// import { google } from 'googleapis';
// import firebase from "firebase";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getFromLocalStorage } from "src/utils";

const dbName = 'notes';
let app;
let db;

function getApp()
{
    const config = getFromLocalStorage('firebase_config', true);

    if(!config)
    {
        throw new Error('No firebase config found');
    }

    const app = initializeApp(config);

    return app;
}

function getDb()
{
    if(!app)
    {
        app = getApp();
    }

    if(db)
    {
        return db;
    }

    db = getDatabase();

    return db;
}

function getConfig()
{
    return getFromLocalStorage('firebase_config') || undefined;
}

export async function writeTasksToFirebaseDb(tasks) {
    const db = getDb();

    const res = await set(ref(db, dbName), {
        tasks,
        updated: Date.now()
    });

    console.log('writeTasksToFirebaseDb: res:', res);

    return res;
}

export async function readTasksFromFirebaseDb(withResult)
{
    if(typeof withResult !== 'function')
    {
        console.warn('readTasksFromFirebaseDb: Change handler required!');

        return;
    }

    const db = getDb();
    const dbRef = ref(db, dbName);

    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();

        console.log('readTasksFromFirebaseDb: new change:', data);

        withResult(data);
    });
}