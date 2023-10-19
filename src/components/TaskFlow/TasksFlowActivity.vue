<template>
  <SimpleLayout :page-offset="120">
    <template #header-left>
      <q-btn
        v-if="flowTaskId"
        icon="close"
        dense
        @click="selectTask({ id: null })"
      />
    </template>
    <template #header-title></template>
    <template #header-right>
      <AppTabSelector />
    </template>
    <template #page-content>
      <div class="q-ma-sm">
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
        <q-card v-if="!flowTaskId" :class="cardClasses" flat>
          <div v-if="results" class="results-container">
            <q-card v-if="!results.length" class="q-pa-sm text-center">
              No results
            </q-card>
            <DisplayTask
              v-for="task in resultsOnPage"
              :key="`display-task-${task.id}`"
              :task-id="task.id"
              @click="selectTask(task)"
            />
          </div>
        </q-card>
        <q-card v-if="selectedTask" :class="cardClasses" flat>
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
          />
          <q-card
            class="q-pa-md q-my-sm"
            style="border: 1px dashed #666; border-radius: 6px; white-space: pre-wrap"
          >
            {{ selectedTask.message }}
          </q-card>
          <TaskTagsList
            :task-id="flowTaskId"
            size="md"
          >
            <template #activator="{ open }">
              <q-btn
                icon="sell"
                label="Manage tags"
                size="sm"
                color="info"
                no-caps
                dense
                @click="open"
              ><q-tooltip>Add tags</q-tooltip></q-btn>
            </template>
          </TaskTagsList>
          <q-card class="row full-width items-center justify-center">
            <q-btn no-caps>Start task</q-btn>
            <q-btn no-caps>Do something</q-btn>
          </q-card>
          <q-card
            class="full-width elevated-dark"
          >
            <div class="full-width q-ma-sm">
              <h5
                class="q-my-sm q-ml-sm q-pa-xs"
                style="border-bottom: 1px solid #666"
              >Activity</h5>
              <q-scroll-area
                style="height: 20vh"
                class="full-width"
              >
                <TaskActivityLog
                  :task-id="flowTaskId"
                />
              </q-scroll-area>
            </div>
          </q-card>
          <q-card
            v-if="selectedTask.active"
            class="row full-width items-center justify-center"
          >
            Hey
          </q-card>
        </q-card>
      </div>
    </template>
  </SimpleLayout>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import SimpleLayout from 'src/components/SimpleLayout.vue';
import AppTabSelector from 'src/components/AppTabSelector.vue';
import useTaskStore from 'src/pinia/taskStore';
import { filterTaskList, getFromLocalStorage, LocalStorageName, saveToLocalStorage } from 'src/utils';
import { Task, TaskFilters } from 'src/types';
import DisplayTask from 'src/components/DisplayTask.vue';
import KeywordSearch from 'src/components/TaskFilters/KeywordSearch.vue';
import BoolToggleGroup from 'src/components/TaskFilters/BoolToggleGroup.vue';
import TaskOptions from 'src/components/TaskOptions.vue';
import TaskTagsList from 'src/components/TaskFilters/TaskTagsList.vue';
import TaskActivityLog from 'src/components/TaskActivityLog.vue';

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
  done: false,
  active: false,
  // tags?: Task['tags'];
  // id?: string;
  // keyword?: string;
  // archived?: boolean;
});

// RESULTS
const results = computed(() => {
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
const resultsPerPage = ref(10);
const pagination = computed(() => ({
  page: resultPage.value,
  max: results.value.length / resultsPerPage.value
}));
</script>

<style scoped>
.results-container {

}

.bordered {
  border: 1px dashed #666;
  border-radius: 6px;
}

.elevated-light {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.elevated-dark {
  box-shadow: 0 1px 5px rgba(255, 255, 255, 0.2), 0 2px 2px rgba(255, 255, 255, 0.14), 0 3px 1px -2px rgba(255, 255, 255, 0.12);
}
</style>
