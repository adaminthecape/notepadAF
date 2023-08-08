<template>
  <q-btn
      :size="size"
      :flat="flat"
      :dense="dense"
      :color="done ? 'green-7' : undefined"
      :icon="done ? 'check_circle' : 'check_circle_outline'"
      @click="toggle"
  >
    <q-tooltip>
      <span v-if="done">Finished {{ timeSince(done) }}</span>
      <span v-else>Finish task</span>
    </q-tooltip>
  </q-btn>
</template>

<script>
  import { timeSince } from '../utils';
  import QPropsMixin from '../mixins/QPropsMixin.js';

  export default {
    mixins: [QPropsMixin],
    props: {
      taskId: {
        type: String,
        default: undefined
      },
      done: {
        type: Number,
        default: 0
      }
    },
    methods: {
      timeSince,
      toggle()
      {
        const newVal = this.done ? 0 : Date.now();

        if(this.taskId)
        {
          this.$store.dispatch(
              'notes/cloudUpdateSingleProperty',
              {
                taskId: this.taskId,
                prop: 'done',
                data: newVal
              }
          );
        }
        else
        {
          this.$emit('toggle', newVal);
        }
      }
    }
  };
</script>