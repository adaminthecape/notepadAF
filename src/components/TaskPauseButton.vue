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
            <q-btn icon="save" dense flat @click="save" />
          </template>
        </q-input>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import useTaskStore from 'src/pinia/taskStore';
import { computed, onMounted, ref, watch } from 'vue';

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

const store = useTaskStore();
const task = computed(() => store.getTask(props.taskId));

const active = computed(() => {
  return store.getTaskProperty(props.taskId, 'active');
});

const lastActivity = computed(() => {
  const activity = store.getTaskProperty(props.taskId, 'activity');

  if (activity && activity.length) {
    return activity[activity.length - 1];
  }

  return undefined;
});

function save() {
  if (!task.value) {
    return;
  }

  const taskData = { ...task.value };

  if (!taskData.activity) {
    taskData.activity = [];
  }

  taskData.active = active.value ? 0 : Date.now();

  if (!active.value) {
    // task is now active; start a new log
    taskData.activity.push({
      start: Date.now(),
      end: 0,
      note: logNote.value || '',
    });
  } // task is no longer active; end the last log
  else {
    const lastLog = taskData.activity.length
      ? taskData.activity[taskData.activity.length - 1]
      : undefined;

    const noteToAdd =
      logNote.value || taskData.activity[taskData.activity.length - 1].note || '';

    if (!lastLog) {
      // create first log
      taskData.activity.push({
        start: active.value,
        end: Date.now(),
        note: logNote.value || '',
      });
    } else {
      taskData.activity[taskData.activity.length - 1].end = Date.now();
      taskData.activity[taskData.activity.length - 1].note = noteToAdd;
    }
  }

  if (!taskData.next) {
    taskData.next = [];
  }

  taskData.next.push({
    note: lastActivity.value.note
  });

  store.cloudUpdateSingle(taskData).then(() => {
    isAddingNote.value = false;
  });
}

const emit = defineEmits<{
  (event: 'toggle', active: number): void;
}>();

function toggle() {
  if (props.mode === 'save') {
    if (active.value) {
      isAddingNote.value = true;
    } else {
      save();
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
