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
      {{ prefix }}
      <q-input
        v-model="createAlertDate"
        mask="##/##/####"
        style="width: 9em"
        class="q-mx-xs"
        filled
        dense
      ><template #prepend><span class="text-caption">D</span></template></q-input>
      <q-input
        v-model="createAlertTime"
        mask="##:##"
        style="width: 6em"
        class="q-mx-xs"
        size="sm"
        filled
        dense
        flat
      ><template #prepend><span class="text-caption">T</span></template></q-input>
      <q-btn-dropdown
        dropdown-icon="watch"
        color="secondary"
        auto-close
        dense
        flat
      >
        <q-item>
          <q-item-section>
            <DirectionalButtonGroup
              label="Min"
              @far-left="setNow(-600000)"
              @near-left="setNow(-60000)"
              @near-right="setNow(60000)"
              @far-right="setNow(600000)"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <DirectionalButtonGroup
              label="Hour"
              @far-left="setNow(-36000000)"
              @near-left="setNow(-3600000)"
              @near-right="setNow(3600000)"
              @far-right="setNow(36000000)"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <DirectionalButtonGroup
              label="Day"
              @far-left="setNow(-864000000)"
              @near-left="setNow(-86400000)"
              @near-right="setNow(86400000)"
              @far-right="setNow(864000000)"
            />
          </q-item-section>
        </q-item>
      </q-btn-dropdown>
      <q-btn
        :icon="iconAdd"
        color="secondary"
        dense
        flat
        @click="createAlert"
      >
        <q-tooltip>{{ ctaTooltip }}</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TaskAlert } from 'src/types';
import { padLeft } from 'src/utils';
import { ref } from 'vue';
import DirectionalButtonGroup from 'src/components/DirectionalButtonGroup.vue';

const props = defineProps({
  inputValue: {
    type: Object,
    default: undefined
  },
  dense: {
    type: Boolean,
    default: true
  },
  prefix: {
    type: String,
    default: 'Due'
  },
  iconAdd: {
    type: String,
    default: 'notification_add'
  },
  ctaTooltip: {
    type: String,
    default: 'Create alert'
  }
});

const createAlertDate = ref<string>();
const createAlertTime = ref<string>();

setNow();

function setNow(add = 0) {
  if(!(createAlertDate.value && createAlertTime.value) && props.inputValue)
  {
    const { date, time, unix } = props.inputValue as TaskAlert;

    if(unix)
    {
      const ctx = getNow(add, unix);

      createAlertDate.value = ctx.date;
      createAlertTime.value = ctx.time;
    }
    else if(date && time)
    {
      createAlertDate.value = date;
      createAlertTime.value = time;
    }

    return;
  }

  const { date, time } = getNow(add);

  createAlertDate.value = date;
  createAlertTime.value = time;
}

function getNow(add = 0, customTime = 0): {
  date: string;
  time: string;
} {
  const d = new Date(
    (
      (createAlertDate.value && createAlertTime.value) ?
        new Date(`${createAlertDate.value} ${createAlertTime.value}`).getTime() :
        (customTime !== 0) ? customTime : Date.now()
    ) + add
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
  console.log('createAlert:', createAlertDate.value, createAlertTime.value);
  const alert: TaskAlert = {
    date: createAlertDate.value || '',
    time: createAlertTime.value || '',
    unix: 0
  };

  alert.unix = new Date(`${alert.date} ${alert.time}`).getTime();

  emit('newAlert', alert);
}
</script>
