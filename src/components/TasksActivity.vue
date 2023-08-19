<template>
  <SimpleLayout id="tasks_list" header :page-classes="['q-px-sm', 'q-pt-sm']">
    <template #header-title>
      <div class="row items-center" style="font-size: 0.8em">
        <q-btn class="q-mr-sm" dense flat>
          <q-icon v-if="!isCloudLoading" name="cloud_sync" />
          <q-spinner v-if="isCloudLoading" size="sm" />
          <q-tooltip v-if="isCloudLoading">Loading from cloud</q-tooltip>
        </q-btn>
        <span v-if="!tasksList || !filteredTasksList">No tasks to show</span>
        <span v-else-if="filteredTasksList.length === Object.keys(tasksList).length">All tasks</span>
        <span v-else>{{ filteredTasksList.length }} / {{ Object.keys(tasksList).length
        }}</span>
        <q-space />
        <q-btn icon="tune" size="sm" dense round flat @click="clearFilters">
          <q-tooltip>Clear filters</q-tooltip>
        </q-btn>
        <TaskSortDropdown :sort-type="sortType" :inverse-sort="inverseSort" @set-sort-type="setSortType($event)" />
        <q-btn
class="q-ml-xs" :icon="applyFilters ? 'lock' : 'lock_open'" size="sm" dense flat dark
          @click="applyFilters = !applyFilters">
          <q-tooltip>Apply filters to new task</q-tooltip>
        </q-btn>
      </div>
    </template>
    <template #page-content>
      <q-dialog v-model="isFirebaseConfigDialogOpen" persistent>
        <q-card>
          <q-item>
            <q-item-section> Firebase config is required! </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-btn @click="goToSettings">Go to Settings</q-btn>
                <FirebaseConfigModal />
            </q-item-section>
          </q-item>
        </q-card>
      </q-dialog>
      <!-- NEW TASK / FILTERS: -->
      <div style="display: flex; flex-direction: column">
        <q-input
ref="newTaskInput" v-model="newTask.message" placeholder="Add a task" class="full-width q-mb-xs" filled
          dense style="background: #ffff0020">
          <template #append>
            <q-btn icon="add_task" dense flat @click="createTask()" />
          </template>
        </q-input>
        <div class="row items-center q-mb-xs">
          <q-input
v-model="filters.keyword" placeholder="Filter by keyword" class="q-mr-xs"
            style="flex-grow: 1; max-width: 40%" debounce="250" filled dense debounce-input="500"
            @input="setFilter('keyword', filters.keyword)">
            <template #append>
              <q-btn
v-if="filters.keyword" icon="close" round dense flat size="xs"
                @click.stop.prevent="setFilter(filterTypes.keyword, undefined)" />
            </template>
          </q-input>
          <TaskTagSelector
              :input-value="filters.tags || []"
              label="Filter by tags"
              style="flex-grow: 1; max-width: 60%"
              multiple
              @input="setFilter(filterTypes.tags, $event)"
              @cancel="setFilter(filterTypes.tags, [])"
          />
          <LocalStorageList
              :value="categoriesMutable"
              title="Categories"
              list-key="taskCategories"
              @updated="filterTasks"
              @input="categoriesMutable = $event"
          />
        </div>
        <div class="row items-center q-mb-xs">
          <q-btn-group class="row items-center q-mb-xs" flat>
            <q-btn
              :icon="filters.done ? 'check_circle' : 'check_circle_outline'"
              :color="getFilterBoolColor('done')"
              no-caps
              dense
              flat
              @click="toggleFilterBool('done')"
            />
            <q-btn
              :icon="filters.active ? 'assignment_ind' : 'content_paste_go'"
              :color="getFilterBoolColor('active')"
              no-caps
              dense
              flat
              @click="toggleFilterBool('active')"
            />
            <q-btn
              :icon="filters.archived ? 'unarchive' : 'move_to_inbox'"
              :color="getFilterBoolColor('archived')"
              no-caps
              dense
              flat
              @click="toggleFilterBool('archived')"
            />
          </q-btn-group>
          <q-space />
          <q-pagination
