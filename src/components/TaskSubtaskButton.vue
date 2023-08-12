<template>
  <div>
    <q-btn
      :size="size"
      :flat="flat"
      :dense="dense"
      icon="add"
      @click="isAddingNote = !isAddingNote"
    >
      <q-tooltip>Add subtask</q-tooltip>
    </q-btn>
    <q-dialog v-model="isAddingNote" class="full-width">
      <q-card>
        <q-input
          v-model="description"
          placeholder="Add subtask..."
          class="q-pa-sm"
          dense
          filled
        >
          <template #append>
            <q-btn icon="save" dense flat @click="save" />
          </template>
        </q-input>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { cudTaskPropertyViaStore } from "src/utils";
import { getTask } from "src/storeHelpers";

export default {
  props: {
    taskId: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      description: undefined,
      isAddingNote: false,
    };
  },
  computed: {
    task() {
      return getTask(this.$store, this.taskId);
    },
  },
  mounted() {
    if (this.mode === "save" && !this.taskId) {
      throw new Error("You must provide a task during save mode!");
    }
  },
  methods: {
    save() {
      if (!this.task) {
        return;
      }

      const task = structuredClone(this.task);

      if (!task.next) {
        task.next = [];
      }

      const data = task.next.concat({ due: 0, note: this.description || "" });

      cudTaskPropertyViaStore(this.$store, {
        taskId: this.taskId,
        prop: "next",
        data,
      }).then(() => {
        this.isAddingNote = false;
      });
    },
  },
};
</script>
