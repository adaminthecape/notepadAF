<template>
  <q-card class="q-py-md">
    <q-item>
      <q-input
          ref="newTaskInput"
          v-model="message"
          placeholder="Add a task"
          class="full-width"
          filled
          dense
      >
        <template #append>
          <q-btn
              icon="add_task"
              dense
              flat
              @click="addTask()"
          />
        </template>
      </q-input>
    </q-item>
    <draggable
        v-model="tasks"
        handle=".handle"
        @end="updateOrder"
    >
      <q-item
          v-for="task in tasks"
          :key="`task-${task.id}`"
      >
        <q-input
            :value="task.message"
            :style="task.done ? 'background: #00FF002A;' : ''"
            placeholder="Add a task"
            class="full-width"
            readonly
            filled
            dense
        >
          <template #append>
            <q-btn
                v-if="task.done"
                icon="task_alt"
                color="positive"
                flat
                dense
                @click="addTask({ ...task, done: 0 })"
            >
              <q-tooltip>
                Finished {{ new Date(task.done).toDateString() }} at {{ new Date(task.done).toLocaleTimeString() }}
              </q-tooltip>
            </q-btn>
            <q-btn
                v-if="!task.done"
                icon="done"
                color="neutral"
                flat
                dense
                @click="addTask({ ...task, done: Date.now() })"
            />
            <q-btn
                icon="close"
                color="negative"
                flat
                dense
                @click="removeTask(task)"
            />
            <div class="handle">
              <q-icon name="menu" />
            </div>
          </template>
        </q-input>
      </q-item>
    </draggable>
  </q-card>
</template>

<script>
  import draggable from 'vuedraggable';
  import NoteControlsMixin from '../mixins/NoteControlsMixin.js';

  export default {
    components: { draggable },
    mixins: [NoteControlsMixin],
    props: {
    },
    data()
    {
      return {
        message: null,
        tasksCopy: []
      };
    },
    computed: {
    },
    mounted()
    {
      this.tasksCopy = this.note.tasks || [];
    },
    watch: {
      noteId()
      {
        setTimeout(() =>
        {
          this.tasksCopy = this.note.tasks || [];
        }, 100);
      }
    },
    methods: {
      async updateOrder()
      {
        await this.$store.dispatch('notes/update', { note: {
          ...this.note,
            tasks: this.tasksCopy || []
        } });

        this.tasksCopy = this.note.tasks || [];
      }
    }
  };
</script>

<style>
.handle {
  align-items: center;
  cursor: grab;
  display: flex;
  margin-right: 8px;
}
</style>