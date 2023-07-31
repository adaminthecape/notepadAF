import Vue from 'vue';
import { readFromDbSync, saveAll } from 'src/mixins/jsondb';
import { readTasksFromFirebaseDb, writeTasksToFirebaseDb} from 'src/mixins/firebase';
import { v4 as uuidv4 } from 'uuid';
import { updateTaskDataByPath } from 'src/mixins/firebase.js';
import { queueTaskRefresh } from 'src/utils';

const state = {
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
    SET_TASK(state, task, merge = false)
    {
        if(!task)
        {
            return;
        }

        console.warn('SET_TASK:', task.id);

        Object.keys(task).forEach((key) =>
        {
            if(typeof task[key] === 'undefined')
            {
                delete task[key];
            }
        });

        state.tasks[task.id] = task;
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
    }
};

const actions = {
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

        console.warn('cloudUpdateSingle', { task: taskDataToAdd });

        commit('SET_TASK', taskDataToAdd);

        updateTaskDataByPath(taskDataToAdd.id, '', taskDataToAdd);
        queueTaskRefresh(taskDataToAdd.id);
        // dispatch('timeSafeCloudUpdate');
    },
    watchCloudDb({ getters, commit })
    {
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
            // saveToLocalStorage('working_tasks', cloudTasks.tasks);

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
    getTask: (state) => (id) => state.tasks[id],
    isCloudLoading: (state) => state.cloudLoading,
    getLastCloudDispatch: (state) => state.lastCloudDispatch,
    getLastCloudUpdate: (state) => state.lastCloudUpdate
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
