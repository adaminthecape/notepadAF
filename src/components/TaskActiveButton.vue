<template>
  <div>
    <q-btn
        v-bind="allQProps"
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
    <q-dialog v-model="isAddingNote" class="full-width">
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
  import { qProps } from '../mixins/QPropsMixin.js';
  import SingleTaskMixin from "src/mixins/SingleTaskMixin";

  export default {
    mixins: [SingleTaskMixin],
    props: {
      active: {
        type: [Number, Boolean],
        default: 0
      },
      mode: {
        type: String,
        default: 'emit'
      },
      taskId: {
        type: String,
        default: undefined
      },
      ...qProps
    },
    data()
    {
      return {
        renderIndex: 0,
        logNote: undefined,
        isAddingNote: false
      };
    },
    mounted()
    {
      if(this.mode === 'save' && !this.taskId)
      {
        throw new Error('You must provide a task during save mode!');
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
            task.activity[task.activity.length - 1].end = Date.now();
            task.activity[task.activity.length - 1].note = this.logNote || '';
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