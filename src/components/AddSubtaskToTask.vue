<template>
  <SimpleModal>
    <template #activator="{ open }">
      <q-btn
        label="add"
        @click.stop.prevent="open"
      />
    </template>
    <template #content>
      <q-input
        v-model="subtaskMessage"
        filled
        dense
      />
      <q-list style="max-height: 50vh; overflow-y: scroll">
        <q-item
          v-for="task in tasks?.slice(0, 50)"
          :key="`add-subtask-for-${task.id}`"
          clickable
          :style="selectedTaskId === task.id ? 'color: green' : ''"
          @click="selectedTaskId = task.id"
        >
          <q-item-section>
            <div class="row items-center">
              <span>{{ task.message?.slice(0, 50) }}</span>
              <q-space />
              <q-icon v-if="selectedTaskId === task.id" name="check" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
    <template #actions>
      <q-btn
        :disable="!selectedTaskId || !subtaskMessage"
        color="primary"
        class="q-ml-sm"
        icon="add"
        @click="addSubtaskToTask"
      >Add</q-btn>
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import useTaskStore from 'src/pinia/taskStore';
import { ref, computed } from 'vue';
import SimpleModal from './SimpleModal.vue';
import { Task } from '@/types';

const props = defineProps({
  storyId: {
    type: [String, Number],
    required: true
  }
});

const store = useTaskStore();

store.watchCloudDb();

const tasks = computed<Task[]>(() => (
  (Object.values(store.getTasksInSelectedBuckets()) as Task[])
    .sort((a: any, b: any) => b.updated - a.updated)
));

const selectedTaskId = ref('');

const subtaskMessage = ref<string>('');

function addSubtaskToTask() {
  const task = tasks.value.find((t) => t?.id === selectedTaskId.value);

  if (!task?.id || !selectedTaskId.value) {
    return;
  }

  store.cloudUpdateSingleProperty({
    taskId: task.id,
    prop: 'next',
    data: (task.next || []).concat({
      due: 0, // todo: implement due date for subtasks
      note: `${props.storyId}: ${subtaskMessage.value || ''}`
    }),
  }).then(() => {
    subtaskMessage.value = '';
    alert('subtask added');
  });
}
</script>