v-model="pagination.page" :max="paginationComputed.max" color="grey" active-color="primary"
            direction-links input />
        </div>
      </div>
      <q-separator class="q-mb-sm" />
      <!-- TASK LIST: -->
      <div class="task-list" :key="`taskList-${taskListRenderIndex}`">
        <div v-for="task in limitedTasks" :key="task.id">
          <DisplayTask
v-if="task" :key="taskRenderIndex[task.id]" note-id="tasks" :task-id="task.id" class="full-width"
show-options
            editable @refresh-task="refreshTask" @filter-by-tag="addTagToFilters" />
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

<script setup lang="ts">
import {
  applyFiltersToTask,
  filterTaskList,
  getFromLocalStorage,
  localStorageIntervalCheck,
  localStorageNames,
  saveToLocalStorage,
  saveToLocalStorageArray,
  sortTaskList
} from 'src/utils';
import { FilterType, FilterTypes, Task } from 'src/types';
import useTaskStore, { TaskBucket } from 'src/pinia/taskStore';
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';


const DisplayTask = defineAsyncComponent(() =>
  import('src/components/DisplayTask.vue'));
const TaskTagSelector = defineAsyncComponent(() =>
  import('src/components/TaskTagSelector.vue'));
const TaskSortDropdown = defineAsyncComponent(() =>
  import('src/components/TaskSortDropdown.vue'));
const SimpleLayout = defineAsyncComponent(() =>
  import('src/components/SimpleLayout.vue'));
const LocalStorageList = defineAsyncComponent(() =>
  import('src/components/LocalStorageList.vue'));
const FirebaseConfigModal = defineAsyncComponent(() =>
  import('src/components/FirebaseConfigModal.vue'));

// prompt going to firebase settings if there is no config
const isFirebaseConfigDialogOpen = ref(!getFromLocalStorage(localStorageNames.firebase_config, true));

const defaults = {
  pagination: {
    page: 1,
    max: 5,
  },
  limit: 5,
  newTask: {
    title: '',
    message: ''
  },
};

const filterTypes = ref({ ...FilterTypes });

const filters = ref<Partial<Record<FilterTypes, any>>>({});
const newTask = ref<Partial<Task>>(defaults.newTask);
const taskRenderIndex = ref<Record<string, string>>({});
const taskListRenderIndex = ref(0);
const sortType = ref();
const inverseSort = ref(false);
const refreshCheckInterval = ref();
const categoriesMutable = ref<TaskBucket[]>([]);

const store = useTaskStore();

const categories = computed(() => {
  return store.getCategories;
})

const pagination = ref(defaults.pagination);

const paginationComputed = computed(() => {
  return {
    max: (filteredTasksList.value || []).length / limit.value + 1,
  };
});

const limit = ref(getFromLocalStorage(localStorageNames.taskLimit) || defaults.limit);
const filteredTasksList = ref([]);
const limitedTasks = computed<Task[]>(() => {
  const page = pagination.value.page - 1;
  const offset = limit.value * page;

  return (filteredTasksList.value || []).slice(
    offset,
    (limit.value || 20) + offset
  );
})

// const toggleableBooleans = computed(() => {
//   return [
//     {
//       label: 'Done',
//       value: 'done',
//       icon_true: 'check_circle',
//       icon_false: 'check_circle_outline',
//     },
//     {
//       label: 'Active',
//       value: 'active',
//       icon_true: 'assignment_ind',
//       icon_false: 'content_paste_go',
//     },
//     {
//       label: 'Archived',
//       value: 'archived',
//       icon_true: 'unarchive',
//       icon_false: 'move_to_inbox',
//     },
//     // { label: 'Alarm', value: 'hasAlarm' },
//     // { label: 'Due', value: 'isDue' }
//   ];
// })

const tasksList = computed(() => {
  const catsToKeep = categories.value
    .filter((c) => c.active)
    .map((c) => c.title)
    .concat('other');
  let tasksToKeep = {};

  const allTasks = store.getTasksByBuckets(categories.value);

  Object.entries(allTasks).forEach(
    ([bucketName, tasksInBucket]) => {
      if (catsToKeep.includes(bucketName)) {
        tasksToKeep = { ...tasksToKeep, ...tasksInBucket };
      }
    }
  );

  return tasksToKeep;
})

const isCloudLoading = computed(() => {
  return store.isCloudLoading;
})

