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
import QPropsMixin from '../mixins/QPropsMixin.js';

export default {
  mixins: [QPropsMixin],
  props: {
    editing: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggle()
    {
      this.$emit('toggle', !this.editing);
    }
  }
};
</script>