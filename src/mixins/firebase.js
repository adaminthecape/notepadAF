// import { google } from 'googleapis';
// import firebase from "firebase";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getFromLocalStorage, saveToLocalStorage } from "src/utils";

const dbName = 'notes';
let app;
let db;

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
    return getFromLocalStorage('firebase_config', true) || undefined;
}

function getAdmin()
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
                console.log("Error making request to generate access token:", error);
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

async function getToken()
{
    let t = getFromLocalStorage('firebase_token', true);

    if(!t)
    {
        console.warn('No credentials found.');

        return undefined;
    }

    // if the token expiry is set but in the past, refresh it
    if(t.expires && (t.expires < Date.now()))
    {
        console.warn('Refreshing authentication...');
        t = await setAuthToken();
        console.warn('Refreshed authentication.');
    }

    if(!t || !t.token)
    {
        console.warn('You are not authorized!');

        return undefined;
    }

    return t.token;
}

export async function awaitStream(stream)
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

export async function firebaseFetch()
{
    const token = await getToken();

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);

    const opts = {
        method: 'GET',
        headers
    };

    const url = getConfig().databaseURL + '/notes.json';

    const res = await fetch(url, opts);

    console.info('res:', await awaitStream(res.body));
}

export async function writeTasksToFirebaseDb(tasks) {
    await firebaseFetch();
    const db = getDb();

    const res = await set(ref(db, dbName), {
        tasks,
        updated: Date.now()
    });

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