<template>
  <div>
    <div v-if="!dense">
      <q-date
        v-model="createAlertDate"
        type="text"
        label="Date"
        class="full-width q-mb-sm"
        landscape
      />
      <q-time
        v-model="createAlertTime"
        type="text"
        label="Time"
        class="full-width"
        format24h
        landscape
        now-btn
      />
    </div>
    <div v-else class="row items-center">
      Due
      <q-input
        v-model="createAlertDate"
        mask="##/##/####"
        style="width: 8em"
        class="q-mx-xs"
        filled
        dense
      />
      at
      <q-input
        v-model="createAlertTime"
        mask="##:##"
        style="width: 5em"
        class="q-mx-sm"
        filled
        dense
      />
      <q-btn
        label="+15"
        color="secondary"
        class="q-mr-xs"
        dense
        flat
        @click="setNow(15 * 60000)"
      >
        <q-tooltip>Add 15 minutes</q-tooltip>
      </q-btn>
      <q-btn
        icon="notification_add"
        color="secondary"
        dense
        flat
        @click="createAlert"
      >
        <q-tooltip>Create alert</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { padLeft } from "src/utils";

export default {
  props: {
    dense: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    const { date, time } = this.getNow();

    return {
      createAlertDate: date,
      createAlertTime: time,
      createAlertMessage: "",
    };
  },
  computed: {},
  methods: {
    setNow(add = 0) {
      const { date, time } = this.getNow(add);

      this.createAlertDate = date;
      this.createAlertTime = time;
    },
    getNow(add = 0) {
      const d = new Date(
        (this.createAlertDate && this.createAlertTime
          ? new Date(
              `${this.createAlertDate} ${this.createAlertTime}`
            ).getTime()
          : Date.now()) + add
      );
      const time = `${padLeft(d.getHours(), "0", 2)}:${padLeft(
        d.getMinutes(),
        "0",
        2
      )}`;
      const date = `${padLeft(d.getMonth() + 1, "0", 2)}/${padLeft(
        d.getDate(),
        "0",
        2
      )}/${padLeft(d.getFullYear(), "0", 4)}`;

      return { date, time };
    },
    createAlert() {
      const alert = {
        date: this.createAlertDate,
        time: this.createAlertTime,
      };

      alert.unix = new Date(`${alert.date} ${alert.time}`).getTime();

      this.$emit("newAlert", alert);
    },
  },
};
</script>
