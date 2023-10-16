<template>
  <SimpleModal>
    <template #content>
      <slot></slot>
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import SimpleModal from 'src/components/SimpleModal.vue';
</script>
