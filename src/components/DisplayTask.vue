<template>
  <q-card v-if="task" class="flex q-mb-sm" :style="`flex-direction: column; background-color: #70809020`" flat bordered>
    <q-item clickable dense @click.ctrl="editTask" @pointerdown="waitingToEdit = true" @pointerup="waitingToEdit = true">
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
            <TaskOptions
v-if="showOptions" show-single-task-button :task-id="task.id" :is-editing="isEditing" size="md"
              dense flat @editTask="editTask" />
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

<script>
import { cudTaskViaStore, timeSince, getStoriesFromTask } from '../utils';
import useTaskStore from 'src/pinia/taskStore';

export default {
  components: {
    AddTag: () => import('src/components/AddTag.vue'),
    TaskStoryDropdown: () => import('src/components/TaskStoryDropdown.vue'),
    TaskOptions: () => import('src/components/TaskOptions.vue'),
  },
  props: {
    showOptions: {
      type: Boolean,
      default: true,
    },
    taskId: {
      type: String,
      default: undefined,
    },
    clickable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      addingTag: false,
      alarmTimeouts: [],
      alarmTickTimeout: null,
      activeAlertsRenderKey: 10000,
      isEditing: false,
    };
  },
  computed: {
    store() {
      return useTaskStore();
    },
    task() {
      return this.store.getTask(this.taskId);
      // return this.$store.getters['notes/getTask'](this.taskId);
      // return getTask(this.$store, this.taskId);
    },
    stories() {
      return ((
        `${(this.task.tags || []).join('|')}|${this.task.message}`
          .match(/1\d{8}/g)
      ) || [])
        .reduce((agg, id) => {
          if (!agg.some((existing) => existing.id === id)) {
            agg.push({ id });
          }

          return agg;
        }, []);
    },
  },
  // mounted()
  // {
  //   if(this.task)
  //   {
  //     this.setAlarms();
  //     this.tickAlarms();
  //   }
  // },
  watch: {
    task: {
      handler() {
        this.$emit('refreshTask', { id: this.task.id });
      },
      deep: true,
    },
    waitingToEdit(n, o) {
      if (o && !n) this.editTask();
    },
  },
  methods: {
    /** helpers */
    timeSince,
    editTask(force = undefined) {
      if (typeof force === 'boolean') {
        this.isEditing = force;
      } else {
        this.isEditing = !this.isEditing;
      }

      if (this.isEditing) {
        // if now editing, focus the input
        this.focusOnNextTick('messageInput');
      } // otherwise, save the task
      else {
        cudTaskViaStore(this.$store, this.task);
      }
    },
    focusOnNextTick(refName, depth = 0) {
      if (depth > 10) {
        return;
      }

      if (this.$refs[refName]) {
        this.$refs[refName].focus();
      } else {
        this.$nextTick(() => {
          if (this.$refs[refName]) {
            this.$refs[refName].focus();
          } else {
            this.focusOnNextTick(refName, depth);
          }
        });
      }
    },
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
    removeAlert(alert) {
      if (!this.task.alerts.length) {
        return;
      }

      const alerts = this.task.alerts.filter((a) => a.unix !== alert.unix);

      cudTaskViaStore(this.$store, { ...this.task, alerts });
    },
    /** manage tags */
    addTag(tag) {
      if (!(this.task.tags || []).includes(tag)) {
        cudTaskViaStore(this.$store, {
          ...this.task,
          tags: [...(this.task.tags || []), tag],
        });
      }

      this.addingTag = false;
    },
    removeTag(tag) {
      const tags = (this.task.tags || []).filter((t) => t !== tag);

      cudTaskViaStore(this.$store, { ...this.task, tags });
    },
    /** manage task props */
    toggleTextarea() {
      cudTaskViaStore(this.$store, {
        ...this.task,
        messageType:
          this.task.messageType === 'textarea' ? undefined : 'textarea',
      });
    },
  },
};
</script>

<style scoped>
.task-message-display {
  white-space: pre-line;
  border-left: 2px solid #1976d2;
  padding: 0 4px;
}
</style>
