<template>
  <q-btn-dropdown
    v-model="dropdownState"
    dropdown-icon="menu"
    auto-close
    square
    dense
    flat
    @mouseenter="dropdownState = true"
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
import { ref, inject } from 'vue';

const dropdownState = ref<boolean>(false);

const app: {
  activeTabs: () => Record<string, boolean>;
  openTab: (tab: string) => void;
} | undefined = inject('helpers');
</script>
