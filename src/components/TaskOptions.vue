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
        :task="task"
        mode="save"
        :dense="dense"
        :flat="flat"
        @toggle="$emit('updateTask', { ...task, active: $event })"
        @refreshTask="$refreshTask(task)"
    />
    <TaskArchiveButton
        :archived="task.archived"
        :size="size"
        :dense="dense"
        :flat="flat"
        @toggle="$emit('updateTask', { ...task, archived: $event })"
    />
    <TaskDeleteButton
        :task="task"
        :size="size"
        :dense="dense"
        :flat="flat"
        @removed="$emit('taskRemoved', $event)"
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
    task: {
      type: Object,
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
  inject: ['$refreshTask'],
  data()
  {
    return {
      isViewingActivity: false
    };
  },
  methods: {
    toggleDone(e)
    {
      this.$emit(
          'updateTask',
          {
            ...this.task,
            done: e,
            alerts: e ? [] : this.task.alerts
          }
      );
    }
  }
}
</script>