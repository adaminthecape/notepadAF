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

<script setup lang="ts">
import { TaskAlert } from '@/types';
import { padLeft } from 'src/utils';
import { ref } from 'vue';

defineProps<{
  dense?: boolean;
}>();

const { date, time } = getNow();
const createAlertDate = ref(date);
const createAlertTime = ref(time);

function setNow(add = 0) {
  const { date, time } = getNow(add);

  createAlertDate.value = date;
  createAlertTime.value = time;
}

function getNow(add = 0): {
  date: string;
  time: string;
} {
  const d = new Date(
    (createAlertDate.value && createAlertTime.value
      ? new Date(
        `${createAlertDate.value} ${createAlertTime.value}`
      ).getTime()
      : Date.now()) + add
  );
  const time = `${padLeft(d.getHours(), '0', 2)}:${padLeft(
    d.getMinutes(),
    '0',
    2
  )}`;
  const date = `${padLeft(d.getMonth() + 1, '0', 2)}/${padLeft(
    d.getDate(),
    '0',
    2
  )}/${padLeft(d.getFullYear(), '0', 4)}`;

  return { date, time };
}

const emit = defineEmits<{
  (event: 'newAlert', alert: TaskAlert): void
}>()

function createAlert() {
  const alert: TaskAlert = {
    date: createAlertDate.value,
    time: createAlertTime.value,
    unix: 0
  };

  alert.unix = new Date(`${alert.date} ${alert.time}`).getTime();

  emit('newAlert', alert);
}
</script>
