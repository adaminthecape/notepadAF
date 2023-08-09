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
          <div class="row items-center full-width">
            <q-btn
                color="negative"
                icon="delete"
                size="sm"
                dense
                flat
                @click="removeActivityLog(log)"
            ><q-tooltip>Remove</q-tooltip></q-btn>
            <q-chip square dense class="text-bold" style="min-width: 10em">{{ log.startDate }}</q-chip>
            <q-chip square dense class="text-bold" style="min-width: 4em">{{ log.duration }}</q-chip>
            <q-chip
                v-if="log.note"
                style="flex-grow: 1"
                square
                dense
            >{{ log.note }}</q-chip>
          </div>
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
      newLogMessage: ''
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
    removeActivityLog(log)
    {
      this.$store.dispatch(
          'notes/cloudUpdateSingleProperty',
          {
            taskId: this.taskId,
            prop: 'activity',
            data: this.taskActivity.filter((l) => (
                (l.start !== log.start) && (l.end !== log.end)
            ))
          }
      ).then(() =>
      {
        this.listRenderIndex += 1;
      });
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