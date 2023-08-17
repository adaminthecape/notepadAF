<template>
  <div>
    <q-btn
      :size="size"
      :flat="flat"
      :dense="dense"
      :icon="icon || 'alarm_add'"
      @click="isCreatingAlert = !isCreatingAlert"
    >
      <q-tooltip>Add alert</q-tooltip>
    </q-btn>
    <q-dialog v-model="isCreatingAlert">
      <q-card>
        <q-item>
          <q-item-section>
            {{ task ? task.message : "" }}
            <CreateAlert
              class="q-mt-md"
              @new-alert="addAlertToTask"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { cudTaskViaStore, queueTaskRefresh } from 'src/utils';
import { ref, computed, defineAsyncComponent } from 'vue';
import useTaskStore from 'src/pinia/taskStore';
import { Task, TaskAlert } from 'src/types';

const store = useTaskStore();
const props = defineProps<{
  taskId: string;
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
}>();
const task = computed<Task>(() => store.getTask(props.taskId));

const CreateAlert = defineAsyncComponent(() =>
  import('src/components/CreateAlert.vue'));

const isCreatingAlert = ref(false);

function getTaskDataWithNewAlert(alert: TaskAlert) {
  if (!task.value) {
    console.warn('Task not found!', alert);

    return undefined;
  }

  const taskData = structuredClone(task.value);

  if (!taskData.alerts) {
    taskData.alerts = [];
  }

  if (alert.id) {
    delete alert.id;
  }

  taskData.alerts.push(alert);

  return taskData;
};

function addAlertToTask(alert: TaskAlert) {
  if (!task.value || !alert || !alert.time || !alert.date) {
    console.warn('Not enough data for alert!', alert);

    return;
  }

  const taskData = getTaskDataWithNewAlert(alert);

  if (!taskData) {
    return;
  }

  cudTaskViaStore(store, taskData as Task).then(() => {
    queueTaskRefresh(taskData.id);
    isCreatingAlert.value = false;
  });
};
</script>
