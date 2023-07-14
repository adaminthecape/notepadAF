<template>
  <q-card
      class="flex q-mb-sm"
      style="flex-direction: column; background-color: #70809020"
      flat
      bordered
  >
    <q-item
        clickable
        dense
        @click.ctrl="editTask"
    >
      <q-item-section>
        <div class="row items-center" style="margin-bottom: -10px">
          <!-- VIEW ALERTS: -->
          <div v-if="alerts.length" style="margin-left: -10px">
            <q-btn
                v-for="(alert, a) in alerts"
                :key="`alert-${a}-${activeAlertsRenderKey}`"
                size="sm"
                class="text-bold"
                :class="{ 'q-ml-xs': !!a }"
                unelevated
                outline
                dense
                :color="(alert.unix < (Date.now() - 600000)) ? 'negative' : 'primary'"
            >
              <div class="row items-center">
                <q-icon name="notification_important" />
                <span>{{ timeSince(new Date(alert.unix)) }}</span>
                <q-icon
                    name="close"
                    size="xs"
                    dense
                    flat
                    @dblclick.stop.prevent="removeAlert(alert)"
                />
              </div>
              <q-tooltip>Due {{ alert.date }} at {{ alert.time }}</q-tooltip>
            </q-btn>
          </div>
          <q-space />
          <!-- VIEW DONE: -->
          <div v-if="task.done" class="row items-center">
            <q-chip
                class="row items-center"
                style="background: #00FF0020"
                square
                dense
            >
              <q-icon name="task_alt" size="xs" class="q-mr-xs" />
              <span>{{ new Date(task.done).toDateString() }}</span>
              <q-icon name="schedule" size="xs" class="q-mx-xs" />
              <span>{{ new Date(task.done).toLocaleTimeString().slice(0, -3) }}</span>
            </q-chip>
          </div>
          <!-- MENU: -->
          <q-space />
          <div
              class="row items-center"
              style="margin-right: -14px; margin-left: -14px"
          >
            <TaskOptions
                :task="task"
                :isEditing="isEditing"
                size="md"
                @editTask="editTask"
                @updateTask="updateTask"
                @taskRemoved="$emit('refreshTask', $event)"
                @toggleArchived="toggleArchived"
            />
          </div>
        </div>
        <div class="row items-center">
          <!-- MESSAGE: -->
          <div
              v-if="!isEditing"
              style="white-space: pre-line;"
              class="q-mt-sm"
          >{{ task.message }}</div>
          <!-- MESSAGE INPUT: -->
          <q-input
              v-else
              ref="messageInput"
              v-model="task.message"
              :type="task.messageType"
              placeholder="Edit task"
              class="full-width q-mb-xs"
              dense
              @keydown.alt.down.stop.prevent="toggleTextarea"
          >
            <template #append>
              <div
                  :style="task.messageType === 'textarea' ?
                    'display: flex; flex-direction: column; margin-top: 40px' :
                    ''"
              >
                <q-btn
                    icon="save_as"
                    :color="isEditing ? 'positive' : 'neutral'"
                    size="sm"
                    class="q-ml-xs"
                    flat
                    dense
                    @click="updateTaskAndStopEditing"
                />
                <q-btn
                    icon="list"
                    :color="task.messageType === 'textarea' ? 'positive' : 'neutral'"
                    size="sm"
                    class="q-ml-xs"
                    :outline="task.messageType === 'textarea'"
                    :flat="task.messageType !== 'textarea'"
                    dense
                    @click="toggleTextarea"
                >
                  <q-tooltip>{{ task.messageType !== 'textarea' ? 'Convert to textarea' : 'Convert to input' }}</q-tooltip>
                </q-btn>
              </div>
            </template>
          </q-input>
        </div>
        <div class="row items-center" style="margin: 0 -12px;">
          <!-- ADD TAGS: -->
          <q-btn
              v-show="!addingTag"
              icon="add"
              size="sm"
              dense
              round
              flat
              @click="toggleAddingTag"
          />
          <!-- MANAGE TAGS: -->
          <q-chip
              v-show="addingTag"
              style="overflow-y: hidden"
              square
              dense
              dark
          >
            <TaskTagSelector
                ref="newTagSelector"
                dark
                @cancel="addingTag = false"
                @input="addTag"
            />
          </q-chip>
          <!-- VIEW TAGS: -->
          <q-chip
              v-for="(tag, tagIndex) in task.tags"
              :key="`tag-${tagIndex}`"
              square
              dense
              dark
              style="margin-right: -2px"
              removable
              @remove="removeTag(tag)"
          >
            <div class="row items-center">
              <span
                  style="margin-top: -2px;"
                  @click="$emit('filterByTag', tag)"
              >{{ tag }}</span>
            </div>
          </q-chip>
          <q-space />
          <div v-if="stories && stories.length">
            <TaskStoryDropdown :stories="stories" />
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script>
import uniq from 'lodash/uniq';
import { timeSince, flashTaskbarIcon, clearAllFlashes } from "../utils";
import TaskTagSelector from './TaskTagSelector';
import TaskStoryDropdown from './TaskStoryDropdown';
import TaskOptions from './TaskOptions';

