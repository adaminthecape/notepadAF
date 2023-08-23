<template>
  <span>{{ message }}<q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip></span>
</template>

<script setup lang="ts">
import usePivotalStore from 'src/pinia/pivotalStore';
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  tooltip: {
    type: String,
    default: undefined
  }
});

const store = usePivotalStore();

const storyName = computed(() => {
  return store.get(parseInt(props.message, 10))?.title;
})
</script>
