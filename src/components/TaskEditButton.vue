<template>
  <q-btn
    :size="size"
    :flat="flat"
    :dense="dense"
    :icon="icon || 'edit'"
    :color="editing ? 'green-9' : undefined"
    @click="toggle()"
  >
    <template>
      <q-icon :name="icon || 'post_add'" />
    </template>
    <q-tooltip>Edit Task</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
const props = defineProps<{
  editing: boolean;
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
  taskId?: string;
}>();

const emit = defineEmits<{
  (event: 'toggle', isEditing: boolean): void;
}>();

function toggle() {
  console.log('Edit toggle:', props.editing);
  emit('toggle', !props.editing);
}
</script>
