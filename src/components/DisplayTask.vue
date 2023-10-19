<template>
  <!-- :class="{ 'q-mt-md': !!task.done }" -->
  <q-card
    v-if="task"
    class="flex q-mb-sm"
    :style="`flex-direction: column; background-color: #70809020`"
    flat
    bordered
  >
    <q-item clickable dense @click.ctrl="editTask">
      <q-item-section>
        <div class="row items-center">
          <!-- <div style="margin-top: -16px;" class="row full-width">
            <q-space />
            <TimeChip :task-id="task.id" />
          </div> -->
          <TaskAlertDisplay :task-id="task.id" />
          <q-space />
          <!-- MENU: -->
          <!-- <div class="row items-center" style="margin-right: -14px">
            <TaskOptions
                v-if="showOptions"
                show-single-task-button
                :task-id="task.id"
                :is-editing="isEditing"
                size="md"
                dense
                flat
                @edit-task="editTask()"
            />
          </div> -->
        </div>
        <div class="row items-center" style="margin-left: -12px">
          <TaskOptionsDropdown
            :task-id="task.id"
            show-active-button
            show-activity-log-button
            show-alert-button
            show-archive-button
            show-delete-button
            show-done-button
            show-edit-button
            show-labels
            show-single-task-button
            show-subtask-button
            dense
            flat
            :size="transformSizeProp('md')"
            :activator-size="transformSizeProp('sm')"
            @edit-task="editTask()"
          />
          <!-- MESSAGE: -->
          <div v-if="!isEditing">
            <span class="q-mt-sm task-message-display">{{ task.message }}</span>
          </div>
          <!-- MESSAGE INPUT: -->
          <q-input
v-else ref="messageInput" v-model="task.message" :type="task.messageType" placeholder="Edit task"
            class="full-width q-mb-xs" dense @keydown.alt.down.stop.prevent="toggleTextarea">
            <template #append>
              <div
:style="task.messageType === 'textarea'
  ? 'display: flex; flex-direction: column; margin-top: 40px'
  : ''
  ">
                <q-btn
icon="save_as" :color="isEditing ? 'positive' : 'neutral'" size="sm" class="q-ml-xs" flat dense
                  @click="editTask(false)" />
                <q-btn
icon="list" :color="task.messageType === 'textarea' ? 'positive' : 'neutral'
  " size="sm" class="q-ml-xs" :outline="task.messageType === 'textarea'"
                  :flat="task.messageType !== 'textarea'" dense @click="toggleTextarea">
                  <q-tooltip>{{
                    task.messageType !== "textarea"
                    ? "Convert to textarea"
                    : "Convert to input"
                  }}</q-tooltip>
                </q-btn>
              </div>
            </template>
          </q-input>
        </div>
        <div class="row items-center" style="margin: 0 -12px">
          <TaskTagsList
            :task-id="taskId"
          />
          <q-space />
          <TaskOptions
            :task-id="taskId"
            hide-menu-button
            :show-alert-button="false"
            dense
            flat
            :size="transformSizeProp('sm')"
            class="q-mr-xs"
            done-chip
          />
          <!-- VIEW STORIES: -->
          <div v-if="stories && stories.length">
            <TaskStoryDropdown :stories="stories" />
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script setup lang="ts">
import { queueTaskRefresh, transformSizeProp } from 'src/utils';
import useTaskStore from 'src/pinia/taskStore';
import { computed, ref, watch } from 'vue';
import { Task } from 'src/types';
// import TaskOptionsModal from 'src/components/TaskOptionsModal.vue';
import TaskOptionsDropdown from 'src/components/TaskOptionsDropdown.vue';
import TaskAlertDisplay from 'src/components/TaskAlertDisplay.vue';
import AddTag from 'src/components/AddTag.vue';
import TaskStoryDropdown from 'src/components/TaskStoryDropdown.vue';
import TaskOptions from 'src/components/TaskOptions.vue';
import TaskTagsList from 'src/components/TaskFilters/TaskTagsList.vue';

