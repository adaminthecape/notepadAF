<template>
  <TimeChip
    v-if="chip && done"
    :task-id="taskId"
    date-format="M/d"
    time-format="h:m:s"
    :show-date="!withinPreviousDay"
    :show-time="withinPreviousDay"
    :size="transformSizeProp('sm')"
    :flat="flat"
    :dense="dense"
    style="display: inline"
    @click="preToggle"
  />
  <q-btn
    v-else
    :label="label"
    :size="transformSizeProp(size)"
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
          Undo or update completed date
        </q-item-section>
      </q-item>
      <div class="q-pa-none q-ma-none q-ml-lg">
        <q-item-section>
          <span class="text-caption">{{ taskTitle }}</span>
        </q-item-section>
      </div>
      <q-item>
        <q-item-section>
          <CreateAlert
            :input-value="{ unix: done }"
            prefix="Finished"
            icon-add="done"
            @newAlert="setDone($event.unix)"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div class="row">
            <q-space />
            <q-btn
              class="q-mr-sm"
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
import { timeSince, transformSizeProp } from 'src/utils';
import { computed, ref } from 'vue';
import TimeChip from 'src/components/TimeChip.vue';
import CreateAlert from 'src/components/CreateAlert.vue';
import { useSingleTask } from 'src/components/composables/singleTask';

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

const { done, setDone, title: taskTitle } = useSingleTask(props.taskId);

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
  const newVal = done.value === 0 ? Date.now() : 0;

  if (props.taskId) {
    setDone(newVal);
  } else {
    emit('toggle', newVal);
  }
}
</script>
