// import { google } from 'googleapis';
// import firebase from "firebase";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, query } from "firebase/database";
import {getFromLocalStorage, queueTaskRefresh, saveToLocalStorage} from "src/utils";
import {
    getAuth,
    // createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import {cProtocols} from "src/mixins/rtdb";

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
    return getFromLocalStorage('firebase_config', true) || undefined;
}

export function getAdmin()
{
    return getFromLocalStorage('firebase_service_account') || undefined;
}

export async function setAuthToken()
{
    const { google } = require('googleapis');

    // Load the service account key JSON file.
    const serviceAccount = getAdmin();

    if(!serviceAccount)
    {
        console.warn('No credentials found!');

        return undefined;
    }

    // Define the required scopes.
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/firebase.database"
    ];

    // Authenticate a JWT client with the service account.
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        scopes
    );

    // Use the JWT client to generate an access token.
    await new Promise((resolve, reject) =>
    {
        jwtClient.authorize(function(error, tokens) {
            if (error) {
                console.log("Token request ERROR:", error);
                resolve(undefined);
            } else if (tokens.access_token === null) {
                console.log("Provided service account does not have permission to generate access tokens");
                resolve(undefined);
            } else {
                const localData = {
                    token: tokens.access_token,
                    expires: tokens.expiry_date
                };
                saveToLocalStorage('firebase_token', localData);
                resolve(localData);

                // See the "Using the access token" section below for information
                // on how to use the access token to send authenticated requests to
                // the Realtime Database REST API.
            }
        });
    });
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
    return getFromLocalStorage('authed_user', true);
}

function setCredentials(user)
{
    try
    {
        saveToLocalStorage('authed_user', JSON.stringify({
            accessToken: user.accessToken,
            expires: user.expires || (Date.now() + (60 * 60 * 1000))
        }));
    }
    catch(e)
    {
        saveToLocalStorage('authed_user', '');
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

export async function firebaseFetch(method, url, data)
{
    try
    {
        const token = await getToken();
        const headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);

        // const uid = '64b98f0-b996-4bf3-9732-1f3270ac6c47';
        // const user = getFromLocalStorage('user_account', true);

        // url = `${url}?auth=${token}`;
        // const auth = {
        //     uid,
        //     token: {
        //         sub: uid,
        //         email: user.email,
        //         email_verified: true,
        //         firebase: {
        //             sign_in_provider: 'password'
        //         }
        //     }
        // };

        const auth = getAuth();
        const { currentUser } = auth;

        console.info('getAuth:', auth, currentUser);

        const opts = { method, headers };

        if(data && (method !== cProtocols.get))
        {
            opts.body = JSON.stringify(data);
        }

        console.info('firebaseFetch:', { token, url, opts, headers: headers.toString() });

        const res = await fetch(url, opts);
        const result = await pipeStream(res.body);

        console.info('firebaseFetch:', result);

        return result;
    }
    catch(e)
    {
        console.error(e);

        return undefined;
    }
}

export async function writeTasksToFirebaseDb(tasks) {
    const db = await getDb();

    await set(ref(db, dbName), {
        tasks,
        updated: Date.now()
    });
}

export function removeUndefined(inputData)
{
    const data = structuredClone(inputData);

    if(typeof data === 'object')
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
) {
    const db = await getDb();
    const fullPath = `${
        dbName
    }/tasks/${
        taskId
    }/${
        path.split('.').join('/')
    }`;

    console.warn('update_TaskDataByPath:', fullPath, data);

    console.log(data, removeUndefined(data));

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
    const me = getFromLocalStorage('user_account', true);

    return authenticateViaEmailAndPassword(me);
}