<template>
  <SimpleModal>
    <template #activator="{ open }">
      <q-btn
        :icon="icon"
        :label="label"
        :size="size"
        color="primary"
        dense
        flat
        @click.stop.prevent="open"
      ><q-tooltip>Add subtask</q-tooltip></q-btn>
    </template>
    <template #content>
      <q-input
        v-model="subtaskMessage"
        placeholder="Add note..."
        filled
        dense
      />
      <q-list style="max-height: 50vh; overflow-y: scroll">
        <q-item
          v-for="task in tasks?.slice(0, 50)"
          :key="`add-subtask-for-${task.id}`"
          clickable
          :style="selectedTaskId === task.id ? 'color: green' : ''"
          @click="selectedTaskId = task.id"
        >
          <q-item-section>
            <div class="row items-center">
              <span>{{ task.message?.slice(0, 50) }}</span>
              <q-space />
              <q-icon v-if="selectedTaskId === task.id" name="check" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
    <template #actions>
      <q-btn
        :disable="!selectedTaskId || !subtaskMessage"
        color="primary"
        class="q-ml-sm"
        icon="add"
        v-close-popup
        @click="addSubtaskToTask({ note: subtaskMessage }, storyId)"
      >Add</q-btn>
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SimpleModal from './SimpleModal.vue';
import { useSingleTask } from 'src/components/composables/singleTask';

const props = defineProps({
  storyId: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    default: undefined
  },
  icon: {
    type: String,
    default: 'task'
  },
  size: {
    type: String,
    default: 'md'
  }
});

const selectedTaskId = ref('');

const subtaskMessage = ref<string>('');

const { addSubtaskToTask } = useSingleTask(selectedTaskId.value);
</script>
