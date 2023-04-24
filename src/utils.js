import { shell } from 'electron';
import * as path from 'path';
import * as moment from 'moment';
import {fsWriteSync, readFromDbSync, writeToDbSync} from "src/mixins/jsondb";

export function openInBrowser(link)
{
    shell.openExternal(link);
}

export function getAppBasePath()
{
    const pathParts = require('electron').remote.app.getAppPath().split('\\');

    return pathParts
        .slice(0, pathParts.length - 2)
        .join('\\');
        // .replace('.quasar\\electron', '');
}

export function getNotesDbPath(filename)
{
    return localStorage.getItem('notesDbFullPath');
}

export function setNotesDbPath(filename)
{
    setLocalStorageFilePath(undefined, 'notesdb', 'json');
}

export function setLocalStorageFilePath(dir, filename, extension)
{
    if(!dir)
    {
        dir = getAppBasePath();
    }

    if(!extension)
    {
        extension = '.json'
    }

    const fullPath = path.join(dir, `${filename}.${extension}`);

    saveToLocalStorage(`${filename}FilePath`, fullPath);
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

export function getFromLocalStorage(name)
{
    const data = localStorage.getItem(name);
    let parsedData;

    try
    {
        parsedData = JSON.parse(data);
    }
    catch(e)
    {
        //
    }

    if(parsedData && typeof parsedData === 'object')
    {
        return JSON.parse(data);
    }
    else
    {
        return data;
    }
}

export function timeSince(time)
{
    return moment(time).fromNow();
}

export function saveToLocalStorageArray(
    name,
    data
)
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