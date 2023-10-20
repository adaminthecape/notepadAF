<template>
  <div class="q-ma-sm q-pa-sm standout-0 rounded">
    <!-- Top bar: -->
    <div class="row items-center justify-center full-width q-mb-xs">
      <q-btn
        v-if="flowTaskId"
        icon="close"
        dense
        @click="selectTask({ id: null })"
      />
      <q-space />
      <AppTabSelector />
    </div>
    <!-- Content: -->
    <q-card
      :class="cardClasses"
      class="content-container"
      flat
    >
      <!-- Icon: -->
      <div
        class="row items-center justify-center q-mt-md q-mb-sm"
      >
        <q-icon name="task_alt" size="xl" color="green-9" />
      </div>
      <!-- Intro: -->
      <div
        class="row items-center justify-center"
      >
        <span v-if="selectedTask">You are currently working on:</span>
        <span v-else>Find a task to work on:</span>
      </div>
      <!-- Selected task message: -->
      <div v-if="!selectedTask">
      </div>
      <!-- Selected task tags: -->
      <q-card
        v-if="selectedTask"
        :class="cardClasses"
        class="q-pa-md q-my-sm standout-1 rounded"
      >
        <div style="white-space: pre-wrap">
          {{ selectedTask?.message }}
        </div>
        <q-separator class="q-my-sm" />
        <TaskTagsList
          :task-id="flowTaskId"
          size="sm"
        >
          <template #activator>
            <q-btn
              icon="sell"
              size="sm"
              color="info"
              disable
              dense
              flat
            />
          </template>
        </TaskTagsList>
        <!-- Task options: -->
        <div
          v-if="selectedTask"
          class="row items-center justify-center standout-2 rounded q-mt-sm"
        >
          <TaskOptions
            :task-id="flowTaskId"
            show-edit-button
            show-active-button
            show-alert-button
            show-delete-button
            show-done-button
            show-archive-button
            show-subtask-button
            hide-menu-button
            show
            add-new
            flat
            dense
          >
            <template #left>
              <TaskTagsList
                :task-id="flowTaskId"
                manage-only
                size="sm"
              >
                <template #activator="{ open }">
                  <q-btn
                    icon="sell"
                    size="md"
                    dense
                    flat
                    @click="open"
                  ><q-tooltip>Manage tags</q-tooltip></q-btn>
                </template>
              </TaskTagsList>
            </template>
          </TaskOptions>
        </div>
      </q-card>
      <!-- Find a task: -->
      <q-card
        v-if="!selectedTask"
        :class="cardClasses"
        class="q-my-sm rounded standout-1"
      >
        <KeywordSearch
          :value="filters.keyword"
          @input="filters.keyword = $event"
        />
        <div class="row items-center q-mt-sm">
          <BoolToggleGroup
            :filters="filters"
            @input="filters = { ...filters, ...$event }"
          />
          <q-space />
          <div class="pagination-container flex flex-center">
            <q-pagination
              :disable="!pagination.max"
              v-model="resultPage"
              :max="pagination.max"
              :boundary-links="false"
              color="grey"
              active-color="primary"
              direction-links
              input
            />
          </div>
        </div>
      </q-card>
      <!-- Search results: -->
      <q-card v-if="!selectedTask" :class="cardClasses" flat>
        <div v-if="!results?.length" class="q-pa-sm text-center full-width">
          <h5 class="q-ma-none q-mb-md">
            Recent tasks
          </h5>
          <DisplayTask
            v-for="task in recentTasks"
            :key="`display-task-${task.id}`"
            :task-id="task.id"
            @click="selectTask(task)"
          />
        </div>
        <DisplayTask
          v-for="task in resultsOnPage"
          :key="`display-task-${task.id}`"
          :task-id="task.id"
          @click="selectTask(task)"
        />
      </q-card>
      <!-- activity/current/next panels: -->
      <div
        v-if="selectedTask"
        class="q-my-sm standout-0"
      >
        <div
          v-if="!availableTabs.length"
          class="full-width q-ma-sm"
        >
          <div class="q-my-sm q-pa-sm">
            <q-item
              clickable
              class="standout-2 rounded justify-center text-center"
              style="width: 50%; height: 150px; margin: 0 auto; display: flex; flex-direction: column"
            >
              <div style="margin: 0 auto;">
                <q-icon name="add" size="xl" />
              </div>
              <div>No activity yet. Click above to get started.</div>
            </q-item>
          </div>
        </div>
        <q-tabs
          v-model="currentTab"
          class="standout-1 rounded full-width"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          dense
          dark
          no-caps
        >
          <q-tab
            v-for="tab in availableTabs"
            :key="`tab-${tab.name}`"
            :name="tab.name"
            :label="tab.label"
          />
        </q-tabs>
        <!-- Activity history tab: -->
        <div
          v-if="currentTab === 'activity'"
          class="full-width"
          style="height: 57vh"
        >
          <div class="full-width scroll-container q-mt-sm">
            <TaskActivityLog
              :task-id="flowTaskId"
            />
          </div>
        </div>
        <!-- Current activity tab: -->
        <div
          v-if="currentTab === 'current'"
          class="full-width"
          style="height: 57vh"
        >
          <div
            v-if="activeSubtask"
            class="full-width q-ma-sm"
          >
            <div class="q-my-sm q-pa-sm">
              <q-input
                v-model="activeSubtaskMutations.note"
                placeholder="Describe your activity..."
                filled
                dense
              >
                <template #append>
                  <q-btn
                    icon="save"
                    dense
                    flat
                    @click="updateSubtask"
                  />
                </template>
              </q-input>
            </div>
            <div class="row full-width">
              <q-space />
              <q-btn-group class="q-mr-sm">
                <q-btn no-caps>
                  <span>Started {{ timeSince(activeSubtask?.start) }}</span>
                </q-btn>
                <TaskActiveButton
                  :task-id="flowTaskId"
                  size="md"
                  flat
                  mode="save"
                />
                <q-btn
                  icon="delete"
                  color="negative"
                  no-caps
                  flat
                />
              </q-btn-group>
            </div>
            <div class="row full-width q-pa-sm q-ma-sm">
              <q-input
                v-model="activeSubtaskMutations.details"
                type="textarea"
                class="full-width"
                placeholder="Add notes for this activity..."
                filled
              />
            </div>
            <div class="row full-width q-pr-md">
              <q-space />
              <q-btn-group>
                <q-btn
                  icon="alarm"
                  dense
                  flat
                  @click="addTimestampAtEnd()"
                ><q-tooltip>Insert timestamp</q-tooltip></q-btn>
                <q-btn
                  icon="save"
                  :color="activeSubtaskMutations.details === activeSubtask.details ? 'green-9' : 'warning'"
                  dense
                  flat
                  @click="updateSubtask"
                />
              </q-btn-group>
            </div>
          </div>
        </div>
        <!-- Next up tab: -->
        <div
          v-if="currentTab === 'next'"
          class="full-width"
          style="height: 57vh"
        >
          <div class="full-width q-ma-sm">
            <div class="full-width scroll-container">
              <TaskSubtaskList
                :task-id="flowTaskId"
              />
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import AppTabSelector from 'src/components/AppTabSelector.vue';
import useTaskStore from 'src/pinia/taskStore';
import {
  filterTaskList,
  getFromLocalStorage,
  LocalStorageName,
  saveToLocalStorage,
  timeSince, updateActiveActivity
} from 'src/utils';
import { Task, TaskFilters } from 'src/types';
import DisplayTask from 'src/components/DisplayTask.vue';
import KeywordSearch from 'src/components/TaskFilters/KeywordSearch.vue';
import BoolToggleGroup from 'src/components/TaskFilters/BoolToggleGroup.vue';
import TaskOptions from 'src/components/TaskOptions.vue';
import TaskTagsList from 'src/components/TaskFilters/TaskTagsList.vue';
import TaskActivityLog from 'src/components/TaskActivityLog.vue';
import TaskSubtaskList from 'src/components/TaskSubtaskList.vue';
import TaskActiveButton from 'src/components/TaskActiveButton.vue';

