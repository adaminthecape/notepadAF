<template>
  <div>
    <q-btn
      :size="size"
      :flat="flat"
      :dense="dense"
      :color="archived ? 'secondary' : undefined"
      :icon="archived ? 'unarchive' : 'move_to_inbox'"
      @click="toggle"
    >
      <q-tooltip>
        <span v-if="archived">Archived {{ timeSince(archived) }}</span>
        <span v-else>Archive task</span>
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script>
import { timeSince, cudTaskPropertyViaStore } from "src/utils";
import { getTaskProperty } from "src/storeHelpers";

export default {
  props: {
    size: {
        type: String,
        default: undefined
    },
    icon: {
        type: String,
        default: undefined
    },
    color: {
        type: String,
        default: undefined
    },
    flat: {
        type: Boolean,
        default: false
    },
    dense: {
        type: Boolean,
        default: false
    },
    taskId: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    archived() {
      return getTaskProperty(
        this.$store,
        this.taskId,
        "archived"
      );
    },
  },
  methods: {
    timeSince,
    toggle() {
      const newVal = this.archived ? 0 : Date.now();

      if (this.taskId) {
        cudTaskPropertyViaStore(this.$store, {
          taskId: this.taskId,
          prop: "archived",
          data: newVal,
        });
      } else {
        this.$emit("toggle", newVal);
      }
    },
  },
};
</script>
