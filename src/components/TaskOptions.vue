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
        v-if="showAlertButton"
        :taskId="task.id"
        :size="size"
        :dense="dense"
        :flat="flat"
    />
    <TaskEditButton
        v-if="showEditButton"
        :editing="isEditing"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="$emit('editTask')"
    />
    <TaskDoneButton
        v-if="showDoneButton"
        :task-id="task.id"
        :done="task.done"
        :size="size"
        :dense="dense"
        :flat="flat"
    />
    <TaskActiveButton
        v-if="showActiveButton"
        :task-id="task.id"
        :size="size"
        :dense="dense"
        :flat="flat"
        mode="save"
    />
    <TaskSubtaskButton
        v-if="showSubtaskButton"
        :task-id="task.id"
        :dense="dense"
        :flat="flat"
        :size="size"
    />
    <TaskArchiveButton
        v-if="showArchiveButton"
        :archived="task.archived"
        :task-id="taskId"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="updateTask({ ...task, archived: $event })"
    />
    <TaskDeleteButton
        v-if="showDeleteButton"
        :taskId="taskId"
        :size="size"
        :dense="dense"
        :flat="flat"
        @removed="queueTaskRefresh(task.id)"
    />
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
      default: true
    },
    showSingleTaskButton: {
      type: Boolean,
      default: false
    },
    showActiveButton: {
      type: Boolean,
      default: true
    },
    showActivityLogButton: {
      type: Boolean,
      default: false
    },
    showDoneButton: {
      type: Boolean,
      default: true
    },
    showEditButton: {
      type: Boolean,
      default: false
    },
    showAlertButton: {
      type: Boolean,
      default: true
    },
    showSubtaskButton: {
      type: Boolean,
      default: false
    },
    showDeleteButton: {
      type: Boolean,
      default: true
    }
  },
  data()
  {
    return {
      taskRenderIndex: 0,
      isViewingActivity: false
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