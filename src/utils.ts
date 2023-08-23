import { generate as uuidv4 } from 'src/components/composables/uuid';
import {
  FilterType,
  Task,
  TaskAlert,
  TaskFilters,
  TaskSortType,
} from './types';
import { TaskBucket } from './pinia/taskStore';
import usePivotalStore from './pinia/pivotalStore';

export enum LocalStorageName {
  /** user prefs */
  appTabs = 'appTabs',
  activeTheme = 'activeTheme',
  taskCategories = 'taskCategories',
  zoomLevel = 'zoomLevel',
  qSize = 'qSize',
  /** state */
  currentTab = 'currentTab',
  taskLimit = 'taskLimit',
  taskFilters = 'taskFilters',
  desiredTaskId = 'desiredTaskId',
  currentTabQueue = 'currentTabQueue',
  taskRefreshQueue = 'taskRefreshQueue',
  /** user auth */
  authed_user = 'authed_user',
  user_account = 'user_account',
  /** system auth */
  firebase_config = 'firebase_config',
  firebase_service_account = 'firebase_service_account',
  // firebase_token: 'firebase_token',
  /** external auth */
  gitlabToken = 'gitlabToken',
  pivotalToken = 'pivotalToken',
  pivotalProjectId = 'pivotalProjectId',
  pivotalProjectIdAlt = 'pivotalProjectIdAlt',
  /** other config */
  external_backups = 'external_backups',
  gitModuleBasePath = 'gitModuleBasePath',
  ticketQueryParams = 'ticketQueryParams',
}

export function openInBrowser(link: string) {
  // require("electron").shell.openExternal(link);
  window.open(link, '_blank');
}

export function getAppBasePath() {
  // const pathParts = require('electron').remote.app.getAppPath().split('\\');

  // return pathParts
  //     .slice(0, pathParts.length - 2)
  //     .join('\\');
  // .replace('.quasar\\electron', '');
  return undefined;
}

/** Local storage operations */
/**
 * Save a value to localStorage.
 * Objects are automatically stringified.
 * Only registered names may be used.
 * @param name
 * @param data
 */
export function saveToLocalStorage(name: LocalStorageName, data: any) {
  const validName = LocalStorageName[name];

  if (!validName) {
    return;
  }

  if (data && typeof data === 'object') {
    localStorage.setItem(validName, JSON.stringify(data));
  } else {
    localStorage.setItem(validName, data);
  }
}

/**
 * Get an item from local storage. Returns the string if it cannot be parsed, unless forceObject is true.
 * @param name - local storage key to fetch
 * @param forceObject - `true` to return undefined when parsing as object fails
 * @returns {string|any}
 */
export function getFromLocalStorage(
  name: LocalStorageName,
  forceObject = false
) {
  const validName = LocalStorageName[name];

  if (!validName) {
    return undefined;
  }

  const data = localStorage.getItem(validName);

  if (forceObject) {
    try {
      return JSON.parse(data as string);
    } catch (e) {
      return undefined;
    }
  } else {
    try {
      return JSON.parse(data as string);
    } catch (e) {
      return data;
    }
  }
}

/**
 * Insert a value into an existing array in localStorage, if not already in the array.
 * @param name
 * @param data
 */
export function saveToLocalStorageArray(name: LocalStorageName, data: any) {
  const existingData = getFromLocalStorage(name) || [];

  if (
    !existingData.some((item: any) => {
      let itemComp;

      try {
        itemComp =
          item && typeof item === 'object' ? JSON.stringify(item) : item;
      } catch (e) {
        itemComp = item;
      }

      return item === itemComp;
    })
  ) {
    existingData.push(data);
  }

  saveToLocalStorage(name, JSON.stringify(existingData));
}

/** Filtering tasks */
/** Helper for `filterTaskList` */
export function checkFilterBool(
  prop: FilterType,
  task: Task,
  filters: TaskFilters
) {
  return typeof filters[prop] === 'boolean'
    ? filters[prop]
      ? (task as any)[prop]
      : !(task as any)[prop]
    : true;
}

