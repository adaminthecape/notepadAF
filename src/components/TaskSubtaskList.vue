<template>
  <q-list :key="`subtask-list-${listRenderIndex}`" class="q-px-sm">
    <q-item
      v-for="(subtask, s) in subtasks"
      :key="`subtask-item-${s}`"
      clickable
      dense
      @dblclick.ctrl="removeSubtask(s)"
    >
      <q-item-section>
        <div class="row items-center full-width">
          <q-chip v-if="subtask.note" style="flex-grow: 1" square dense>{{
            subtask.note
          }}</q-chip>
          <q-btn
            color="primary"
            icon="start"
            size="sm"
            dense
            flat
            @click="startSubtask(s)"
            ><q-tooltip>Start</q-tooltip></q-btn
          >
          <q-btn
            color="negative"
            icon="delete"
            size="sm"
            dense
            flat
            @click="removeSubtask(s)"
            ><q-tooltip>Remove</q-tooltip></q-btn
          >
        </div>
      </q-item-section>
    </q-item>
    <q-input
      v-if="addNew"
      v-model="newLogMessage"
      placeholder="Add subtask..."
      filled
      dense
    >
      <template #append>
        <q-btn
          icon="save"
          dense
          flat
          @click="saveNew({ due: 0, note: newLogMessage })"
        />
      </template>
    </q-input>
  </q-list>
</template>

<script>
import {
  qNotify,
  queueTaskRefresh,
  cudTaskViaStore,
  cudTaskPropertyViaStore,
} from "src/utils";
import { getTask, getTaskProperty } from "src/storeHelpers";

export default {
  name: "SubtaskList",
  props: {
    taskId: {
      type: String,
      default: undefined,
    },
    addNew: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      listRenderIndex: 0,
      newLogMessage: "",
    };
  },
  computed: {
    task() {
      return getTask(this.$store, this.taskId);
    },
    subtasks() {
      return getTaskProperty(this.$store, this.taskId, "next") || [];
    },
    isActive() {
      return !!getTaskProperty(this.$store, this.taskId, "active");
    },
  },
  methods: {
    startSubtask(index) {
      // is the task active? then quit
      if (this.isActive) {
        qNotify(this.$q, "You must finish the current activity first");

        return;
      }

      // start a new activity log with this message
      const activity = (this.task.activity || []).concat({
        start: Date.now(),
        end: 0,
        note: this.subtasks[index].note || "",
      });

      cudTaskViaStore(this.$store, {
        ...this.task,
        activity: activity,
        active: Date.now(),
      }).then(() => {
        this.removeSubtask(index);
        setTimeout(() => {
          queueTaskRefresh(this.taskId);
        }, 250);
      });
    },
    removeSubtask(index) {
      const data = this.subtasks.filter((s, i) => i !== index);

      cudTaskPropertyViaStore(this.$store, {
        taskId: this.taskId,
        prop: "next",
        data,
      }).then(() => {
        this.listRenderIndex += 1;
      });
    },
    saveNew(newItem) {
      if (!this.taskId || !newItem) {
        return;
      }

      const data = this.subtasks.concat(newItem);
      this.newLogMessage = "";

      cudTaskPropertyViaStore(this.$store, {
        taskId: this.taskId,
        prop: "next",
        data,
      }).then(() => {
        this.listRenderIndex += 1;
      });
    },
  },
};
</script>
