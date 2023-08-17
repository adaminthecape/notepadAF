// import { timeSince } from 'src/utils';
// import { v4 as uuidv4 } from 'uuid';

// export default {
//   props: {
//     noteId: {
//       type: String,
//       default: null,
//     },
//     dark: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   data() {
//     return {};
//   },
//   computed: {
//     allNotes() {
//       return this.$store.getters['notes/all'];
//     },
//     note() {
//       return this.$store.getters['notes/getNote'](this.noteId);
//     },
//     stories() {
//       return this.note ? this.note.stories : null;
//     },
//     created() {
//       return this.note.created ? timeSince(this.note.created) : null;
//     },
//     updated() {
//       return this.note.updated ? timeSince(this.note.updated) : null;
//     },
//     tasks() {
//       return this.note.tasks || [];
//     },
//   },
//   methods: {
//     removeTask(task) {
//       if (!task.id) {
//         return;
//       }

//       const tasks = [...this.note.tasks];
//       const existingIndex = tasks.findIndex((t) => t.id === task.id);

//       if (existingIndex > -1) {
//         tasks.splice(existingIndex, 1);
//       }

//       this.$store.dispatch('notes/update', { note: { ...this.note, tasks } });

//       this.tasks = this.note.tasks || [];
//     },
//     addTask(task) {
//       if (!this.noteId || !this.note) {
//         return;
//       }

//       if (!task && this.message) {
//         task = {
//           message: this.message,
//         };
//       }

//       const tasks = this.note.tasks || [];
//       const now = Date.now();
//       let existingIndex = -1;

//       if (!task.id) {
//         task.id = uuidv4();
//       } else {
//         existingIndex = tasks.findIndex((t) => t.id === task.id);
//       }

//       if (!task.created) {
//         task.created = now;
//       }

//       if (!task.updated) {
//         task.updated = now;
//       }

//       if (existingIndex > -1) {
//         tasks.splice(existingIndex, 1, task);
//       } else {
//         tasks.push(task);
//       }

//       this.$store.dispatch('notes/update', { note: { ...this.note, tasks } });

//       this.tasks = this.note.tasks || [];

//       this.message = null;
//       if (this.$refs.newTaskInput) this.$refs.newTaskInput.focus();
//     },
//   },
// };