function keywordCheck(task: Task, filters: TaskFilters) {
  if (!task || !filters || !filters.keyword || filters.keyword === '') {
    return true;
  }

  const message = (task.message || '').toLowerCase();
  const tags = (task.tags || []).join('').toLowerCase();
  const haystack = `${message} ${tags}`;
  const term = filters.keyword.toLowerCase();
  const terms = term.split(' ');

  return terms.every((t) =>
    t.indexOf('-') === 0
      ? haystack.indexOf(t.slice(1)) === -1
      : haystack.indexOf(t) > -1
  );
}

export function getStoriesFromTask(task: Task) {
  if (!task || !task.stories) {
    return [];
  }

  return (
    (`${(task.tags || []).join('|')}|${task.message}`.match(/1\d{8}/g) ||
      []) as any
  ).reduce((agg: Array<{ id: string | number }>, id: string) => {
    if (!agg.some((existing: any) => existing.id === id)) {
      agg.push({ id });
    }

    return agg;
  }, [] as any[]);
}

/** Filter the list of tasks based on provided filters */
export function filterTaskList(tasks: Task[], filters: TaskFilters) {
  return tasks.filter((task) =>
    Boolean(
      task &&
        (!filters.id ? true : task.id === filters.id) &&
        (!filters.tags || !filters.tags.length
          ? true
          : !task.tags
          ? false
          : task.tags.some((t) => filters.tags?.includes(t))) &&
        keywordCheck(task, filters) &&
        checkFilterBool('done', task, filters) &&
        checkFilterBool('archived', task, filters) &&
        checkFilterBool('active', task, filters)
    )
  );
}

export function checkTaskInBucket(cat: TaskBucket, task: Task) {
  return cat.active
    ? cat.handler(task, cat.extra)
    : !cat.handler(task, cat.extra);
}

export function filterTasksByCategory(tasks: Task[], categories: TaskBucket[]) {
  if (!Array.isArray(tasks) || !categories) {
    return tasks;
  }

  const { ands, ors }: { ands: TaskBucket[]; ors: TaskBucket[] } =
    categories.reduce(
      (agg: { ands: TaskBucket[]; ors: TaskBucket[] }, cat: TaskBucket) => {
        if (cat.operator === 'and') agg.ands.push(cat);
        else agg.ors.push(cat);

        return agg;
      },
      { ands: [], ors: [] }
    );

  const res = tasks.filter((task) =>
    !ors.length
      ? true
      : ors.some((cat) => Boolean(checkTaskInBucket(cat, task))) && !ands.length
      ? true
      : ands.every((cat) => Boolean(checkTaskInBucket(cat, task)))
  );

  console.log({ res, ands, ors });

  return res;
}

export function stringSort(arr: any[], prop: string, inverse: boolean) {
  arr.sort((a, b) => {
    if (a[prop] < b[prop]) {
      return inverse ? 1 : -1;
    }
    if (a[prop] > b[prop]) {
      return inverse ? -1 : 1;
    }
    return 0;
  });
}

export function intSort(arr: any[], prop: string, inverse: boolean) {
  arr.sort((a, b) => {
    return inverse ? a[prop] - b[prop] : b[prop] - a[prop];
  });
}

export function dateSort(arr: any[], prop: string, inverse: boolean) {
  arr.sort((a, b) => {
    const aComp = new Date(a[prop]).getTime();
    const bComp = new Date(b[prop]).getTime();

    return inverse ? aComp - bComp : bComp - aComp;
  });
}

