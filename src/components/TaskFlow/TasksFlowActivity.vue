<template>
  <div class="q-ma-sm q-pa-sm standout-0 rounded">
    <!-- Top bar: -->
    <div class="row items-center justify-center full-width q-mb-xs">
      <q-btn
        v-if="flowTaskId"
        icon="close"
        dense
        flat
        @click="selectTask({ id: null })"
      />
      <q-space />
      <GitCheckout target="184425511" />
      <AppTabSelector />
      <q-input v-model="testUrl" />
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
          class="row items-center justify-center standout-2 rounded q-mt-sm elevation-1"
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
        <div v-if="!selectedTask && filters.keyword" class="q-pa-sm text-center full-width">
          <h5 class="q-ma-none row items-center full-width justify-center">
            <q-icon name="search" class="q-mr-sm" color="primary" size="md" />
            <span>{{ results.length }} tasks found</span>
          </h5>
          <q-separator v-if="results.length" class="q-mb-md q-mt-sm" />
          <DisplayTask
            v-for="task in resultsOnPage"
            :key="`display-task-${task.id}`"
            :task-id="task.id"
            @click="selectTask(task)"
          />
        </div>
        <div v-if="!results?.length" class="q-pa-sm text-center full-width">
          <!-- loading indicator: -->
          <div
            v-if="!taskStore.getLastCloudUpdate"
            class="full-width q-pa-sm"
          >
            <h5 class="q-ma-none q-mb-md row items-center full-width justify-center">
              <q-spinner size="sm" class="q-mr-md" />Loading tasks ...
            </h5>
            <div class="column">
              <q-skeleton
                v-for="num in [1, 2, 3, 4, 5]"
                :key="`skeleton-task-${num}`"
                type="QCard"
                :height="`${Math.floor(Math.random() * 20) + 60}px`"
                class="standout-0 full-width q-my-xs"
              />
            </div>
          </div>
          <!-- recent tasks: -->
          <div v-else>
            <h5 class="q-ma-none row items-center full-width justify-center">
              <q-icon name="history" class="q-mr-sm" color="primary" size="md" />
              <span>Recent tasks</span>
            </h5>
            <q-separator class="q-mb-md q-mt-sm" />
            <DisplayTask
              v-for="task in recentTasks"
              :key="`display-task-${task.id}`"
              :task-id="task.id"
              :use-slots="['right']"
              class="task-selector-parent"
              @dblclick="selectTask(task)"
            >
              <template #right>
                <div
                  class="standout-2 task-selector"
                  style="margin-right: -16px; margin-left: 16px;"
                  @click="selectTask(task)"
                >
                  <q-icon
                    name="arrow_forward"
                    size="lg"
                    style="height: 100%"
                  >
                    <q-tooltip>
                      <span>Select task</span>
                    </q-tooltip>
                  </q-icon>
                </div>
              </template>
            </DisplayTask>
          </div>
        </div>
      </q-card>
      <!-- activity/current/next panels: -->
      <div
        v-if="selectedTask"
        class="q-my-sm"
      >
        <q-tabs
          v-model="currentTab"
          class="standout-1 rounded full-width elevation-2"
          indicator-color="primary"
          active-color="primary"
          narrow-indicator
          no-caps
          dense
          dark
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
          class="full-width inner-tab"
        >
          <div class="full-width scroll-container q-mt-sm">
            <TaskActivityLogView
              :task-id="flowTaskId"
            />
          </div>
        </div>
        <!-- Current activity tab: -->
        <div
          v-if="currentTab === 'current'"
          class="full-width inner-tab"
        >
          <!-- No tabs cta: -->
          <div
            v-if="!activeSubtask"
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
          <!-- Active subtask: -->
          <div
            v-if="activeSubtask"
            class="full-width q-ma-sm"
          >
            <div class="row full-width justify-center q-mt-md">
              <div
                class="standout-2 rounded flex-col"
                style="width: 60%; height: auto;"
              >
                <div class="flex-col text-center">
                  <h4 class="q-my-md">Currently active</h4>
                  <h6 class="q-my-none q-mb-xs">
                    Started {{ new Date(activeSubtask.start).toDateString() }}
                  </h6>
                  <h6 class="q-my-none q-mb-md">
                    ({{ timeSince(activeSubtask.start) }})
                  </h6>
                </div>
                <q-space />
                <div class="row items-center justify-center q-mb-sm">
                  <TaskActiveButton
                    :task-id="flowTaskId"
                    size="lg"
                    color="primary"
                    flat
                    mode="save"
                  />
                  <!-- <q-btn-->
                  <!-- icon="delete"-->
                  <!-- color="negative"-->
                  <!-- size="lg"-->
                  <!-- no-caps-->
                  <!-- flat-->
                  <!-- >-->
                  <!-- <q-tooltip>Delete</q-tooltip>-->
                  <!-- </q-btn>-->
                  <TaskPauseButton
                    :task-id="flowTaskId"
                    mode="save"
                    size="lg"
                    flat
                  />
                </div>
              </div>
            </div>
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
            <div
              v-if="doesStringHaveStories(`${activeSubtaskMutations.note} ${activeSubtaskMutations.details}`)"
              class="row full-width q-pr-sm"
            >
              <q-space />
              <TaskStoryDropdown
                :stories="getStoriesFromString(`${activeSubtaskMutations.note} ${activeSubtaskMutations.details}`)
                  .map((id) => ({ id }))
                  "
              />
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
                  size="lg"
                  dense
                  flat
                  @click="addTimestampAtEnd()"
                ><q-tooltip>Insert timestamp</q-tooltip></q-btn>
                <q-btn
                  icon="save"
                  size="lg"
                  :color="activeSubtaskMutations.details === activeSubtask.details ? 'green-9' : 'warning'"
                  dense
                  flat
                  @click="updateSubtask"
                />
                <q-btn
                  icon="undo"
                  size="lg"
                  v-if="activeSubtaskMutations.details !== activeSubtask.details"
                  dense
                  flat
                  @click="activeSubtaskMutations.details = activeSubtask.details"
                />
              </q-btn-group>
            </div>
          </div>
        </div>
        <!-- Next up tab: -->
        <div
          v-if="currentTab === 'next'"
          class="full-width inner-tab"
        >
          <div class="full-width q-ma-sm">
            <div class="full-width">
              <TaskSubtaskList
                :task-id="flowTaskId"
                @started="currentTab = 'current'"
              />
            </div>
          </div>
        </div>
        <!-- Stories tab: -->
        <div
          v-if="currentTab === 'stories'"
          class="full-width"
        >
          <div
            v-if="taskStories"
            class="full-width q-ma-sm"
          >
            <div class="full-width scroll-container inner-tab">
              <q-card
                v-for="story in taskStories"
                :key="story.id"
                class="standout-0 q-mb-xs"
                dense
                flat
              >
                <q-item clickable class="q-px-sm q-pb-xs q-pt-none">
                  <q-item-section>
                    <StoryCard
                      :story-id="story.id"
                      dense
                    />
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, defineProps } from 'vue';
import AppTabSelector from 'src/components/AppTabSelector.vue';
import useTaskStore from 'src/pinia/taskStore';
import {
  filterTaskList,
  getFromLocalStorage,
  getStoriesFromTask,
  doesStringHaveStories,
  getStoriesFromString,
  LocalStorageName,
  saveToLocalStorage,
  timeSince,
  updateActiveActivity
} from 'src/utils';
import { Task, TaskFilters, TaskActivityLog } from 'src/types';
import DisplayTask from 'src/components/DisplayTask.vue';
import KeywordSearch from 'src/components/TaskFilters/KeywordSearch.vue';
import BoolToggleGroup from 'src/components/TaskFilters/BoolToggleGroup.vue';
import TaskOptions from 'src/components/TaskOptions.vue';
import TaskTagsList from 'src/components/TaskFilters/TaskTagsList.vue';
import TaskActivityLogView from 'src/components/TaskActivityLog.vue';
import TaskSubtaskList from 'src/components/TaskSubtaskList.vue';
import TaskActiveButton from 'src/components/TaskActiveButton.vue';
import TaskPauseButton from 'src/components/TaskPauseButton.vue';
import StoryCard from 'src/components/StoryCard.vue';
import TaskStoryDropdown from 'src/components/TaskStoryDropdown.vue';
import GitCheckout from 'src/components/GitCheckout.vue';
import { useTasks } from 'src/components/composables/tasks';

