<template>
  <div>
    <q-btn
      :label="label"
      :size="transformSizeProp(size)"
      :flat="flat"
      :dense="dense"
      :color="archived ? 'secondary' : undefined"
      :icon="archived ? 'unarchive' : 'move_to_inbox'"
      @click="toggleArchived"
    >
      <q-tooltip>
        <span v-if="archived">Archived {{ timeSinceArchived }}</span>
        <span v-else>Archive task</span>
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { timeSince, transformSizeProp } from 'src/utils';
import { useSingleTask } from 'src/components/composables/singleTask';

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
});

const { toggleArchived, archived } = useSingleTask(props.taskId);

const timeSinceArchived = computed(() => timeSince(archived.value));
</script>