export function sortTaskList(
  tasks: Task[],
  sortType: TaskSortType,
  inverseSort: boolean
) {
  const sortByCreated = (a: Task, b: Task) => {
    if (inverseSort) {
      return a.created - b.created;
    }

    return b.created - a.created;
  };

  const sortByAlarm = (a: Task, b: Task) => {
    const aSoonest =
      a.alerts && a.alerts.length
        ? Math.min(...a.alerts.map((alert: TaskAlert) => alert.unix))
        : Infinity;
    const bSoonest =
      b.alerts && b.alerts.length
        ? Math.min(...b.alerts.map((alert: TaskAlert) => alert.unix))
        : Infinity;

    if (inverseSort) {
      return bSoonest - aSoonest;
    }

    return aSoonest - bSoonest;
  };

  const sortByBool = (bool: string, a: Task, b: Task) => {
    if (inverseSort) {
      return (b as any)[bool] - (a as any)[bool];
    }

    return (a as any)[bool] - (b as any)[bool];
  };

  switch (sortType) {
    case 'due':
      return tasks.sort(sortByAlarm);
    case 'done':
      return tasks.sort((a, b) => sortByBool('done', a, b));
    case 'created':
    default:
      return tasks.sort(sortByCreated);
  }
}

/** @returns task with current filters merged in */
export function applyFiltersToTask(task: Task, filters: TaskFilters) {
  if (!Object.keys(filters || {}).length) {
    return task;
  }

  const now = Date.now();

  if (!task.tags) {
    task.tags = [];
  }

  if (filters.tags && filters.tags.length) {
    task.tags = [...task.tags, ...filters.tags];
  }

  if (filters.keyword) {
    task.tags = [...task.tags, filters.keyword];
  }

  if (typeof filters.done === 'boolean') {
    task.done = filters.done ? now : 0;
  }

  if (typeof filters.active === 'boolean') {
    task.active = filters.active ? now : 0;
  }

  if (typeof filters.archived === 'boolean') {
    task.archived = filters.archived ? now : 0;
  }

  return task;
}

/** CRUD for tasks */
export function reduceIntoAssociativeArray(
  source: any[],
  key: string,
  deleteKey = false
) {
  let res;

  try {
    res = source.reduce((agg, item) => {
      if (item && item[key]) {
        const clonedItem = { ...item };

        if (deleteKey) {
          delete clonedItem[key];
        }

        agg[item[key]] = clonedItem;
      }

      return agg;
    }, {});
  } catch (e) {
    console.warn(e);

    res = source;
  }

  return res;
}

/**
 * Add a task id to an array which is checked by TasksActivity.
 * The task will be re-rendered when the array value is checked.
 * @param id
 */
export function queueTaskRefresh(id: string) {
  saveToLocalStorageArray(LocalStorageName.taskRefreshQueue, id);
}

export function localStorageIntervalCheck(
  name: LocalStorageName,
  callback: (queue: Array<string | number>) => void
) {
  if (!name || typeof callback !== 'function') {
    return undefined;
  }

  return setInterval(() => {
    const queue = getFromLocalStorage(name);

    if (Array.isArray(queue) && queue.length) {
      callback(queue);
      saveToLocalStorage(name, []);
    }
  }, 250);
}

/** General helpers */
/** Various time units as seconds */
export enum SecondsIn {
  minute = 60,
  hour = 60 * 60,
  day = 60 * 60 * 24,
  month = 60 * 60 * 24 * 30,
  year = 60 * 60 * 24 * 30 * 12,
}

export enum ShortTimeNames {
  minute = 'm',
  hour = 'h',
  day = 'd',
  month = 'mo',
  year = 'y',
}

export type TimeUnit = 'minute' | 'hour' | 'day' | 'month' | 'year';

export function secondsToHumanReadable(seconds: number, short = false) {
  let res = `${seconds} ${short ? 's' : 'seconds'}`;

  Object.keys(SecondsIn).forEach((x: string) => {
    if (seconds > SecondsIn[x as TimeUnit]) {
      if (seconds > 2 * SecondsIn[x as TimeUnit]) {
        res = `${Math.floor(seconds / SecondsIn[x as TimeUnit])} ${
          short ? ShortTimeNames[x as TimeUnit] : `${x}s`
        }`;
      } else {
        res = short ? `1 ${ShortTimeNames[x as TimeUnit]}` : `a ${x}`;
      }
    }
  });

  return res;
}

