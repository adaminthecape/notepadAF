import { shell } from 'electron';
import * as path from 'path';
import * as moment from 'moment';
import { fsWriteSync, readFromDbSync } from 'src/mixins/jsondb';

export function openInBrowser(link)
{
    shell.openExternal(link);
}

export function flashTaskbarIcon()
{
    const window = require ("electron").remote.getCurrentWindow();

    const disable = () => window.flashFrame(false);

    window.once('focus', disable);
    window.flashFrame(true);

    return disable;
}

export function clearAllFlashes()
{
    const window = require ("electron").remote.getCurrentWindow();

    window.flashFrame(false);
    window.focus();
}

export function getAppBasePath()
{
    const pathParts = require('electron').remote.app.getAppPath().split('\\');

    return pathParts
        .slice(0, pathParts.length - 2)
        .join('\\');
        // .replace('.quasar\\electron', '');
}

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

export function timeSince(time)
{
    return moment(time).fromNow();
}

export function saveToLocalStorageArray(name, data)
{
    const existingData = getFromLocalStorage(name) || [];

    console.log({ existingData });

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
        console.log({ data });

        existingData.push(data);
    }

    console.log({ existingData });

    saveToLocalStorage(name, JSON.stringify(existingData));
}

export function saveToExternalBackup(
    source, //: { dir: string, file: string, ext: string }
    target //: { dir: string, file: string, ext: string }
)
{
    if(!target || !source)
    {
        console.warn({ source, target });

        throw new Error('You need a target and a source to save a backup!');
    }

    const sourcePath = path.join(source.dir, `${source.file}.${source.ext}`);
    const targetPath = path.join(target.dir, `${target.file}.${target.ext}`);

    console.warn('sourcePath:', sourcePath, targetPath);

    let fileData = readFromDbSync(sourcePath, false);

    if(!fileData)
    {
        console.warn({ source, target });

        throw new Error('No data found to back up!');
    }

    if(typeof fileData === 'string')
    {
        try
        {
            fileData = JSON.parse(fileData);
        }
        catch(e)
        {
            //
        }
    }

    if(typeof fileData === 'string')
    {
        try
        {
            fileData = JSON.parse(fileData);
        }
        catch(e)
        {
            //
        }
    }

    console.info({ fileData });

    fsWriteSync(targetPath, fileData);

    saveToLocalStorageArray('external_backups', target);
}

export function restoreFromExternalBackup(
    target, //: { dir: string, file: string, ext: string }
    source //: { dir: string, file: string, ext: string }
)
{
    if(!target || !source)
    {
        console.warn({ source, target });

        throw new Error('You need a target and a source to save a backup!');
    }

    const sourcePath = path.join(source.dir, `${source.file}.${source.ext}`);
    const targetPath = path.join(target.dir, `${target.file}.${target.ext}`);

    const fileData = readFromDbSync(sourcePath, false);

    if(!fileData)
    {
        console.warn({ source, target });

        throw new Error('No data found to restore from!');
    }

    let dataToSave = JSON.parse(fileData);

    if(typeof dataToSave === 'string')
    {
        try
        {
            dataToSave = JSON.parse(dataToSave);
        }
        catch(e)
        {
            //
        }
    }

    if(typeof dataToSave === 'string')
    {
        try
        {
            dataToSave = JSON.parse(dataToSave);
        }
        catch(e)
        {
            //
        }
    }

    console.info({ dataToSave });

    fsWriteSync(targetPath, dataToSave);
}

export function readFromExternalBackup(
    source //: { dir: string, file: string, ext: string }
)
{
    if(!source)
    {
        console.warn('You need a source to load a backup!', { source });

        return null;
    }

    const sourcePath = path.join(source.dir, `${source.file}.${source.ext}`);

    return readFromDbSync(sourcePath, false);
}

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

export function checkFilterBool(prop, task, filters)
{
    return typeof filters[prop] === 'boolean' ?
        filters[prop] ? task[prop] : !task[prop] :
        true;
}

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