<template>
  <div>
    <q-btn
        :size="size"
        :flat="flat"
        :dense="dense"
        :color="active ? 'orange' : undefined"
        :icon="active ? 'assignment_ind' : 'content_paste_go'"
        :key="renderIndex"
        @click="toggle"
    >
      <q-tooltip>
        <span v-if="active">Started {{ timeSince(active) }}</span>
        <span v-else>Start task</span>
      </q-tooltip>
    </q-btn>
    <q-dialog
        v-if="!disableAddingNote"
        v-model="isAddingNote"
        class="full-width"
    >
      <q-card>
        <q-input
            v-model="logNote"
            placeholder="Add a message..."
            class="q-pa-sm"
            dense
            filled
        >
          <template #append>
            <q-btn
              icon="save"
              dense
              flat
              @click="save"
            />
          </template>
        </q-input>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
  import { timeSince } from "../utils";
import { getTask } from 'src/storeHelpers';

  export default {
    props: {
      size: {
          type: String,
          default: undefined
      },
      icon: {
          type: String,
          default: undefined
      },
      color: {
          type: String,
          default: undefined
      },
      flat: {
          type: Boolean,
          default: false
      },
      dense: {
          type: Boolean,
          default: false
      },
      mode: {
        type: String,
        default: 'emit'
      },
      taskId: {
        type: String,
        default: undefined
      },
      disableAddingNote: {
        type: Boolean,
        default: false
      }
    },
    data()
    {
      return {
        renderIndex: 0,
        logNote: undefined,
        isAddingNote: false
      };
    },
    computed: {
      task()
      {
        return getTask(this.$store, this.taskId);
      },
      active()
      {
        return this.$store.getters['notes/getTaskProperty'](this.taskId, 'active');
      },
      lastActivity()
      {
        const activity = this.$store.getters['notes/getTaskProperty'](this.taskId, 'activity') || [];

        if(activity && activity.length)
        {
          return activity[activity.length - 1];
        }

        return undefined;
      }
    },
    mounted()
    {
      if(this.mode === 'save' && !this.taskId)
      {
        throw new Error('You must provide a task during save mode!');
      }

      if(this.lastActivity && !this.lastActivity.end && this.lastActivity.note)
      {
        this.logNote = this.lastActivity.note;
      }
    },
    watch: {
      lastActivity: {
        handler(newVal, oldVal)
        {
          this.logNote = newVal.note || undefined;
        },
        deep: true
      }
    },
    methods: {
      timeSince,
      toggle()
      {
        if(this.mode === 'save')
        {
          if(this.active)
          {
            this.isAddingNote = true;
          }
          else
          {
            this.save();
          }
        }
        else
        {
          this.$emit('toggle', this.active ? 0 : Date.now());
        }
      },
      save()
      {
        if(!this.task)
        {
          return;
        }

        const task = structuredClone(this.task);

        if(!task.activity)
        {
          task.activity = [];
        }

        task.active = this.active ? 0 : Date.now();

        if(!this.active) // task is now active; start a new log
        {
          task.activity.push({ start: Date.now(), end: 0, note: this.logNote || '' });
        }
        else // task is no longer active; end the last log
        {
          const lastLog = task.activity.length ?
              task.activity[task.activity.length - 1] :
              undefined;

          if(!lastLog) // create first log
          {
            task.activity.push({ start: this.active, end: Date.now(), note: this.logNote || '' });
          }
          else
          {
            const noteToAdd = this.logNote || task.activity[task.activity.length - 1].note || '';
            task.activity[task.activity.length - 1].end = Date.now();
            task.activity[task.activity.length - 1].note = noteToAdd;
          }
        }

        this.updateTask(task).then(() =>
        {
          this.$emit('refreshTask', task);
          this.isAddingNote = false;
        });
      }
    }
  };
</script>