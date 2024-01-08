<template>
  <div>
    <q-btn
      :label="label"
      :size="transformSizeProp(size)"
      :flat="flat"
      :dense="dense"
      :color="active ? 'orange' : undefined"
      :icon="active ? 'assignment_ind' : 'content_paste_go'"
      :key="renderIndex"
      @click="toggle"
    >
      <q-tooltip>
        <span v-if="active">Started {{ timeSinceActive }}</span>
        <span v-else>Start task</span>
      </q-tooltip>
    </q-btn>
    <q-dialog
      v-if="!disableAddingNote"
      v-model="isAddingNote"
      class="full-width"
    >
      <q-card>
        <q-input
          v-model="logNote"
          placeholder="Add a message..."
          class="q-pa-sm"
          dense
          filled
        >
          <template #append>
            <q-btn icon="save" dense flat @click="save" />
          </template>
        </q-input>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { timeSince, transformSizeProp } from 'src/utils';
import { computed, onMounted, ref, watch } from 'vue';
import { useSingleTask } from 'src/components/composables/singleTask';

const props = defineProps<{
  label?: string;
  size?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  dense?: boolean;
  mode?: 'emit' | 'save' | undefined;
  disableAddingNote?: boolean;
  taskId: string;
}>();

const renderIndex = ref(0);
const logNote = ref(undefined);
const isAddingNote = ref(false);

const { task, lastActivity, active, toggleActive } = useSingleTask(props.taskId);

function save()
{
  toggleActive(logNote.value).then(() => {
    isAddingNote.value = false;
  });
}

const timeSinceActive = computed(() => timeSince(active.value));

const emit = defineEmits<{
  (event: 'toggle', active: number): void;
}>();

function toggle() {
  if (props.mode === 'save') {
    if (active.value) {
      isAddingNote.value = true;
    } else {
      save();
    }
  } else {
    emit('toggle', active.value ? 0 : Date.now());
  }
}

onMounted(() => {
  if (props.mode === 'save' && !props.taskId) {
    throw new Error('You must provide a task during save mode!');
  }

  if (lastActivity.value && !lastActivity.value.end && lastActivity.value.note) {
    logNote.value = lastActivity.value.note;
  }
});

watch(lastActivity, (newVal) => {
  logNote.value = newVal?.note || undefined;
});
</script>
