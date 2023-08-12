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
          <q-btn-dropdown
            class="row items-center full-width justify-start"
            style="align-content: start"
            flat
            dense
            no-caps
          >
            <template #label>
              <div class="row items-center justify-start full-width">
                <q-chip
                  square
                  dense
                  class="text-bold"
                  style="min-width: 12em"
                  >{{ log.startDate }}</q-chip
                >
                <TaskActiveButton
                  v-if="!log.end"
                  :task-id="taskId"
                  mode="save"
                  @click.stop.prevent="
                    {
                    }
                  "
                />
                <q-chip
                  v-else
                  class="text-bold"
                  style="min-width: 4em"
                  square
                  dense
                  >{{ !log.end ? "..." : log.duration }}</q-chip
                >
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
                    v-if="log.end"
                    color="negative"
                    icon="delete"
                    size="md"
                    class="q-mr-sm"
                    dense
                    flat
                    @click="removeActivityLog(log)"
                  />
                  <q-space />
                  <q-btn-group>
                    <q-btn
                      color="primary"
                      icon="keyboard_double_arrow_left"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      :v-close-popup="false"
                      @click.stop.prevent="incrementBy('start', log, -3600000)"
                    />
                    <q-btn
                      color="primary"
                      icon="keyboard_arrow_left"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click.stop.prevent="incrementBy('start', log, -600000)"
                    />
                    <q-btn label="Start" no-caps dense />
                    <q-btn
                      color="primary"
                      icon="keyboard_arrow_right"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click.stop.prevent="incrementBy('start', log, 600000)"
                    />
                    <q-btn
                      color="primary"
                      icon="keyboard_double_arrow_right"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click.stop.prevent="incrementBy('start', log, 3600000)"
                    />
                  </q-btn-group>
                  <q-space />
                  <q-btn-group v-if="log.end" class="q-ml-sm">
                    <q-btn
                      color="primary"
                      icon="keyboard_double_arrow_left"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click.stop.prevent="incrementBy('end', log, -3600000)"
                    />
                    <q-btn
                      color="primary"
                      icon="keyboard_arrow_left"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click.stop.prevent="incrementBy('end', log, -600000)"
                    />
                    <q-btn label="End" no-caps dense />
                    <q-btn
                      color="primary"
                      icon="keyboard_arrow_right"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click.stop.prevent="incrementBy('end', log, 600000)"
                    />
                    <q-btn
                      color="primary"
                      icon="keyboard_double_arrow_right"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click.stop.prevent="incrementBy('end', log, 3600000)"
                    />
                  </q-btn-group>
                </q-item>
              </div>
              <q-input
                v-model="log.note"
                dense
                filled
                @click.stop.prevent="
                  {
                  }
                "
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
            </template>
          </q-btn-dropdown>
        </div>
      </q-item-section>
    </q-item>
    <q-input v-if="addNew" v-model="newLogMessage" />
  </q-list>
</template>

<script>
import {
  filterTaskList,
  getAllTasksFromStore,
  secondsToHumanReadable,
  cudTaskPropertyViaStore
} from "src/utils";
import TaskActiveButton from "components/TaskActiveButton";

export default {
  name: "ActivityLog",
  components: { TaskActiveButton },
  props: {
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
  },
  data() {
    return {
      allActivity: [],
      listRenderIndex: 0,
      newLogMessage: "",
      isIncrementDialogOpen: {},
    };
  },
  computed: {
    taskList() {
      if (this.taskId) {
        return [this.$store.getters["notes/getTask"](this.taskId)];
      }

      return this.allActivity;
    },
    taskActivity() {
      return this.taskList
        .reduce((agg, task) => {
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
                .split(":")
                .slice(0, 2)
                .join(":"),
              id: task.id,
              message: this.showMessage
                ? task.message && task.message.length > 50
                  ? `${task.message.slice(0, 50)}...`
                  : task.message || ""
                : undefined,
            });
          });

          return agg;
        }, [])
        .sort((a, b) => a.start - b.start);
    },
  },
  watch: {
    filters: {
      handler() {
        this.setActivity();
      },
      deep: true,
    },
  },
  mounted() {
    this.setActivity();
  },
  methods: {
    updateLog(data) {
      cudTaskPropertyViaStore(
        this.$store,
        {
          taskId: this.taskId,
          prop: "activity",
          data: data.map((item) => {
            delete item.isEditing;

            return item;
          }),
        })
        .then(() => {
          // this.listRenderIndex += 1;
        });
    },
    removeActivityLog(log) {
      this.updateLog(
        this.taskActivity.filter(
          (l) => l.start !== log.start && l.end !== log.end
        )
      );
    },
    updateTime(index, newTime, startOrEnd) {
      const data = [...this.taskActivity].map((log, l) => {
        if (l === index) {
          return {
            ...log,
            [startOrEnd]: newTime,
          };
        }

        return log;
      });

      this.updateLog(data);
    },
    incrementBy(startOrEnd, log, amount) {
      if (!startOrEnd || !amount || !log) {
        return;
      }

      const index = this.taskActivity.findIndex(
        (l) => l.start === log.start && l.end === log.end
      );

      const newTime = this.taskActivity[index][startOrEnd] + amount;

      this.updateTime(index, newTime, startOrEnd);
    },
    setActivity() {
      if (this.taskId) {
        return;
      }

      const tasks = getAllTasksFromStore(this.$store);

      if (!tasks) {
        return;
      }

      const tasksList =
        (Object.keys(this.filters || {}).length
          ? filterTaskList(tasks, this.filters)
          : tasks) || [];

      this.allActivity = tasksList;
    },
  },
};
</script>
