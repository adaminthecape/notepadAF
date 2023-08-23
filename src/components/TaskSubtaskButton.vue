<template>
  <div>
    <q-btn
      :label="label"
      :size="transformSizeProp(size)"
      :flat="flat"
      :dense="dense"
      icon="add"
      @click="isAddingNote = !isAddingNote"
    >
      <q-tooltip>Add subtask</q-tooltip>
    </q-btn>
    <q-dialog v-model="isAddingNote" class="full-width">
      <q-card>
        <q-input
          v-model="description"
          placeholder="Add subtask..."
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
import { computed, onMounted, ref } from 'vue';
import useTaskStore from 'src/pinia/taskStore';
import { transformSizeProp } from 'src/utils';

const props = defineProps({
  taskId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: undefined
  },
  size: {
    type: String,
    default: undefined
  },
  icon: {
    type: String,
    default: undefined
  },
  color: {
    type: String,
    default: undefined
  },
  flat: {
    type: Boolean,
    default: false
  },
  dense: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'save'
  }
});

const description = ref();
const isAddingNote = ref(false);

const store = useTaskStore();

const task = computed(() => store.getTask(props.taskId));

onMounted(() => {
  if (props.mode === 'save' && !props.taskId) {
    throw new Error('You must provide a task during save mode!');
  }
});

function save() {
  if (!task.value) {
    return;
  }

  const taskData = { ...task.value };

  if (!taskData.next) {
    taskData.next = [];
  }

  const data = taskData.next.concat({ due: 0, note: description.value || '' });

  store.cloudUpdateSingleProperty({
    taskId: props.taskId,
    prop: 'next',
    data,
  }).then(() => {
    isAddingNote.value = false;
  });
}
</script>
