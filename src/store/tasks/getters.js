export function all(state) {
  return state.notes;
}
export function getNote(state) {
  return (id) => {
    state.notes.find((n) => n.id === id);
  };
}
