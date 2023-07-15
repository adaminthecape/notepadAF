<template>
  <q-btn
      v-bind="allQProps"
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
      done: {
        type: Number,
        default: 0
      }
    },
    methods: {
      timeSince,
      toggle()
      {
        // do some test logic here
        console.log('start!');
      },
      _toggle()
      {
        if(this.done)
        {
          this.$emit('toggle', 0);
        }
        else
        {
          this.$emit('toggle', Date.now());
        }
      }
    }
  };
</script>