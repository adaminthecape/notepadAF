<template>
  <SimpleLayout header :page-classes="['q-px-sm', 'q-pt-sm']">
    <template #header-title>
      <div class="row items-center" style="font-size: 0.8em">
        <q-btn
          class="q-mr-sm"
          dense
          flat
        >
          <q-icon v-if="!isCloudLoading" name="cloud_sync" />
          <q-spinner v-if="isCloudLoading" size="sm" />
          <q-tooltip v-if="isCloudLoading">Loading from cloud</q-tooltip>
        </q-btn>
        <span v-if="!tasksList || !filteredTasksList">No tasks to show</span>
        <span v-else-if="filteredTasksList.length === tasksList.length">All tasks</span>
        <span v-else>{{ filteredTasksList.length }} / {{ tasksList.length }}{{ $q.screen.lt.sm ? '' : ' tasks' }}</span>
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
      <q-dialog v-model="isFirebaseConfigDialogOpen" persistent>
        <q-card>
          <q-item>
            <q-item-section>
              Firebase config is required!
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-btn @click="$openTab('settings')">Go to Settings</q-btn>
            </q-item-section>
          </q-item>
        </q-card>
      </q-dialog>
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
        <div class="row items-center q-mb-xs">
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
          <q-space />
          <q-pagination
              v-model="pagination.page"
              :max="paginationComputed.max"
              color="grey"
              active-color="primary"
              direction-links
              input
          />
        </div>
      </div>
      <q-separator class="q-mb-sm" />
      <!-- TASK LIST: -->
      <div
          class="task-list"
          :key="`taskList-${taskListRenderIndex}`"
      >
        <div
            v-for="task in limitedTasks"
            :key="task.id"
        >
          <DisplayTask
              :key="taskRenderIndex[task.id]"
              noteId="tasks"
              :taskId="task.id"
              class="full-width"
              editable
              @refreshTask="refreshTask"
              @filterByTag="addTagToFilters"
          />
        </div>
      </div>
      <!--<q-space />-->
      <!--<div class="pagination-container flex flex-center">-->
      <!--  <q-pagination-->
      <!--      v-model="pagination.page"-->
      <!--      :max="paginationComputed.max"-->
      <!--      color="grey"-->
      <!--      active-color="primary"-->
      <!--      direction-links-->
      <!--      input-->
      <!--  />-->
      <!--</div>-->
    </template>
  </SimpleLayout>
</template>

<script>
import DisplayTask from './DisplayTask';
import SimpleLayout from './SimpleLayout';
import TaskTagSelector from './TaskTagSelector';
import TaskSortDropdown from './TaskSortDropdown';
import {
  cudTaskViaStore,
  filterTaskList,
  getAllTasksFromStore,
  getFromLocalStorage,
  saveToLocalStorage
} from "src/utils";

export default {
  name: 'Tasks',
  components: {
    DisplayTask,
    TaskTagSelector,
    TaskSortDropdown,
    SimpleLayout
  },
  data()
  {
    return {
      limit: getFromLocalStorage('taskLimit') || 5,
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
      inverseSort: false,
      refreshCheckInterval: null,
      isLoggingIn: false,
      isSignedIn: false,
      isFirebaseConfigDialogOpen: false,
      pagination: {
        page: 1,
        max: 5
      },
      tmpInterval: undefined
    };
  },
  inject: ['$openTab'],
  computed: {
    limitedTasks()
    {
      const page = (this.pagination.page - 1);
      const offset = this.limit * page;

      return this.filteredTasksList.slice(offset, (this.limit || 20) + offset);
    },
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
      return getAllTasksFromStore(this.$store) || [];
    },
    isCloudLoading()
    {
      return this.$store.getters['notes/isCloudLoading'];
    },
    paginationComputed()
    {
      return {
        max: this.filteredTasksList.length / this.limit
      };
    }
  },
  created()
  {
    if(!getFromLocalStorage('firebase_config', true))
    {
      this.isFirebaseConfigDialogOpen = true;
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

    if(this.refreshCheckInterval)
    {
      clearInterval(this.refreshCheckInterval);
    }

    this.refreshCheckInterval = setInterval(() =>
    {
      const queue = getFromLocalStorage('taskRefreshQueue');

      if(Array.isArray(queue) && queue.length)
      {
        queue.forEach((id) =>
        {
          this.refreshTask({ id });
        });

        console.info('cleared queue');

        saveToLocalStorage('taskRefreshQueue', []);
      }
    }, 250);
  },
  methods: {
    /****** Loading/fetching tasks */
    async loadTasks()
    {
      // this.tasksLoaded = true;
      // await this.$store.dispatch('notes/loadAllFromJson');
      this.$store.dispatch('notes/watchCloudDb');

      this.tmpInterval = setInterval(() =>
      {
        if(!this.isCloudLoading && this.tasksList && this.tasksList.length)
        {
          this.filterTasks();
          clearInterval(this.tmpInterval);
        }
      }, 100);
    },

    /****** Filtering tasks */
    clearFilters()
    {
      this.filters = {};
      this.filterTasks();
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
    createTask()
    {
      try
      {
        if(this.newTask.message)
        {
          const t = {
            message: this.newTask.message,
            created: Date.now()
          };

          const newTask = this.applyFilters ? this.applyFiltersToTask(t, this.filters) : t;

          cudTaskViaStore(this.$store, newTask).then(() =>
          {
            this.newTask = { message: null };
            this.loadTasks().then(() =>
            {
              this.refreshAll();
            });
          });
        }
      }
      catch(e)
      {
        console.error(e);
      }
    },

    /****** Reactivity helpers */
    refreshTask(task)
    {
      this.taskRenderIndex[task.id] = `render-${task.id}-${Date.now()}`;
    },
    refreshAll()
    {
      this.taskListRenderIndex += 1;
    },

    /****** Helpers */
    /** @returns task with current filters merged in */
    applyFiltersToTask(task, filters)
    {
      if(!Object.keys(filters || {}).length)
      {
        return task;
      }

      const now = Date.now();

      if(!task.tags)
      {
        task.tags = [];
      }

      if(filters.tags && filters.tags.length)
      {
        task.tags = [...task.tags, ...filters.tags];
      }

      if(filters.keyword)
      {
        task.tags = [...task.tags, filters.keyword];
      }

      ['active', 'archived'].forEach((bool) =>
      {
        if(typeof filters[bool] === 'boolean')
        {
          task[bool] = filters[bool];
        }
      });

      ['done'].forEach((num) =>
      {
        if(typeof filters[num] === 'boolean')
        {
          if(filters[num])
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

<style scoped>
.pagination-container {
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.task-list {
  max-height: calc(100vh - 260px);
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
