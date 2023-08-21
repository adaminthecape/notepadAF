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
            class="q-my-sm"
            add-new
            flat
            dense
            @edit-task="editTask"
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

<script setup lang="ts">
import { getFromLocalStorage, LocalStorageName } from 'src/utils';
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import useTaskStore from 'src/pinia/taskStore';

const SubtaskList = defineAsyncComponent(() => import('src/components/TaskSubtaskList.vue'));
const DisplayTask = defineAsyncComponent(() => import('src/components/DisplayTask.vue'));
const TaskActivityLog = defineAsyncComponent(() => import('src/components/TaskActivityLog.vue'));
const TaskOptions = defineAsyncComponent(() => import('src/components/TaskOptions.vue'));
const SimpleLayout = defineAsyncComponent(() => import('src/components/SimpleLayout.vue'));

const props = defineProps<{
  taskId: string;
}>();

const store = useTaskStore();
const task = computed(() => store.getTask(props.taskId));
const isTaskActive = computed(() => !!task?.value?.active);
const taskIdToUse = computed(() => {
  return props.taskId || getFromLocalStorage(LocalStorageName.desiredTaskId);
});

const logRenderKey = ref<number>(0);

watch(isTaskActive, () => {
  logRenderKey.value += 1;
});

function editTask() {
  // this.$refs.displayTask.editTask();
}
</script>

<style>
.task-message-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  white-space: pre-wrap;
}
</style>
