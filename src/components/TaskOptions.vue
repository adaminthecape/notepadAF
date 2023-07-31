<template>
  <div class="row items-center">
    <q-btn
        v-if="task.activity && task.activity.length"
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
        :taskId="task.id"
        :size="size"
        :dense="dense"
        :flat="flat"
    />
    <TaskEditButton
        :editing="isEditing"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="$emit('editTask')"
    />
    <TaskDoneButton
        :done="task.done"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="toggleDone"
    />
    <TaskActiveButton
        :active="task.active"
        :size="size"
        :taskId="task.id"
        mode="save"
        :dense="dense"
        :flat="flat"
        @toggle="updateTask({ ...task, active: $event })"
        @refreshTask="queueTaskRefresh(task.id)"
    />
    <TaskArchiveButton
        :archived="task.archived"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="updateTask({ ...task, archived: $event })"
    />
    <TaskDeleteButton
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

export default {
  components: {
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
    }
  },
  data()
  {
    return {
      isViewingActivity: false
    };
  },
  methods: {
    toggleDone(newVal)
    {
      this.updateTask({
        ...this.task,
        done: newVal,
        // clear alerts on marking done
        alerts: newVal ? [] : this.task.alerts
      });
    }
  }
}
</script>