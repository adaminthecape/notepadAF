<template>
  <q-btn-dropdown
    dropdown-icon="menu"
    auto-close
    square
    dense
    flat
  >
    <q-item
      v-for="tab in ['tasks', 'activity', 'tickets', 'settings']"
      :key="`tab-selector-${tab}`"
      clickable
      :active="app?.activeTabs?.()?.[tab]"
      @click="app?.openTab?.(tab)"
    >
      <q-item-section>{{ tab.toLocaleUpperCase() }}</q-item-section>
    </q-item>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const app: {
  activeTabs: () => Record<string, boolean>;
  openTab: (tab: string) => void;
} | undefined = inject('helpers');
</script>
