<template>
  <div style="display: inline">
    <slot name="activator" v-bind="{ open: open }">
      <q-btn
          icon="add_task"
          color="primary"
          :dense="dense"
          flat
          @click.stop.prevent="open"
      >
        <q-tooltip>Add a task</q-tooltip>
      </q-btn>
    </slot>
    <q-dialog v-model="isAddingTask">
      <q-card class="q-pa-md full-width">
        <q-item-section>
          <h5 class="q-my-none">
            Add task
          </h5>
          <q-input
              ref="messageInput"
              :key="newTaskRenderIndex"
              v-model="newTask.message"
              :type="newTask.messageType"
              placeholder="Edit task"
              class="full-width q-my-sm"
              outlined
              dense
              @keydown.alt.down.stop.prevent="toggleTextarea"
          >
            <template #append>
              <div
                  :style="newTask.messageType === 'textarea' ?
                    'display: flex; flex-direction: column; margin-top: 40px' :
                    ''"
              >
                <q-btn
                    icon="list"
                    :color="newTask.messageType === 'textarea' ? 'positive' : 'neutral'"
                    size="sm"
                    class="q-ml-xs"
                    :outline="newTask.messageType === 'textarea'"
                    :flat="newTask.messageType !== 'textarea'"
                    dense
                    @click="toggleTextarea"
                >
                  <q-tooltip>{{ newTask.messageType !== 'textarea' ? 'Convert to textarea' : 'Convert to input' }}</q-tooltip>
                </q-btn>
              </div>
            </template>
          </q-input>
          <div class="row">
            <TaskDoneButton
                :done="newTask.done"
                class="q-mr-sm"
                dense
                @toggle="newTask.done = $event; newTaskRenderIndex += 1"
            />
            <TaskActiveButton
                :active="newTask.active"
                dense
                @toggle="newTask.active = $event; newTaskRenderIndex += 1"
            />
            <q-space />
            <div
                v-if="newTask.stories && newTask.stories.length"
                class="q-mr-sm q-my-sm"
            >
              {{ newTask.stories }}
            </div>
            <q-btn
                label="Save"
                icon="save"
                color="primary"
                dense
                @click="addNewTask"
            />
          </div>
        </q-item-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
  import QPropsMixin from '../mixins/QPropsMixin.js';
  import TaskDoneButton from "components/TaskDoneButton";
  import TaskActiveButton from "components/TaskActiveButton";

  export default {
    components: { TaskActiveButton, TaskDoneButton },
    mixins: [QPropsMixin],
    props: {
      initialTaskData: {
        type: Object,
        default: () => ({})
      }
    },
    data()
    {
      return {
        isAddingTask: false,
        newTask: {
          done: 0,
          active: 0,
          archived: 0,
          message: '',
          stories: [],
          ...(this.initialTaskData || {})
        },
        newTaskRenderIndex: 0
      };
    },
    methods: {
      open()
      {
        this.isAddingTask = !this.isAddingTask;
      },
      toggleTextarea()
      {
        this.newTask.messageType = (this.newTask.messageType === 'textarea') ? undefined : 'textarea';

        this.newTaskRenderIndex += 1;
      },
      addNewTask()
      {
        const tags = Array.isArray(this.newTask.tags) ? this.newTask.tags : [];

        if(Array.isArray(this.newTask.stories))
        {
          tags.push(...this.newTask.stories.map((s) => `${s}`));
        }

        this.newTask.tags = tags;

        this.updateTask(this.newTask);
        this.newTask = { ...this.initialTaskData };
        this.$refs.messageInput.focus();
      },
    }
  };
</script>