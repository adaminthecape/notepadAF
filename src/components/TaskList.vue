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
                @click="addTask({ ...task, done: false })"
            />
            <q-btn
                v-else
                icon="done"
                color="neutral"
                flat
                dense
                @click="addTask({ ...task, done: true })"
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
  import { v4 as uuidv4 } from 'uuid';
  import draggable from 'vuedraggable';

  export default {
    components: { draggable },
    props: {
      noteId: {
        type: String,
        required: true
      }
    },
    data()
    {
      return {
        message: null,
        tasks: []
      };
    },
    computed: {
      note()
      {
        return this.$store.getters['notes/getNote'](this.noteId);
      }
    },
    mounted()
    {
      this.tasks = this.note.tasks || [];
    },
    watch: {
      noteId()
      {
        setTimeout(() =>
        {
          this.tasks = this.note.tasks || [];
        }, 100);
      }
    },
    methods: {
      async updateOrder()
      {
        await this.$store.dispatch('notes/update', { note: {
          ...this.note,
            tasks: this.tasks || []
        } });

        this.tasks = this.note.tasks || [];
      },
      removeTask(task)
      {
        if(!task.id)
        {
          return;
        }

        const tasks = [...this.note.tasks];
        const existingIndex = tasks.findIndex((t) => t.id === task.id);

        if(existingIndex > -1)
        {
          tasks.splice(existingIndex, 1);
        }

        this.$store.dispatch('notes/update', { note: { ...this.note, tasks } });

        this.tasks = this.note.tasks || [];
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

        this.tasks = this.note.tasks || [];

        this.message = null;
        this.$refs.newTaskInput.focus();
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