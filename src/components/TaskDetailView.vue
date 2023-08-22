<template>
  <SimpleLayout
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
        <AppTabSelector />
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
      <div v-if="!task">
        <q-card flat>
          <q-item>
            <q-item-section avatar>
              <q-skeleton type="QAvatar" />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" />
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-skeleton height="30px" square class="q-my-xl" />
          <q-skeleton height="30px" square class="q-my-xl" />
          <q-skeleton height="30px" square class="q-my-xl" />
          <q-skeleton height="30px" square class="q-my-xl" />

          <q-card-actions align="right" class="q-gutter-md">
            <q-skeleton type="item" style="flex-grow:1" />
            <q-skeleton type="QBtn" />
            <q-skeleton type="QBtn" />
          </q-card-actions>
        </q-card>
      </div>
      <div v-if="task">
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
      </div>
    </template>
  </SimpleLayout>
</template>

<script setup lang="ts">
import { getFromLocalStorage, LocalStorageName } from 'src/utils';
import { computed, ref, watch } from 'vue';
import useTaskStore from 'src/pinia/taskStore';

import AppTabSelector from 'src/components/AppTabSelector.vue';
import SimpleLayout from 'src/components/SimpleLayout.vue';
import SubtaskList from 'src/components/TaskSubtaskList.vue';
import DisplayTask from 'src/components/DisplayTask.vue';
import TaskActivityLog from 'src/components/TaskActivityLog.vue';
import TaskOptions from 'src/components/TaskOptions.vue';

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
