import { v4 as uuidv4 } from 'uuid';

export function openInBrowser(link)
{
    // require("electron").shell.openExternal(link);
    window.open(link, '_blank');
}

export function getAppBasePath()
{
    // const pathParts = require('electron').remote.app.getAppPath().split('\\');

    // return pathParts
    //     .slice(0, pathParts.length - 2)
    //     .join('\\');
        // .replace('.quasar\\electron', '');
    return undefined;
}

/** Local storage operations */
/**
 * Save a value to localStorage. Objects are automatically stringified.
 * @param name
 * @param data
 */
export function saveToLocalStorage(name, data)
{
    if(data && typeof data === 'object')
    {
        localStorage.setItem(name, JSON.stringify(data));
    }
    else
    {
        localStorage.setItem(name, data);
    }
}

/**
 * Get an item from local storage. Returns the string if it cannot be parsed, unless forceObject is true.
 * @param name - local storage key to fetch
 * @param forceObject - `true` to return undefined when parsing as object fails
 * @returns {string|any}
 */
export function getFromLocalStorage(name, forceObject = false)
{
    const data = localStorage.getItem(name);

    if(forceObject)
    {
        try
        {
            return JSON.parse(data);
        }
        catch(e)
        {
            return undefined;
        }
    }
    else
    {
        try
        {
            return JSON.parse(data);
        }
        catch(e)
        {
            return data;
        }
    }
}

/**
 * Insert a value into an existing array in localStorage, if not already in the array.
 * @param name
 * @param data
 */
export function saveToLocalStorageArray(name, data)
{
    const existingData = getFromLocalStorage(name) || [];

    if(!existingData.some((item) =>
    {
        let itemComp;

        try
        {
            itemComp = item && typeof item === 'object' ?
                JSON.stringify(item) :
                item;
        }
        catch(e)
        {
            itemComp = item;
        }

        return item === itemComp;
    }))
    {
        existingData.push(data);
    }

    saveToLocalStorage(name, JSON.stringify(existingData));
}

/** Filtering tasks */
/** Helper for `filterTaskList` */
export function checkFilterBool(prop, task, filters)
{
    return typeof filters[prop] === 'boolean' ?
        filters[prop] ? task[prop] : !task[prop] :
        true;
}

function keywordCheck(task, filters)
{
    if(!task || !filters || !filters.keyword)
    {
        return true;
    }

    const message = (task.message || '').toLowerCase();
    const tags = (task.tags || []).join('').toLowerCase();
    const haystack = `${message} ${tags}`;
    const term = filters.keyword.toLowerCase();
    const terms = term.split(' ');

    return terms.every((t) => (
        t.indexOf('-') === 0 ?
            haystack.indexOf(t.slice(1)) === -1 :
            haystack.indexOf(t) > -1
    ));
}

export function getStoriesFromTask(task)
{
    return ((
        `${JSON.stringify(task.tags || [])} ${task.message}`
            .match(/1\d{8}/g)
    ) || [])
        .reduce((agg, id) =>
        {
            if(!agg.some((existing) => existing.id === id))
            {
                agg.push({ id });
            }

            return agg;
        }, []);
}

/** Filter the list of tasks based on provided filters */
export function filterTaskList(tasks, filters)
{
    return tasks.filter((task) => Boolean(
        task &&
        (
            !filters.id ? true :
                task.id === filters.id
        ) &&
        (
            !filters.tags || !filters.tags.length ? true :
                !task.tags ? false : task.tags.some((t) => filters.tags.includes(t))
        ) &&
        (
            keywordCheck(task, filters)
        ) &&
        checkFilterBool('done', task, filters) &&
        checkFilterBool('archived', task, filters) &&
        checkFilterBool('active', task, filters)
    ));
}

export function checkTaskInBucket(cat, task)
{
    return cat.active ? cat.handler(task, cat.extra) : !cat.handler(task, cat.extra);
}

export function filterTasksByCategory(tasks, categories)
{
    if(!Array.isArray(tasks) || !categories)
    {
        return tasks;
    }

    const { ands, ors } = categories.reduce((agg, cat) =>
    {
        if(cat.operator === 'and') agg.ands.push(cat);
        else agg.ors.push(cat);

        return agg;
    }, { ands: [], ors: [] });

    const res = tasks.filter((task) => (
        !ors.length ? true : ors.some((cat) => Boolean(checkTaskInBucket(cat, task))) &&
        !ands.length ? true : ands.every((cat) => Boolean(checkTaskInBucket(cat, task)))
    ));

    console.log({ res, ands, ors });

    return res;
}

