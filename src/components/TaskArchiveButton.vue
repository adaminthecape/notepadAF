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
import { timeSince, cudTaskPropertyViaStore } from "../utils";
import QPropsMixin from "../mixins/QPropsMixin.js";

export default {
  mixins: [QPropsMixin],
  props: {
    taskId: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    archived() {
      return this.$store.getters["notes/getTaskProperty"](
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
