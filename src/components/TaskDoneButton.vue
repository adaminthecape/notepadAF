<template>
  <q-btn
    :size="size"
    :flat="flat"
    :dense="dense"
    :color="done ? 'green-7' : undefined"
    :icon="done ? 'check_circle' : 'check_circle_outline'"
    @click="toggle">
    <q-tooltip>
      <span v-if="done">Finished {{ timeSinceDone }}</span>
      <span v-else>Finish task</span>
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { timeSince } from 'src/utils';
import { computed } from 'vue';
import useTaskStore from 'src/pinia/taskStore';

const props = defineProps({
  taskId: {
    type: String,
    required: true,
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
  }
});

const store = useTaskStore();

const done = computed(() => store.getTaskProperty(props.taskId, 'done'));
const timeSinceDone = computed(() => timeSince(done.value));

const emit = defineEmits<{
  (event: 'toggle', done: number): void
}>();

function toggle() {
  const newVal = done.value ? 0 : Date.now();

  if (props.taskId) {
    store.cloudUpdateSingleProperty({
      taskId: props.taskId,
      prop: 'done',
      data: newVal,
    });
  } else {
    emit('toggle', newVal);
  }
}
</script>
