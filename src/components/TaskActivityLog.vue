<template>
  <q-list :key="`activity-list-${listRenderIndex}`">
    <q-item
      v-for="(log, l) in taskActivity"
      :key="`activity-item-${l}`"
      dense
      @dblclick.ctrl="removeActivityLog(log)"
    >
      <q-item-section>
        <div class="flex" style="flex-direction: column">
          <div v-if="showMessage">{{ log.message }}</div>
          <div class="row items-center justify-start full-width">
            <!-- <q-chip square dense class="text-bold" style="min-width: 12em">{{ log.startDate }}</q-chip> -->
            <q-btn-dropdown
              class="row items-center justify-start"
              style="align-content: start"
              flat
              dense
              no-caps
            >
              <template #label>
                <TimeChip
                  :custom-done-value="log.unix"
                  date-format="M/d"
                  time-format="M/d h:m:s"
                  show-time
                  dense
                  :size="transformSizeProp('sm')"
                  style="display: inline;margin-right:-10px"
              /></template>
              <template #default>
                <div>
                  <q-item class="row items-center">
                    <q-input
                      v-model="log.note"
                      class="full-width"
                      dense
                      filled
                    >
                      <template #append>
                        <q-btn
                          icon="save"
                          dense
                          flat
                          @click.stop.prevent="updateLog(taskActivity)"
                        />
                      </template>
                    </q-input>
                    <q-btn
                      color="negative"
                      icon="delete"
                      size="md"
                      class="q-ml-sm"
                      dense
                      flat
                      @click="removeActivityLog(log)"
                    />
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <CreateAlert
                        :input-value="log.start ? { unix: log.start } : undefined"
                        icon-add="save"
                        cta-tooltip="Set time"
                        prefix="Start:"
                        @newAlert="updateTimeFromAlert('start', log, $event)"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <CreateAlert
                        :input-value="log.end ? { unix: log.end } : undefined"
                        icon-add="save"
                        cta-tooltip="Set time"
                        prefix="End:&nbsp;&nbsp;"
                        @newAlert="updateTimeFromAlert('end', log, $event)"
                      />
                    </q-item-section>
                  </q-item>
                </div>
              </template>
            </q-btn-dropdown>
            <TaskActiveButton
              v-if="taskId && !log.end"
              :task-id="taskId"
              mode="save"
              dense
              flat
            />
            <q-chip
              v-else
              :size="transformSizeProp('sm')"
              class="text-bold"
              style="min-width: 4em; font-size: 0.95em"
              square
              dense
              >{{ !log.end ? '...' : log.duration }}</q-chip
            >
            <div class="row items-center">
              <q-chip style="flex-grow: 1" class="full-width" square dense>
                <span>{{ log.note }}</span>
                <StoryListTooltip :value="log.note" />
              </q-chip>
            </div>
            <q-space />
          </div>
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
  transformSizeProp,
} from 'src/utils';
import useTaskStore from 'src/pinia/taskStore';
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { Task, TaskActivityLog, TaskAlert, TaskFilters } from 'src/types';
import TimeChip from 'src/components/TimeChip.vue';
import StoryListTooltip from 'src/components/StoryListTooltip.vue';
import CreateAlert from 'src/components/CreateAlert.vue';
import { removeUndefined } from 'src/mixins/firebase';

const TaskActiveButton = defineAsyncComponent(
  () => import('src/components/TaskActiveButton.vue')
);
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

watch(
  () => props.filters,
  () => setActivity()
);
onMounted(() => setActivity());

function updateLog(data: TaskActivityLog) {
  if (!props.taskId) {
    return;
  }

  store
    .cloudUpdateSingleProperty({
      taskId: props.taskId,
      prop: 'activity',
      data: data
        .filter((item: TaskActivityLog) => item)
        .map((item: TaskActivityLog) => {
          delete item.isEditing;

          return removeUndefined(item);
        })
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

function updateTimeFromAlert(
  startOrEnd: 'start' | 'end',
  log: TaskActivityLog,
  alert: TaskAlert
) {
  if (!startOrEnd || !alert?.unix || !log) {
    return;
  }

  const index = taskActivity.value.findIndex(
    (l: TaskActivityLog) => l.start === log.start && l.end === log.end
  );

  updateTime(index, alert.unix, startOrEnd);
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
