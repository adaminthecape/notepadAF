<template>
  <div>
    <q-btn
:size="size" :flat="flat" :dense="dense" :icon="icon || 'alarm_add'"
      @click="isCreatingAlert = !isCreatingAlert">
      <q-tooltip>Add alert</q-tooltip>
    </q-btn>
    <q-dialog v-model="isCreatingAlert">
      <q-card>
        <q-item>
          <q-item-section>
            {{ task ? task.message : "" }}
            <CreateAlert class="q-mt-md" @newAlert="addAlertToTask" />
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import CreateAlert from 'components/CreateAlert';
import { cudTaskViaStore, queueTaskRefresh } from 'src/utils';
import { getTask } from 'src/storeHelpers';

export default {
  components: { CreateAlert },
  props: {
    taskId: {
      type: String,
      default: undefined,
    },
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
  },
  data() {
    return {
      isCreatingAlert: false,
    };
  },
  computed: {
    task() {
      return getTask(this.$store, this.taskId);
    },
  },
  methods: {
    getTaskDataWithNewAlert(alert) {
      if (!this.task) {
        console.warn('Task not found!', alert);

        return;
      }

      const task = structuredClone(this.task);

      if (!task.alerts) {
        task.alerts = [];
      }

      if (alert.id) {
        delete alert.id;
      }

      task.alerts.push(alert);

      return task;
    },
    addAlertToTask(alert) {
      if (!this.task || !alert || !alert.time || !alert.date) {
        console.warn('Not enough data for alert!', alert);

        return;
      }

      const task = this.getTaskDataWithNewAlert(alert);

      cudTaskViaStore(this.$store, task).then(() => {
        queueTaskRefresh(task.id);
        this.isCreatingAlert = false;
      });
    },
  },
};
</script>
