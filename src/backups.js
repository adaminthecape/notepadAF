import path from "path";
import {fsWriteSync, readFromDbSync} from "src/mixins/jsondb";
import {saveToLocalStorageArray} from "src/utils";

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
