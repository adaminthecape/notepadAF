<template>
  <q-card
      v-if="task"
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
        <div class="row items-center">
          <!-- VIEW DONE: -->
          <div
              v-if="task.done"
              style="margin-left: -14px"
              class="row items-center"
          >
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
          <!-- VIEW ALERTS: -->
          <div v-else-if="task.alerts && task.alerts.length" style="margin-left: -10px">
            <q-btn
                v-for="(alert, a) in task.alerts"
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
          <!-- MENU: -->
          <div
              class="row items-center"
              style="margin-right: -14px"
          >
            <TaskOptions
                :taskId="task.id"
                :isEditing="isEditing"
                size="md"
                dense
                flat
                @editTask="editTask"
            />
          </div>
        </div>
        <div class="row items-center">
          <!-- MESSAGE: -->
          <div
              v-if="!isEditing"
              class="q-mt-sm task-message-display"
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
                    @click="editTask(false)"
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
              icon="add"
              size="sm"
              dense
              round
              flat
              @click="addingTag = !addingTag"
          />
          <q-chip
              v-show="addingTag"
              style="overflow-y: hidden"
              square
              dense
              dark
          >
            <TaskTagSelector
                dark
                new-value-mode
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
import { timeSince } from "../utils";
import TaskTagSelector from './TaskTagSelector';
import TaskStoryDropdown from './TaskStoryDropdown';
import TaskOptions from './TaskOptions';
import SingleTaskMixin from "src/mixins/SingleTaskMixin";

export default {
  components: {
    TaskTagSelector,
    TaskStoryDropdown,
    TaskOptions
  },
  mixins: [SingleTaskMixin],
  data()
  {
    return {
      addingTag: false,
      alarmTimeouts: [],
      alarmTickTimeout: null,
      activeAlertsRenderKey: 10000,
      isEditing: false
    };
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
      handler()
      {
        this.$emit('refreshTask', { id: this.task.id });
      },
      deep: true
    }
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
    addTag(tag)
    {
      if(!this.task.tags.includes(tag))
      {
        this.updateTask({
          ...this.task,
          tags: [...this.task.tags, tag]
        });
      }

      this.addingTag = false;
    },
    removeTag(tag)
    {
      const tags = (this.task.tags || []).filter((t) => t !== tag);

      this.updateTask({ ...this.task, tags });
    },
    /** manage task props */
    toggleTextarea()
    {
      this.updateTask({
        ...this.task,
        messageType: this.task.messageType === 'textarea' ? undefined : 'textarea'
      });
    }
  }
};
</script>

<style scoped>
.task-message-display {
  white-space: pre-line;
  border-left: 2px solid #1976D280;
  padding: 0 4px;
}
</style>