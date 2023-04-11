import Vue from 'vue';
import deepmerge from "deepmerge";
import { writeToDb, readFromDb, saveAll } from '../../mixins/jsondb';

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
    DELETE_NOTE(state, noteId)
    {
        if(!noteId)
        {
            return;
        }

        const allNotes = state.notes;

        const existingIndex = allNotes.findIndex((n) => n.id === noteId);

        if(existingIndex > -1)
        {
            allNotes.splice(existingIndex, 1);

            Vue.set(state, 'notes', allNotes);
        }
    },
    UPDATE_NOTE(state, { fileId, changes })
    {
        state.files.forEach((file, i) =>
        {
            if(file.id === fileId)
            {
                state.files[i].data = deepmerge(state.files[i].data, changes);
            }
        });
    },
    SAVE_NOTES(state)
    {
        saveAll(state.notes, () =>
        {
            console.log('SAVE_NOTES: done');
        });
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
        const existing = allNotes
            .find((n) => n.id === note.id) || {};

        console.log('updateNote: existing', existing, allNotes);

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

        console.log('updateNote: newNote', newNote);
        commit('ADD_NOTE', newNote);
    },
    deleteNote({ commit }, { id })
    {
        console.log('deleteNote', { id });
        if(!id)
        {
            return;
        }

        commit('DELETE_NOTE', id);
        commit('SAVE_NOTES');
    },
    starNote({ getters, commit }, noteId)
    {
        const note = getters.getNote(noteId);

        if(note)
        {
            commit('ADD_NOTE', {
                ...note,
                isStarred: !note.isStarred
            });
        }
    },
    attachStory({ getters, commit }, { noteId, storyId })
    {
        const note = getters.getNote(noteId);

        if(note)
        {
            const stories = (note.stories || []).push(storyId);

            commit('ADD_NOTE', { ...note, stories });
        }
    },
    removeStory({ getters, commit }, { noteId, storyId })
    {
        console.log('removeStory:', { noteId, storyId });
        const note = getters.getNote(noteId);

        console.log('removeStory:', { note });
        if(note)
        {
            const stories = note.stories || [];
            const storyIndex = stories.findIndex((s) => s === storyId.toString());

            console.log({
                storyIndex,
                stories,
                id: storyId.toString()
            });

            if(storyIndex > -1)
            {
                stories.splice(storyIndex, 1);

                console.log({
                    storyIndex,
                    stories
                });

                commit('ADD_NOTE', { ...note, stories });
                commit('SAVE_NOTES');
            }
        }
    },
    loadAll({ commit, dispatch })
    {
        readFromDb('notesdb.json', (data) =>
        {
            let parsed = JSON.parse(data) || {};

            if(typeof parsed === 'string')
            {
                parsed = JSON.parse(parsed);
            }

            if(!parsed.notes)
            {
                parsed.notes = [];
            }

            console.log('loadNotes', parsed);
            parsed.notes.forEach((note) =>
            {
                commit('ADD_NOTE', note);
            });
        }, true);
    },
    saveAll({ commit })
    {
        commit('SAVE_NOTES');
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
