<template>
    <div style="display: inline">
        <slot name="activator" v-bind="{ open: open }">
            <q-btn
                icon="add_task"
                color="primary"
                :dense="dense"
                :size="size"
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
                                    :size="transformSizeProp('sm')"
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
                          task-id="new"
                          :done="newTask.done"
                          class="q-mr-sm"
                          dense
                          @toggle="newTask.done = $event; newTaskRenderIndex += 1"
                        />
                        <!-- <TaskActiveButton
                            :active="newTask.active"
                            dense
                            @toggle="newTask.active = $event; newTaskRenderIndex += 1"
                        /> -->
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
                            color="info"
                            dense
                            @click="addNewTask"
                        />
                    </div>
                </q-item-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { transformSizeProp } from 'src/utils';
import { Task } from 'src/types';
import { ref, defineAsyncComponent } from 'vue';
import { useTasks } from 'src/components/composables/tasks';

// const TaskActiveButton = defineAsyncComponent(() =>
//     import('src/components/TaskActiveButton.vue'));
const TaskDoneButton = defineAsyncComponent(() =>
  import('src/components/TaskDoneButton.vue'));

const props = defineProps<{
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
  initialTaskData?: Partial<Task>;
}>();

const isAddingTask = ref<boolean>(false);
const newTaskRenderIndex = ref<number>(0);
const newTask = ref<Partial<Task & { stories: (number | string)[] }>>({
  done: 0,
  active: 0,
  archived: 0,
  message: '',
  stories: [],
  ...(props.initialTaskData || {})
});

function open() {
  isAddingTask.value = !isAddingTask.value;
}

function toggleTextarea() {
  newTask.value.messageType = (newTask.value.messageType === 'textarea') ? undefined : 'textarea';
  newTaskRenderIndex.value += 1;
}

async function addNewTask() {
  const { addNewTask: addNewFn } = useTasks();

  await addNewFn(newTask.value);

  newTask.value = { ...props.initialTaskData };
  // this.$refs.messageInput.focus();
}
</script>
