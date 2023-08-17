<template>
    <div>HELLO WORLD</div>
  <div
    class="row items-center"
    :key="`task-options-${taskId}-${taskRenderIndex}`"
  >
    <q-btn
        v-if="showSingleTaskButton"
        icon="description"
        :size="size"
        :dense="dense"
        :flat="flat"
        @click="goToActivityPageForTask(task.id)"
    >
      <q-tooltip>View activity</q-tooltip>
    </q-btn>
    <q-btn
        v-if="showActivityLogButton && task.activity && task.activity.length"
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
        :task-id="task.id"
        :size="size"
        :dense="dense"
        :flat="flat"
    />
    <TaskEditButton
        v-if="showAllOptions || showEditButton"
        :editing="isEditing || false"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="$emit('editTask')"
    />
    <TaskDoneButton
        v-if="showAllOptions || (showDoneButton || task.done)"
        :task-id="task.id"
        :done="task.done"
        :size="size"
        :dense="dense"
        :flat="flat"
    />
    <TaskActiveButton
        v-if="showAllOptions || (showActiveButton || task.active)"
        :task-id="task.id"
        :size="size"
        :dense="dense"
        :flat="flat"
        mode="save"
    />
    <TaskSubtaskButton
        v-if="showAllOptions || (showSubtaskButton)"
        :task-id="task.id"
        :dense="dense"
        :flat="flat"
        :size="size"
        mode="save"
    />
    <TaskArchiveButton
        v-if="showAllOptions || (showArchiveButton || task.archived)"
        :archived="task.archived"
        :task-id="taskId"
        :size="size"
        :dense="dense"
        :flat="flat"
    />
    <TaskDeleteButton
        v-if="showAllOptions || (showDeleteButton || task.deleted)"
        :task-id="taskId"
        :size="size"
        :dense="dense"
        :flat="flat"
        @removed="queueTaskRefresh(task.id)"
    />
    <q-btn
        v-if="!hideMenuButton"
        icon="menu"
        :size="size"
        :dense="dense"
        :flat="flat"
        @click="showAllOptions = !showAllOptions"
    ><q-tooltip>More options</q-tooltip></q-btn>
  </div>
</template>

<script setup lang="ts">
import {
    queueTaskRefresh,
    goToActivityPageForTask
} from 'src/utils';
import { ref, computed, defineAsyncComponent, watch } from 'vue';
import useTaskStore from 'src/pinia/taskStore';

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
    size?: string;
    icon?: string;
    color?: string;
    flat?: boolean;
    dense?: boolean;
}>();

const store = useTaskStore();
const task = computed(() => store.getTask(props.taskId));
const taskRenderIndex = ref(0);
const isViewingActivity = ref(false);
const showAllOptions = ref(false);

const TaskSubtaskButton = defineAsyncComponent(() => import('src/components/TaskSubtaskButton.vue'));
const TaskActivityLog = defineAsyncComponent(() => import('src/components/TaskActivityLog.vue'));
const TaskAlertButton = defineAsyncComponent(() => import('src/components/TaskAlertButton.vue'));
const TaskDeleteButton = defineAsyncComponent(() => import('src/components/TaskDeleteButton.vue'));
const TaskArchiveButton = defineAsyncComponent(() => import('src/components/TaskArchiveButton.vue'));
const TaskEditButton = defineAsyncComponent(() => import('src/components/TaskEditButton.vue'));
const TaskDoneButton = defineAsyncComponent(() => import('src/components/TaskDoneButton.vue'));
const TaskActiveButton = defineAsyncComponent(() => import('src/components/TaskActiveButton.vue'));

watch(task, () =>
{
    taskRenderIndex.value += 1;
});
</script>