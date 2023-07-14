<template>
  <SimpleLayout header>
    <template #header-title>
      <div class="row items-center" style="font-size: 0.8em">
        <span v-if="!tasksList || !filteredTasksList">No tasks to show</span>
        <span v-else-if="filteredTasksList.length === tasksList.length">Showing all tasks</span>
        <span v-else>Showing {{ filteredTasksList.length }} of {{ tasksList.length }} tasks</span>
        <q-space />
        <q-btn
            v-if="areFiltersActive"
            icon="tune"
            size="sm"
            dense
            round
            flat
            @click="clearFilters"
        >
          <q-tooltip>Clear filters</q-tooltip>
        </q-btn>
        <TaskSortDropdown
            :sortType="sortType"
            :inverseSort="inverseSort"
            @setSortType="setSort"
        />
        <q-btn
            class="q-ml-xs"
            :icon="applyFilters ? 'lock' : 'lock_open'"
            size="sm"
            dense
            flat
            dark
            @click="applyFilters = !applyFilters"
        >
          <q-tooltip>Apply filters to new task</q-tooltip>
        </q-btn>
      </div>
    </template>
    <template #page-content>
      <!-- NEW TASK / FILTERS: -->
      <div style="display: flex; flex-direction: column">
        <q-input
            ref="newTaskInput"
            v-model="newTask.message"
            placeholder="Add a task"
            class="full-width q-mb-xs"
            filled
            dense
            style="background: #FFFF0020;"
        >
          <template #append>
            <q-btn
                icon="add_task"
                dense
                flat
                @click="createTask()"
            />
          </template>
        </q-input>
        <div class="row items-center q-mb-xs">
          <q-input
              v-model="filters.keyword"
              placeholder="Filter by keyword"
              class="q-mr-xs"
              style="flex-grow: 1; max-width: 40%"
              debounce="250"
              filled
              dense
              @input="filterTasks"
          >
            <template #append>
              <q-btn
                  v-if="filters.keyword"
                  icon="close"
                  round
                  dense
                  flat
                  size="xs"
                  @click.stop.prevent="setFilter(filterTypes.keyword, undefined)"
              />
            </template>
          </q-input>
          <TaskTagSelector
              :inputValue="filters.tags || []"
              label="Filter by tags"
              style="flex-grow: 1; max-width: 60%"
              multiple
              @input="setFilter(filterTypes.tags, $event)"
              @cancel="setFilter(filterTypes.tags, [])"
          />
        </div>
        <q-btn-group class="row items-center q-mb-xs" flat>
          <q-btn
              v-for="bool in toggleableBooleans"
              :key="`bool-toggle-${bool.value}`"
              :label="bool.label"
              dense
              flat
              :color="getFilterBoolColor(bool.value)"
              @click="toggleFilterBool(bool.value)"
          />
        </q-btn-group>
      </div>
      <q-separator class="q-mb-sm" />
      <!-- TASK LIST: -->
      <div
          style="height: calc(100vh - 260px); overflow-y: scroll"
          :key="`taskList-${taskListRenderIndex}`"
      >
        <div
            v-for="task in filteredTasksList"
            :key="task.id"
        >
          <DisplayTask
              :key="taskRenderIndex[task.id]"
              noteId="tasks"
              :taskId="task.id"
              class="full-width"
              editable
              :dark="dark"
              @updateTask="updateTask"
              @refreshTask="refreshTask"
              @filterByTag="addTagToFilters"
          />
        </div>
      </div>
    </template>
  </SimpleLayout>
</template>

<script>
import DisplayTask from './DisplayTask';
import SimpleLayout from './SimpleLayout';
import TaskTagSelector from './TaskTagSelector';
import TaskSortDropdown from './TaskSortDropdown';
import DbMixin from '../mixins/jsondb';
import { v4 as uuidv4 } from 'uuid';
import { filterTaskList, getFromLocalStorage, saveToLocalStorage } from "src/utils";

