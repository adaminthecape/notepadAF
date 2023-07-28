<template>
  <q-btn
      v-bind="allQProps"
      :color="editing ? 'green-9' : undefined"
      @click="toggle"
  >
    <template>
      <q-icon
          :name="icon || 'post_add'"
      />
    </template>
    <q-tooltip>Edit Task</q-tooltip>
  </q-btn>
</template>

<script>
import { qProps } from '../mixins/QPropsMixin.js';

export default {
  props: {
    editing: {
      type: Boolean,
      default: false
    },
    ...qProps
  },
  methods: {
    toggle()
    {
      this.$emit('toggle', !this.editing);
    }
  }
};
</script>