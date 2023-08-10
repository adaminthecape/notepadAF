<template>
  <div
    class="row items-center"
    :key="`task-options-${task.id}-${taskRenderIndex}`"
  >
    <q-btn
        v-if="showSingleTaskButton"
        icon="description"
        :size="size"
        :dense="dense"
        :flat="flat"
        @click="goToActivityPage"
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
        <TaskActivityLog :filters="{ id: task.id }" />
      </q-card>
    </q-dialog>
    <TaskAlertButton
        v-if="showAllOptions || (showAlertButton || (task.alerts && task.alerts.length))"
        :taskId="task.id"
        :size="size"
        :dense="dense"
        :flat="flat"
    />
    <TaskEditButton
        v-if="showAllOptions || showEditButton || !$q.platform.is.desktop"
        :editing="isEditing"
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
        @toggle="updateTask({ ...task, archived: $event })"
    />
    <TaskDeleteButton
        v-if="showAllOptions || (showDeleteButton || task.deleted)"
        :taskId="taskId"
        :size="size"
        :dense="dense"
        :flat="flat"
        @removed="queueTaskRefresh(task.id)"
    />
    <q-btn
        icon="menu"
        dense
        flat
        @click="showAllOptions = !showAllOptions"
    ><q-tooltip>More options</q-tooltip></q-btn>
  </div>
</template>

<script>
import TaskActiveButton from "components/TaskActiveButton";
import TaskDoneButton from "components/TaskDoneButton";
import TaskEditButton from "components/TaskEditButton";
import TaskArchiveButton from "components/TaskArchiveButton";
import TaskDeleteButton from "components/TaskDeleteButton";
import TaskAlertButton from "components/TaskAlertButton";
import TaskActivityLog from "components/TaskActivityLog";
import QPropsMixin from '../mixins/QPropsMixin.js';
import SingleTaskMixin from "src/mixins/SingleTaskMixin";
import { goToActivityPageForTask } from "src/utils";
import TaskSubtaskButton from "components/TaskSubtaskButton";

export default {
  components: {
    TaskSubtaskButton,
    TaskActivityLog,
    TaskAlertButton,
    TaskDeleteButton,
    TaskArchiveButton,
    TaskEditButton,
    TaskDoneButton,
    TaskActiveButton
  },
  mixins: [QPropsMixin, SingleTaskMixin],
  props: {
    isEditing: {
      type: Boolean,
      default: false
    },
    showArchiveButton: {
      type: Boolean,
      default: false
    },
    showSingleTaskButton: {
      type: Boolean,
      default: false
    },
    showActiveButton: {
      type: Boolean,
      default: false
    },
    showActivityLogButton: {
      type: Boolean,
      default: false
    },
    showDoneButton: {
      type: Boolean,
      default: false
    },
    showEditButton: {
      type: Boolean,
      default: false
    },
    showAlertButton: {
      type: Boolean,
      default: false
    },
    showSubtaskButton: {
      type: Boolean,
      default: false
    },
    showDeleteButton: {
      type: Boolean,
      default: false
    }
  },
  data()
  {
    return {
      taskRenderIndex: 0,
      isViewingActivity: false,
      showAllOptions: false
    };
  },
  watch: {
    task: {
      handler()
      {
          this.taskRenderIndex += 1;
      },
      deep: true
    }
  },
  methods: {
    goToActivityPage()
    {
      goToActivityPageForTask(this.task.id);
    }
  }
}
</script>