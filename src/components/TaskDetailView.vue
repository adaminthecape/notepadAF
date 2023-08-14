<template>
  <SimpleLayout
      v-if="task"
      :key="`layout-${logRenderKey}`"
      :page-classes="['q-pa-sm']"
  >
    <template #header-title>
      <!-- Task controls -->
      <div class="row">
        <q-space />
        <TaskOptions
            :task-id="taskIdToUse"
            show-edit-button
            show-active-button
            show-alert-button
            show-delete-button
            show-done-button
            show-archive-button
            show-subtask-button
            hide-menu-button
            show
            class="q-mb-sm"
            add-new
            flat
            @editTask="editTask"
        />
        <q-space />
      </div>
    </template>
    <template #page-header>
      <!-- Task message -->
      <DisplayTask
          ref="displayTask"
          :task-id="taskIdToUse"
          :show-options="false"
          :clickable="true"
      />
    </template>
    <template #page-content>
      <!-- Task activity: add new -->
      <!--<div class="row items-center">-->
      <!--  <q-input-->
      <!--      v-model="newLogMessage"-->
      <!--      placeholder="New subtask..."-->
      <!--      class="full-width"-->
      <!--      filled-->
      <!--      dense-->
      <!--  >-->
      <!--    <template #append>-->
      <!--      <TaskActiveButton-->
      <!--          :task-id="taskIdToUse"-->
      <!--          mode="save"-->
      <!--          disable-adding-note-->
      <!--          dense-->
      <!--      />-->
      <!--    </template>-->
      <!--  </q-input>-->
      <!--</div>-->
      <!-- Task activity: show list -->
      <TaskActivityLog
          :key="`activity-log-${logRenderKey}`"
          :task-id="taskIdToUse"
      />
      <SubtaskList
          :task-id="taskIdToUse"
      />
    </template>
  </SimpleLayout>
</template>

<script>
import { getFromLocalStorage, localStorageNames } from 'src/utils.js';
import { getTask } from 'src/storeHelpers.js';
import SimpleLayout from 'src/components/SimpleLayout.vue';
import TaskOptions from 'src/components/TaskOptions.vue';
import TaskActivityLog from 'src/components/TaskActivityLog.vue';
import DisplayTask from 'components/DisplayTask';
import SubtaskList from 'components/TaskSubtaskList';
// import TaskActiveButton from "components/TaskActiveButton";

export default {
  components: {
    SubtaskList,
    DisplayTask,
    // TaskActiveButton,
    TaskActivityLog,
    TaskOptions,
    SimpleLayout
  },
  props: {
    taskId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      localStorageData: {},
      // newLogMessage: '',
      logRenderKey: 0
    };
  },
  watch: {
    'task.active'() {
      this.logRenderKey += 1;
    }
  },
  computed: {
    task() {
      return getTask(this.$store, this.taskIdToUse);
    },
    taskIdToUse() {
      return this.taskId || getFromLocalStorage(localStorageNames.desiredTaskId);
    }
  },
  methods: {
    editTask() {
      this.$refs.displayTask.editTask();
    }
  }
};
</script>

<style>
.task-message-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  white-space: pre-wrap;
}
</style>
