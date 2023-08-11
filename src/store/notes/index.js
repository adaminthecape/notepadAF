import Vue from 'vue';
import { readFromDbSync, saveAll } from 'src/mixins/jsondb';
import { readTasksFromFirebaseDb, writeTasksToFirebaseDb} from 'src/mixins/firebase';
import { v4 as uuidv4 } from 'uuid';
import { updateTaskDataByPath } from 'src/mixins/firebase.js';
import {
    checkTaskInBucket,
    getFromLocalStorage,
    getStoriesFromTask, localStorageNames,
    queueTaskRefresh
} from 'src/utils';

const state = {
    defaultCategories: [
        {
            title: 'Work',
            active: true,
            operator: 'or',
            extra: {
                tags: []
            },
            handler: (task, extra) =>
            {
                return Boolean(
                    (
                        Array.isArray(extra) &&
                        (task.tags || []).some((tag) => extra.includes(tag))
                    ) ||
                    getStoriesFromTask(task).length
                );
            }
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
                tags: ['personal', 'shopping']
            },
            handler: (task, extra) =>
            {
                return !(getStoriesFromTask(task).length) && (
                    (!extra || !extra.tags) ? true : (
                        task.tags || []).some((tag) => extra.tags.includes(tag)
                    )
                );
            }
        },
        {
          title: 'Deleted',
          active: false,
          operator: 'and',
          handler: (task) => Boolean(task.deleted)
        // },
        // {
        //   title: 'Other',
        //   active: true,
        //   operator: 'or',
        //   handler: () => false
        }
    ],
    categories: [],
    tasks: {},
    taskUpdateQueue: [],
    taskUpdateTimeout: [],
    cloudLoading: false,
    lastCloudUpdate: 0,
    lastCloudDispatch: 0
};

const mutations = {
    SET_CLOUD_LOADING(state, val)
    {
        state.cloudLoading = val;
    },
    SET_LAST_CLOUD_UPDATE(state)
    {
        state.lastCloudUpdate = Date.now();
    },
    SET_LAST_CLOUD_DISPATCH(state)
    {
        state.lastCloudDispatch = Date.now();
    },
    SET_TASK(state, task)
    {
        if(!task)
        {
            return;
        }

        Object.keys(task).forEach((key) =>
        {
            if(typeof task[key] === 'undefined')
            {
                delete task[key];
            }
        });

        Vue.set(state.tasks, task.id, task);
    },
    SET_TASK_PROPERTY(state, taskId, prop, data)
    {
        if(!taskId || !prop)
        {
            return;
        }

        Vue.set(state.tasks[taskId], prop, data);
    },
    SAVE_TASKS_TO_JSON(state, tasks)
    {
        saveAll(tasks);
    },
    SAVE_TASKS_TO_CLOUD_FROM_STATE(state)
    {
        if(!state.tasks || !Object.keys(state.tasks).length)
        {
            return;
        }

        console.warn('SAVE__TASKS_TO_CLOUD_FROM_STATE:', state.tasks.length);
        writeTasksToFirebaseDb(state.tasks);
    },
    // QUEUE_TASK_UPDATE(state, task)
    // {
    //     const existingIndex = state.tasks.findIndex((t) => t.id === task.id);
    //
    //     if(existingIndex > -1)
    //     {
    //         state.tasks.splice(existingIndex, 1, task);
    //     }
    //     else
    //     {
    //         state.taskUpdateQueue.push(task);
    //     }
    //
    //     console.log('update queue:', state.taskUpdateQueue);
    // },
    QUEUE_UPDATE_ALL(state, time)
    {
        state.taskUpdateQueue.push(time || Date.now() + 5001);
    },
    CLEAR_UPDATE_ALL(state)
    {
        Vue.set(state, 'taskUpdateQueue', []);
    },
    CLEAR_UPDATE_TIMEOUT(state)
    {
        clearTimeout(state.taskUpdateTimeout);
    },
    SET_UPDATE_TIMEOUT(state, timeout)
    {
        state.taskUpdateTimeout = timeout;
    },
    SET_CATEGORIES(state)
    {
        const storedCategories = getFromLocalStorage(localStorageNames.taskCategories, true);
        const categories = [];

        if(storedCategories)
        {
            state.defaultCategories.forEach((def) =>
            {
                const ctg = storedCategories.find((c) => c.title === def.title);

                if(ctg)
                {
                    categories.push({
                        ...def, // add the default props
                        ...ctg, // overwrite with the saved props
                        handler: def.handler // fn must be local
                    });
                }
                else
                {
                    categories.push(def);
                }
            });
        }
        else
        {
            categories.push(...state.defaultCategories);
        }

        Vue.set(state, 'categories', categories);
    }
};

