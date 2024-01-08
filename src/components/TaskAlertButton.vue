<template>
  <div>
    <q-btn
      :label="label"
      :size="transformSizeProp(size)"
      :flat="flat"
      :dense="dense"
      :icon="icon || 'alarm_add'"
      @click="isCreatingAlert = !isCreatingAlert"
    >
      <q-tooltip>Add alert</q-tooltip>
    </q-btn>
    <q-dialog v-model="isCreatingAlert">
      <q-card>
        <q-item>
          <q-item-section>
            {{ task ? task.message : "" }}
            <CreateAlert
              class="q-mt-md"
              @new-alert="addAlertToTask"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import useTaskStore from 'src/pinia/taskStore';
import { Task } from 'src/types';
import { transformSizeProp } from 'src/utils';
import CreateAlert from 'src/components/CreateAlert.vue';
import { useSingleTask } from 'src/components/composables/singleTask';

const props = defineProps<{
  taskId: string;
  label?: string;
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
}>();

const store = useTaskStore();
const task = computed<Task>(() => store.getTask(props.taskId));

const isCreatingAlert = ref(false);

const { addAlertToTask } = useSingleTask(props.taskId);
</script>
