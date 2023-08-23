<template>
  <!-- VIEW DONE: -->
  <div v-if="done" class="row items-center">
    <q-chip
      class="row items-center"
      :style="color ? '' : 'background: #002200'"
      :color="color"
      :size="transformSizeProp(size)"
      dark
      square
      dense
    >
      <q-icon
        v-if="showDate"
        name="event_available"
        class="q-mr-xs"
      />
      <span v-if="showDate" style="font-size:1.25em">{{ date }}</span>
      <q-icon
        v-if="showTime"
        name="schedule"
        class="q-mr-xs"
        :class="{ 'q-ml-xs': showDate }"
      />
      <span v-if="showTime" style="font-size:1.25em">{{ time.slice(0, -3) }}</span>
    </q-chip>
  </div>
</template>

<script setup lang="ts">
import { padLeft, transformSizeProp } from 'src/utils';
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
  size: {
    type: String,
    default: undefined
  },
  color: {
    type: String,
    default: undefined
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
    new Date(done.value).toLocaleDateString()
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

function toFormat(format: string, timeOrDate?: 'time' | 'date' | undefined) {
  const {
    date, month, yearShort, yearLong, dayShort, dayLong,
    hour, minute, second
  } = getDateValues();

  let res = `${format}`;

  if (!timeOrDate || timeOrDate === 'date')
  {
    res = res
      .replaceAll('d', `${date}`)
      .replaceAll('D', `${dayShort}`)
      .replaceAll('DD', `${dayLong}`)
      .replaceAll('M', `${month}`)
      .replaceAll('MM', padLeft(`${month}`, '0', 2))
      .replaceAll('y', `${yearShort}`)
      .replaceAll('Y', `${yearShort}`)
      .replaceAll('yy', `${yearLong}`)
      .replaceAll('YY', `${yearLong}`);
  }

  if (!timeOrDate || timeOrDate === 'time')
  {
    res = res
      .replaceAll('h', `${hour}`)
      .replaceAll('m', padLeft(`${minute}`, '0', 2))
      .replaceAll('s', padLeft(`${second}`, '0', 2));
  }

  return res;
}

const dateValues = ref(getDateValues());
</script>
