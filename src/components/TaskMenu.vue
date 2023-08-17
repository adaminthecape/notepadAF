<template>
  <q-btn-dropdown :icon="icon" :size="size" dense flat>
    <q-list>
      <q-item clickable @click="isRemovingTask = true">
        <q-item-section>
          <div v-if="!isRemovingTask">Remove task</div>
          <div v-else class="row items-center">
            <span>Are you sure?</span>
            <q-space />
            <q-btn
              label="Cancel"
              dense
              flat
              @click.stop.prevent="isRemovingTask = false"
            />
            <q-btn
              color="negative"
              label="Remove"
              dense
              flat
              @dblclick.stop.prevent="removeTask"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item clickable @click.stop.prevent="toggleArchived">
        <q-item-section>
          <div class="row items-center">
            <span>Archive</span>
            <q-space />
            <q-checkbox :value="!!task.archived" />
          </div>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <CreateAlert @new-alert="createAlert" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import CreateAlert from 'src/components/CreateAlert.vue';

export default {
  components: {
    CreateAlert,
  },
  props: {
    task: {
      type: Object,
      required: true,
    },
    icon: {
      type: String,
      default: undefined,
    },
    size: {
      type: String,
      default: 'sm',
    },
  },
  emits: ['removeTask', 'toggleArchived', 'createAlert'],
  data() {
    return {
      isRemovingTask: false,
    };
  },
  methods: {
    removeTask() {
      this.$emit('removeTask');
    },
    toggleArchived() {
      this.$emit('toggleArchived');
    },
    createAlert(e) {
      this.$emit('createAlert', e);
    },
  },
};
</script>
