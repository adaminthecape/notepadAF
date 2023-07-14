<template>
  <div>
    <q-btn
        v-bind="allQProps"
        v-model="isConfirmingDeletion"
        icon="close"
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
                <span class="text-bold">{{ task.message ? task.message.slice(0, 100) : '' }}</span>
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
import QPropsMixin from '../mixins/QPropsMixin.js';

export default {
  mixins: [QPropsMixin],
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data()
  {
    return {
      isConfirmingDeletion: false
    };
  },
  inject: ['$addOrUpdateTask'],
  methods: {
    reallyRemoveTask()
    {
      this.$addOrUpdateTask({ ...this.task, deleted: Date.now() }, true);
      this.isConfirmingDeletion = false;
      this.$emit('removed', { ...this.task, deleted: Date.now() });
    }
  }
};
</script>