<template>
  <q-btn
      v-bind="allQProps"
      :color="active ? 'orange' : undefined"
      :icon="active ? 'pending_actions' : 'pending_actions'"
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
      }
    },
    methods: {
      timeSince,
      toggle()
      {
        this.$emit('toggle', this.active ? 0 : Date.now());
      }
    }
  };
</script>