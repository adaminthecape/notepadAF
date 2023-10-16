<template>
  <q-tooltip v-if="stories?.length">
    <span
      v-for="story in stories"
      :key="`story-tooltip-${story.id}`"
    >{{ story.tooltip }}<br /></span>
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
const stories = computed<{
  id: string | number;
  tooltip: string;
}[]>(() => (
  (getStoriesFromString(props.value) || [])
    .map((id) => ({
      id,
      tooltip: `${id}: ${pivotalStore.get(id)?.name}`
    }))
));

onMounted(() => {
  stories.value.forEach(({ id }) => pivotalStore.load({ id } as { id: any }))
});
</script>
