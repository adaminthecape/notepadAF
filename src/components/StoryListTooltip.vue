<template>
  <q-tooltip
    v-for="tooltip in stories"
    :key="`story-tooltip-${tooltip}`"
  >
    <span>{{ tooltip }}</span>
  </q-tooltip>
</template>

<script setup lang="ts">
import {
  getStoriesFromString
} from 'src/utils';
// import useTaskStore from 'src/pinia/taskStore';
import usePivotalStore from 'src/pinia/pivotalStore';
import { computed, onMounted } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true
  }
});

// const taskStore = useTaskStore();
const pivotalStore = usePivotalStore();
// const task = computed(() => taskStore.getTask(props.taskId));
const stories = computed(() => (
  (getStoriesFromString(props.value) || [])
    .map((id) => `${id}: ${pivotalStore.get(id)?.name}`)
));

onMounted(() => {
  stories.value.forEach((id) => pivotalStore.load({ id }))
});
</script>