const app: {
  activeTabs: () => Record<string, boolean>;
  openTab: (tab: string) => void;
} | undefined = inject('helpers');

const cardClasses = ref<string[]>(['full-width', 'q-pa-sm', 'q-mb-sm']);

// STORE
const taskStore = useTaskStore();
const allTasks = computed<Task[]>(() => Object.values(taskStore.getTasksInSelectedBuckets()));

// FILTER MODELS
const filters = ref<Partial<TaskFilters>>({
  keyword: '',
  // tags?: Task['tags'];
  // id?: string;
  // keyword?: string;
  // archived?: boolean;
});

// RESULTS
const results = computed(() => {
  if(!filters.value.keyword)
  {
    return [];
  }

  return (Object.keys(filters.value || {}).length
    ? filterTaskList(allTasks.value, filters.value as Partial<TaskFilters>)
    : allTasks.value) || [];
});

const resultsOnPage = computed(() => {
  return results.value.slice(
    (pagination.value.page - 1) * resultsPerPage.value,
    (pagination.value.page) * resultsPerPage.value
  );
});

const recentTasks = computed(() => {
  return [...allTasks.value]
    .sort((a, b) => b.updated - a.updated)
    .slice(0, 5);
});

// SELECT
const flowTaskId = ref<string>(getFromLocalStorage(LocalStorageName.flowTask));
const selectedTask = computed(() => taskStore.getTask(flowTaskId.value));

