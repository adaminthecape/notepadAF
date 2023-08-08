<template>
  <SimpleLayout
      v-if="task"
      :header="false"
      :key="`layout-${logRenderKey}`"
      :page-classes="['q-pa-sm']"
  >
    <template #header-title>
      Current task
    </template>
    <template #page-header>
      <!-- Task controls -->
      <div class="row">
        <q-space />
        <TaskOptions
            :task-id="taskIdToUse"
            class="q-mb-sm"
            add-new
            flat
        />
        <q-space />
      </div>
      <!-- Task message -->
      <DisplayTask
          :task-id="taskIdToUse"
          :show-options="true"
          :clickable="false"
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
    </template>
  </SimpleLayout>
</template>

<script>
import { getFromLocalStorage, saveToLocalStorage } from "src/utils.js";
import SimpleLayout from "src/components/SimpleLayout.vue";
import TaskOptions from "src/components/TaskOptions.vue";
import TaskActivityLog from "src/components/TaskActivityLog.vue";
import DisplayTask from "components/DisplayTask";
// import TaskActiveButton from "components/TaskActiveButton";

export default {
  components: {
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
  data()
  {
    return {
      localStorageData: {},
      // newLogMessage: '',
      logRenderKey: 0
    };
  },
  watch: {
    'task.active'()
    {
      this.logRenderKey += 1;
    }
  },
  computed: {
    task()
    {
      return this.$store.getters['notes/getTask'](this.taskIdToUse);
    },
    taskIdToUse()
    {
      return this.taskId || getFromLocalStorage('desiredTaskId');
    }
  },
  methods: {
    saveConfig()
    {
      saveToLocalStorage('singleTaskConfig', this.localStorageData);
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