<template>
  <q-list :key="`activity-list-${listRenderIndex}`">
    <q-item
        v-for="(log, l) in taskActivity"
        :key="`activity-item-${l}`"
        clickable
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
              <div class="row items-center justify-start">
                <q-chip square dense class="text-bold" style="min-width: 12em">{{ log.startDate }}</q-chip>
                <div class="column">
                  <q-chip
                      class="text-bold"
                      style="min-width: 4em"
                      square
                      dense
                      @click="isIncrementDialogOpen[l] = true"
                  >{{ log.duration }}</q-chip>
                </div>
                <q-chip
                    v-if="log.note"
                    style="flex-grow: 1"
                    square
                    dense
                >{{ log.note }}</q-chip>
                <q-space />
              </div>
            </template>
            <template #default>
              <div class="row items-center">
                <q-item>
                  <q-btn
                      color="negative"
                      icon="delete"
                      size="md"
                      class="full-width"
                      dense
                      flat
                      @click="removeActivityLog(log)"
                  >Remove</q-btn>
                </q-item>
                <q-item>
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
                    <q-btn label="Start" no-caps />
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
                </q-item>
                <q-item>
                  <q-btn-group>
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
                    <q-btn label="End" no-caps />
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
            </template>
          </q-btn-dropdown>
        </div>
      </q-item-section>
    </q-item>
    <q-input
        v-if="addNew"
        v-model="newLogMessage"
    />
  </q-list>
</template>

<script>
import { filterTaskList, getAllTasksFromStore, secondsToHumanReadable } from "src/utils";

export default {
  name: 'ActivityLog',
  props: {
    taskId: {
      type: String,
      default: undefined
    },
    addNew: {
      type: Boolean,
      default: false
    },
    filters: {
      type: Object,
      default: undefined
    },
    showMessage: {
      type: Boolean,
      default: false
    }
  },
  data()
  {
    return {
      allActivity: [],
      listRenderIndex: 0,
      newLogMessage: '',
      isIncrementDialogOpen: {}
    };
  },
  computed: {
    taskList()
    {
      if(this.taskId)
      {
        return [this.$store.getters['notes/getTask'](this.taskId)];
      }

      return this.allActivity;
    },
    taskActivity()
    {
      return this.taskList
          .reduce((agg, task) =>
          {
            if(!task.activity) return agg;
            if(!task.activity.length) return agg;

            task.activity.forEach((log) =>
            {
              agg.push({
                ...log,
                duration: log.end && log.start ?
                    secondsToHumanReadable(Math.floor((log.end - log.start) / 1000), true) :
                    0,
                startDate: new Date(log.start).toLocaleString().split(':').slice(0, 2).join(':'),
                id: task.id,
                message: this.showMessage ? (
                    task.message && task.message.length > 50 ?
                        `${task.message.slice(0, 50)}...` :
                        task.message || ''
                ) : undefined
              });
            });

            return agg;
          }, [])
          .sort((a, b) => (a.start - b.start));
    }
  },
  watch: {
    filters: {
      handler()
      {
        this.setActivity();
      },
      deep: true
    }
  },
  mounted()
  {
    this.setActivity();
  },
  methods: {
    updateLog(data)
    {
      this.$store.dispatch(
          'notes/cloudUpdateSingleProperty',
          {
            taskId: this.taskId,
            prop: 'activity',
            data
          }
      ).then(() =>
      {
        this.listRenderIndex += 1;
      });
    },
    removeActivityLog(log)
    {
      this.updateLog(
        this.taskActivity.filter((l) => (
          (l.start !== log.start) && (l.end !== log.end)
        ))
      );
    },
    updateTime(index, newTime, startOrEnd)
    {
      const data = [...this.taskActivity].map((log, l) =>
      {
        if(l === index)
        {
          return {
            ...log,
            [startOrEnd]: newTime
          };
        }

        return log;
      });

      this.updateLog(data);
    },
    incrementBy(startOrEnd, log, amount)
    {
      if(!startOrEnd || !amount || !log)
      {
        return;
      }

      console.log('incrementBy:', { log, amount, startOrEnd });
      const index = this.taskActivity.findIndex((l) => (
          (l.start === log.start) && (l.end === log.end)
      ));

      const newTime = this.taskActivity[index][startOrEnd] + amount;

      this.updateTime(index, newTime, startOrEnd);
    },
    setActivity()
    {
      if(this.taskId)
      {
        return;
      }

      const tasks = getAllTasksFromStore(this.$store);

      if(!tasks)
      {
        return;
      }

      const tasksList = ((
          Object.keys(this.filters || {}).length ?
              filterTaskList(tasks, this.filters) :
              tasks
      ) || []);

      this.allActivity = tasksList;
    }
  }
};
</script>