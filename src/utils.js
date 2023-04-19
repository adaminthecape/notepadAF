import { app, shell } from 'electron';
import * as path from 'path';
import * as moment from 'moment';

export function openInBrowser(link)
{
    shell.openExternal(link);
}

export function getNotesDbPath(filename)
{
    return localStorage.getItem('notesDbFullPath');
}

export function setNotesDbPath(filename)
{
    setLocalStorageFilePath(undefined, 'notesdb', '.json');
}

export function setLocalStorageFilePath(dir, filename, extension)
{
    if(!dir)
    {
        dir = app.getAppPath();
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