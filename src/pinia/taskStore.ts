import { defineStore } from 'pinia';
import { Note, Task } from 'src/types';
// import { readFromDbSync, saveAll } from 'src/mixins/jsondb.js';
import { getBasket, saveBasket } from 'src/mixins/pantry';
import { getFromLocalStorage } from 'src/utils';
import { google } from 'googleapis';

type RootState = {
  notes: Note[];
};

const useTaskStore = defineStore('taskStore', {
  state: () =>
    ({
      notes: [],
    } as RootState),
  getters: {
    all: (state) => state.notes,
    get: (state) => (id: string) => state.notes.find((n) => n.id === id),
  },
  actions: {
    setInitial() {
      const tasks = [
        {
          id: '0cd2b311-9367-483b-b23e-f88c019bc7f3',
          message:
            'Port tasks app to vue3/pinia\nChange all components to script setup / composition API\nCheck that fs can still be accessed',
          created: 1687976249463,
          tags: ['tasks'],
          updated: 1688068519183,
          description: null,
          done: null,
          links: [],
          active: 1688068433873,
          messageType: 'textarea',
        },
        {
          id: '457c30f0-4faa-4b6a-8485-500c94e9bf17',
          message:
            'Figure out how to share json data across platforms (G sheets?)',
          created: 1687976316017,
          tags: ['tasks'],
          updated: 1688627939942,
          description: null,
          done: 1688627939942,
          links: [],
        },
        {
          id: '36de9473-9180-4b7e-8fa2-34f3919c9213',
          message: 'Get DIY plans for kneeling chair',
          created: 1687977535422,
          tags: ['DIY'],
          updated: 1688062504407,
          description: null,
          done: null,
          links: [],
        },
        {
          id: 'fbc0731e-035f-48ed-bf2d-744252553659',
          message: 'Get hooks for hanging headphones',
          created: 1687977560335,
          tags: ['DIY', 'shopping'],
          updated: 1688413909235,
          description: null,
          done: 1688413908407,
          links: [],
          active: 0,
        },
        {
          id: '59c8bf60-b0ec-4cd6-98a8-0c090b731aad',
          message: 'Implement repeating due dates',
          created: 1687977598965,
          tags: ['tasks'],
          updated: 1688037309563,
          description: null,
          done: null,
          links: [],
        },
        {
          id: '9ae31b18-7986-4fc4-bd73-6d9be9a89d8d',
          message: 'Implement changing done date\nShow done date as timestamp',
          created: 1687977614246,
          tags: ['tasks'],
          updated: 1688037614210,
          description: null,
          done: null,
          links: [],
          messageType: 'textarea',
        },
        {
          id: '5ae3c079-1bee-4e7b-a690-b1430007e555',
          message: 'Stop debouncing input on edit message',
          created: 1687977730109,
          tags: ['tasks'],
          updated: 1688202260646,
          description: null,
          done: 1688202260646,
          links: [],
        },
        {
          id: '2aeda893-0749-488f-be04-61c170d3dfc2',
          message: 'Save message on alt/ctrl+enter instead of @input (or tab?)',
          created: 1687977774461,
          tags: ['tasks'],
          updated: 1688037594951,
          description: null,
          done: 1688037594951,
          links: [],
        },
        {
          id: 'be4c6adf-746f-4f5e-8e5b-71e8987a4341',
          message: 'Show line breaks',
          created: 1687977898678,
          tags: ['tasks'],
          updated: 1688037590723,
          description: null,
          done: 1688037590723,
          links: [],
        },
        {
          id: '9308816a-31e5-4474-9be3-a97e8d7d8927',
          message: 'Add +1d / +2h options to CreateAlarm',
          created: 1687977944552,
          tags: ['tasks'],
          updated: 1687977974777,
          description: null,
          done: null,
          links: [],
          archived: false,
        },
        {
          id: '8c8508bc-0be1-4190-9bca-aa12e05cd048',
          message: 'Add activity logs',
          created: 1687978044843,
          tags: ['tasks'],
          updated: 1687978915154,
          description: null,
          done: 0,
          links: [],
          active: 0,
        },
        {
          id: 'ae40439a-1ab2-488e-8f01-e0d64444f9dc',
          message: 'Find a stretching plan',
          created: 1687978143574,
          tags: ['health'],
          updated: 1687978143575,
        },
        {
          id: '33cf7923-4482-4c3c-8e48-5bb35e84d30e',
          message: 'Find a workout plan & try some exercises',
          created: 1687978162776,
          tags: ['health'],
          updated: 1687978162776,
        },
        {
          id: 'fccef28b-27f2-4e0d-896b-bd1af5ee4f8d',
          message: 'Do stretches when you wake up',
          created: 1687978188511,
          tags: ['health'],
          updated: 1687978188511,
        },
        {
          id: '04d9f5b3-5f10-482e-ae82-0a88c0f76261',
          message: 'Record your weight',
          created: 1687978203585,
          tags: ['health'],
          updated: 1687978213133,
          description: null,
          done: null,
          links: [],
        },
        {
          id: 'b6ae11c6-2893-4bd8-bee9-33a56cfbc154',
          message: 'Remove .web.app site',
          created: 1687978349837,
          tags: ['misc'],
          updated: 1687978349838,
        },
        {
          id: '4b41c03e-a9c6-48fd-8092-ff335237d735',
          message: 'Compile PT activity data',
          created: 1687978378486,
          tags: ['misc'],
          updated: 1687978378487,
        },
        {
          id: 'bc2dce31-faed-41f8-8665-caf709a4c981',
          message: 'Gel pad for wrists',
          created: 1687978413913,
          tags: ['shopping'],
          updated: 1687978413913,
        },
        {
          id: 'd154d822-f8dc-45b6-b2d6-79b3b30a25b7',
          message: 'Get 2x2s and supplies to build cabinet',
          created: 1687978450441,
          tags: ['DIY'],
          updated: 1687978450441,
        },
        {
          id: 'ad17dbf1-491e-4455-8cef-88c8875df2c2',
          message: 'Get estimates for grow lights + fans + plant food',
          created: 1687978467918,
          tags: ['DIY'],
          updated: 1687978467918,
        },
        {
          id: 'fbc9b8a2-875a-43a2-b8bd-fb646dcc52d3',
          message: 'Find out how to repaint moldy ceiling',
          created: 1687978497722,
          tags: ['DIY'],
          updated: 1687978497722,
        },
        {
          id: '89c07ba2-aa9f-48ee-9056-cc96c6757ba1',
          message: 'Read ADHD book to page 20',
          created: 1687978545085,
          tags: ['health'],
          updated: 1688037261453,
          description: null,
          done: null,
          links: [],
        },
        {
          id: '5b95b41e-4143-460c-bb89-f78c27502e64',
          message: 'Research chore wheel plans',
          created: 1687978579452,
          tags: ['misc'],
          updated: 1687978579452,
        },
        {
          id: 'cea002e8-f9c6-4a6f-a1b5-608bfa4543c7',
          message:
            'Filter by tag on click (add to filters.tags[]) (convert to btn)',
          created: 1687978760915,
          tags: ['tasks'],
          updated: 1688037237781,
          description: null,
          done: 1688037237781,
          links: [],
        },
        {
          id: '0be8d555-c3ef-4387-9ce0-3b71b153ba98',
          message: 'On marked done, clear active & hide active toggle',
          created: 1687978934976,
          tags: ['tasks'],
          updated: 1687979666524,
          description: null,
          done: 0,
          links: [],
          active: 0,
        },
        {
          id: '933be920-7711-440b-ba98-b6843064d7ba',
          message: 'Replace dblclicks with DoubleClickButton component',
          created: 1687979130364,
          tags: ['tasks'],
          updated: 1688037233584,
          description: null,
          done: 1688037233584,
          links: [],
          alerts: [],
          messageType: 'textarea',
        },
        {
          id: '524b198b-9e01-4e55-8219-73ef77ceae0a',
          message: 'Use q-input on message div only (not replace whole q-item)',
          created: 1687979396535,
          tags: ['tasks'],
          updated: 1688037229931,
          description: null,
          done: 1688037229931,
          links: [],
        },
        {
          id: 'b80dc85b-b277-4eaf-9b2a-47f4335f44ef',
          message: 'Sort by created date when clearing sort',
          created: 1687979544853,
          tags: ['tasks'],
          updated: 1688037210168,
          description: null,
          done: 1688037210168,
          links: [],
        },
        {
          id: 'c7471d91-1edc-4b6a-b7a6-d6fa146329cb',
          message: 'Add short/medium/long estimation to tasks',
          created: 1687979579233,
          tags: ['tasks'],
          updated: 1688037192585,
          description: null,
          done: 0,
          links: [],
          active: 0,
          alerts: [],
        },
        {
          id: '82ff5bda-9889-4117-9a7a-8752708585c8',
          message: 'Flatten bool toggles',
          created: 1687979747475,
          tags: ['tasks'],
          updated: 1688202257218,
          description: null,
          done: 1688202257218,
          links: [],
        },
        {
          id: '4b998d38-cbc7-4c70-b1ce-f2226bfff759',
          message: 'Take morning meds',
          created: 1688037367469,
          tags: ['health', 'recurring'],
          updated: 1688037575320,
          description: null,
          done: 0,
          links: [],
        },
        {
          id: 'ed0c1277-e69f-4078-ab70-97eee6046df9',
          message: 'Take midday meds',
          created: 1688037371811,
          tags: ['health', 'recurring'],
          updated: 1688037571355,
          description: null,
          done: 0,
          links: [],
        },
        {
          id: 'bac3d6f0-f7f0-47f7-97fa-dc7797e0d411',
          message: 'Take afternoon meds',
          created: 1688037376773,
          tags: ['health', 'recurring'],
          updated: 1688037563243,
          description: null,
          done: 0,
          links: [],
        },
        {
          id: 'f490cb5b-3dc1-45fd-8e11-e3485746ba43',
          message: 'Clean car',
          created: 1688037521260,
          tags: ['car'],
          updated: 1688037521261,
        },
        {
          id: 'd36e920b-8f49-4e45-996f-f68cd0eae9cf',
          message: 'Get quote for insurance',
          created: 1688037533136,
          tags: ['car'],
          updated: 1688037533137,
        },
        {
          id: 'e054fdd0-b086-43f0-b8a5-ecaef7b06b78',
          message: 'Check debit order dates',
          created: 1688037543559,
          tags: ['car'],
          updated: 1688037543559,
        },
        {
          id: 'b4db4b27-abbf-4704-a671-7d35b1ae07a5',
          message: 'Split components into smaller chunks',
          created: 1688037634729,
          tags: ['tasks'],
          updated: 1688068318444,
          description: null,
          done: 1688068318444,
          links: [],
        },
        {
          id: 'ce2e23bb-2749-4acd-9276-28245774d683',
          message:
            'pipe wrench\nhttps://www.makro.co.za/hardware-auto/hand-tools/loose-tools/wrenches/wrenches/grip-350-mm-pipe-wrench/p/000000000000403299_EA',
          created: 1688038021865,
          tags: ['DIY', 'shopping'],
          updated: 1688413905239,
          description: null,
          done: 1688413903650,
          links: [],
          messageType: 'textarea',
          alerts: [
            {
              date: '07/01/2023',
              time: '10:00',
              unix: 1688198400000,
            },
          ],
          active: 0,
        },
        {
          id: '636453c8-c27d-4c10-86ef-4022fa9825fd',
          message: 'Implement pantry cloud storage',
          created: 1688366231875,
          tags: ['tasks'],
          done: 1688627908057,
          updated: 1688627908057,
          description: null,
          links: [],
        },
      ];

      console.log('init:', tasks.length, 'tasks');

      saveBasket('tasks', { tasks });
    },
    async updateMultiple(tasks: Task[]): Promise<void> {
      if (!(Array.isArray(tasks) && tasks.length)) {
        return;
      }

      const allNotes = this.all;
      const now = Date.now();

      tasks.forEach((task) => {
        const existing = allNotes.find((n) => n.id === task.id) || {};

        const newNote = {
          ...existing,
          ...task,
          updated: now,
          created: task.created || now,
        };

        if (!newNote || !newNote.id) {
          return;
        }

        this.ADD_NOTE(newNote);
      });

      this.saveAll();
    },
    deleteNote({ id }: { id: string }) {
      console.log('deleteNote', { id });
      if (!id) {
        return;
      }

      this.DELETE_NOTE(id);
      this.saveAll();
    },
    setLocal(tasks: Task[]) {
      localStorage.setItem('local_tasks', JSON.stringify(tasks));
    },
    getLocal(): Task[] | undefined {
      try {
        const local = localStorage.getItem('local_tasks');
        if (!local) {
          return undefined;
        }
        return JSON.parse(local);
      } catch (e) {
        return undefined;
      }
    },
    async loadAll(forceCloud = false) {
      let data: { tasks?: Task[] } = {},
        isFromLocal = false;

      const local = { tasks: this.getLocal() };
      if (forceCloud) {
        data = await getBasket('tasks');
      } else if (local.tasks?.length) {
        data = local;
        isFromLocal = true;
      }

      // const data = readFromDbSync('notesdb.json', true);

      console.log('loadAll', isFromLocal ? 'from local storage' : '', data);

      if (!data?.tasks) return;

      data.tasks = data.tasks.filter((t) => t.id !== 'tasks');

      data.tasks.forEach((task: Task) => {
        this.ADD_NOTE(task);
      });

      if (!isFromLocal) {
        this.setLocal(data.tasks);
      }

      this.apiTest();
    },
    async apiTest() {
      const log = (...msgs: any) => console.log('API test::', ...msgs);
      log('start');

      const key = localStorage.getItem('db_api_token') || '';
      const filename = 'tasks';

      const headers = new Headers();

      headers.append('Content-Type', 'application/json');
      headers.append('access_token', key);

      const url = `https://adam-in-the-cape.firebaseio.com/${filename}.json`;
      const data = { user_id: 'jack', text: 'Ahoy!' };
      const opts = {
        method: 'GET',
        // body: JSON.stringify(data),
        headers,
      };

      let res;
      try {
        res = await fetch(url, opts);
      } catch (e) {
        log(e);
      }
      log({ url, res });
      log('googleApiAuthToken', await this.googleApiAuthToken());
    },
    async googleApiAuthToken() {
      // Load the service account key JSON file.
      const serviceAccount = getFromLocalStorage('google_auth', true);

      // Define the required scopes.
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/firebase.database',
      ];

      // Authenticate a JWT client with the service account.
      const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        undefined,
        serviceAccount.private_key,
        scopes
      );

      let accessToken;

      // Use the JWT client to generate an access token.
      await jwtClient.authorize(function (error, tokens) {
        if (error || !tokens) {
          console.log('Error making request to generate access token:', error);
        } else if (tokens.access_token === null) {
          console.log(
            'Provided service account does not have permission to generate access tokens'
          );
        } else {
          accessToken = tokens.access_token;
        }
      });
      return accessToken;
    },
    async _loadAll() {
      // const data = readFromDbSync('notesdb.json', true);
      // if (!data || typeof data !== 'string') return;
      // let parsed = JSON.parse(data) || {};
      // if (typeof parsed === 'string') {
      //   parsed = JSON.parse(parsed);
      // }
      // console.log('loadNotes', parsed);
      // parsed.notes.forEach((note: Note) => {
      //   this.ADD_NOTE(note);
      // });
    },
    async saveAll() {
      const tasks = this.notes;

      console.log('saveAll:', tasks.length, 'tasks');

      // await saveBasket('tasks', { tasks });

      this.setLocal(tasks as Task[]);
    },
    async syncAll() {
      await saveBasket(
        'tasks',
        this.notes.filter((t) => t.id !== 'tasks')
      );
    },
    ADD_NOTE(note: Note) {
      if (!note) {
        return;
      }

      const allNotes = this.all;

      const existingIndex = allNotes.findIndex((n) => n.id === note.id);

      if (existingIndex > -1) {
        allNotes.splice(existingIndex, 1, note);
      } else {
        allNotes.push(note);
      }

      this.notes = allNotes;
    },
    DELETE_NOTE(noteId: string) {
      if (!noteId) {
        return;
      }

      const allNotes = this.all;

      const existingIndex = allNotes.findIndex((n) => n.id === noteId);

      if (existingIndex > -1) {
        allNotes.splice(existingIndex, 1);

        this.notes = allNotes;
      }
    },
  },
});

export default useTaskStore;
