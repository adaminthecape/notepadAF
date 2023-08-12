<template>
  <q-btn
    :size="size"
    :flat="flat"
    :dense="dense"
    :icon="icon"
    :color="editing ? 'green-9' : undefined"
    @click="toggle"
  >
    <template>
      <q-icon :name="icon || 'post_add'" />
    </template>
    <q-tooltip>Edit Task</q-tooltip>
  </q-btn>
</template>

<script>
export default {
  props: {
    editing: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toggle() {
      this.$emit("toggle", !this.editing);
    },
  },
};
</script>