const actions = {
    setCategoriesFromLocalStorage({ commit })
    {
        commit('SET_CATEGORIES');
    },
    timeSafeCloudUpdate({ commit })
    {
        console.warn('timeSafeCloudUpdate: start');
        const squash = () =>
        {
            const millisToWait = 5000;
            const latestUpdate = state.lastCloudDispatch || 0;
            const millisSinceLatestUpdate = Date.now() - latestUpdate;

            if((millisSinceLatestUpdate > millisToWait))
            { // update now
                commit('SET_LAST_CLOUD_DISPATCH');
                commit('SAVE_TASKS_TO_CLOUD_FROM_STATE');
            }
            else
            { // postpone update
                commit('CLEAR_UPDATE_TIMEOUT');

                const wait = (millisToWait - millisSinceLatestUpdate);
                const timeout = setTimeout(squash, wait);

                commit('SET_UPDATE_TIMEOUT', timeout);
            }

            commit('CLEAR_UPDATE_ALL');
        };

        squash();
    },
    async cloudUpdateSingle({ commit, dispatch }, task)
    {
        if(!task || typeof task !== 'object')
        {
            return;
        }

        const now = Date.now();
        const taskDataToAdd = {
            ...task,
            updated: now,
            created: task.created || now,
            id: task.id || uuidv4()
        };

        commit('SET_TASK', taskDataToAdd);

        await updateTaskDataByPath(taskDataToAdd.id, '', taskDataToAdd);
        queueTaskRefresh(taskDataToAdd.id);
        // dispatch('timeSafeCloudUpdate');
    },
    async cloudUpdateSingleProperty({ getters, commit, dispatch }, { taskId, prop, data })
    {
        if(!taskId || !prop || typeof data === 'undefined')
        {
            return;
        }

        commit('SET_TASK_PROPERTY', taskId, prop, data);

        await updateTaskDataByPath(taskId, prop, data);

        setTimeout(() =>
        {
            queueTaskRefresh(taskId);
        }, 250);
    },
    watchCloudDb({ getters, commit })
    {
        if(getters.getLastCloudUpdate)
        {
            return;
        }

        commit('SET_CLOUD_LOADING', true);

        // const localTasks = getFromLocalStorage('working_tasks', true);

        // console.warn('Local tasks:', localTasks);

        // init connection with cloud db & update store on change
        readTasksFromFirebaseDb((cloudTasks) =>
        {
            if(!cloudTasks)
            {
                return;
            }

            commit('SET_CLOUD_LOADING', true);

            Object.values(cloudTasks.tasks).forEach((task) =>
            {
                let changed = false,
                    existing = undefined;

                try
                {
                    existing = getters.getTask(task.id);

                    changed = !existing || (
                        JSON.stringify(task) !== JSON.stringify(existing)
                    );
                }
                catch(e)
                {
                    console.warn(e);
                }

                if(changed)
                {
                    commit('SET_TASK', task);
                }
            });

            commit('SET_LAST_CLOUD_UPDATE');

            setTimeout(() =>
            {
                commit('SET_CLOUD_LOADING', false);
            }, 200);
        });
    },
    updateJson({ commit, dispatch }, tasks)
    {
        // console.log('updateJson', { tasks });
        if(!tasks || !tasks.length)
        {
            return;
        }

        commit('SAVE_TASKS_TO_JSON', tasks);
    },
    loadAllFromJson({ commit })
    {
        const data = readFromDbSync('notesdb.json', true);

        let parsed = JSON.parse(data) || {};

        if(typeof parsed === 'string')
        {
            parsed = JSON.parse(parsed);
        }

        parsed.tasks.forEach((task) =>
        {
            commit('SET_TASK', task);
        });
    }
};

const getters = {
    all: (state) => Object.values(state.tasks),
    getTasks: (state) => state.tasks,
    getTasksByBuckets: (state) => (buckets) =>
    {
        const all = {};

        Object.values(state.tasks).forEach((task) =>
        {
            let isInAnyBuckets = false;

            buckets.forEach((bucket) =>
            {
                if(!all[bucket.title]) all[bucket.title] = {};

                const isInThisBucket = bucket.handler(task, bucket.extra);

                if(isInThisBucket)
                {
                    isInAnyBuckets = true;
                    all[bucket.title][task.id] = task;
                }
            });

            if(!isInAnyBuckets)
            {
                if(!all.other) all.other = {};

                all.other[task.id] = task;
            }
        });

        return all;
    },
    getTask: (state) => (id) => state.tasks[id],
    getTaskProperty: (state) => (id, prop) =>
    {
        if(id && state.tasks[id])
        {
            return state.tasks[id][prop];
        }

        return undefined;
    },
    isCloudLoading: (state) => state.cloudLoading,
    getLastCloudDispatch: (state) => state.lastCloudDispatch,
    getLastCloudUpdate: (state) => state.lastCloudUpdate,
    getDefaultCategories: (state) => state.defaultCategories,
    getCategories: (state) => state.categories
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
