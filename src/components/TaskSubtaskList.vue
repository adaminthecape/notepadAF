<template>
  <q-list :key="`subtask-list-${listRenderIndex}`" class="q-px-sm">
    <q-item
      v-for="(subtask, s) in subtasks"
      :key="`subtask-item-${s}`"
      clickable
      dense
    >
      <q-item-section>
        <div class="row items-center full-width" style="flex-wrap: nowrap;justify-content: space-between;">
          <q-chip
            v-if="subtask.note"
            square
            dense
            style="flex-grow: 1;max-width: calc(100vw - 170px)"
          >
            <div class="ellipsis">{{ subtask.note }}</div>
            <q-tooltip
              v-if="subtask.note.length > 40"
              anchor="top start"
            >{{ subtask.note }}</q-tooltip>
            <StoryListTooltip :value="subtask.note" />
          </q-chip>
          <q-space />
          <div class="row items-center" style="flex-wrap: nowrap;">
            <q-btn
              color="warning"
              icon="done"
              size="sm"
              dense
              flat
              @click="finishSubtask(s)"
            ><q-tooltip>Finish</q-tooltip></q-btn>
            <q-btn
              color="primary"
              icon="start"
              size="sm"
              dense
              flat
              @click="startSubtask(s)"
            ><q-tooltip>Start</q-tooltip></q-btn>
            <q-btn
              color="negative"
              icon="delete"
              :size="transformSizeProp('sm')"
              dense
              flat
              @click="removeSubtask(s)"
            ><q-tooltip>Remove</q-tooltip></q-btn>
          </div>
        </div>
      </q-item-section>
    </q-item>
    <q-input
      v-if="addNew"
      v-model="newLogMessage"
      placeholder="Add subtask..."
      filled
      dense
    >
      <template #append>
        <q-btn
          icon="save"
          dense
          flat
          @click="saveNew({ note: newLogMessage })"
        />
      </template>
    </q-input>
  </q-list>
</template>

<script setup lang="ts">
import {
  getStoriesFromTask,
  queueTaskRefresh,
  transformSizeProp
} from 'src/utils';
import { computed, onMounted, ref, watch } from 'vue';
import useTaskStore from 'src/pinia/taskStore';
import { TaskSubtask } from 'src/types';
import usePivotalStore from 'src/pinia/pivotalStore';
import StoryListTooltip from './StoryListTooltip.vue';

const props = defineProps({
  taskId: {
    type: String,
    required: true,
  },
  addNew: {
    type: Boolean,
    default: true,
  },
});

const listRenderIndex = ref<number>(0);
const newLogMessage = ref<string>('');

const store = useTaskStore();
const task = computed(() => store.getTask(props.taskId));
const subtasks = computed(() => store.getTaskProperty(props.taskId, 'next'));
const isActive = computed(() => !!store.getTaskProperty(props.taskId, 'active'));
const pivotalStore = usePivotalStore();
const taskStories = computed(() => getStoriesFromTask(task.value));

watch(taskStories, (n: { id: string | number }[]) => {
  if (n?.length) {
    n.forEach(({ id }) => pivotalStore.load({ id }));
  }
});

const emit = defineEmits<{
  (event: 'finished'): void;
  (event: 'started'): void;
  (event: 'removed'): void;
}>();

function finishSubtask(index: number) {
  // is the task active? then quit
  if (isActive.value) {
    // qNotify(this.$q, 'You must finish the current activity first');

    return;
  }

  const now = Date.now();

  // start a new activity log with this message
  const activity = (task.value.activity || []).concat({
    start: now,
    end: now + 1000,
    note: subtasks.value[index].note || '',
  });

  store.cloudUpdateSingle({
    ...task.value,
    activity: activity,
    active: false
  }).then(() => {
    removeSubtask(index);
    setTimeout(() => {
      queueTaskRefresh(props.taskId);
    }, 250);
  });

  emit('finished');
}

function startSubtask(index: number) {
  // is the task active? then quit
  if (isActive.value) {
    // qNotify(this.$q, 'You must finish the current activity first');

    return;
  }

  // start a new activity log with this message
  const activity = (task.value.activity || []).concat({
    start: Date.now(),
    end: 0,
    note: subtasks.value[index].note || '',
  });

  store.cloudUpdateSingle({
    ...task.value,
    activity: activity,
    active: Date.now()
  }).then(() => {
    removeSubtask(index);
    setTimeout(() => {
      queueTaskRefresh(props.taskId);
    }, 250);
  });

  emit('started');
}

function removeSubtask(index: number) {
  const data = subtasks.value
    .filter((s: TaskSubtask, i: number) => i !== index);

  store.cloudUpdateSingleProperty({
    taskId: props.taskId,
    prop: 'next',
    data,
  }).then(() => {
    listRenderIndex.value += 1;
  });

  emit('removed');
}

function saveNew(newItem: TaskSubtask) {
  if (!props.taskId || !newItem) {
    return;
  }

  const data = (subtasks.value || []).concat(newItem);
  newLogMessage.value = '';

  store.cloudUpdateSingleProperty({
    taskId: props.taskId,
    prop: 'next',
    data,
  }).then(() => {
    listRenderIndex.value += 1;
  });
}

onMounted(() => {
  if (taskStories.value?.length) {
    taskStories.value.forEach(({ id }) => {
      pivotalStore.load({ id });
    });
  }
});
</script>
