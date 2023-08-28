// import { google } from 'googleapis';
// import firebase from "firebase";
import { initializeApp } from '@firebase/app';
import { getDatabase, ref, onValue, set } from '@firebase/database';
import {
  getFromLocalStorage,
  LocalStorageName,
  reduceIntoAssociativeArray,
  saveToLocalStorage,
} from 'src/utils';
import {
  getAuth,
  // createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@firebase/auth';
import { Task } from 'src/types';
import { generate as uuid } from 'src/components/composables/uuid';

export function isDebug() {
  return true;
}

const dbName = 'notes';
let db: any,
  intialised = false;

export function makeFakeTask(): Task {
  const id = uuid();
  const now = Date.now();
  const pick = (a: any, b: any): any => (Math.random() * 9 < 4 ? a : b);

  return {
    id,
    message: `Message for ${id}`,
    created: now - Math.random() * 10000000,
    updated: now - Math.random() * 100000,
    done: pick(now - Math.random() * 100000, 0),
    active: pick(now - Math.random() * 100000, 0),
    deleted: 0,
    tags: [],
    alerts: [],
    stories: [],
    activity: [],
    subtasks: [],
  };
}

const mockTasks = reduceIntoAssociativeArray(
  [...Array(10).keys()].map(() => makeFakeTask()),
  'id'
);

async function initApp() {
  if (intialised) {
    return;
  }

  await getApp();
  await authenticateMe();

  intialised = true;
}

async function getApp() {
  const config = getConfig();

  if (!config) {
    throw new Error('No firebase config found');
  }

  const app = initializeApp(config);

  return app;
}

export async function getDb() {
  await initApp();

  if (db) {
    return db;
  }

  if (isDebug()) {
    return {};
  }

  db = getDatabase();

  return db;
}

export function getConfig() {
  return (
    getFromLocalStorage(LocalStorageName.firebase_config, true) || undefined
  );
}

export function getAdmin() {
  return (
    getFromLocalStorage(LocalStorageName.firebase_service_account) || undefined
  );
}

type UserCredentials = Record<string, any>;

function validateCredentials(credentials: UserCredentials) {
  try {
    if (!credentials) {
      throw new Error('No credentials found.');
    }

    if (!credentials.accessToken) {
      throw new Error('Access token missing or invalid.');
    }

    if (credentials.expires && credentials.expires < Date.now()) {
      throw new Error('Access token is expired.');
    }

    return true;
  } catch (e) {
    console.warn(e);

    return false;
  }
}

function getCredentials() {
  return getFromLocalStorage(LocalStorageName.authed_user, true);
}

function setCredentials(user: UserCredentials) {
  try {
    saveToLocalStorage(
      LocalStorageName.authed_user,
      JSON.stringify({
        accessToken: user.accessToken,
        expires: user.expires || Date.now() + 60 * 60 * 1000,
      })
    );
  } catch (e) {
    saveToLocalStorage(LocalStorageName.authed_user, '');
  }
}

export async function getToken() {
  try {
    // get existing token
    let credentials = getCredentials();

    // if no existing valid token, try to get a new one
    if (!validateCredentials(credentials)) {
      const user = await authenticateMe();

      // set the credentials; if wrong, they won't work anyway
      setCredentials(user as UserCredentials);
    }

    credentials = getCredentials();

    if (!validateCredentials(credentials)) {
      return undefined;
    }

    // return the token
    return credentials.accessToken;
  } catch (e) {
    console.error(e);

    return undefined;
  }
}

export async function pipeStream(stream: ReadableStream) {
  const set = [];
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    set.push(value);
  }

  return set.join('');
}

export async function writeTasksToFirebaseDb(tasks: Record<string, Task>) {
  const db = await getDb();

  if (isDebug()) {
    console.warn('writeTasksToFirebaseDb (DEBUG)', tasks);

    return;
  }

  await set(ref(db, dbName), {
    tasks,
    updated: Date.now(),
  });
}

export function removeUndefined(inputData: any, depth = 0): any {
  if (depth > 100 || typeof inputData === 'undefined') {
    return null;
  }

  if (inputData !== null && typeof inputData !== 'object') {
    return inputData;
  }

  if (Array.isArray(inputData)) {
    return inputData.map((item) => removeUndefined(item));
  }

  const data = { ...inputData };

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'undefined') {
      data[key] = null;
    }
  });

  return data;
}

export async function updateTaskDataByPath(
  taskId: string,
  path: string,
  data: any
) {
  const db = await getDb();
  const fullPath = `${dbName}/tasks/${taskId}/${path.split('.').join('/')}`;

  console.log('update:', fullPath, removeUndefined(data));

  if (isDebug()) {
    return;
  }

  await set(ref(db, fullPath), removeUndefined(data));
}

export async function readTasksFromFirebaseDb(
  withResult: (result: any) => any
) {
  console.warn('readTasksFromFirebaseDb: start');
  if (typeof withResult !== 'function') {
    console.warn('readTasksFromFirebaseDb: Change handler required!');

    return;
  }

  if (isDebug()) {
    console.warn('readTasksFromFirebaseDb');
    withResult({ tasks: mockTasks });
  } else {
    const db = await getDb();
    const dbRef = ref(db, dbName);

    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();

      withResult(data);
    });
  }
}

export async function authenticateViaEmailAndPassword(user: UserCredentials) {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    if (isDebug()) {
      console.warn('Authentication (DEBUG)');
      return resolve(true);
    }

    signInWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        console.log('user:', userCredential.user);
        // Signed in
        resolve(userCredential.user);
      })
      .catch((error) => {
        console.error(error);
        reject('Authentication failed.');
      });
  });
}

export async function authenticateMe() {
  const me = getFromLocalStorage(LocalStorageName.user_account, true);

  return authenticateViaEmailAndPassword(me);
}
