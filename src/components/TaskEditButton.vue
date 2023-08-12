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
    taskId: {
      type: String,
      default: undefined,
    },
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
