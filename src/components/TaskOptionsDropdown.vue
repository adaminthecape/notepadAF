<template>
  <q-btn-dropdown
    dropdown-icon="menu"
      :size="activatorSize || size || 'md'"
      :dense="dense"
      :flat="flat"
  >
  <template #default>
    <q-item v-if="showSingleTaskButton" dense>
      <q-btn
          v-close-popup
          label="Details"
          icon="description"
          :size="size"
          :dense="dense"
          :flat="flat"
          @click="goToActivity()"
      >
        <q-tooltip>View activity</q-tooltip>
      </q-btn>
    </q-item>
    <q-item v-if="showAllOptions || showEditButton" dense>
      <TaskEditButton
          v-close-popup
          label="Edit"
          :editing="isEditing || false"
          :size="size"
          :dense="dense"
          :flat="flat"
          @toggle="editTask()"
      />
    </q-item>
    <q-item v-if="showAllOptions || (showDoneButton || task.done)" dense>
      <TaskDoneButton
          v-close-popup
          :label="task.done ? 'Undo' : 'Complete'"
          :task-id="task.id"
          :done="task.done"
          :size="size"
          :dense="dense"
          :flat="flat"
      />
    </q-item>
    <q-item v-if="showAllOptions || (showActiveButton || task.active)" dense>
      <TaskActiveButton
          :v-close-popup="!task.active"
          :label="task.active ? 'Finish' : 'Start'"
          :task-id="task.id"
          :size="size"
          :dense="dense"
          :flat="flat"
          mode="save"
      />
    </q-item>
    <q-item v-if="task.activity && task.activity.length" dense>
      <q-btn
          label="Activity"
          icon="list"
          :dense="dense"
          :size="size"
          :flat="flat"
          :v-close-popup="false"
          @click="isViewingActivity = !isViewingActivity"
      >
        <q-tooltip>View activity</q-tooltip>
      </q-btn>
      <q-dialog v-model="isViewingActivity">
        <q-card>
          <TaskActivityLog :task-id="taskId" />
        </q-card>
      </q-dialog>
    </q-item>
    <q-item v-if="showAllOptions || (showAlertButton || (task.alerts && task.alerts.length))" dense>
      <TaskAlertButton
          label="Add alert"
          :task-id="task.id"
          :size="size"
          :dense="dense"
          :flat="flat"
      />
    </q-item>
    <q-item v-if="showAllOptions || (showSubtaskButton)" dense>
      <TaskSubtaskButton
          label="Add todo"
          :task-id="task.id"
          :dense="dense"
          :flat="flat"
          :size="size"
          mode="save"
      />
    </q-item>
    <q-item v-if="showAllOptions || (showArchiveButton || task.archived)" dense>
      <TaskArchiveButton
          v-close-popup
          label="Archive"
          :archived="task.archived"
          :task-id="taskId"
          :size="size"
          :dense="dense"
          :flat="flat"
      />
    </q-item>
    <q-item
      v-if="showAllOptions || (showDeleteButton || task.deleted)"
      dense
    >
      <TaskDeleteButton
          label="Delete"
          :task-id="taskId"
          :size="size"
          :dense="dense"
          :flat="flat"
          @removed="refreshTask()"
      />
    </q-item>
  </template>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import {
  queueTaskRefresh,
  goToActivityPageForTask
} from 'src/utils';
import { ref, computed, watch } from 'vue';
import TaskSubtaskButton from 'src/components/TaskSubtaskButton.vue';
import TaskActivityLog from 'src/components/TaskActivityLog.vue';
import TaskAlertButton from 'src/components/TaskAlertButton.vue';
import TaskDeleteButton from 'src/components/TaskDeleteButton.vue';
import TaskArchiveButton from 'src/components/TaskArchiveButton.vue';
import TaskEditButton from 'src/components/TaskEditButton.vue';
import TaskDoneButton from 'src/components/TaskDoneButton.vue';
import TaskActiveButton from 'src/components/TaskActiveButton.vue';
import { useSingleTask } from 'src/components/composables/singleTask';

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

const { task, refreshTask, goToActivity } = useSingleTask(props.taskId);

const taskRenderIndex = ref(0);
const isViewingActivity = ref(false);
const showAllOptions = ref(false);

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
