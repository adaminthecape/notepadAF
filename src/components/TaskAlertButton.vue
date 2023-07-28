<template>
  <div>
    <q-btn
        v-bind="allQProps"
        icon="alarm_add"
        @click="isCreatingAlert = !isCreatingAlert"
    >
      <q-tooltip>Add alert</q-tooltip>
    </q-btn>
    <q-dialog v-model="isCreatingAlert">
      <q-card>
        <q-item>
          <q-item-section>
            {{ task ? task.message : '' }}
            <CreateAlert
                class="q-mt-md"
                @newAlert="addAlertToTask"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { qProps } from '../mixins/QPropsMixin.js';
import SingleTaskMixin from "src/mixins/SingleTaskMixin";
import CreateAlert from "components/CreateAlert";
import { cudTaskViaStore, queueTaskRefresh } from "src/utils";

export default {
  components: { CreateAlert },
  mixins: [SingleTaskMixin],
  props: { ...qProps },
  data()
  {
    return {
      isCreatingAlert: false
    };
  },
  methods: {
    getTaskDataWithNewAlert(alert)
    {
      if(!this.task)
      {
        console.warn('Task not found!', alert);

        return;
      }

      const task = structuredClone(this.task);

      if(!task.alerts)
      {
        task.alerts = [];
      }

      if(alert.id)
      {
        delete alert.id;
      }

      task.alerts.push(alert);

      return task;
    },
    addAlertToTask(alert)
    {
      if(!this.task || !alert || !alert.time || !alert.date)
      {
        console.warn('Not enough data for alert!', alert);

        return;
      }

      const task = this.getTaskDataWithNewAlert(alert);

      cudTaskViaStore(this.$store, task).then(() =>
      {
        queueTaskRefresh(task.id);
        this.isCreatingAlert = false;
      });
    }
  }
};
</script>