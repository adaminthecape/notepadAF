<template>
  <q-btn
    :size="size"
    :flat="flat"
    :dense="dense"
    :color="done ? 'green-7' : undefined"
    :icon="done ? 'check_circle' : 'check_circle_outline'"
    @click="toggle"
  >
    <q-tooltip>
      <span v-if="done">Finished {{ timeSince(done) }}</span>
      <span v-else>Finish task</span>
    </q-tooltip>
  </q-btn>
</template>

<script>
import { timeSince, cudTaskPropertyViaStore } from "../utils";

export default {
  props: {
    size: {
      type: String,
      default: undefined,
    },
    icon: {
      type: String,
      default: undefined,
    },
    color: {
      type: String,
      default: undefined,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: String,
      default: undefined,
    },
    done: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    timeSince,
    toggle() {
      const newVal = this.done ? 0 : Date.now();

      if (this.taskId) {
        cudTaskPropertyViaStore(this.$store, {
          taskId: this.taskId,
          prop: "done",
          data: newVal,
        });
      } else {
        this.$emit("toggle", newVal);
      }
    },
  },
};
</script>
