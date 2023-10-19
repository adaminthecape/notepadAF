<template>
  <div>
    <div class="q-ma-sm q-pa-sm bordered" v-if="['x'].length">
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
      <q-card
        :class="cardClasses"
        style="height: 92vh; overflow: hidden; overflow-y: hidden;"
        flat
      >
        <div
          class="row items-center justify-center q-my-md"
        >
          <q-icon name="task_alt" size="xl" color="green-9" />
        </div>
        <div
          class="row items-center justify-center"
        >
          <span v-if="selectedTask">You are currently working on:</span>
          <span v-else>Find a task to work on:</span>
        </div>
        <div v-if="!selectedTask">
        </div>
        <q-card
          v-if="selectedTask"
          :class="cardClasses"
          class="q-pa-md q-my-sm bordered"
        >
          <div>
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
        </q-card>
        <q-card
          v-if="!selectedTask"
          :class="cardClasses"
          class="q-pa-md q-my-sm bordered"
        >
          <q-card v-if="!flowTaskId" :class="cardClasses" flat>
            <KeywordSearch
              :value="filters.keyword"
              @input="filters.keyword = $event"
            />
            <div class="row items-center q-mt-sm">
              <BoolToggleGroup
                :filters="filters"
                @input="filters = { ...filters, ...$event }"
              />
              <div class="pagination-container flex flex-center">
                <q-pagination
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
        </q-card>
        <q-card v-if="!selectedTask" :class="cardClasses" flat>
          <q-card v-if="!results?.length" class="q-pa-sm text-center">
            No results
          </q-card>
          <DisplayTask
            v-for="task in resultsOnPage"
            :key="`display-task-${task.id}`"
            :task-id="task.id"
            @click="selectTask(task)"
          />
        </q-card>
        <div
          v-if="selectedTask"
          class="row items-center justify-center q-my-sm"
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
            class="q-my-sm"
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
        <div
          v-if="selectedTask"
          class="row items-center justify-center q-my-sm bordered q-pa-sm"
        >
          <q-btn-group>
            <q-btn
              label="Activity"
              :color="viewingActivity ? 'secondary' : undefined"
              @click="viewingActivity = !viewingActivity"
            />
            <q-btn
              label="Next"
              :color="viewingNext ? 'secondary' : undefined"
              @click="viewingNext = !viewingNext"
            />
          </q-btn-group>
        </div>
        <div
          v-if="selectedTask"
          class="row items-center justify-center q-my-sm"
        >
          <q-card
            v-if="viewingActivity"
            class="full-width elevated-dark"
          >
            <div class="full-width q-ma-sm">
              <h5
                class="q-my-sm q-ml-sm q-pa-xs"
                style="border-bottom: 1px solid #666"
              >Activity</h5>
              <q-scroll-area
                style="min-height: 4vh; max-height: 20vh"
                class="full-width"
              >
                <TaskActivityLog
                  :task-id="flowTaskId"
                />
              </q-scroll-area>
            </div>
          </q-card>
        </div>
        <div
          v-if="selectedTask && viewingNext"
          class="row items-center justify-center q-my-sm"
        >
          <q-card
            class="full-width elevated-dark"
          >
            <div class="full-width q-ma-sm">
              <h5
                class="q-my-sm q-ml-sm q-pa-xs"
                style="border-bottom: 1px solid #666"
              >Next</h5>
              <q-scroll-area
                style="min-height: 4vh; max-height: 20vh"
                class="full-width"
              >
                <TaskSubtaskList
                  :task-id="flowTaskId"
                />
              </q-scroll-area>
            </div>
          </q-card>
        </div>
        <div
          v-if="selectedTask && activeSubtask"
          class="row items-center justify-center q-my-sm"
        >
          <q-card
            class="full-width elevated-dark"
          >
            <div class="full-width q-ma-sm">
              <h5
                class="q-my-sm q-ml-sm q-pa-xs"
                style="border-bottom: 1px solid #666"
              >Active subtask</h5>
              <q-card :class="cardClasses">
                <span>{{ activeSubtask.note }}</span>
              </q-card>
              <div class="row full-width">
                <q-space />
                <q-btn-group>
                  <q-btn
                    no-caps
                  >
                <span>Started {{
                    timeSince(activeSubtask.start)
                  }}</span>
                  </q-btn>
                  <q-btn
                    icon="done"
                    color="warning"
                    label="Finish"
                    no-caps
                  />
                  <q-btn
                    icon="edit"
                    color="secondary"
                    label="Edit"
                    no-caps
                  />
                  <q-btn
                    icon="delete"
                    color="negative"
                    label="Delete"
                    no-caps
                  />
                </q-btn-group>
              </div>
            </div>
          </q-card>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import AppTabSelector from 'src/components/AppTabSelector.vue';
import useTaskStore from 'src/pinia/taskStore';
import {
  filterTaskList,
  getFromLocalStorage,
  LocalStorageName,
  saveToLocalStorage,
  timeSince
} from 'src/utils';
import { Task, TaskFilters } from 'src/types';
import DisplayTask from 'src/components/DisplayTask.vue';
import KeywordSearch from 'src/components/TaskFilters/KeywordSearch.vue';
import BoolToggleGroup from 'src/components/TaskFilters/BoolToggleGroup.vue';
import TaskOptions from 'src/components/TaskOptions.vue';
import TaskTagsList from 'src/components/TaskFilters/TaskTagsList.vue';
import TaskActivityLog from 'src/components/TaskActivityLog.vue';
import TaskSubtaskList from 'src/components/TaskSubtaskList.vue';

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

const viewingActivity = ref(false);
const viewingNext = ref(false);

const activeSubtask = computed(() => {
  return selectedTask.value?.activity?.find((log) => {
    return log?.start && !log?.end;
  });
});
</script>

<style scoped>
.results-container {

}

.bordered {
  border: 1px dashed #666;
  border-radius: 6px !important;
}

.elevated-light {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.elevated-dark {
  box-shadow: 0 1px 5px rgba(255, 255, 255, 0.2), 0 2px 2px rgba(255, 255, 255, 0.14), 0 3px 1px -2px rgba(255, 255, 255, 0.12);
}
</style>
