<template>
  <SimpleModal>
    <template #activator="{ open: openModal }">
      <q-btn
          v-if="!hideMenuButton"
          icon="menu"
          :size="activatorSize || size || 'md'"
          :dense="dense"
          :flat="flat"
          @click="openModal"
      ><q-tooltip>More options</q-tooltip></q-btn>
    </template>
    <template #content>
      <div
        class="row"
        :key="`task-options-${taskId}-${taskRenderIndex}`"
        style="display: flex; flex-direction: column"
      >
        <q-btn
            v-if="showSingleTaskButton"
            label="View detail"
            icon="description"
            :size="size"
            :dense="dense"
            :flat="flat"
            @click="goToActivity()"
        >
          <q-tooltip>View activity</q-tooltip>
        </q-btn>
        <q-btn
            v-if="showActivityLogButton && task.activity && task.activity.length"
            label="Activity log"
            icon="list"
            :size="size"
            :dense="dense"
            :flat="flat"
            @click="isViewingActivity = !isViewingActivity"
        >
          <q-tooltip>View activity</q-tooltip>
        </q-btn>
        <q-dialog v-model="isViewingActivity">
          <q-card>
            <TaskActivityLog :task-id="taskId" />
          </q-card>
        </q-dialog>
        <TaskAlertButton
            v-if="showAllOptions || (showAlertButton || (task.alerts && task.alerts.length))"
            label="Create alert"
            :task-id="task.id"
            :size="size"
            :dense="dense"
            :flat="flat"
        />
        <TaskEditButton
            v-if="showAllOptions || showEditButton"
            label="Edit task"
            :editing="isEditing || false"
            :size="size"
            :dense="dense"
            :flat="flat"
            @toggle="editTask()"
        />
        <TaskDoneButton
            v-if="showAllOptions || (showDoneButton || task.done)"
            label="Complete task"
            :task-id="task.id"
            :done="task.done"
            :size="size"
            :dense="dense"
            :flat="flat"
        />
        <TaskActiveButton
            v-if="showAllOptions || (showActiveButton || task.active)"
            :label="task.active ? 'Start task' : 'Finish activity'"
            :task-id="task.id"
            :size="size"
            :dense="dense"
            :flat="flat"
            mode="save"
        />
        <TaskSubtaskButton
            v-if="showAllOptions || (showSubtaskButton)"
            label="Subtasks"
            :task-id="task.id"
            :dense="dense"
            :flat="flat"
            :size="size"
            mode="save"
        />
        <TaskArchiveButton
            v-if="showAllOptions || (showArchiveButton || task.archived)"
            label="Archive task"
            :archived="task.archived"
            :task-id="taskId"
            :size="size"
            :dense="dense"
            :flat="flat"
        />
        <TaskDeleteButton
            v-if="showAllOptions || (showDeleteButton || task.deleted)"
            label="Delete task"
            :task-id="taskId"
            :size="size"
            :dense="dense"
            :flat="flat"
            @removed="refreshTask()"
        />
      </div>
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import {
  queueTaskRefresh,
  goToActivityPageForTask
} from 'src/utils';
import { ref, computed, watch } from 'vue';
import useTaskStore from 'src/pinia/taskStore';

import SimpleModal from 'src/components/SimpleModal.vue';
import TaskSubtaskButton from 'src/components/TaskSubtaskButton.vue';
import TaskActivityLog from 'src/components/TaskActivityLog.vue';
import TaskAlertButton from 'src/components/TaskAlertButton.vue';
import TaskDeleteButton from 'src/components/TaskDeleteButton.vue';
import TaskArchiveButton from 'src/components/TaskArchiveButton.vue';
import TaskEditButton from 'src/components/TaskEditButton.vue';
import TaskDoneButton from 'src/components/TaskDoneButton.vue';
import TaskActiveButton from 'src/components/TaskActiveButton.vue';

const props = defineProps<{
  taskId: string;
  isEditing?: boolean;
  showArchiveButton?: boolean;
  showSingleTaskButton?: boolean;
  showActiveButton?: boolean;
  showActivityLogButton?: boolean;
  showDoneButton?: boolean;
  showEditButton?: boolean;
  showAlertButton?: boolean;
  showSubtaskButton?: boolean;
  showDeleteButton?: boolean;
  hideMenuButton?: boolean;
  activatorSize?: string;
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
  column?: boolean;
  showLabels?: boolean;
}>();

const store = useTaskStore();
const task = computed(() => store.getTask(props.taskId));
const taskRenderIndex = ref(0);
const isViewingActivity = ref(false);
const showAllOptions = ref(false);

function refreshTask() {
  queueTaskRefresh(props.taskId);
}

function goToActivity() {
  goToActivityPageForTask(props.taskId);
}

const emit = defineEmits<{
  (event: 'editTask'): void;
}>();

function editTask() {
  emit('editTask');
}

watch(task, () => {
  taskRenderIndex.value += 1;
});
</script>