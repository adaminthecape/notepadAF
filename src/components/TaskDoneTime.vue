<template>
  <!-- VIEW DONE: -->
  <div v-if="done" style="margin-left: -14px;" class="row items-center">
    <q-chip class="row items-center" style="background: #008d00"  dark square dense>
      <q-icon name="task_alt" size="xs" class="q-mr-xs" />
      <span>{{ new Date(done).toDateString() }}</span>
      <q-icon name="schedule" size="xs" class="q-mx-xs" />
      <span>{{
        new Date(done).toLocaleTimeString().slice(0, -3)
      }}</span>
    </q-chip>
  </div>
</template>

<script setup lang="ts">
import useTaskStore from 'src/pinia/taskStore';
import { computed } from 'vue';

const props = defineProps<{
  taskId: string;
}>();

const store = useTaskStore();

const done = computed(() => store.getTaskProperty(props.taskId, 'done'));

console.log('done:', done.value);
</script>
