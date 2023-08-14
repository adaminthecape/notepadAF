export function update({ commit }, { note }) {
  console.log('updateNote', { note });
  if (!note || typeof note !== 'object') {
    return;
  }

  const allNotes = getters.all(state);
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
  commit('ADD_NOTE', newNote);

  commit('SAVE_NOTES');
}
export function deleteNote({ commit }, { id }) {
  console.log('deleteNote', { id });
  if (!id) {
    return;
  }

  commit('DELETE_NOTE', id);
  commit('SAVE_NOTES');
}
export function starNote({ getters, commit }, noteId) {
  const note = getters.getNote(noteId);

  if (note) {
    commit('ADD_NOTE', {
      ...note,
      isStarred: !note.isStarred,
    });
  }

  commit('SAVE_NOTES');
}
export function attachStory({ getters, commit }, { noteId, storyId }) {
  const note = getters.getNote(noteId);

  if (note) {
    const stories = cloneDeep(note.stories || []);

    stories.push(storyId);

    commit('ADD_NOTE', { ...note, stories });
  }
}
export function removeStory({ getters, commit }, { noteId, storyId }) {
  console.log('removeStory:', { noteId, storyId });
  const note = getters.getNote(noteId);

  console.log('removeStory:', { note });
  if (note) {
    const stories = cloneDeep(note.stories || []);
    const storyIndex = stories.findIndex((s) => s === storyId.toString());

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

      commit('ADD_NOTE', { ...note, stories });
      commit('SAVE_NOTES');
    }
  }
}
export function loadAll({ commit }) {
  const data = readFromDbSync('notesdb.json', true);

  let parsed = JSON.parse(data) || {};

  if (typeof parsed === 'string') {
    parsed = JSON.parse(parsed);
  }

  if (!parsed.notes) {
    parsed.notes = [];
  }

  console.log('loadNotes', parsed);
  parsed.notes.forEach((note) => {
    commit('ADD_NOTE', note);
  });
}
export function saveAll({ commit }) {
  commit('SAVE_NOTES');
}
