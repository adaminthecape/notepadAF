import Vue from 'vue';
import { readFromDbSync, saveAll } from 'src/mixins/jsondb';
import { readTasksFromFirebaseDb, writeTasksToFirebaseDb } from 'src/mixins/firebase';
import { v4 as uuidv4 } from 'uuid';

const state = {
    tasks: [],
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

        Object.keys(task).forEach((key) =>
        {
            if(typeof task[key] === 'undefined')
            {
                delete task[key];
            }
        });

        const tasks = state.tasks;

        const existingIndex = tasks.findIndex((t) => t.id === task.id);

        if(existingIndex > -1)
        {
            if(JSON.stringify(tasks[existingIndex]) === JSON.stringify(task))
            {
                return;
            }
            else if(merge)
            {
                tasks.splice(existingIndex, 1, {
                    ...tasks[existingIndex],
                    task
                });
            }
            else
            {
                tasks.splice(existingIndex, 1, task);
            }
        }
        else
        {
            tasks.push(task);
        }

        Vue.set(state, 'tasks', tasks);
    },
    SAVE_TASKS_TO_JSON(state, tasks)
    {
        saveAll(tasks);
    },
    SAVE_TASKS_TO_CLOUD(state, tasks)
    {
        console.log('SAVE_TASKS_TO_CLOUD:', tasks);
        if(!tasks || !tasks.length)
        {
            return;
        }

        writeTasksToFirebaseDb(tasks);
    },
    SAVE_TASKS_TO_CLOUD_FROM_STATE(state)
    {
        console.log('SAVE_TASKS_TO_CLOUD_FROM_STATE:', state.tasks);
        if(!state.tasks || !state.tasks.length)
        {
            return;
        }

        writeTasksToFirebaseDb(state.tasks);
    }
};

const actions = {
    async cloudUpdate({ commit }, tasks)
    {
        commit('SAVE_TASKS_TO_CLOUD', tasks);
    },
    async cloudUpdateSingle({ commit }, task)
    {
        console.log('cloudUpdateSingle', { task });
        if(!task || typeof task !== 'object')
        {
            return;
        }

        const now = Date.now();

        commit('SET_TASK', {
            ...task,
            updated: now,
            created: task.created || now,
            id: task.id || uuidv4()
        });

        commit('SET_LAST_CLOUD_DISPATCH');
        commit('SAVE_TASKS_TO_CLOUD_FROM_STATE');
    },
    watchCloudDb({ commit })
    {
        commit('SET_CLOUD_LOADING', true);

        // init connection with cloud db & update store on change
        readTasksFromFirebaseDb((cloudTasks) =>
        {
            commit('SET_CLOUD_LOADING', true);
            if(!cloudTasks)
            {
                return;
            }

            commit('SET_LAST_CLOUD_UPDATE');

            const localTasks = getters.all() || [];

            console.log({ localTasks });

            cloudTasks.tasks.forEach((task) =>
            {
                commit('SET_TASK', task);
            });

            setTimeout(() =>
            {
                commit('SET_CLOUD_LOADING', false);
            }, 200);
        });
    },
    updateJson({ commit, dispatch }, tasks)
    {
        console.log('updateJson', { tasks });
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

        console.log('parsed data:', parsed);

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
    all: (state) => state ? state.tasks : undefined,
    getTask: (state) => (id) => state.tasks.find((n) => n.id === id),
    isCloudLoading: (state) => state.cloudLoading
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
