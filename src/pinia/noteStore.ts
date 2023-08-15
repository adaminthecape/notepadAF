import { defineStore } from 'pinia';
import { Note } from 'src/types';
import { readFromDbSync, saveAll } from 'src/mixins/jsondb.js';

export type MyInterface = {
  [key: string]: any;
};

type RootState = {
  notes: Note[];
};

const useNoteStore = defineStore('noteStore', {
  state: () =>
    ({
      notes: [],
    } as RootState),
  getters: {
    all: (state) => state.notes,
    getNote: (state) => (id: string) => state.notes.find((n) => n.id === id),
  },
  actions: {
    async update({ note }: { note: Note }): Promise<void> {
      console.log('updateNote', { note });
      if (!note || typeof note !== 'object') {
        return;
      }

      const allNotes = this.all;
      const existing = allNotes.find((n) => n.id === note.id) || {};

      console.log('updateNote: existing', existing, allNotes);

      const now = Date.now();
      const newNote = {
        ...existing,
        ...note,
        updated: now,
        created: note.created || now,
      };

      if (!newNote || !newNote.id) {
        return;
      }

      console.log('updateNote: newNote', newNote);
      this.ADD_NOTE(newNote);

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
    starNote(noteId: string) {
      const note = this.getNote(noteId);

      if (note) {
        this.ADD_NOTE({
          ...note,
          isStarred: !note.isStarred,
        });
      }

      this.saveAll();
    },
    attachStory({ noteId, storyId }: { noteId: string; storyId: number }) {
      const note = this.getNote(noteId);

      if (note) {
        const stories = structuredClone(note.stories || []);

        stories.push(storyId);

        this.ADD_NOTE({ ...note, stories });
      }
    },
    removeStory({ noteId, storyId }: { noteId: string; storyId: number }) {
      console.log('removeStory:', { noteId, storyId });
      const note = this.getNote(noteId);

      console.log('removeStory:', { note });
      if (note) {
        const stories = structuredClone(note.stories || []);
        const storyIndex = stories.findIndex(
          (s: string) => s === storyId.toString()
        );

        console.log({
          storyIndex,
          stories,
          id: storyId.toString(),
        });

        if (storyIndex > -1) {
          stories.splice(storyIndex, 1);

          console.log({
            storyIndex,
            stories,
          });

          this.ADD_NOTE({ ...note, stories });
          this.saveAll();
        }
      }
    },
    loadAll() {
      const data = readFromDbSync('notesdb.json', true);

      if (!data) return;

      let parsed = JSON.parse(data) || {};

      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }

      if (!parsed.notes) {
        parsed.notes = [];
      }

      console.log('loadNotes', parsed);
      parsed.notes.forEach((note: Note) => {
        this.ADD_NOTE(note);
      });
    },
    saveAll() {
      saveAll();
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

export default useNoteStore;