const emit = defineEmits<{
  (event: 'filterByTag', tag: string): void
}>();


const props = defineProps({
  taskId: {
    type: String,
    required: true
  },
  showOptions: {
    type: Boolean,
    default: true
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

const areTagsExpanded = ref(false);
const addingTag = ref(false);
// const alarmTimeouts = ref([]);
// const alarmTickTimeout = ref(null);
const activeAlertsRenderKey = ref(10000);
const isEditing = ref(false);

const store = useTaskStore();
const task = computed(() => store.getTask(props.taskId));
const stories = computed(() => {
  if (!task.value) return [];

  const storyIds: Array<string | number> = (
    `${(task.value.tags || []).join('|')}|${task.value.message}|${(task.value.next || []).map((s) => s.note || '').join('|')}`
      .match(/1\d{8}/g)
  ) || [];

  return (storyIds).reduce((agg, id: string | number) => {
    if (!agg.some((existing: { id: string | number }) => existing.id === id)) {
      agg.push({ id });
    }

    return agg;
  }, [] as Array<{ id: string | number; }>);
});

watch(task, () => queueTaskRefresh(task.value.id));

function editTask(force?: boolean) {
  if (typeof force === 'boolean') {
    isEditing.value = force;
  } else {
    isEditing.value = !isEditing.value;
  }

  if (isEditing.value) {
    // if now editing, focus the input
    // focusOnNextTick('messageInput');
  } // otherwise, save the task
  else {
    store.cloudUpdateSingle(task.value as Task);
  }
};

function addTag(tag: string) {
  if (!(task.value.tags || []).includes(tag)) {
    store.cloudUpdateSingle({
      ...task.value,
      tags: [...(task.value.tags || []), tag],
    });
  }

  addingTag.value = false;
};

function removeTag(tag: string) {
  const tags = (task.value.tags || []).filter((t) => t !== tag);

  store.cloudUpdateSingle({ ...task.value, tags });
};

function toggleTextarea() {
  store.cloudUpdateSingle({
    ...task.value,
    messageType:
      task.value.messageType === 'textarea' ? undefined : 'textarea',
  });
};

/** manage alarms */
// tickAlarms()
// {
//   if(this.alarmTickTimeout)
//   {
//     clearTimeout(this.alarmTickTimeout);
//   }
//
//   this.alarmTickTimeout = setInterval(() =>
//   {
//     this.activeAlertsRenderKey += 1;
//   }, 5000);
// },
// clearAlarms()
// {
//   this.alarmTimeouts.forEach((timeout) => clearTimeout(timeout));
//   this.alarmTimeouts = [];
//   // clearAllFlashes();
// },
// setAlarms()
// {
//   this.clearAlarms();
//
//   const now = Date.now();
//
//   (this.task.alerts || []).forEach((alert) =>
//   {
//     const diff = (alert.unix - now);
//
//     this.alarmTimeouts.push(setTimeout(
//         () => {
//           this.triggerAlarm();
//         },
//         diff || 1
//     ));
//   });
// },
// triggerAlarm()
// {
//   // const disable = flashTaskbarIcon();
//   //
//   // setTimeout(() => disable(), 2 * 60 * 1000);
// },

// function focusOnNextTick(refName, depth = 0) {
//     if (depth > 10) {
//     return;
//     }
//     if (this.$refs[refName]) {
//     this.$refs[refName].focus();
//     } else {
//     this.$nextTick(() => {
//         if (this.$refs[refName]) {
//         this.$refs[refName].focus();
//         } else {
//         this.focusOnNextTick(refName, depth);
//         }
//     });
//     }
// };
</script>

<style scoped>
.task-message-display {
  white-space: pre-line;
  border-left: 0px solid #1976d2;
  padding: 0 4px;
}
</style>
