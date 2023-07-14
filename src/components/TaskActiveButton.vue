<template>
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
</template>

<script>
  import { timeSince } from '../utils';
  import QPropsMixin from '../mixins/QPropsMixin.js';

  export default {
    mixins: [QPropsMixin],
    props: {
      active: {
        type: [Number, Boolean],
        default: 0
      },
      mode: {
        type: String,
        default: 'emit'
      },
      task: {
        type: Object,
        default: () => ({})
      }
    },
    data()
    {
      return {
        renderIndex: 0
      };
    },
    inject: ['$addOrUpdateTask'],
    mounted()
    {
      if(this.mode === 'save' && !this.task)
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
            task.activity.push({ start: Date.now(), end: 0 });
          }
          else // task is no longer active; end the last log
          {
            const lastLog = task.activity.length ?
                task.activity[task.activity.length - 1] :
                undefined;

            if(!lastLog) // create first log
            {
              task.activity.push({ start: this.active, end: Date.now() });
            }
            else
            {
              task.activity[task.activity.length - 1].end = Date.now();
            }
          }

          this.$addOrUpdateTask(task);
          this.$emit('refreshTask', task);

          return;
        }

        this.$emit('toggle', this.active ? 0 : Date.now());
      }
    }
  };
</script>