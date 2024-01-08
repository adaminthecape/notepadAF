<template>
  <span>{{ message }}<q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip></span>
</template>

<script setup lang="ts">
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
</script>