export default {
  name: 'Tasks',
  components: {
    DisplayTask,
    TaskTagSelector,
    TaskSortDropdown,
    SimpleLayout
  },
  mixins: [DbMixin],
  props: {
    dark: {
      type: Boolean,
      default: true
    }
  },
  data()
  {
    return {
      filterTypes: {
        keyword: 'keyword',
        tags: 'tags',
        active: 'active',
        archived: 'archived',
        done: 'done'
      },
      filters: {},
      applyFilters: true,
      filteredTasksList: [],
      newTask: {
        title: null,
        content: null
      },
      tasksLoaded: false,
      taskRenderIndex: {},
      taskListRenderIndex: 0,
      sortType: null,
      inverseSort: false
    };
  },
  provide()
  {
    return {
      $updateTask: this.updateTaskInDb,
      $getTask: this.getTask,
      $refreshTask: this.refreshTask
    };
  },
  inject: ['$addOrUpdateTask'],
  computed: {
    areFiltersActive()
    {
      return this.tasksList.length !== this.filteredTasksList.length;
    },
    toggleableBooleans()
    {
      return [
        { label: 'Done', value: 'done' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' }
        // { label: 'Alarm', value: 'hasAlarm' },
        // { label: 'Due', value: 'isDue' }
      ];
    },
    tasksList()
    {
      if(!this.$store.getters['notes/getNote']('tasks'))
      {
        return [];
      }

      return this.$store.getters['notes/getNote']('tasks').tasks;
    },
    taskOptions()
    {
      if(!this.tasksList || !this.tasksList.length)
      {
        return [];
      }

      return this.tasksList.map((task) => ({
        label: task.message,
        value: task.id
      }));
    },
    allTags()
    {
      if(!this.tasksList || !this.tasksList.length)
      {
        return [];
      }

      return this.tasksList.reduce((agg, task) =>
      {
        const tags = [...task.tags || []]
            .filter((tag) => !agg.includes(tag));

        if(tags.length)
        {
          return agg.concat(tags);
        }

        return agg;
      }, []);
    }
  },
  mounted()
  {
    this.loadTasks();
    this.filteredTasksList = this.tasksList;

    const storedFilters = getFromLocalStorage('taskFilters', true);

    if(storedFilters)
    {
      this.sortType = storedFilters.sortType;
      this.inverseSort = storedFilters.inverseSort;
      this.filters = storedFilters;
      this.filterTasks();
    }
  },
  methods: {
    /****** Loading/fetching tasks */
    async loadTasks()
    {
      this.$log(`loadTasks`);
      await this.$store.dispatch('notes/loadAll');
      this.tasksLoaded = true;
    },
    getTask(id)
    {
      return this.tasksList.find((task) => task.id === id);
    },
    /****** Filtering tasks */
    clearFilters()
    {
      this.filters = {};
      this.filterTasks();
    },
    /** Used with q-select */
    filterFn(val, update)
    {
      if(!val || val === '')
      {
        update(() =>
        {
          this.filteredTasksList = this.taskOptions;
        });

        return;
      }

      update(() =>
      {
        const needle = val.toLowerCase();

        this.filteredTasksList = this.taskOptions.filter((n) => n.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    /** Actual filtering logic. Sorts after filtering. Saves filters to localStorage. */
    filterTasks()
    {
      saveToLocalStorage('taskFilters', {
        ...this.filters,
        sortType: this.sortType,
        inverseSort: this.inverseSort
      });

      this.filteredTasksList = filterTaskList(this.tasksList, this.filters);

      this.sortTasks();
    },
    /**
     * Add OR remove given tag to current filters & filter again.
     * @param tag - Tag to add or remove, if already in filters.
     */
    addTagToFilters(tag)
    {
      if(!tag)
      {
        return;
      }

      if(!this.filters)
      {
        this.filters = {};
      }

      if(!this.filters.tags)
      {
        this.filters.tags = [];
      }

      if(this.filters.tags.includes(tag))
      {
        this.filters.tags = this.filters.tags.filter((t) => t !== tag);
      }
      else
      {
        this.filters.tags.push(tag);
      }

      this.filterTasks();
    },
    /****** Filtering tasks - booleans */
    getFilterBoolColor(prop)
    {
      return this.filters[prop] ?
          'green-9' :
          this.filters[prop] === false ?
              'negative' :
              'grey-9';
    },
    toggleFilterBool(prop)
    {
      if(this.filters[prop] === true)
      {
        this.filters[prop] = false;
      }
      else if(this.filters[prop] === false)
      {
        this.filters[prop] = null;
      }
      else
      {
        this.filters[prop] = true;
      }

      this.filterTasks();
    },
    /****** Sorting tasks */
    sortTasks()
    {
      const sortByCreated = (a, b) =>
      {
        if(this.inverseSort)
        {
          return a.created - b.created;
        }

        return b.created - a.created;
      }

      const sortByAlarm = (a, b) =>
      {
        const aSoonest = a.alerts && a.alerts.length ? Math.min(a.alerts.map((alert) => alert.unix)) : Infinity;
        const bSoonest = b.alerts && b.alerts.length ? Math.min(b.alerts.map((alert) => alert.unix)) : Infinity;

        if(this.inverseSort)
        {
          return bSoonest - aSoonest;
        }

        return aSoonest - bSoonest;
      }

      const sortByBool = (bool, a, b) =>
      {
        if(this.inverseSort)
        {
          return b[bool] - a[bool];
        }

        return a[bool] - b[bool];
      }

      switch(this.sortType)
      {
        case 'due':
          return this.filteredTasksList.sort(sortByAlarm);
        case 'done':
          return this.filteredTasksList.sort((a, b) => sortByBool('done', a, b));
        case 'created':
        default:
          return this.filteredTasksList.sort(sortByCreated);
      }
    },
    /** Set the sort type AND sort tasks. */
    setSort(type)
    {
      if(type === this.sortType)
      {
        // invert it
        this.inverseSort = !this.inverseSort;
      }
      else
      {
        this.sortType = type;
      }

      this.sortTasks();
    },
    /****** Updating tasks */
    updateTaskInDb(taskData, deleteTask = false)
    {
      console.info({ taskData });
      this.$addOrUpdateTask(taskData, deleteTask).then(() =>
      {
        setTimeout(() =>
        {
          this.refreshTask(taskData);
          this.filterTasks();
        }, 100);
      });
    },
    createTask()
    {
      this.$log('createTask', this.newTask.message);
      const newId = uuidv4();

      try
      {
        if(this.newTask.message)
        {
          const newTask = this.applyFiltersToTask({
            id: newId,
            message: this.newTask.message,
            created: Date.now()
          });

          this.tasksList.push(newTask);

          this.updateTaskInDb(newTask);
        }

        this.newTask = { message: null };

        this.loadTasks();
      }
      catch(e)
      {
        this.$log('error', e);
        console.error(e);
      }
    },
    /** updateTaskInDb with delete: false */
    updateTask(task)
    {
      this.updateTaskInDb(task);
    },
    /** updateTaskInDb with delete: true */
    removeTask(id)
    {
      this.updateTaskInDb({ id }, true);
    },
    refreshTask(task)
    {
      console.info('refresh:', task, task.active);
      this.taskRenderIndex[task.id] = `render-${task.id}-${Date.now()}`;
    },
    refreshAll()
    {
      this.taskListRenderIndex += 1;
    },
    /** updateTaskInDb with new alert added */
    createAlert(alert)
    {
      if(!alert || !alert.id || !alert.date)
      {
        console.warn('Not enough data for alert!', alert);

        return;
      }

      const task = this.addAlertToTask(
          this.getTask(alert.id),
          alert
      );

      this.updateTaskInDb(task);
    },
    /****** Helpers */
    /** @returns task with alert */
    addAlertToTask(task, alert)
    {
      if(!task)
      {
        console.warn('Task not found!', alert);

        return;
      }

      if(!task.alerts)
      {
        task.alerts = [];
      }

      if(alert.id)
      {
        delete alert.id;
      }

      task.alerts.push(alert);

      return task;
    },
    /** @returns task with current filters merged in */
    applyFiltersToTask(task)
    {
      if(!this.applyFilters || !Object.keys(this.filters || {}).length)
      {
        return task;
      }

      const now = Date.now();

      if(!task.tags)
      {
        task.tags = [];
      }

      if(this.filters.tags && this.filters.tags.length)
      {
        task.tags = [...task.tags, ...this.filters.tags];
      }

      if(this.filters.keyword)
      {
        task.tags = [...task.tags, this.filters.keyword];
      }

      ['active', 'archived'].forEach((bool) =>
      {
        if(typeof this.filters[bool] === 'boolean')
        {
          task[bool] = this.filters[bool];
        }
      });

      ['done'].forEach((num) =>
      {
        if(typeof this.filters[num] === 'boolean')
        {
          if(this.filters[num])
          {
            task[num] = now;
          }
          else
          {
            task[num] = 0;
          }
        }
      });

      return task;
    },
    setFilter(type, value)
    {
      this.filters[type] = value;
      this.filterTasks();
    }
  }
};
</script>

<style>
body {
  background: #eee;
}

.full-height {
  min-height: 92vh;
  max-height: 92vh;
  max-width: 50%;
  overflow-y: scroll;
}

pre {
  white-space: pre-wrap;
}

.markdown-attention {
  color: #f00;
  background: #ff0;
  padding: 0 4px;
  border-radius: 4px;
}

#selectionMenu {
  display: none;
  position: absolute;
  left: -10000px;
  top: -10000px;
  background: white;
  border-radius: 6px;
  border: 1px solid #aaa;
  overflow-y: scroll;
  max-height: 20em;
}

h1, h2, h3, h4, h5, h6 { line-height: 1em; }
h1 { font-size: 2em; }
h2 { font-size: 1.8em; }
h3 { font-size: 1.6em; }
h4 { font-size: 1.4em; }
h5 { font-size: 1.2em; }
h6 { font-size: 1em; }
</style>