const cardClasses = ref<string[]>(['full-width', 'q-pa-sm', 'q-mb-sm']);

const { tasks: allTasks } = useTasks();

// STORE
const taskStore = useTaskStore();

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
  if (!filters.value.keyword) {
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
  return filterTaskList(
    [...allTasks.value]
      .sort((a, b) => b.updated - a.updated)
      .slice(0, 5),
    filters.value
  );
});

// SELECT
const flowTaskId = ref<string>(getFromLocalStorage(LocalStorageName.flowTask));
const selectedTask = computed(() => taskStore.getTask(flowTaskId.value));

function selectTask(task: any) {
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
watch(activeSubtask, (n) => {
  activeSubtaskMutations.value = { ...n };
});

const taskStories = computed(() => !selectedTask.value ? undefined : getStoriesFromTask(selectedTask.value));

const currentTab = ref<string>('current');
const availableTabs = computed(() => {
  if (!selectedTask.value) {
    return [];
  }

  const tabs = [];

  if (selectedTask.value.activity?.length) {
    tabs.push({
      name: 'activity',
      label: 'History'
    });
  }

  if (selectedTask.value.activity?.length) {
    tabs.push({
      name: 'current',
      label: 'Current'
    });
  }

  if (selectedTask.value.next?.length) {
    tabs.push({
      name: 'next',
      label: 'Next up'
    });
  }

  if (taskStories.value?.length) {
    tabs.push({
      name: 'stories',
      label: 'Tickets'
    });
  }

  return tabs;
});

function addTimestampAtEnd() {
  activeSubtaskMutations.value.details += `\n${new Date().toDateString()} ${new Date().toTimeString().split(' ')[0]}: `;
}
</script>

<style scoped>
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
}

@import url('https://fonts.googleapis.com/css?family=Allerta');

.content-container>div,
.content-container>span {
  font-family: 'Allerta', sans-serif;
}

.q-card>div:last-child {
  border-bottom: 1px;
}

.inner-tab {
  max-height: calc(100vh - 375px);
  overflow-y: auto;
}

.task-selector-parent:hover .task-selector {
  display: block;
  width: 50px;
  transition: all 500ms ease-in-out;
}

.task-selector {
  width: 0px;
  height: 100%;
  border-radius: 6px;
  transition: all 500ms ease-in-out;
  margin-left: 2px;
  overflow: hidden;
}

.round-corners {
  border-radius: 6px;
}
</style>
