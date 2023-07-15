import Vue from 'vue';
import { readFromDbSync, saveAll } from 'src/mixins/jsondb';

const state = {
    notes: []
};

const mutations = {
    ADD_NOTE(state, note)
    {
        if(!note)
        {
            return;
        }

        const allNotes = state.notes;

        const existingIndex = allNotes.findIndex((n) => n.id === note.id);

        if(existingIndex > -1)
        {
            allNotes.splice(existingIndex, 1, note);
        }
        else
        {
            allNotes.push(note);
        }

        Vue.set(state, 'notes', allNotes);
    },
    SAVE_NOTES(state)
    {
        saveAll(state.notes);
    }
};

const actions = {
    update({ commit, dispatch }, { note })
    {
        console.log('updateNote', { note });
        if(!note || typeof note !== 'object')
        {
            return;
        }

        const allNotes = getters.all(state);
        const existing = allNotes.find((n) => n.id === note.id) || {};

        const now = Date.now();
        const newNote = {
            ...existing,
            ...note,
            updated: now,
            created: note.created || now
        };

        if(!newNote || !newNote.id)
        {
            return;
        }

        commit('ADD_NOTE', newNote);

        // OUTPUT DATA: save via API
        commit('SAVE_NOTES');
    },
    loadAll({ commit })
    {
        // INPUT DATA: get from API
        const data = readFromDbSync('notesdb.json', true);

        let parsed = JSON.parse(data) || {};

        if(typeof parsed === 'string')
        {
            parsed = JSON.parse(parsed);
        }

        if(!parsed.notes)
        {
            parsed.notes = [];
        }

        parsed.notes.forEach((note) =>
        {
            commit('ADD_NOTE', note);
        });
    }
};

const getters = {
    all: (state) => state.notes,
    getNote: (state) => (id) => state.notes.find((n) => n.id === id)
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