export function sortTaskList(tasks, sortType, inverseSort)
{
    const sortByCreated = (a, b) =>
    {
        if(inverseSort)
        {
            return a.created - b.created;
        }

        return b.created - a.created;
    }

    const sortByAlarm = (a, b) =>
    {
        const aSoonest = a.alerts && a.alerts.length ? Math.min(a.alerts.map((alert) => alert.unix)) : Infinity;
        const bSoonest = b.alerts && b.alerts.length ? Math.min(b.alerts.map((alert) => alert.unix)) : Infinity;

        if(inverseSort)
        {
            return bSoonest - aSoonest;
        }

        return aSoonest - bSoonest;
    }

    const sortByBool = (bool, a, b) =>
    {
        if(inverseSort)
        {
            return b[bool] - a[bool];
        }

        return a[bool] - b[bool];
    }

    switch(sortType)
    {
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
export function applyFiltersToTask(task, filters)
{
    if(!Object.keys(filters || {}).length)
    {
        return task;
    }

    const now = Date.now();

    if(!task.tags)
    {
        task.tags = [];
    }

    if(filters.tags && filters.tags.length)
    {
        task.tags = [...task.tags, ...filters.tags];
    }

    if(filters.keyword)
    {
        task.tags = [...task.tags, filters.keyword];
    }

    ['active', 'archived'].forEach((bool) =>
    {
        if(typeof filters[bool] === 'boolean')
        {
            task[bool] = filters[bool];
        }
    });

    ['done'].forEach((num) =>
    {
        if(typeof filters[num] === 'boolean')
        {
            if(filters[num])
            {
                task[num] = now;
            }
            else
            {
                task[num] = 0;
            }
        }
    });

    return task;
}

/** CRUD for tasks */
/**
 * Create/update/delete a task, independent of store interface.
 * Requires a store updater function which dispatches an API call.
 * @param tasksList
 * @param storeUpdater
 * @param taskData
 * @param deleteTask
 * @returns {Promise<void>}
 */
export async function cudTask(tasksList, storeUpdater, taskData, deleteTask = false)
{
    if(!storeUpdater || typeof storeUpdater !== 'function')
    {
        throw new Error('A store interface is required');
    }

    if(!taskData)
    {
        console.warn('bad task!', taskData);

        return;
    }

    if(!Array.isArray(tasksList))
    {
        console.warn('no tasks to update!', tasksList);

        return;
    }

    const taskDataClone = structuredClone(taskData);

    if(!taskDataClone.id)
    {
        taskDataClone.id = uuidv4();
    }

    taskDataClone.updated = Date.now();

    let foundTaskIndex = -1;

    const tasks = tasksList.map((task, t) =>
    {
        if(task)
        {
            if(task.id === taskDataClone.id)
            {
                foundTaskIndex = t;

                if(deleteTask)
                {
                    // blank it
                    return null;
                }

                return {
                    ...task,
                    ...taskDataClone
                };
            }
        }

        return task;
    }).filter((t) => t);

    if(!deleteTask)
    {
        if(foundTaskIndex === -1)
        {
            tasks.push(taskDataClone);
        }
    }

    await storeUpdater(tasks);
}

export function reduceIntoAssociativeArray(source, key, deleteKey = false)
{
    let res;

    try
    {
        res = source.reduce((agg, item) =>
        {
            if(item && item[key])
            {
                const clonedItem = structuredClone(item);

                if(deleteKey)
                {
                    delete clonedItem[key];
                }

                agg[item[key]] = clonedItem;
            }

            return agg;
        }, {});
    }
    catch(e)
    {
        console.warn(e);

        res = source;
    }

    return res;
}

/**
 * Update task via db interface. Do NOT use any other fn to dispatch task updates,
 * unless it goes through here.
 * @param {Object} store
 * @param {Object} taskData
 * @param {boolean} deleteTask
 */
export async function cudTaskViaStore(store, taskData, deleteTask = false)
{
    // const storeFn = async (tasks) =>
    // {
    //     await store.dispatch('notes/updateJson', tasks);
    //     // await store.dispatch('notes/updateJson', {
    //     //     note: {
    //     //         id: 'tasks',
    //     //         tasks
    //     //     }
    //     // })
    // };

    // await cudTask(
    //     getAllTasksFromStore(store),
    //     storeFn,
    //     taskData,
    //     deleteTask
    // );
    await store.dispatch('notes/cloudUpdateSingle', taskData);

    setTimeout(() =>
    {
        queueTaskRefresh(taskData.id);
    }, 500);
}

/**
 * Add a task id to an array which is checked by TasksActivity.
 * The task will be re-rendered when the array value is checked.
 * @param id
 */
export function queueTaskRefresh(id)
{
    saveToLocalStorageArray('taskRefreshQueue', id);
}

export function localStorageIntervalCheck(name, callback)
{
    if(!name || typeof callback !== 'function')
    {
        return undefined;
    }

    return setInterval(() =>
    {
        const queue = getFromLocalStorage(name);

        if(Array.isArray(queue) && queue.length)
        {
            callback(queue);
            saveToLocalStorage(name, []);
        }
    }, 250);
}

export function getAllTasksFromStore(store)
{
    if(!store) return undefined;

    // return store.getters['notes/getNote']('tasks') ?
    //     store.getters['notes/getNote']('tasks').tasks :
    //     undefined;
    return Object.values(store.getters['notes/getTasks']);
}

export function getTaskByIdFromStore(store, id)
{
    if(!id || !store) return undefined;

    return getAllTasksFromStore(store).find((t) => t && (t.id === id));
}

/** General helpers */
/** Various time units as seconds */
export const secondsIn = {
    minute: 60,
    hour: 60 * 60,
    day: 60 * 60 * 24,
    month: 60 * 60 * 24 * 30,
    year: 60 * 60 * 24 * 30 * 12
};

export function secondsToHumanReadable(seconds, short = false)
{
    const shorts = {
        minute: 'm',
        hour: 'h',
        day: 'd',
        month: 'mo',
        year: 'y'
    };

    let res = `${seconds} ${short ? 's' : 'seconds'}`;

    Object.keys(secondsIn).forEach((x) =>
    {
        if(seconds > secondsIn[x])
        {
            if(seconds > (2 * secondsIn[x]))
            {
                res = `${Math.floor(seconds / secondsIn[x])} ${short ? shorts[x] : `${x}s`}`;
            }
            else
            {
                res = short ? `1 ${shorts[x]}` : `a ${x}`;
            }
        }
    });

    return res;
}

export function timeSince(time)
{
    const diff = Math.floor((Date.now() - time) / 1000);

    if(diff > 0)
    {
        return `${secondsToHumanReadable(diff)} ago`;
    }
    else
    {
        return `in ${secondsToHumanReadable(-diff)}`;
    }
}

/** Send an app-wide notification. */
export function qNotify(q, message, opts = null, action = null)
{
    if(!q) return;

    opts = opts ?
        {
            progress: typeof opts.progress === 'boolean' ? opts.progress : true,
            timeout: opts.timeout || 2000,
            position: opts.progress || 'bottom',
            color: opts.color || 'primary'
        } :
        {
            progress: true,
            timeout: 2000,
            position: 'bottom',
            color: 'primary'
        };

    q.notify({
        message,
        color: opts.color,
        position: opts.position,
        timeout: opts.timeout,
        progress: opts.progress,
        actions: !action ? undefined : [
            {
                label: action.label,
                color: 'negative',
                handler: () =>
                {
                    q.dialog({
                        title: action.title,
                        message: action.message,
                        cancel: true,
                        persistent: true
                    })
                        .onOk(() =>
                        {
                            if(typeof action.onSuccess === 'function')
                            {
                                action.onSuccess();
                            }
                        })
                        .onCancel(() =>
                        {
                            if(typeof action.onCancel === 'function')
                            {
                                action.onCancel();
                            }
                        });
                }
            },
            {
                label: 'Dismiss',
                color: 'white'
            }
        ]
    });
}

/**
 * Copy text or objects to the clipboard.
 * @param value
 */
export function copyToClipboard(value)
{
    if(Array.isArray(value))
    {
        navigator.clipboard.writeText(value.join(', '));
    }
    else if(value && typeof value === 'object')
    {
        navigator.clipboard.writeText(JSON.stringify(value));
    }
    else
    {
        navigator.clipboard.writeText(value);
    }
}

export async function v_dac(path)
{
    return defineAsyncComponent(() => import(path));
}

export async function v_dac_vc(path)
{
    return defineAsyncComponent(() => import(`src/components/${path}.vue`));
}

export function goToActivityPageForTask(taskId)
{
    if(taskId)
    {
        saveToLocalStorage('desiredTaskId', taskId);
        saveToLocalStorageArray('currentTabQueue', 'activity');
    }
}