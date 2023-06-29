<template>
  <div class="row items-center">
    <q-btn
        icon="edit"
        :color="isEditing ? 'positive' : 'neutral'"
        :size="size"
        dense
        flat
        @click="$emit('editTask')"
    />
    <q-btn
        v-if="task.done"
        icon="task_alt"
        color="positive"
        :size="size"
        dense
        flat
        @click="$emit('updateTask', { ...task, done: 0 })"
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
        @click="$emit('updateTask', { ...task, done: Date.now() })"
    />
    <q-btn
        v-if="task.active"
        icon="pending_actions"
        color="orange"
        :size="size"
        flat
        dense
        @click="$emit('updateTask', { ...task, active: 0 })"
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
        @click="$emit('updateTask', { ...task, active: Date.now() })"
    >
      <q-tooltip>Start</q-tooltip>
    </q-btn>
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
    timeSince
  }
}
</script>