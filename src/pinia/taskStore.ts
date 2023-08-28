import { generate as uuidv4 } from 'src/components/composables/uuid';
import {
  readTasksFromFirebaseDb,
  updateTaskDataByPath,
  writeTasksToFirebaseDb,
} from 'src/mixins/firebase';
import { defineStore } from 'pinia';
import { Task } from 'src/types';
// import { readFromDbSync, saveAll } from 'src/mixins/jsondb.js';
import {
  doesTaskHaveStories,
  getFromLocalStorage,
  getStoriesFromTask,
  LocalStorageName,
  queueTaskRefresh,
} from 'src/utils';

type TaskBucketExtras = {
  tags?: string[];
};

export type TaskBucket = {
  title: string;
  active: boolean;
  operator: 'or' | 'and';
  extra?: TaskBucketExtras;
  handler: (task: Task, extra?: TaskBucketExtras) => boolean;
};

type RootState = {
  defaultCategories: TaskBucket[];
  categories: TaskBucket[];
  tasks: Record<string, Task>;
  tasksInSelectedBuckets: Record<string, Task>;
  taskUpdateQueue: number[];
  taskUpdateTimeout: number;
  cloudLoading: boolean;
  lastCloudUpdate: number;
  lastCloudDispatch: number;
};

const useTaskStore = defineStore('taskStore', {
  state: () =>
    ({
      defaultCategories: [
        {
          title: 'Work',
          active: true,
          operator: 'or',
          extra: {
            tags: [],
          },
          handler: (task: Task, extra: TaskBucketExtras): boolean => {
            const hasStories = doesTaskHaveStories(task);

            if (hasStories) return true;

            if (Array.isArray(extra?.tags) && Array.isArray(task.tags)) {
              return Boolean(
                task.tags.some((tag: string) => extra.tags?.includes(tag))
              );
            }

            return false;
          },
        },
        // {
        //   title: 'Daily',
        //   active: true,
        //   extra: {
        //     tags: []
        //   },
        //   operator: 'or',
        //   handler: (task, extra) =>
        //   {
        //     return !extra || !extra.tags ?
        //         true :
        //         (task.tags || []).some((tag) => extra.tags.includes(tag));
        //   }
        // },
        {
          title: 'Personal',
          active: true,
          operator: 'or',
          extra: {
            tags: ['personal', 'shopping'],
          },
          handler: (task: Task, extra: TaskBucketExtras): boolean => {
            return (
              !getStoriesFromTask(task).length &&
              (!extra || !extra.tags
                ? true
                : (task.tags || []).some(
                    (tag) => extra.tags && extra.tags.includes(tag)
                  ))
            );
          },
          // },
          // {
          //   title: 'Deleted',
          //   active: false,
          //   operator: 'and',
          //   handler: (task: Task) => Boolean(task.deleted),
          // },
          // {
          //   title: 'Other',
          //   active: true,
          //   operator: 'or',
          //   handler: () => false
        },
      ],
      categories: [],
      tasks: {},
      tasksInSelectedBuckets: {},
      taskUpdateQueue: [],
      taskUpdateTimeout: 0,
      cloudLoading: false,
      lastCloudUpdate: 0,
      lastCloudDispatch: 0,
    } as RootState),
  getters: {
    all: (state) => Object.values(state.tasks),
    getTasks: (state) => state.tasks,
    getTasksByBuckets: (state) => (buckets: TaskBucket[]) => {
      const all: Record<TaskBucket['title'], Record<string, Task>> = {};

      Object.values(state.tasks).forEach((task) => {
        let isInAnyBuckets = false;

        buckets.forEach((bucket) => {
          if (!all[bucket.title]) all[bucket.title] = {};

          const isInThisBucket = bucket.handler(task, bucket.extra);

          if (isInThisBucket) {
            isInAnyBuckets = true;
            all[bucket.title][task.id] = task;
          }
        });

        if (!isInAnyBuckets) {
          if (!all.other) all.other = {};

          all.other[task.id] = task;
        }
      });

      return all;
    },
    getTask: (state) => (id: Task['id']) => state.tasks[id],
    getTaskProperty: (state) => (id: Task['id'], prop: string) => {
      if (id && state.tasks[id]) {
        return (state.tasks[id] as any)[prop];
      }

      return undefined;
    },
    isCloudLoading: (state) => state.cloudLoading,
    getLastCloudDispatch: (state) => state.lastCloudDispatch,
    getLastCloudUpdate: (state) => state.lastCloudUpdate,
    getDefaultCategories: (state) => state.defaultCategories,
    getCategories: (state) => state.categories,
  },
  actions: {
    getTasksInSelectedBuckets() {
      const catsToKeep = this.categories
        .filter((c) => c.active)
        .map((c) => c.title)
        .concat('other');
      let tasksToKeep = {};

      const allTasks = this.getTasksByBuckets(this.categories);

      Object.entries(allTasks).forEach(([bucketName, tasksInBucket]) => {
        if (catsToKeep.includes(bucketName)) {
          tasksToKeep = { ...tasksToKeep, ...tasksInBucket };
        }
      });

      return tasksToKeep;
    },
    setCategoriesFromLocalStorage() {
      this.SET_CATEGORIES();
    },
    async cloudUpdateSingle(task: Task) {
      console.log('single:', task);
      if (!task || typeof task !== 'object') {
        return;
      }

      const now = Date.now();
      const taskDataToAdd = {
        ...task,
        updated: now,
        created: task.created || now,
        id: !task.id || task.id === 'new' ? uuidv4() : task.id,
      };

      this.SET_TASK(taskDataToAdd);

      await updateTaskDataByPath(taskDataToAdd.id, '', taskDataToAdd);
      queueTaskRefresh(taskDataToAdd.id);
    },
    async cloudUpdateSingleProperty({
      taskId,
      prop,
      data,
    }: {
      taskId: Task['id'];
      prop: string;
      data: any;
    }) {
      console.log('single property:', { taskId, prop, data });
      if (!taskId || !prop || typeof data === 'undefined') {
        return;
      }

      this.SET_TASK_PROPERTY(taskId, prop, data);

      await updateTaskDataByPath(taskId, prop, data);

      setTimeout(() => {
        queueTaskRefresh(taskId);
      }, 250);
    },
    watchCloudDb() {
      if (this.getLastCloudUpdate) {
        return;
      }

      this.SET_CLOUD_LOADING(true);

      // const localTasks = getFromLocalStorage('working_tasks', true);

      // console.warn('Local tasks:', localTasks);

      // init connection with cloud db & update store on change
      readTasksFromFirebaseDb((cloudTasks: { tasks: Task[] }) => {
        if (!cloudTasks) {
          return;
        }

        this.SET_CLOUD_LOADING(true);

        Object.values(cloudTasks.tasks).forEach((task: Task) => {
          let changed = false,
            existing = undefined;

          try {
            existing = this.getTask(task.id);

            changed =
              !existing || JSON.stringify(task) !== JSON.stringify(existing);
          } catch (e) {
            console.warn(e);
          }

          if (changed) {
            this.SET_TASK(task);
          }
        });

        this.SET_LAST_CLOUD_UPDATE();

        setTimeout(() => {
          this.SET_CLOUD_LOADING(false);
        }, 200);
      });
    },
    SET_CLOUD_LOADING(val: boolean) {
      this.cloudLoading = val;
    },
    SET_LAST_CLOUD_UPDATE() {
      this.lastCloudUpdate = Date.now();
    },
    SET_LAST_CLOUD_DISPATCH() {
      this.lastCloudDispatch = Date.now();
    },
    SET_TASK(task: Task) {
      if (!task) {
        return;
      }

      Object.keys(task).forEach((key) => {
        if (typeof (task as any)[key] === 'undefined') {
          delete (task as any)[key];
        }
      });

      this.tasks[task.id] = task;
    },
    SET_TASK_PROPERTY(taskId: Task['id'], prop: string, data: any) {
      if (!taskId || !prop) {
        return;
      }

      (this.tasks[taskId] as any)[prop] = data;
    },
    SAVE_TASKS_TO_CLOUD_FROM_STATE() {
      if (!this.tasks || !Object.keys(this.tasks).length) {
        return;
      }

      console.warn('SAVE__TASKS_TO_CLOUD_FROM_STATE:', this.tasks.length);
      writeTasksToFirebaseDb(this.tasks);
    },
    QUEUE_UPDATE_ALL(time: number) {
      this.taskUpdateQueue.push(time || Date.now() + 5001);
    },
    CLEAR_UPDATE_ALL() {
      this.taskUpdateQueue = [];
    },
    CLEAR_UPDATE_TIMEOUT() {
      clearTimeout(this.taskUpdateTimeout);
    },
    SET_UPDATE_TIMEOUT(timeout: number) {
      this.taskUpdateTimeout = timeout;
    },
    SET_CATEGORIES() {
      console.log('SET_CATEGORIES', this.defaultCategories);
      const storedCategories = getFromLocalStorage(
        LocalStorageName.taskCategories,
        true
      );
      const categories = [];

      if (storedCategories) {
        this.defaultCategories.forEach((def: TaskBucket) => {
          const ctg = storedCategories.find(
            (c: TaskBucket) => c.title === def.title
          );

          if (ctg) {
            categories.push({
              ...def, // add the default props
              ...ctg, // overwrite with the saved props
              handler: def.handler, // fn must be local
            });
          } else {
            categories.push(def);
          }
        });
      } else {
        categories.push(...this.defaultCategories);
      }

      console.log('set cats:', categories);

      this.categories = categories;
    },
  },
});

export default useTaskStore;
