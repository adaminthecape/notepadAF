import deepmerge from "deepmerge";
import fs from "fs";
import path from "path";
import {getAppBasePath} from "src/utils";

export function $log(...args)
{
    console.warn(...args);
}

export function readFromDir(
    dirPath,
    opts = { extensions: ['txt', 'md'] },
    thenFn
)
{
    $log('readFromDir', dirPath);
    const fs = require('fs');

    $log('readFromDir', `fs :: ${!!fs}`);
    fs.readdir(dirPath, (err, files) =>
    {
        if(
            Array.isArray(files) &&
            Array.isArray(opts.extensions) &&
            opts.extensions.length
        )
        {
            files = files.filter((file) => (
                opts.extensions.includes(file.split('.').pop())
            ));
        }

        files = files.map((f) => ({
            name: f.includes('.') ? f.split('.').shift() : f,
            ext: f.includes('.') ? f.split('.').pop() : undefined
        }));

        if(typeof thenFn === 'function')
        {
            thenFn(files);
        }
    });
};

export function readFileWithoutError(dir, filename, extension, thenFn)
{
    // implementation:
    // readFileWithoutError(
    //     dir, filename, extension,
    //     (fileContent) =>
    //     {
    //     }
    // );
    const path = `${dir}/${filename}.${extension}`;
    const fs = require('fs');

    fs.readFile(
        path,
        { encoding: 'utf8' },
        (err, data) =>
        {
            if(typeof thenFn === 'function')
            {
                thenFn(data);
            }
        }
    );
}

export function readFromDbSync(path, createFile = false)
{
    try
    {
        const data = fs.readFileSync(path, { encoding: 'utf8' });

        if(!data)
        {
            if(createFile)
            {
                try
                {
                    fsWriteSync(path, {});
                }
                catch(e)
                {
                    console.warn('readFromDbSync: error creating file', e);
                }
            }

            $log('readFromDb', `no data :: ${data}`);
            console.warn('file EMPTY:', data, path);
        }

        return data;
    }
    catch(e)
    {
        $log('readFromDbSync ERROR:', e.message);
        console.error(e);
    }
}

export function mergeData(source, key, newData, deep = false)
{
    if(deep)
    {
        return deepmerge(source, { [key]: newData });
    }
    else
    {
        return {
            ...source,
            [key]: newData
        };
    }
}

export function fsWriteSync(path, data)
{
    $log('fsWriteSync', `${path} :: ${data}`);

    try
    {
        try
        {
            const pathParts = path.split('\\');
            const dirPath = `${
                pathParts.slice(0, pathParts.length - 1).join('\\')
            }\\`;

            console.log({ dirPath });

            fs.mkdirSync(dirPath, { recursive: true } );
        }
        catch(e)
        {
            console.log('Cannot create folder ', e);

            return;
        }

        fs.writeFileSync(path, JSON.stringify(data));
    }
    catch(e)
    {
        $log('fsWriteSync ERROR:', `${path} :: ${data}`);
        console.error(e);
    }
}

export function _updateNoteInDb(noteData, deleteNote = false)
{
    $log('updateNoteInDb', noteData.id);

    const now = Date.now();

    if(!noteData.created)
    {
        noteData.created = now;
    }

    noteData.updated = now;

    const allNotes = JSON.parse(
        readFromDbSync('notesdb.json')
    );

    const existing = allNotes
        .find((item) => item.id && item.id === noteData.id);

    // find the existing item with this id if possible
    const existingIndex = allNotes
        .findIndex((item) => item.id && item.id === noteData.id);

    if(existingIndex > -1)
    {
        const toUpdate = {
            ...existing,
            ...noteData
        };

        if(deleteNote)
        {
            allNotes.splice(existingIndex, 1);
        }
        else
        {
            allNotes.splice(existingIndex, 1, toUpdate);
        }
    }

    saveAll(allNotes);
}

export function saveAll(allNotes)
{
    if(typeof allNotes === 'string')
    {
        try
        {
            allNotes = JSON.parse(allNotes);
        }
        catch(e)
        {
            //
        }
    }

    writeToDbSync(
        'notes',
        allNotes,
        {
            createTable: true,
            dbFile: 'notesdb.json'
        }
    );
}

export function deleteNote(note)
{
    _updateNoteInDb(note, true);
}

export function writeToDbSync(
    table,
    data,
    opts
)
{
    const baseOpts = {
        shouldMerge: false,
        createTable: true,
        dbFile: 'notesdb.json',
        baseDir: getAppBasePath()
    };

    opts = opts ? { ...baseOpts, ...opts } : baseOpts;

    let existingDbData = readFromDbSync(opts.dbFile, opts.createTable || false);

    if(!existingDbData)
    {
        existingDbData = '{}';
    }

    let db = JSON.parse(existingDbData);

    if(typeof db === 'string')
    {
        try
        {
            db = JSON.parse(existingDbData);
        }
        catch(e)
        {
            console.warn(e);
        }
    }

    if(typeof db === 'string')
    {
        try
        {
            db = JSON.parse(existingDbData);
        }
        catch(e)
        {
            console.warn(e);
        }
    }

    if(typeof data === 'string')
    {
        try
        {
            data = JSON.parse(data);
        }
        catch(e)
        {
            console.warn(e);
        }
    }

    if(!db[table])
    {
        if(!opts.createTable)
        {
            $log('writeToDb', 'invalid table!');
            console.warn('Not a valid table!');

            return;
        }

        db[table] = data;
    }

    if(typeof db[table] !== typeof data)
    {
        $log('writeToDb', `data type mismatch! ${typeof db[table]} : ${typeof data}`);
        console.warn('Data type mismatch!', typeof db[table], typeof data);

        return;
    }

    const mergedFileData = mergeData(db, table, data, opts.shouldMerge);

    const pathWithDir = path.join(opts.baseDir || '', opts.dbFile);

    fsWriteSync(pathWithDir, mergedFileData);
}

export default {
    name: 'DbMixin',
    methods: {
        readFromDir,
        readFileWithoutError,
        readFromDbSync,
        mergeData,
        fsWriteSync,
        writeToDbSync,
        saveAll,
        deleteNote
    }
};