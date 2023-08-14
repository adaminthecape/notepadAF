export function ADD_NOTE(state, note) {
  if (!note) {
    return;
  }

  const allNotes = state.notes;

  const existingIndex = allNotes.findIndex((n) => n.id === note.id);

  if (existingIndex > -1) {
    allNotes.splice(existingIndex, 1, note);
  } else {
    allNotes.push(note);
  }

  Vue.set(state, 'notes', allNotes);
}

export function DELETE_NOTE(state, noteId) {
  if (!noteId) {
    return;
  }

  const allNotes = state.notes;

  const existingIndex = allNotes.findIndex((n) => n.id === noteId);

  if (existingIndex > -1) {
    allNotes.splice(existingIndex, 1);

    Vue.set(state, 'notes', allNotes);
  }
}

export function UPDATE_NOTE(state, { fileId, changes }) {
  state.files.forEach((file, i) => {
    if (file.id === fileId) {
      state.files[i].data = deepmerge(state.files[i].data, changes);
    }
  });
}

export function SAVE_NOTES(state) {
  saveAll(state.notes);
}
