<template>
  <div>
    <q-btn
        v-bind="allQProps"
        icon="add_alert"
        @click="isCreatingAlert = !isCreatingAlert"
    >
      <q-tooltip>Add alert</q-tooltip>
    </q-btn>
    <q-dialog v-model="isCreatingAlert">
      <q-card>
        <q-item>
          <q-item-section>
            {{ task.message }}
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
import QPropsMixin from '../mixins/QPropsMixin.js';
import CreateAlert from "components/CreateAlert";

export default {
  components: { CreateAlert }, mixins: [QPropsMixin],
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data()
  {
    return {
      isCreatingAlert: false
    };
  },
  inject: ['$addOrUpdateTask'],
  methods: {
    getTaskDataWithNewAlert(alert)
    {
      if(!this.task)
      {
        console.warn('Task not found!', alert);

        return;
      }

      const task = { ...this.task };

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

      this.$addOrUpdateTask(task);
      this.isCreatingAlert = false;
    }
  }
};
</script>