export function timeSince(time: number) {
  const diff = Math.floor((Date.now() - time) / 1000);

  if (diff > 0) {
    return `${secondsToHumanReadable(diff)} ago`;
  } else {
    return `in ${secondsToHumanReadable(-diff)}`;
  }
}

/** Send an app-wide notification. */
// export function qNotify(q, message: string, opts = null, action = null) {
//   if (!q) return;

//   opts = opts
//     ? {
//         progress: typeof opts.progress === 'boolean' ? opts.progress : true,
//         timeout: opts.timeout || 2000,
//         position: opts.progress || 'bottom',
//         color: opts.color || 'primary',
//       }
//     : {
//         progress: true,
//         timeout: 2000,
//         position: 'bottom',
//         color: 'primary',
//       };

//   q.notify({
//     message,
//     color: opts.color,
//     position: opts.position,
//     timeout: opts.timeout,
//     progress: opts.progress,
//     actions: !action
//       ? undefined
//       : [
//           {
//             label: action.label,
//             color: 'negative',
//             handler: () => {
//               q.dialog({
//                 title: action.title,
//                 message: action.message,
//                 cancel: true,
//                 persistent: true,
//               })
//                 .onOk(() => {
//                   if (typeof action.onSuccess === 'function') {
//                     action.onSuccess();
//                   }
//                 })
//                 .onCancel(() => {
//                   if (typeof action.onCancel === 'function') {
//                     action.onCancel();
//                   }
//                 });
//             },
//           },
//           {
//             label: 'Dismiss',
//             color: 'white',
//           },
//         ],
//   });
// }

/**
 * Copy text or objects to the clipboard.
 * @param value
 */
export function copyToClipboard(value: any) {
  if (Array.isArray(value)) {
    navigator.clipboard.writeText(value.join(', '));
  } else if (value && typeof value === 'object') {
    navigator.clipboard.writeText(JSON.stringify(value));
  } else {
    navigator.clipboard.writeText(value);
  }
}

export function goToActivityPageForTask(taskId: string) {
  if (taskId) {
    saveToLocalStorage(LocalStorageName.desiredTaskId, taskId);
    saveToLocalStorageArray(LocalStorageName.currentTabQueue, 'activity');
  }
}

export function padLeft(
  str: string | number,
  padChar: string,
  totalLength: number
) {
  str = str.toString();

  while (str.length < totalLength) {
    str = `${padChar}${str}`;
  }

  return str;
}

export function getStoryHint(storyId: string | number) {
  const storyName = usePivotalStore().get(storyId)?.title;

  if (!storyName) {
    return `${storyId}`;
  }

  return `<span>${storyId}<q-tooltip>${storyName}</q-tooltip></span>`;
}

export function transformSizeProp(
  requestedSize: string | undefined
): string | undefined
{
  if (!requestedSize)
  {
    return requestedSize;
  }

  const pref = getFromLocalStorage(LocalStorageName.qSize, true);

  if (!pref) {
    return requestedSize;
  }

  const upsize = (size: string): string => {
    console.log('upsize:', size);
    switch (size)
    {
      case 'xs': return 'sm';
      case 'sm': return 'md';
      case 'md': return 'lg';
      case 'lg': return 'xl';
      case 'xl': return 'xl';
      default: return size;
    }
  }

  const downsize = (size: string): string => {
    switch (size)
    {
      case 'xs': return 'xs';
      case 'sm': return 'xs';
      case 'md': return 'sm';
      case 'lg': return 'md';
      case 'xl': return 'lg';
      default: return size;
    }
  }

  switch (pref.level)
  {
    case -1: return downsize(requestedSize);
    case 0: return requestedSize;
    case 1: return upsize(requestedSize);
    default: return requestedSize;
  }
}