\<template>
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
        <span v-else>{{ filteredTasksList.length }} / {{ Object.keys(tasksList).length }}</span>
        <q-space />
        <q-btn icon="tune" size="sm" dense flat @click="clearFilters">
          <q-tooltip>Clear filters</q-tooltip>
        </q-btn>
        <TaskSortDropdown
          :sort-type="sortType"
          :inverse-sort="inverseSort"
          @set-sort-type="setSortType($event)"
        />
        <AppTabSelector />
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
        <div class="row items-center q-mb-xs">
          <BoolToggleGroup
            :filters="filters"
            @input="filters = { ...filters, ...$event }; filterTasks()"
          >
            <template #left>
              <q-btn
                icon="list"
                color="primary"
                no-caps
                dense
                flat
                @click="changeDisplayType"
              ><q-tooltip>{{ displayType }}</q-tooltip></q-btn>
            </template>
          </BoolToggleGroup>
          <q-space />
          <!-- pagination: -->
          <div class="pagination-container flex flex-center">
            <q-pagination
                v-model="pagination.page"
                :max="paginationComputed.max"
                :boundary-links="false"
                color="grey"
                active-color="primary"
                direction-links
                input
            />
          </div>
          <q-space />
          <q-btn-group flat>
            <!-- keyword modal: -->
            <SimpleModal>
              <template #activator="{ open: openKeywordModal }">
                <q-btn
                  icon="search"
                  color="primary"
                  dense
                  flat
                  @click="openKeywordModal"
                ><q-tooltip>Search by keyword</q-tooltip></q-btn>
              </template>
              <template #content>
                <KeywordSearch
                  :value="filters.keyword"
                  @input="setFilter(FilterTypes.keyword, $event)"
                />
              </template>
            </SimpleModal>
            <AddTag
              multiple
              :selected-tags="filters.tags"
              @input="addTagToFilters"
              @remove="addTagToFilters"
            >
              <template #activator="{ open }">
                <q-btn
                  icon="sell"
                  color="secondary"
                  size="md"
                  dense
                  flat
                  @click="open"
                ><q-tooltip>Filter by tag</q-tooltip></q-btn>
              </template>
            </AddTag>
            <CategoryManager
                @updated="filterTasks"
            />
            <!-- add task modal: -->
            <SimpleModal>
              <template #activator="{ open: openKeywordModal }">
                <q-btn
                  icon="add_circle"
                  color="secondary"
                  dense
                  flat
                  @click="openKeywordModal"
                ><q-tooltip>Add task</q-tooltip></q-btn>
              </template>
              <template #content>
                <div class="row items-center">
                  <q-input
                    ref="newTaskInput"
                    v-model="newTask.message"
                    placeholder="Add a task"
                    class="full-width q-mb-xs"
                    filled
                    dense
                  >
                    <template #append>
                      <q-btn icon="add_task" dense flat @click="createTask()" />
                    </template>
                  </q-input>
                </div>
              </template>
              <template #actions>
                  <q-btn
                    class="q-ml-xs"
                    :icon="applyFilters ? 'lock' : 'lock_open'"
                    :size="transformSizeProp('sm')"
                    dense
                    flat
                    dark
                    @click="applyFilters = !applyFilters"
                  >
                    <q-tooltip>Apply filters to new task</q-tooltip>
                  </q-btn>
                </template>
            </SimpleModal>
            <q-space />
          </q-btn-group>
        </div>
        <!-- show active keyword/tags: -->
        <div class="row items-center" style="margin-top: -8px">
          <q-chip
            v-if="filters.keyword"
            color="info"
            clickable
            square
            dense
            dark
            @click="filters.keyword = ''; filterTasks()"
          >
            <q-icon name="search" />
            <span>{{ filters.keyword }}</span>
          </q-chip>
          <div v-if="filters.tags && filters.tags.length">
            <q-chip
              v-for="(selectedTag, st) in filters.tags"
              :key="`selected-tag-${st}`"
              color="info"
              class="q-mr-none"
              clickable
              square
              dense
              dark
              @click="addTagToFilters(selectedTag)"
            >
              <q-icon name="sell" class="q-mr-xs" />
              <span>{{ selectedTag }}</span>
            </q-chip>
          </div>
        </div>
      </div>
      <q-separator class="q-mb-sm" />
      <!-- TASK LIST: -->
      <div
        v-if="displayType === displayTypes.taskList"
        class="task-list"
        :key="`taskList-${taskListRenderIndex}`"
      >
        <div
          v-for="task in limitedTasks"
          :key="task.id"
        >
          <!-- :style="task.done ? 'margin-top: 8px' : ''" -->
          <DisplayTask
            v-if="task"
            :key="taskRenderIndex[task.id]"
            note-id="tasks"
            :task-id="task.id"
            class="full-width"
            show-options
            editable
            @refresh-task="refreshTask"
            @filter-by-tag="addTagToFilters"
          />
        </div>
      </div>
      <!-- SUBTASK LIST: -->
      <div
        v-if="displayType === displayTypes.subtaskList"
        class="task-list"
        :key="`taskList-${taskListRenderIndex}`"
      >
        <div
          v-for="task in limitedTasks"
          :key="task.id"
        >
          <!-- :style="task.done ? 'margin-top: 8px' : ''" -->
          <TaskSubtaskList
            v-if="task"
            :key="taskRenderIndex[task.id]"
            note-id="tasks"
            :task-id="task.id"
            class="full-width"
            show-options
            :add-new="false"
            editable @refresh-task="refreshTask" @filter-by-tag="addTagToFilters" />
        </div>
      </div>
    </template>
  </SimpleLayout>
