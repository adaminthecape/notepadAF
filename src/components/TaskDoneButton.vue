<template>
  <TimeChip
    v-if="chip && done"
    :task-id="taskId"
    date-format="M/d"
    time-format="h:m:s"
    :show-date="!withinPreviousDay"
    :show-time="withinPreviousDay"
    :size="size"
    :flat="flat"
    :dense="dense"
    style="display: inline"
    @click="preToggle"
  />
  <q-btn
    v-else
    :label="label"
    :size="size"
    :flat="flat"
    :dense="dense"
    :color="done ? 'green-7' : undefined"
    :icon="done ? 'check_circle' : 'check_circle_outline'"
    @click="preToggle"
  >
    <q-tooltip>
      <span v-if="done">Finished {{ timeSinceDone }}</span>
      <span v-else>Finish task</span>
    </q-tooltip>
  </q-btn>
  <q-dialog v-model="isConfirming">
    <q-card>
      <q-item>
        <q-item-section>
          Really undo?
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div class="row">
            <q-btn
              class="q-mr-sm q-ml-xl"
              dense
              flat
              v-close-popup
            >Cancel</q-btn>
            <q-btn
              color="negative"
              @click="toggle"
            >Undo</q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { timeSince } from 'src/utils';
import { computed, ref } from 'vue';
import useTaskStore from 'src/pinia/taskStore';
import TimeChip from 'src/components/TimeChip.vue';

const props = defineProps({
  taskId: {
    type: String,
    required: true,
  },
  chip: {
    type: Boolean,
    default: undefined
  },
  size: {
    type: String,
    default: undefined
  },
  label: {
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
  }
});

const store = useTaskStore();

const done = computed(() => store.getTaskProperty(props.taskId, 'done'));
const timeSinceDone = computed(() => timeSince(done.value));
const withinPreviousDay = computed(() => (Date.now() - done.value) < 86400000);

const emit = defineEmits<{
  (event: 'toggle', done: number): void
}>();

const isConfirming = ref<boolean>(false);

function preToggle() {
  if (done.value) {
    isConfirming.value = !isConfirming.value;
  }
  else {
    toggle();
  }
}

function toggle() {
  const newVal = done.value ? 0 : Date.now();

  if (props.taskId) {
    store.cloudUpdateSingleProperty({
      taskId: props.taskId,
      prop: 'done',
      data: newVal,
    });
  } else {
    emit('toggle', newVal);
  }
}
</script>
