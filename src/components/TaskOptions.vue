<template>
  <div class="row items-center">
    <TaskAlertButton
        :task="task"
        :size="size"
        flat
        dense
    />
    <TaskEditButton
        :editing="isEditing"
        :size="size"
        flat
        dense
        @toggle="$emit('editTask')"
    />
    <TaskDoneButton
        :done="task.done"
        :size="size"
        flat
        dense
        @toggle="$emit('updateTask', { ...task, done: $event })"
    />
    <TaskActiveButton
        :active="task.active"
        :size="size"
        :task="task"
        mode="save"
        flat
        dense
        @toggle="$emit('updateTask', { ...task, active: $event })"
    />
    <TaskArchiveButton
        :archived="task.archived"
        :size="size"
        flat
        dense
        @toggle="$emit('updateTask', { ...task, archived: $event })"
    />
    <TaskDeleteButton
        :task="task"
        :size="size"
        flat
        dense
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

export default {
  components: {
    TaskAlertButton,
    TaskDeleteButton,
    TaskArchiveButton,
    TaskEditButton,
    TaskDoneButton,
    TaskActiveButton
  },
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
  }
}
</script>