import deepmerge from "deepmerge";
import fs from "fs";
import App from '../App';

export function $log(...args)
{
    try
    {
        App.methods.audit(...args);
    }
    catch(e)
    {
        console.warn(e);
    }
}

let debugTitle = '';
export function $debug(...args)
{
    try
    {
        console.warn('**** DEBUG:', debugTitle, ...args);
    }
    catch(e)
    {
        console.warn(e);
    }
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

export function writeToFile(dir, filename, extension, dataToWrite, thenFn)
{
    $log('writeToFile', JSON.stringify({ dir, filename, extension, dataToWrite: dataToWrite.slice(0, 50) }));
    const path = `${dir}/${filename}.${extension}`;

    fsWrite(path, dataToWrite, thenFn);
}

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

export function readFromDb(path, thenFn, createFile = false)
{
    $log('readFromDb');
    const fs = require('fs');

    $log('readFromDb', `fs :: ${!!fs}`);
    fs.readFile(
        path,
        { encoding: 'utf8' },
        (err, data) =>
        {
            if(err)
            {
                $log('readFromDb', `error :: ${err} (${createFile})`);
                console.warn('file read ERROR:', err);

                if(!createFile)
                {
                    return;
                }

                fsWrite(path, {}, (err, data) =>
                {
                    $log('readFromDb', JSON.stringify({ err, data }));

                    if(typeof thenFn === 'function')
                    {
                        $log('readFromDb', 'created file');
                        thenFn(data);
                    }

                    return;
                });
            }
            else if(!data)
            {
                $log('readFromDb', `no data :: ${data}`);
                console.warn('file EMPTY:', data, path);
            }

            if(typeof thenFn === 'function')
            {
                $log('readFromDb', `success :: ${data}`);
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
        $log('mergeData', 'deepmerging...');

        return deepmerge(source, { [key]: newData });
    }
    else
    {
        $log('mergeData', 'merging...');

        return {
            ...source,
            [key]: newData
        };
    }
}

export function fsWrite(path, data, thenFn)
{
    $log('fsWrite', `${path} :: ${data}`);
    fs.writeFile(path, JSON.stringify(data), (err) =>
    {
        if(err)
        {
            $log('fsWrite', `ERROR :: ${err}`);
            console.warn('file read ERROR:', err);

            return;
        }

        if(typeof thenFn === 'function')
        {
            $log('fsWrite', `success :: ${path} - ${typeof data}`);
            thenFn(data);
        }
    });
}

export function fsWriteSync(path, data)
{
    $log('fsWriteSync', `${path} :: ${data}`);

    try
    {
        fs.writeFileSync(path, JSON.stringify(data));
    }
    catch(e)
    {
        $log('fsWriteSync ERROR:', `${path} :: ${data}`);
        console.error(e);
    }
}

export function _updateNoteInDb(allNotes, noteData, deleteNote = false, thenFn)
{
    $log('updateNoteInDb', noteData.id);

    const now = Date.now();

    if(!noteData.created)
    {
        noteData.created = now;
    }

    noteData.updated = now;

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

    saveAll(allNotes, thenFn);
}

export function saveAll(allNotes)
{
    writeToDbSync('notes', allNotes, { createTable: true, dbFile: 'notesdb.json' });

    console.info('updated all notes');
}

export function deleteNote(note)
{
    _updateNoteInDb(note, true);
}

export function writeToDb(table, data, thenFn, opts = { shouldMerge: false, createTable: true, dbFile: 'notesdb.json' })
{
    $log('writeToDb', JSON.stringify({ table, data, opts }));

    if(!data)
    {
        console.warn('Invalid data!');

        return;
    }

    readFromDb(opts.dbFile, (existingDbData) =>
    {
        if(!opts)
        {
            opts = {};
        }

        if(!existingDbData)
        {
            existingDbData = '{}';
        }

        const db = JSON.parse(existingDbData);

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

        fsWrite(opts.dbFile, mergedFileData, thenFn);
    });
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
        dbFile: 'notesdb.json'
    };

    opts = opts ? { ...baseOpts, ...opts } : baseOpts;

    debugTitle = 'writeToDbSync';
    $debug('start');

    let existingDbData = readFromDbSync(opts.dbFile, opts.createTable || false);

    if(!existingDbData)
    {
        existingDbData = '{}';
    }

    const db = JSON.parse(existingDbData);

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

    fsWriteSync(opts.dbFile, mergedFileData);
}

export default {
    name: 'DbMixin',
    inject: ['$log', '$notify'],
    methods: {
        readFromDir,
        writeToFile,
        readFileWithoutError,
        readFromDb,
        readFromDbSync,
        mergeData,
        fsWrite,
        fsWriteSync,
        writeToDb,
        writeToDbSync,
        saveAll,
        deleteNote
    }
};