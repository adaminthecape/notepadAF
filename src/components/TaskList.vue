<template>
  <q-card>
    <q-item>
      <q-input
          ref="newTaskInput"
          v-model="message"
          placeholder="Add a task"
          class="full-width"
          filled
      >
        <template #append>
          <q-btn
              label="Add"
              @click="addTask()"
          />
        </template>
      </q-input>
    </q-item>
    <q-item
        v-for="task in tasks"
        :key="`task-${task.id}`"
    >
      <q-input
          :value="task.message"
          placeholder="Add a task"
          class="full-width"
          readonly
          filled
      >
        <template #append>
          <q-btn
              icon="close"
              color="negative"
              flat
              @click="removeTask(task)"
          />
        </template>
      </q-input>
    </q-item>
  </q-card>
</template>

<script>
  import { v4 as uuidv4 } from 'uuid';

  export default {
    props: {
      noteId: {
        type: String,
        required: true
      }
    },
    data()
    {
      return {
        message: null
      };
    },
    computed: {
      note()
      {
        return this.$store.getters['notes/getNote'](this.noteId);
      },
      tasks()
      {
        return this.note.tasks || [];
      }
    },
    methods: {
      removeTask(task)
      {
        if(!task.id)
        {
          return;
        }

        const tasks = [...this.note.tasks];
        const existingIndex = tasks.findIndex((t) => t.id === task.id);

        console.log({ existingIndex });

        if(existingIndex > -1)
        {
          tasks.splice(existingIndex, 1);
        }

        console.log({ tasks });

        this.$store.dispatch('notes/update', { note: { ...this.note, tasks } });
      },
      addTask(task)
      {
        if(!this.noteId || !this.note)
        {
          return;
        }

        if(!task && this.message)
        {
          task = {
            message: this.message
          };
        }

        const tasks = this.note.tasks || [];
        const now = Date.now();
        let existingIndex = -1;

        if(!task.id)
        {
          task.id = uuidv4();
        }
        else
        {
          existingIndex = tasks.findIndex((t) => t.id === task.id);
        }

        if(!task.created)
        {
          task.created = now;
        }

        if(!task.updated)
        {
          task.updated = now;
        }

        if(existingIndex > -1)
        {
          tasks.splice(existingIndex, 1, task);
        }
        else
        {
          tasks.push(task);
        }

        this.$store.dispatch('notes/update', { note: { ...this.note, tasks } });

        this.message = null;
        this.$refs.newTaskInput.focus();
      }
    }
  };
</script>