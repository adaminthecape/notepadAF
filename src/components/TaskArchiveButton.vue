<template>
  <q-btn
      v-bind="allQProps"
      :color="archived ? 'secondary' : undefined"
      :icon="archived ? 'unarchive' : 'move_to_inbox'"
      @click="toggle"
  >
    <q-tooltip>
      <span v-if="archived">Archived {{ timeSince(archived) }}</span>
      <span v-else>Archive task</span>
    </q-tooltip>
  </q-btn>
</template>

<script>
import { timeSince } from '../utils';
import QPropsMixin from '../mixins/QPropsMixin.js';

export default {
  mixins: [QPropsMixin],
  props: {
    archived: {
      type: [Boolean, Number],
      default: 0
    }
  },
  methods: {
    timeSince,
    toggle()
    {
      this.$emit('toggle', this.archived ? 0 : Date.now());
    }
  }
};
</script>