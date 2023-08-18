<template>
  <q-list :key="`subtask-list-${listRenderIndex}`" class="q-px-sm">
    <q-item v-for="(subtask, s) in subtasks" :key="`subtask-item-${s}`" clickable dense @dblclick.ctrl="removeSubtask(s)">
      <q-item-section>
        <div class="row items-center full-width">
          <q-chip v-if="subtask.note" style="flex-grow: 1" square dense>{{
            subtask.note
          }}</q-chip>
          <q-btn
color="primary" icon="start" size="sm" dense flat
            @click="startSubtask(s)"><q-tooltip>Start</q-tooltip></q-btn>
          <q-btn
color="negative" icon="delete" size="sm" dense flat
            @click="removeSubtask(s)"><q-tooltip>Remove</q-tooltip></q-btn>
        </div>
      </q-item-section>
    </q-item>
    <q-input v-if="addNew" v-model="newLogMessage" placeholder="Add subtask..." filled dense>
      <template #append>
        <q-btn icon="save" dense flat @click="saveNew({ due: 0, note: newLogMessage })" />
      </template>
    </q-input>
  </q-list>
</template>

<script setup lang="ts">
import {
  queueTaskRefresh,
} from 'src/utils';
import { computed, ref } from 'vue';
import useTaskStore from '@/pinia/taskStore';
import { TaskSubtask } from '@/types';

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
}

function saveNew(newItem: TaskSubtask) {
  if (!props.taskId || !newItem) {
    return;
  }

  const data = subtasks.value.concat(newItem);
  newLogMessage.value = '';

  store.cloudUpdateSingleProperty({
    taskId: props.taskId,
    prop: 'next',
    data,
  }).then(() => {
    listRenderIndex.value += 1;
  });
}
</script>
