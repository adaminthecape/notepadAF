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

<script setup lang="ts">
import {
    defineEmits,
    defineProps
} from 'vue';
import { useQuasarProps } from 'src/components/composables/QuasarProps';
import { useSingleTaskProps } from 'src/components/composables/SingleTaskProps';

const { size, icon, color, flat, dense } = useQuasarProps();
const { taskId, task } = useSingleTaskProps();

const editing = defineProps<boolean>();

const emit = defineEmits<{
    (event: 'toggle', isEditing: boolean): void;
}>();

function toggle()
{
    console.log('Edit toggle:', editing);
    emit('toggle', !editing);
}
</script>