function selectTask(task: Task) {
  flowTaskId.value = task.id;
  saveToLocalStorage(LocalStorageName.flowTask, task.id);
}

// PAGINATION
const resultPage = ref(1);
const resultsPerPage = ref(5);
const pagination = computed(() => ({
  page: resultPage.value,
  max: results.value.length / resultsPerPage.value
}));

const activeSubtask = computed(() => {
  return selectedTask.value?.activity?.find((log) => {
    return log?.start && !log?.end;
  });
});
const activeSubtaskMutations = ref<Partial<TaskActivityLog>>({
  note: activeSubtask.value?.note || ''
});
function updateSubtask(additionalMutations: Record<string, any>) {
  console.log('updateSubtask:', additionalMutations, activeSubtaskMutations.value);
  updateActiveActivity(
    flowTaskId.value,
    {
      ...(additionalMutations || {}),
      ...activeSubtaskMutations.value
    }
  );
}
watch(activeSubtask, (n: TaskActivityLog) => {
  activeSubtaskMutations.value = { ...n };
});

const currentTab = ref<string>('current');
const availableTabs = computed(() => {
  if(!selectedTask.value)
  {
    return [];
  }

  const tabs = [];

  if(selectedTask.value.activity?.length)
  {
    tabs.push({
      name: 'activity',
      label: 'History'
    });
  }

  if(selectedTask.value.activity?.length)
  {
    tabs.push({
      name: 'current',
      label: 'Current'
    });
  }

  if(selectedTask.value.next?.length)
  {
    tabs.push({
      name: 'next',
      label: 'Next up'
    });
  }

  return tabs;
});

function addTimestampAtEnd() {
  activeSubtaskMutations.value.details += `\n${new Date().toDateString()} ${new Date().toTimeString().split(' ')[0]}: `;
}
</script>

<style scoped>
.results-container {

}

.bordered {
  border: 1px solid #666;
  border-radius: 6px !important;
}

.elevated-light {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.elevated-dark {
  box-shadow: 0 1px 5px rgba(255, 255, 255, 0.2), 0 2px 2px rgba(255, 255, 255, 0.14), 0 3px 1px -2px rgba(255, 255, 255, 0.12);
}

.scroll-container {
  height: 100%;
  overflow-y: scroll;
}

.content-container {
  height: 91vh;
  overflow: hidden;
  overflow-y: hidden;
}

.q-card > div:last-child {
  border-bottom: 1px;
}

.standout-0 { background-color: #70809007; }
.standout-1 { background-color: #70809020; }
.standout-2 { background-color: #70809040; }

.rounded {
  border-radius: 6px !important;
}
</style>
