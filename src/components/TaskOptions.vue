<template>
  <div class="row items-center">
<!--<q-btn-->
<!--    icon="edit"-->
<!--    :color="isEditing ? 'positive' : 'neutral'"-->
<!--    :size="size"-->
<!--    flat-->
<!--    dense-->
<!--    @dblclick="editTask"-->
<!--/>-->
    <q-btn
        icon="edit"
        :color="isEditing ? 'positive' : 'neutral'"
        size="sm"
        class="q-mr-xs"
        style="margin-left: -10px"
        flat
        dense
        @click="editTask"
    />
    <q-btn
        v-if="task.done"
        icon="task_alt"
        color="positive"
        :size="size"
        flat
        dense
        @click="updateTask({ ...task, done: 0 })"
    >
      <q-tooltip>
        Finished {{ timeSince(task.done) }}
      </q-tooltip>
    </q-btn>
    <q-btn
        v-if="!task.done"
        icon="done"
        color="neutral"
        :size="size"
        flat
        dense
        @click="updateTask({ ...task, done: Date.now() })"
    />
    <q-btn
        v-if="task.active"
        icon="pending_actions"
        color="orange"
        :size="size"
        flat
        dense
        @click="updateTask({
              ...task,
              active: 0
            })"
    >
      <q-tooltip>
        Started {{ timeSince(task.active) }}
      </q-tooltip>
    </q-btn>
    <q-btn
        v-if="!task.active"
        icon="play_arrow"
        color="neutral"
        :size="size"
        flat
        dense
        @click="updateTask({
             ...task,
             active: Date.now()
            })"
    >
      <q-tooltip>Start</q-tooltip>
    </q-btn>
    <TaskMenu
        :task="task"
        :size="size"
        @removeTask="removeTask"
        @toggleArchived="toggleArchived"
        @createAlert="createAlert"
    />
  </div>
</template>

<script>
import TaskMenu from './TaskMenu';
import { timeSince } from "src/utils";

export default {
  components: {
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
  },
  computed: {},
  methods: {
    timeSince,
    updateTask(task)
    {
      this.$emit('updateTask', task);
    },
    editTask()
    {
      this.$emit('editTask');
    },
    removeTask()
    {
      this.$emit('removeTask');
    },
    toggleArchived()
    {
      this.$emit('toggleArchived');
    },
    createAlert(e)
    {
      this.$emit('createAlert', e);
    }
  }
}
</script>