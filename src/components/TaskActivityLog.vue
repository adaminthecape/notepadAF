<template>
  <q-list>
    <q-item
        v-for="(log, l) in allActivity"
        :key="`activity-item-${l}`"
        clickable
        dense
    >
      <q-item-section>
        <div class="flex" style="flex-direction: column">
          <div v-if="showMessage">{{ log.message }}</div>
          <div>
            <q-chip square dense>{{ log.startDate }}</q-chip>
            <q-chip square dense>{{ log.duration }}</q-chip>
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { filterTaskList } from "src/utils";

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
      allActivity: []
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
    setActivity()
    {
      const tasks = this.$store.getters['notes/getNote']('tasks');

      console.info('setActivity', tasks, this.filters, filterTaskList(tasks.tasks, this.filters));
      if(!tasks)
      {
        return;
      }

      this.allActivity = ((
          Object.keys(this.filters || {}).length ?
              filterTaskList(tasks.tasks, this.filters) :
              tasks.tasks
      ) || []).reduce((agg, task) =>
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
        return `${Math.floor(year / seconds)} years`;
      }
      else if(seconds > (2 * month))
      {
        return `${Math.floor(month / seconds)} months`;
      }
      else if(seconds > (2 * day))
      {
        return `${Math.floor(day / seconds)} days`;
      }
      else if(seconds > (2 * hour))
      {
        return `${Math.floor(hour / seconds)} hrs`;
      }
      else if(seconds > (2 * minute))
      {
        return `${Math.floor(minute / seconds)} min`;
      }

      return `${seconds} sec`;
    }
  }
};
</script>