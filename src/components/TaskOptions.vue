<template>
  <div
    v-if="task"
    class="row items-center"
    :key="`task-options-${taskId}-${taskRenderIndex}`"
    :class="{ column: !!column }"
  >
    <slot name="left"></slot>
    <q-btn
        v-if="showSingleTaskButton"
        icon="description"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
        @click="goToActivity()"
    >
      <q-tooltip>View activity</q-tooltip>
    </q-btn>
    <q-btn
        v-if="showActivityLogButton && task.activity && task.activity.length"
        icon="list"
        :size="transformSizeProp(size)"
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
        v-if="showAllOptions || (showAlertButton && (task.alerts && task.alerts.length))"
        :task-id="task.id"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
    />
    <TaskEditButton
        v-if="showAllOptions || showEditButton"
        :editing="isEditing || false"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
        @toggle="editTask()"
    />
    <TaskDoneButton
        v-if="!hideDoneButton && (
          showAllOptions || (showDoneButton || task.done)
        )"
        :task-id="task.id"
        :done="task.done"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
        :chip="doneChip"
    />
    <TaskActiveButton
        v-if="showAllOptions || (showActiveButton || task.active)"
        :task-id="task.id"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
        mode="save"
    />
    <TaskSubtaskButton
        v-if="showAllOptions || (showSubtaskButton)"
        :task-id="task.id"
        :dense="dense"
        :flat="flat"
        :size="transformSizeProp(size)"
        mode="save"
    />
    <TaskArchiveButton
        v-if="showAllOptions || (showArchiveButton || task.archived)"
        :archived="task.archived"
        :task-id="taskId"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
    />
    <TaskDeleteButton
        v-if="showAllOptions || (showDeleteButton || task.deleted)"
        :task-id="taskId"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
        @removed="refreshTask()"
    />
    <q-btn
        v-if="!hideMenuButton"
        icon="menu"
        :size="transformSizeProp(size)"
        :dense="dense"
        :flat="flat"
        @click="showAllOptions = !showAllOptions"
    ><q-tooltip>More options</q-tooltip></q-btn>
    <slot name="right"></slot>
  </div>
</template>

<script setup lang="ts">
import {
  queueTaskRefresh,
  goToActivityPageForTask,
  transformSizeProp
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
  hideDoneButton?: boolean;
  showDoneButton?: boolean;
  showEditButton?: boolean;
  showAlertButton?: boolean;
  showSubtaskButton?: boolean;
  showDeleteButton?: boolean;
  hideMenuButton?: boolean;
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
  column?: boolean;
  showLabels?: boolean;
  doneChip?: boolean;
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
