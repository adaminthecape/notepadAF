// import { google } from 'googleapis';
// import firebase from "firebase";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import {getFromLocalStorage, localStorageNames, saveToLocalStorage} from "src/utils";
import {
    getAuth,
    // createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";

const dbName = 'notes';
let db,
    intialised = false;

async function initApp()
{
    if(intialised)
    {
        return;
    }

    await getApp();
    await authenticateMe();

    intialised = true;
}

async function getApp()
{
    const config = getConfig();

    if(!config)
    {
        throw new Error('No firebase config found');
    }

    const app = initializeApp(config);

    return app;
}

export async function getDb()
{
    await initApp();

    if(db)
    {
        return db;
    }

    db = getDatabase();

    return db;
}

export function getConfig()
{
    return getFromLocalStorage(localStorageNames.firebase_config, true) || undefined;
}

export function getAdmin()
{
    return getFromLocalStorage(localStorageNames.firebase_service_account) || undefined;
}

function validateCredentials(credentials)
{
    try
    {
        if(!credentials)
        {
            throw new Error('No credentials found.');
        }

        if(!credentials.accessToken)
        {
            throw new Error('Access token missing or invalid.');
        }

        if(credentials.expires && (credentials.expires < Date.now()))
        {
            throw new Error('Access token is expired.');
        }

        return true;
    }
    catch(e)
    {
        console.warn(e);

        return false;
    }
}

function getCredentials()
{
    return getFromLocalStorage(localStorageNames.authed_user, true);
}

function setCredentials(user)
{
    try
    {
        saveToLocalStorage(localStorageNames.authed_user, JSON.stringify({
            accessToken: user.accessToken,
            expires: user.expires || (Date.now() + (60 * 60 * 1000))
        }));
    }
    catch(e)
    {
        saveToLocalStorage(localStorageNames.authed_user, '');
    }
}

export async function getToken()
{
    try
    {
        // get existing token
        let credentials = getCredentials();

        // if no existing valid token, try to get a new one
        if(!validateCredentials(credentials))
        {
            const user = await authenticateMe();

            // set the credentials; if wrong, they won't work anyway
            setCredentials(user);
        }

        credentials = getCredentials();

        if(!validateCredentials(credentials))
        {
            return undefined;
        }

        // return the token
        return credentials.accessToken;
    }
    catch(e)
    {
        console.error(e);

        return undefined;
    }
}

export async function pipeStream(stream)
{
    const set = [];
    const reader = stream.pipeThrough(new TextDecoderStream()).getReader();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        set.push(value);
    }

    return set.join('');
}

export async function writeTasksToFirebaseDb(tasks) {
    const db = await getDb();

    await set(ref(db, dbName), {
        tasks,
        updated: Date.now()
    });
}

export function removeUndefined(inputData, depth = 0)
{
    if(depth > 100)
    {
        return null;
    }

    const data = structuredClone(inputData);

    if(Array.isArray(data))
    {
        return data.map((item) => removeUndefined(item));
    }
    else if(typeof data === 'object')
    {
        Object.keys(data).forEach((key) =>
        {
            if(typeof data[key] === 'undefined')
            {
                data[key] = null;
            }
        })
    }
    else if(typeof data === 'undefined')
    {
        return null;
    }

    return data;
}

export async function updateTaskDataByPath(
    /** @type {string} */taskId,
    /** @type {string} */path,
    /** @type {*} */data
)
{
    const db = await getDb();
    const fullPath = `${
        dbName
    }/tasks/${
        taskId
    }/${
        path.split('.').join('/')
    }`;

    await set(ref(db, fullPath), removeUndefined(data));
}

export async function readTasksFromFirebaseDb(withResult)
{
    console.warn('readTasksFromFirebaseDb: start');
    if(typeof withResult !== 'function')
    {
        console.warn('readTasksFromFirebaseDb: Change handler required!');

        return;
    }

    const db = await getDb();
    const dbRef = ref(db, dbName);

    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();

        withResult(data);
    });
}

export async function authenticateViaEmailAndPassword(user)
{
    const auth = getAuth();

    return new Promise((resolve, reject) =>
    {
        signInWithEmailAndPassword(auth, user.email, user.password)
            .then((userCredential) => {
                // Signed in
                resolve(userCredential.user);
            })
            .catch((error) => {
                console.error(error);
                reject('Authentication failed.');
            });
    });
}

export async function authenticateMe()
{
    const me = getFromLocalStorage(localStorageNames.user_account, true);

    return authenticateViaEmailAndPassword(me);
}