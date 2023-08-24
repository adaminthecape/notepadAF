<template>
  <div v-if="task">
    <q-btn
      :label="label"
      :size="transformSizeProp(size)"
      :flat="flat"
      :dense="dense"
      :icon="icon || 'close'"
      :color="task.deleted ? 'negative' : undefined"
      v-model="isConfirmingDeletion"
      @click="handleClick"
    >
      <q-tooltip>Delete task</q-tooltip>
    </q-btn>
    <q-dialog v-model="isConfirmingDeletion">
      <q-card>
        <q-item>
          <q-item-section>
            <div>
              <div class="q-mb-sm">
                <span class="text-bold">{{
                  task && task.message ? task.message.slice(0, 50) : ""
                }}</span>
              </div>
              <div>Are you sure you want to delete?</div>
              <div class="row">
                <q-space />
                <q-btn
                  label="Cancel"
                  dense
                  flat
                  @click.stop.prevent="isConfirmingDeletion = false"
                />
                <q-btn
                  color="negative"
                  label="Remove"
                  dense
                  flat
                  @click.stop.prevent="toggleDeleted"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import useTaskStore from 'src/pinia/taskStore';
import { transformSizeProp } from 'src/utils';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined,
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

const isConfirmingDeletion = ref<boolean>(false);

const store = useTaskStore();

const task = computed(() => (
  props.taskId ? store.getTask(props.taskId) : undefined
));

function toggleDeleted() {
  if (!task.value) return;

  store.cloudUpdateSingle(
    { ...task.value, deleted: task.value.deleted ? 0 : Date.now() }
  ).then(() => {
    isConfirmingDeletion.value = false;
  });
}

function handleClick(): void {
  if (!task.value) return;

  if (task.value.deleted) {
    toggleDeleted();
  }
  else {
    isConfirmingDeletion.value = !isConfirmingDeletion.value;
  }
}
</script>
