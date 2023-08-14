<template>
  <div v-if="task">
    <q-btn
      :size="size"
      :flat="flat"
      :dense="dense"
      :icon="icon || 'close'"
      :color="task.deleted ? 'negative' : undefined"
      v-model="isConfirmingDeletion"
      @click="isConfirmingDeletion = !isConfirmingDeletion"
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
                  @click.stop.prevent="reallyRemoveTask"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { cudTaskViaStore } from 'src/utils';
import { getTask } from 'src/storeHelpers';

export default {
  props: {
    taskId: {
      type: String,
      default: undefined,
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
  },
  data() {
    return {
      isConfirmingDeletion: false,
    };
  },
  computed: {
    task() {
      return getTask(this.$store, this.taskId);
    }
  },
  methods: {
    reallyRemoveTask() {
      cudTaskViaStore(
        this.$store,
        { ...this.task, deleted: Date.now() },
        true
      ).then(() => {
        this.isConfirmingDeletion = false;
      });
    },
  },
};
</script>
