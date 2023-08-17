<template>
  <q-card v-if="task" class="flex q-mb-sm" :style="`flex-direction: column; background-color: #70809020`" flat bordered>
    <q-item clickable dense @click.ctrl="editTask">
      <q-item-section>
        <div class="row items-center">
          <!-- VIEW DONE: -->
          <div v-if="task.done" style="margin-left: -14px" class="row items-center">
            <q-chip class="row items-center" style="background: #00ff0020" square dense>
              <q-icon name="task_alt" size="xs" class="q-mr-xs" />
              <span>{{ new Date(task.done).toDateString() }}</span>
              <q-icon name="schedule" size="xs" class="q-mx-xs" />
              <span>{{
                new Date(task.done).toLocaleTimeString().slice(0, -3)
              }}</span>
            </q-chip>
          </div>
          <!-- VIEW ALERTS: -->
          <div
            v-else-if="task.alerts && task.alerts.length"
            style="margin-left: -10px">
            <q-btn
v-for="(alert, a) in task.alerts" :key="`alert-${a}-${activeAlertsRenderKey}`" size="sm"
              class="text-bold" :class="{ 'q-ml-xs': !!a }" unelevated outline dense
              :color="alert.unix < Date.now() - 600000 ? 'negative' : 'primary'">
              <div class="row items-center">
                <q-icon name="notification_important" />
                <span>{{ timeSince(new Date(alert.unix)) }}</span>
                <q-icon name="close" size="xs" dense flat @dblclick.stop.prevent="removeAlert(alert)" />
              </div>
              <q-tooltip>Due {{ alert.date }} at {{ alert.time }}</q-tooltip>
            </q-btn>
          </div>
          <q-space />
          <!-- MENU: -->
          <div class="row items-center" style="margin-right: -14px">
            xx<TaskOptions
                v-if="showOptions"
                show-single-task-button
                :task-id="task.id"
                :is-editing="isEditing"
                size="md"
                dense
                flat
                @edit-task="editTask"
            />yy
          </div>
        </div>
        <div class="row items-center">
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
          <!-- ADD TAGS: -->
          <AddTag @input="addTag">
            <template #activator="{ open }">
              <q-btn icon="add" size="sm" dense round flat @click="open" />
            </template>
          </AddTag>
          <!--<q-btn-->
          <!--    icon="add"-->
          <!--    size="sm"-->
          <!--    dense-->
          <!--    round-->
          <!--    flat-->
          <!--    @click="addingTag = !addingTag"-->
          <!--/>-->
          <!--<q-chip-->
          <!--    v-show="addingTag"-->
          <!--    style="overflow-y: hidden"-->
          <!--    square-->
          <!--    dense-->
          <!--    dark-->
          <!--&gt;-->
          <!--  <TaskTagSelector-->
          <!--      dark-->
          <!--      new-value-mode-->
          <!--      @cancel="addingTag = false"-->
          <!--      @input="addTag"-->
          <!--  />-->
          <!--</q-chip>-->
          <!-- VIEW TAGS: -->
          <q-chip
v-for="(tag, tagIndex) in task.tags" :key="`tag-${tagIndex}`" square dense dark
            style="margin-right: -2px" removable @remove="removeTag(tag)">
            <div class="row items-center">
              <span style="margin-top: -2px" @click="$emit('filterByTag', tag)">{{ tag }}</span>
            </div>
          </q-chip>
          <q-space />
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
import { cudTaskViaStore, queueTaskRefresh, timeSince } from '../utils';
import useTaskStore from 'src/pinia/taskStore';
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { Task, TaskAlert } from 'src/types';

const AddTag = defineAsyncComponent(() => import('src/components/AddTag.vue'));
const TaskStoryDropdown = defineAsyncComponent(() => import('src/components/TaskStoryDropdown.vue'));
const TaskOptions = defineAsyncComponent(() => import('src/components/TaskOptions.vue'));

const props = defineProps<{
    taskId: string;
    showOptions?: boolean;
    clickable?: boolean;
}>();

const addingTag = ref(false);
const alarmTimeouts = ref([]);
const alarmTickTimeout = ref(null);
const activeAlertsRenderKey = ref(10000);
const isEditing = ref(false);

const store = useTaskStore();
const task = computed(() => store.getTask(props.taskId));
const stories = computed(() =>
{
    const storyIds: Array<string|number> = (
        `${(task.value.tags || []).join('|')}|${task.value.message}`
            .match(/1\d{8}/g)
    ) || [];

    return (storyIds).reduce((agg, id: string | number) => {
        if (!agg.some((existing: { id: string|number }) => existing.id === id)) {
        agg.push({ id });
        }

        return agg;
    }, [] as Array<{ id: string | number; }>);
});

watch(task, () => queueTaskRefresh(task.value.id));

function editTask(force: boolean) {
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

function removeAlert(alert: TaskAlert) {
    if (!task.value.alerts?.length) {
    return;
    }

    const alerts = task.value.alerts.filter((a) => a.unix !== alert.unix);

    store.cloudUpdateSingle({ ...task.value, alerts });
}

function addTag(tag: string) {
    if (!(task.value.tags || []).includes(tag))
    {
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
  border-left: 2px solid #1976d2;
  padding: 0 4px;
}
</style>
