<template>
  <q-list :key="`activity-list-${listRenderIndex}`">
    <q-item v-for="(log, l) in taskActivity" :key="`activity-item-${l}`" dense @dblclick.ctrl="removeActivityLog(log)">
      <q-item-section>
        <div class="flex" style="flex-direction: column">
          <div v-if="showMessage">{{ log.message }}</div>
          <q-btn-dropdown
class="row items-center full-width justify-start" style="align-content: start" flat dense
            no-caps>
            <template #label>
              <div class="row items-center justify-start full-width">
                <!-- <q-chip square dense class="text-bold" style="min-width: 12em">{{ log.startDate }}</q-chip> -->
                <TimeChip
                  :custom-done-value="log.unix"
                  date-format="M/d"
                  time-format="M/d h:m:s"
                  show-time
                  dense
                  :size="transformSizeProp('xs')"
                  style="display: inline"
                />
                <TaskActiveButton
                  v-if="taskId && !log.end"
                  :task-id="taskId"
                  mode="save"
                  dense
                  flat
                />
                <q-chip v-else class="text-bold" style="min-width: 4em" square dense>{{ !log.end ? "..." : log.duration
                }}</q-chip>
                <q-chip style="flex-grow: 1" class="full-width" square dense>
                  <span>{{ log.note }}</span>
                </q-chip>
                <q-space />
              </div>
            </template>
            <template #default>
              <div>
                <q-item class="row items-center">
                  <q-btn
v-if="log.end" color="negative" icon="delete" size="md" class="q-mr-sm" dense flat
                    @click="removeActivityLog(log)" />
                  <q-space />
                  <q-btn-group>
                    <q-btn
color="primary" icon="keyboard_double_arrow_left" size="md" class="full-width" dense flat
                      :v-close-popup="false" @click.stop.prevent="incrementBy('start', log, -3600000)" />
                    <q-btn
color="primary" icon="keyboard_arrow_left" size="md" class="full-width" dense flat
                      @click.stop.prevent="incrementBy('start', log, -600000)" />
                    <q-btn label="Start" no-caps dense />
                    <q-btn
color="primary" icon="keyboard_arrow_right" size="md" class="full-width" dense flat
                      @click.stop.prevent="incrementBy('start', log, 600000)" />
                    <q-btn
color="primary" icon="keyboard_double_arrow_right" size="md" class="full-width" dense flat
                      @click.stop.prevent="incrementBy('start', log, 3600000)" />
                  </q-btn-group>
                  <q-space />
                  <q-btn-group v-if="log.end" class="q-ml-sm">
                    <q-btn
color="primary" icon="keyboard_double_arrow_left" size="md" class="full-width" dense flat
                      @click.stop.prevent="incrementBy('end', log, -3600000)" />
                    <q-btn
                    color="primary" icon="keyboard_arrow_left" size="md" class="full-width" dense flat
                      @click.stop.prevent="incrementBy('end', log, -600000)" />
                    <q-btn label="End" no-caps dense />
                    <q-btn
color="primary" icon="keyboard_arrow_right" size="md" class="full-width" dense flat
                      @click.stop.prevent="incrementBy('end', log, 600000)" />
                    <q-btn
color="primary" icon="keyboard_double_arrow_right" size="md" class="full-width" dense flat
                      @click.stop.prevent="incrementBy('end', log, 3600000)" />
                  </q-btn-group>
                </q-item>
              </div>
              <q-input
v-model="log.note" dense filled @click.stop.prevent="
                                {
}
  ">
                <template #append>
                  <q-btn icon="save" dense flat @click.stop.prevent="updateLog(taskActivity)" />
                </template>
              </q-input>
            </template>
          </q-btn-dropdown>
        </div>
      </q-item-section>
    </q-item>
    <q-input v-if="addNew" v-model="newLogMessage" />
  </q-list>
</template>

<script setup lang="ts">
import {
  filterTaskList,
  secondsToHumanReadable,
  transformSizeProp
} from 'src/utils';
import useTaskStore from 'src/pinia/taskStore';
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { Task, TaskActivityLog, TaskFilters } from 'src/types';
import TimeChip from 'src/components/TimeChip.vue';

const TaskActiveButton = defineAsyncComponent(() => import('src/components/TaskActiveButton.vue'));
const props = defineProps({
  taskId: {
    type: String,
    default: undefined,
  },
  addNew: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    default: undefined,
  },
  showMessage: {
    type: Boolean,
    default: false,
  },
});

const store = useTaskStore();

const allActivity = ref<TaskActivityLog[]>([]);
const listRenderIndex = ref(0);
const newLogMessage = ref('');

const taskList = computed(() => {
  if (props.taskId) {
    return [store.getTask(props.taskId)];
  }

  return allActivity.value;
});

const taskActivity = computed(() => {
  return (taskList.value as any)
    .reduce((agg: TaskActivityLog[], task: Task) => {
      if (!task.activity) return agg;
      if (!task.activity.length) return agg;

      task.activity.forEach((log) => {
        agg.push({
          ...log,
          duration:
            log.end && log.start
              ? secondsToHumanReadable(
                Math.floor((log.end - log.start) / 1000),
                true
              )
              : 0,
          startDate: new Date(log.start)
            .toLocaleString()
            .split(':')
            .slice(0, 2)
            .join(':'),
          id: task.id,
          unix: new Date(log.start).getTime(),
          message: props.showMessage
            ? task.message && task.message.length > 50
              ? `${task.message.slice(0, 50)}...`
              : task.message || ''
            : undefined,
        });
      });

      return agg;
    }, [])
    .sort((a: TaskActivityLog, b: TaskActivityLog) => a.start - b.start);
});

watch(() => props.filters, () => setActivity());
onMounted(() => setActivity());

function updateLog(data: TaskActivityLog) {
  if (!props.taskId) {
    return;
  }

  store.cloudUpdateSingleProperty({
    taskId: props.taskId,
    prop: 'activity',
    data: data.map((item: TaskActivityLog) => {
      delete item.isEditing;

      return item;
    }),
  })
    .then(() => {
      // this.listRenderIndex += 1;
    });
}

function removeActivityLog(log: TaskActivityLog) {
  updateLog(
    taskActivity.value.filter(
      (l: TaskActivityLog) => l.start !== log.start && l.end !== log.end
    )
  );
}

function updateTime(
  index: number,
  newTime: number,
  startOrEnd: 'start' | 'end'
) {
  const data = [...taskActivity.value].map((log, l) => {
    if (l === index) {
      return {
        ...log,
        [startOrEnd]: newTime,
      };
    }

    return log;
  });

  updateLog(data);
}

function incrementBy(
  startOrEnd: 'start' | 'end',
  log: TaskActivityLog,
  amount: number
) {
  if (!startOrEnd || !amount || !log) {
    return;
  }

  const index = taskActivity.value.findIndex(
    (l: TaskActivityLog) => l.start === log.start && l.end === log.end
  );

  const newTime = taskActivity.value[index][startOrEnd] + amount;

  updateTime(index, newTime, startOrEnd);
}

function setActivity() {
  if (props.taskId) {
    return;
  }

  const tasks = useTaskStore().all;
  // const tasks = this.$store.getters['notes/getTasks'];

  if (!tasks) {
    return;
  }

  const tasksList =
    (Object.keys(props.filters || {}).length
      ? filterTaskList(tasks, props.filters as Partial<TaskFilters>)
      : tasks) || [];

  // allActivity.value = tasksList;
}
</script>
