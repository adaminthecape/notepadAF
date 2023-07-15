<template>
  <q-list :key="`activity-list-${listRenderIndex}`">
    <q-item
        v-for="(log, l) in allActivity"
        :key="`activity-item-${l}`"
        clickable
        dense
        @dblclick.ctrl="removeActivityLog(log)"
    >
      <q-item-section>
        <div class="flex" style="flex-direction: column">
          <div v-if="showMessage">{{ log.message }}</div>
          <div>
            <q-chip square dense>{{ log.startDate }}</q-chip>
            <q-chip square dense class="text-bold" style="min-width: 6em">{{ log.duration }}</q-chip>
            <q-chip v-if="log.note" square dense>{{ log.note }}</q-chip>
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { cudTask, filterTaskList, queueTaskRefresh } from "src/utils";

export default {
  props: {
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
      singleTask: undefined,
      listRenderIndex: 0
    };
  },
  computed: {
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
      if(!this.filters || !this.filters.id || !this.singleTask || !this.singleTask.activity)
      {
        return;
      }

      const storeFn = async (tasks) =>
      {
        await this.$store.dispatch('notes/update', {
          note: {
            id: 'tasks',
            tasks
          }
        })
      };

      cudTask(
          this.$store.getters['notes/getNote']('tasks').tasks,
          storeFn,
          {
            ...this.singleTask,
            activity: this.singleTask.activity.filter((l) => (
                (l.start !== log.start) && (l.end !== log.end)
            ))
          }
      ).then(() =>
      {
        this.listRenderIndex += 1;
        queueTaskRefresh(this.singleTask.id);
      });
    },
    setActivity()
    {
      this.singleTask = undefined;
      const tasks = this.$store.getters['notes/getNote']('tasks');

      console.info('setActivity', tasks, this.filters, filterTaskList(tasks.tasks, this.filters));
      if(!tasks)
      {
        return;
      }

      const tasksList = ((
          Object.keys(this.filters || {}).length ?
              filterTaskList(tasks.tasks, this.filters) :
              tasks.tasks
      ) || []);

      if(this.filters && this.filters.id && tasksList.length === 1)
      {
        this.singleTask = tasksList[0];
      }

      this.allActivity = tasksList
          .reduce((agg, task) =>
          {
            if(!task.activity) return agg;
            if(!task.activity.length) return agg;

            task.activity.forEach((log) =>
            {
              agg.push({
                ...log,
                duration: log.end && log.start ?
                    this.secondsToHumanReadable(Math.floor((log.end - log.start) / 1000)) :
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
    },
    secondsToHumanReadable(seconds)
    {
      const minute = 60;
      const hour = minute * 60;
      const day = hour * 24;
      const month = day * 30;
      const year = month * 12;

      if(seconds > year)
      {
        return `${Math.floor(seconds / year)} years`;
      }
      else if(seconds > (2 * month))
      {
        return `${Math.floor(seconds / month)} months`;
      }
      else if(seconds > (2 * day))
      {
        return `${Math.floor(seconds / day)} days`;
      }
      else if(seconds > (2 * hour))
      {
        return `${Math.floor(seconds / hour)} hrs`;
      }
      else if(seconds > (2 * minute))
      {
        return `${Math.floor(seconds / minute)} min`;
      }

      return `${seconds} sec`;
    }
  }
};
</script>