const lastCloudUpdate = computed(() => {
  return store.getLastCloudUpdate;
})

onMounted(() => {
  loadTasks();

  const storedFilters = getFromLocalStorage(
    localStorageNames.taskFilters,
    true
  );

  if (storedFilters) {
    sortType.value = storedFilters.sortType;
    inverseSort.value = storedFilters.inverseSort;
    filters.value = storedFilters;

    if (storedFilters.pagination) {
      pagination.value = {
        ...pagination.value,
        ...storedFilters.pagination,
      };
    }
  }

  if (refreshCheckInterval.value) {
    clearInterval(refreshCheckInterval.value);
  }

  refreshCheckInterval.value = localStorageIntervalCheck(
    'taskRefreshQueue',
    (queue: string[]) =>
      queue.forEach((id) => {
        refreshTask({ id });
      })
  );

  categoriesMutable.value = [...categories.value];

  filterTasks();
});


const tmpInterval = ref();

/****** Loading/fetching tasks */
async function loadTasks() {
  store.setCategoriesFromLocalStorage();
  store.watchCloudDb();

  tmpInterval.value = setInterval(() => {
    const check =
      lastCloudUpdate.value &&
      tasksList.value &&
      Object.keys(tasksList.value).length;

    if (check) {
      filterTasks();
      clearInterval(tmpInterval.value);
    }
  }, 100);
}

/** Actual filtering logic. Sorts after filtering. Saves filters to localStorage. */
function filterTasks() {
  saveFilters();

  filteredTasksList.value =
    filterAndSortTasksList(Object.values(tasksList.value)) || [];
}

function filterAndSortTasksList(list: Task[]) {
  return sortTaskList(
    filterTaskList(list, filters.value),
    sortType.value,
    inverseSort.value
  );
}

function setSortType(type: string) {
  if (type === sortType.value) {
    // invert it
    inverseSort.value = !inverseSort.value;
  } else {
    sortType.value = type;
  }

  filterTasks();
}

function refreshTask(task: Record<string, any>) {
  taskRenderIndex.value[task.id] = `render-${task.id}-${Date.now()}`;
}

function clearFilters() {
  filters.value = {};
  filterTasks();
}

/**
 * Add OR remove given tag to current filters & filter again.
 * @param tag - Tag to add or remove, if already in filters.
 */
function addTagToFilters(tag: string) {
  if (tag) {
    setFilter(
      FilterTypes.tags,
      (filters.value.tags || []).includes(tag)
        ? (filters.value.tags || []).filter((t: string) => t !== tag)
        : (filters.value.tags || []).concat(tag)
    );
  }
}

function setFilter(type: FilterType, value: any) {
  filters.value[type] = value;
  filterTasks();
}

function saveFilters() {
  saveToLocalStorage(localStorageNames.taskFilters, {
    ...filters.value,
    sortType: sortType.value,
    inverseSort: inverseSort.value,
    pagination: pagination.value,
  });
}

/****** Filtering tasks - booleans */
function getFilterBoolColor(prop: FilterType) {
  return (
    (filters.value[prop] === true && 'green-6') ||
    (filters.value[prop] === false && 'red-6') ||
    'grey-6'
  );
}

function toggleFilterBool(prop: keyof typeof FilterTypes) {
  if (filters.value[prop] === true) {
    filters.value[prop] = false;
  } else if (filters.value[prop] === false) {
    filters.value[prop] = null;
  } else {
    filters.value[prop] = true;
  }

  filterTasks();
}

const applyFilters = ref(true);

async function createTask() {
  store.cloudUpdateSingle(
    applyFilters.value ?
      applyFiltersToTask(newTask.value, filters.value) :
      newTask.value
  ).then(() => {
    newTask.value = { message: '' };
    filterTasks();
  });
}

function goToSettings() {
  saveToLocalStorageArray(
    localStorageNames.currentTabQueue,
    'settings'
  );

  console.log('goToSettings', getFromLocalStorage(localStorageNames.currentTabQueue));
}

watch(pagination, () => {
  saveFilters();
});
</script>

<style>
.full-height {
  min-height: 92vh;
  max-height: 92vh;
  max-width: 50%;
  overflow-y: scroll;
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
