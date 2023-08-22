<template>
  <!-- VIEW DONE: -->
  <div v-if="done" class="row items-center">
    <q-chip
      class="row items-center"
      style="background: #002200"
      dark
      square
      dense
    >
      <q-icon v-if="showDate" name="task_alt" size="xs" class="q-mr-xs" />
      <span v-if="showDate">{{ date }}</span>
      <q-icon v-if="showTime" name="schedule" size="xs" class="q-mr-xs" :class="{ 'q-ml-xs': showDate }" />
      <span v-if="showTime">{{ time.slice(0, -3) }}</span>
    </q-chip>
  </div>
</template>

<script setup lang="ts">
import { padLeft } from 'src/utils';
import useTaskStore from 'src/pinia/taskStore';
import { computed, ref } from 'vue';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  },
  showDate: {
    type: Boolean,
    default: false
  },
  showTime: {
    type: Boolean,
    default: false
  },
  short: {
    type: Boolean,
    default: true
  },
  dateFormat: {
    type: String,
    default: undefined
  },
  timeFormat: {
    type: String,
    default: undefined
  },
  customDoneValue: {
    type: Number,
    default: undefined
  }
});

const store = useTaskStore();

const done = computed(() => !props.taskId ? props.customDoneValue || 0 : store.getTaskProperty(props.taskId, 'done'));
const date = computed<string>(() => (
  props.dateFormat ?
    toFormat(props.dateFormat) :
    new Date(done.value).toLocaleTimeString()
));
const time = computed<string>(() => (
  props.timeFormat ?
    toFormat(props.timeFormat) :
    new Date(done.value).toLocaleTimeString()
));

function getDateValues() {
  if (!done.value) return {};

  const d = new Date(done.value);
  const daysLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysShort = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

  return {
    date: d.getDate(),
    month: d.getMonth() + 1,
    yearShort: `${d.getFullYear()}`.slice(2, 4),
    yearLong: `${d.getFullYear()}`,
    dayLong: daysLong[d.getDay()],
    dayShort: daysShort[d.getDay()],
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds()
  };
}

function toFormat(format: string) {
  const {
    date, month, yearShort, yearLong, dayShort, dayLong,
    hour, minute, second
  } = getDateValues();

  return format
    // date:
    .replaceAll('{d}', `${date}`)
    .replaceAll('{D}', `${dayShort}`)
    .replaceAll('{DD}', `${dayLong}`)
    .replaceAll('{M}', `${month}`)
    .replaceAll('{y}', `${yearShort}`)
    .replaceAll('{Y}', `${yearShort}`)
    .replaceAll('{yy}', `${yearLong}`)
    .replaceAll('{YY}', `${yearLong}`)
    // time:
    .replaceAll('{h}', `${hour}`)
    .replaceAll('{m}', padLeft(`${minute}`, '0', 2))
    .replaceAll('{s}', padLeft(`${second}`, '0', 2))
}

const dateValues = ref(getDateValues());
</script>
