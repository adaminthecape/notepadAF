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
        :task="task"
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
        @toggle="$updateTask({ ...task, active: $event })"
        @refreshTask="queueTaskRefresh(task.id)"
    />
    <TaskArchiveButton
        :archived="task.archived"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="$updateTask({ ...task, archived: $event })"
    />
    <TaskDeleteButton
        :task="task"
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
import QPropsMixin from "src/mixins/QPropsMixin";
import { getTaskByIdFromStore, queueTaskRefresh } from "src/utils";

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
  mixins: [QPropsMixin],
  props: {
    taskId: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'sm'
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  inject: ['$updateTask'],
  data()
  {
    return {
      isViewingActivity: false
    };
  },
  computed: {
    task()
    {
      return getTaskByIdFromStore(this.$store, this.taskId);
    }
  },
  methods: {
    queueTaskRefresh,
    toggleDone(e)
    {
      this.$updateTask({
        ...this.task,
        done: e,
        alerts: e ? [] : this.task.alerts
      });
    }
  }
}
</script>