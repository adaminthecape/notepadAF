<template>
  <div>
    <q-btn
      :label="label"
      :size="size"
      :flat="flat"
      :dense="dense"
      :color="archived ? 'secondary' : undefined"
      :icon="archived ? 'unarchive' : 'move_to_inbox'"
      @click="toggle"
    >
      <q-tooltip>
        <span v-if="archived">Archived {{ timeSinceArchived }}</span>
        <span v-else>Archive task</span>
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useTaskStore from 'src/pinia/taskStore';
import { timeSince } from 'src/utils';

const props = defineProps({
  taskId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: undefined
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
});

const store = useTaskStore();

const archived = computed(() => {
  return store.getTaskProperty(props.taskId, 'archived');
});

const timeSinceArchived = computed(() => {
  return timeSince(store.getTaskProperty(props.taskId, 'archived'));
});

const emit = defineEmits<{
  (event: 'toggle', active: number): void
}>();

function toggle() {
  const newVal = archived.value ? 0 : Date.now();

  if (props.taskId) {
    store.cloudUpdateSingleProperty({
      taskId: props.taskId,
      prop: 'archived',
      data: newVal
    });
  } else {
    emit('toggle', newVal);
  }
}
</script>
