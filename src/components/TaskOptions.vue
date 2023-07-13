<template>
  <div class="row items-center">
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
    <TaskMenu
        :task="task"
        :size="size"
        @removeTask="$emit('removeTask')"
        @toggleArchived="$emit('toggleArchived')"
        @createAlert="$emit('createAlert', $event)"
    />
  </div>
</template>

<script>
import TaskMenu from './TaskMenu';
import TaskActiveButton from "components/TaskActiveButton";
import TaskDoneButton from "components/TaskDoneButton";
import TaskEditButton from "components/TaskEditButton";
import TaskArchiveButton from "components/TaskArchiveButton";

export default {
  components: {
    TaskArchiveButton,
    TaskEditButton,
    TaskDoneButton,
    TaskActiveButton,
    TaskMenu
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
  },
  data()
  {
    return {
      isRemovingTask: false
    };
  }
}
</script>