export default {
  components: {
    TaskTagSelector,
    TaskStoryDropdown,
    TaskOptions
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
      addingTag: false,
      newTag: null,
      task: {
        id: this.taskId,
        message: null,
        description: null,
        done: null,
        links: [],
        tags: []
      },
      alarmTimeouts: [],
      alarmTickTimeout: null,
      activeAlertsRenderKey: 10000,
      isEditing: false,
      isCreatingAlert: false
    };
  },
  inject: ['$openLink'],
  computed: {
    stories()
    {
      if(this.task)
      {
        return uniq(
          `${JSON.stringify(this.task.tags || [])} ${this.task.message}`
            .match(/1\d{8}/g)
        ).map((id) => ({
          id: parseInt(id, 10),
          link: `https://www.pivotaltracker.com/story/show/${id}`
        }));
      }

      return [];
    },
    alerts()
    {
      if(this.task && this.task.alerts && this.task.alerts.length)
      {
        return this.task.alerts;
      }

      return [];
    }
  },
  mounted()
  {
    // load stories
    // this.$store.dispatch();
    this.loadTask();
    this.setAlarms();
    this.tickAlarms();
  },
  methods: {
    /** helpers */
    timeSince,
    editTask(force = undefined)
    {
      if(typeof force === 'boolean')
      {
        this.isEditing = force;
      }
      else
      {
        this.isEditing = !this.isEditing;
      }

      if(this.isEditing) // if now editing, focus the input
      {
        this.focusOnNextTick('messageInput');
      }
      else // otherwise, save the task
      {
        this.updateTask(this.task);
      }
    },
    focusOnNextTick(refName, depth = 0)
    {
      if(this.$refs[refName])
      {
        this.$refs[refName].focus();
      }
      else
      {
        this.$nextTick(() =>
        {
          if(this.$refs[refName])
          {
            this.$refs[refName].focus();
          }
          else
          {
            if(depth > 10)
            {
              return;
            }

            this.focusOnNextTick(refName, depth);
          }
        });
      }
    },
    /** load tasks */
    loadTask()
    {
      const note = this.$store.getters['notes/getNote']('tasks');
      let task = null;

      if(note && note.tasks && note.tasks.length)
      {
        task = note.tasks.find((task) => task.id === this.taskId);
      }

      if(task && Object.keys(task).length)
      {
        this.task = {
          ...this.task,
          ...task
        };
      }

      return null;
    },
    /** manage tasks */
    updateTask(task)
    {
      this.$emit('updateTask', task);
    },
    updateTaskAndStopEditing()
    {
      this.updateTask(this.task);
      this.editTask(false);
    },
    /** manage alarms */
    tickAlarms()
    {
      if(this.alarmTickTimeout)
      {
        clearTimeout(this.alarmTickTimeout);
      }

      this.alarmTickTimeout = setInterval(() =>
      {
        this.activeAlertsRenderKey += 1;
      }, 5000);
    },
    clearAlarms()
    {
      this.alarmTimeouts.forEach((timeout) => clearTimeout(timeout));
      this.alarmTimeouts = [];
      clearAllFlashes();
    },
    setAlarms()
    {
      this.clearAlarms();

      const now = Date.now();

      this.alerts.forEach((alert) =>
      {
        const diff = (alert.unix - now);

        this.alarmTimeouts.push(setTimeout(
            () => {
              this.triggerAlarm();
            },
            diff || 1
        ));
      });
    },
    triggerAlarm()
    {
      const disable = flashTaskbarIcon();

      setTimeout(() => disable(), 2 * 60 * 1000);
    },
    /** set alarms */
    getTaskDataWithNewAlert(alert)
    {
      if(!this.task)
      {
        console.warn('Task not found!', alert);

        return;
      }

      if(!this.task.alerts)
      {
        this.task.alerts = [];
      }

      if(alert.id)
      {
        delete alert.id;
      }

      this.task.alerts.push(alert);

      return this.task;
    },
    addAlertToTask(alert)
    {
      if(!this.task || !alert || !alert.time || !alert.date)
      {
        console.warn('Not enough data for alert!', alert);

        return;
      }

      const task = this.getTaskDataWithNewAlert(alert);

      this.updateTask(task);
    },
    removeAlert(alert)
    {
      if(!this.task.alerts.length)
      {
        return;
      }

      const alerts = this.task.alerts.filter((a) => (
          a.unix !== alert.unix
      ));

      this.updateTask({ ...this.task, alerts });
    },
    /** manage tags */
    toggleAddingTag()
    {
      this.addingTag = !this.addingTag;

      this.focusOnNextTick('newTagSelector');
    },
    addTag(tag)
    {
      if(!this.task.tags.includes(tag))
      {
        this.task.tags.push(tag);
      }

      this.updateTask(this.task);

      this.newTag = null;
      this.addingTag = false;
    },
    removeTag(tag)
    {
      this.task.tags = (this.task.tags || [])
          .filter((t) => t !== tag);

      this.updateTask(this.task);
    },
    /** manage task props */
    toggleTextarea()
    {
      let messageType = 'textarea';

      if(this.task.messageType === 'textarea')
      {
        messageType = undefined;
      }

      this.task.messageType = messageType;

      this.updateTask({ ...this.task, messageType });
    },
    toggleArchived()
    {
      this.updateTask({
        ...this.task,
        archived: !this.task.archived
      });
    }
  }
};
</script>

<style>
.handle {
  align-items: center;
  cursor: grab;
  display: flex;
  margin-right: 8px;
}
</style>