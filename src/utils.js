import { v4 as uuidv4 } from 'uuid';

export function openInBrowser(link)
{
    require("electron").shell.openExternal(link);
    // window.open(link, '_blank');
}

export function getAppBasePath()
{
    const pathParts = require('electron').remote.app.getAppPath().split('\\');

    return pathParts
        .slice(0, pathParts.length - 2)
        .join('\\');
        // .replace('.quasar\\electron', '');
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

/** Filter the list of tasks based on provided filters */
export function filterTaskList(tasks, filters)
{
    return tasks.filter((task) => (
        (
            !filters.id ? true :
                task.id === filters.id
        ) &&
        (
            !filters.tags || !filters.tags.length ? true :
                !task.tags ? false : task.tags.some((t) => filters.tags.includes(t))
        ) &&
        (
            !filters.keyword ? true :
                `${
                    task.message.toLowerCase()
                } ${
                    (task.tags || []).join('').toLowerCase()
                }`.indexOf(filters.keyword.toLowerCase()) > -1
        ) &&
        checkFilterBool('done', task, filters) &&
        checkFilterBool('archived', task, filters) &&
        checkFilterBool('active', task, filters)
    ));
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

    console.info('cudTask:', taskData);
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

/**
 * Update task via db interface. Do NOT use any other fn to dispatch task updates,
 * unless it goes through here.
 * @param {Object} store
 * @param {Object} taskData
 * @param {boolean} deleteTask
 */
export async function cudTaskViaStore(store, taskData, deleteTask = false)
{
    const storeFn = async (tasks) =>
    {
        await store.dispatch('notes/update', {
            note: {
                id: 'tasks',
                tasks
            }
        })
    };

    await cudTask(
        getAllTasksFromStore(store),
        storeFn,
        taskData,
        deleteTask
    );

    queueTaskRefresh(taskData.id);
}

/**
 * Add a task id to an array which is checked by TasksActivity.
 * The task will be re-rendered when the array value is checked.
 * @param id
 */
export function queueTaskRefresh(id)
{
    console.info('queue:', id);
    saveToLocalStorageArray('taskRefreshQueue', id);
}

export function getAllTasksFromStore(store)
{
    if(!store) return undefined;

    return store.getters['notes/getNote']('tasks') ?
        store.getters['notes/getNote']('tasks').tasks :
        undefined;
}

export function getTaskByIdFromStore(store, id)
{
    if(!id || !store) return undefined;

    return getAllTasksFromStore(store).find((t) => t.id === id);
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
export function qNotify(q, message, opts, action)
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