</template>

<script setup lang="ts">
import {
  applyFiltersToTask,
  filterTaskList,
  getFromLocalStorage,
  LocalStorageName,
  saveToLocalStorage,
  saveToLocalStorageArray,
  sortTaskList,
  transformSizeProp,
  loopToNextInArray
} from '../utils';
import { FilterType, FilterTypes, Task } from 'src/types';
import useTaskStore from 'src/pinia/taskStore';
import { computed, onMounted, ref, watch } from 'vue';

import AppTabSelector from 'src/components/AppTabSelector.vue';
import SimpleLayout from 'src/components/SimpleLayout.vue';
import AddTag from 'src/components/AddTag.vue';
import DisplayTask from 'src/components/DisplayTask.vue';
import SimpleModal from 'src/components/SimpleModal.vue';
import TaskSortDropdown from 'src/components/TaskSortDropdown.vue';
import FirebaseConfigModal from 'src/components/FirebaseConfigModal.vue';
import TaskSubtaskList from './TaskSubtaskList.vue';
import KeywordSearch from 'src/components/TaskFilters/KeywordSearch.vue';
import BoolToggleGroup from 'src/components/TaskFilters/BoolToggleGroup.vue';
import CategoryManager from 'src/components/TaskFilters/CategoryManager.vue';

enum displayTypes {
  taskList = 'taskList',
  subtaskList = 'subtaskList'
};

const displayType = ref(displayTypes.taskList);

function changeDisplayType() {
  displayType.value = loopToNextInArray<string>(
    displayType.value,
    Object.keys(displayTypes)
  ) as displayTypes;
}

// prompt going to firebase settings if there is no config
const isFirebaseConfigDialogOpen = ref(
  !getFromLocalStorage(LocalStorageName.firebase_config, true)
);

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

const filters = ref<Partial<Record<FilterTypes, any>>>({
  done: false,
  active: false,
  archived: false,
  keyword: '',
  tags: []
});
const taskRenderIndex = ref<Record<string, string>>({});
const taskListRenderIndex = ref(0);
const sortType = ref();
const inverseSort = ref(false);

const store = useTaskStore();

const pagination = ref(defaults.pagination);

const paginationComputed = computed(() => {
  return {
    max: Math.floor((filteredTasksList.value || []).length / limit.value) + 1,
  };
});

const limit = ref(getFromLocalStorage(LocalStorageName.taskLimit) || defaults.limit);
const filteredTasksList = ref<Task[]>([]);
const limitedTasks = computed<Task[]>(() => {
  const page = pagination.value.page - 1;
  const offset = limit.value * page;

  return (filteredTasksList.value || []).slice(
    offset,
    (limit.value || 20) + offset
  );
});

const tasksList = computed(() => store.getTasksInSelectedBuckets());

const isCloudLoading = computed(() => {
  return store.isCloudLoading;
})

const lastCloudUpdate = computed(() => {
  return store.getLastCloudUpdate;
})

function loadFilters() {
  // get saved filters
  const storedFilters = getFromLocalStorage(
    LocalStorageName.taskFilters,
    true
  );

  // set filters from storage
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
}

// const refreshCheckInterval = ref();

onMounted(() => {
  loadFilters();
  loadTasks();
  filterTasks();
});

const tmpInterval = ref();

/****** Loading/fetching tasks */
async function loadTasks() {
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
    filterTaskList(list.filter((x) => !x.deleted), filters.value),
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

/** @deprecated */
function refreshTask(/* task: Record<string, any> */) {
  // taskRenderIndex.value[task.id] = `render-${task.id}-${Date.now()}`;
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

function setFilter(type: string, value: any) {
  console.log('setFilter:', type, value);
  switch (type) {
    case 'tags': filters.value.tags = value; break;
    case 'keyword': filters.value.keyword = value; break;
    case 'done': filters.value.done = value; break;
    case 'active': filters.value.active = value; break;
    case 'archived': filters.value.archived = value; break;
    default:
      break;
  }

  filterTasks();
}

function saveFilters() {
  saveToLocalStorage(LocalStorageName.taskFilters, {
    ...filters.value,
    sortType: sortType.value,
    inverseSort: inverseSort.value,
    pagination: pagination.value,
  });
}

const applyFilters = ref<boolean>(true);
const newTask = ref<Partial<Task>>(defaults.newTask);
async function createTask() {
  store.cloudUpdateSingle(
    applyFilters.value ?
      applyFiltersToTask(newTask.value as Task, filters.value) :
      newTask.value as Task
  ).then(() => {
    newTask.value = { message: '' };
    filterTasks();
  });
}

function goToSettings() {
  saveToLocalStorageArray(
    LocalStorageName.currentTabQueue,
    'settings'
  );
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
  max-height: calc(100vh - 200px);
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
