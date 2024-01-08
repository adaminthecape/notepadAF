<template>
  <div>
    <q-btn
      :label="label"
      :size="size || 'md'"
      :flat="flat"
      :dense="dense"
      :color="active ? 'orange' : undefined"
      icon="pause"
      :key="renderIndex"
      @click="toggle"
    >
      <q-tooltip>
        Pause
      </q-tooltip>
    </q-btn>
    <q-dialog
      v-if="!disableAddingNote"
      v-model="isAddingNote"
      class="full-width"
    >
      <q-card>
        <q-input
          v-model="logNote"
          placeholder="Add a message..."
          class="q-pa-sm"
          dense
          filled
        >
          <template #append>
            <q-btn icon="save" dense flat @click="toggle" />
          </template>
        </q-input>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useSingleTask } from 'src/components/composables/singleTask';

const props = defineProps<{
  label?: string;
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
  mode?: 'emit' | 'save' | undefined;
  disableAddingNote?: boolean;
  taskId: string;
}>();

const renderIndex = ref(0);
const logNote = ref(undefined);
const isAddingNote = ref(false);

const { lastActivity, active, toggleActive } = useSingleTask(props.taskId);

const emit = defineEmits<{
  (event: 'toggle', active: number): void;
}>();

function toggle() {
  if (props.mode === 'save') {
    if (active.value) {
      isAddingNote.value = true;
    } else {
      toggleActive(logNote.value);
    }
  } else {
    emit('toggle', active.value ? 0 : Date.now());
  }
}

onMounted(() => {
  if (props.mode === 'save' && !props.taskId) {
    throw new Error('You must provide a task during save mode!');
  }

  if (lastActivity.value && !lastActivity.value.end && lastActivity.value.note) {
    logNote.value = lastActivity.value.note;
  }
});

watch(lastActivity, (newVal) => {
  logNote.value = newVal?.note || undefined;
});
</script>
