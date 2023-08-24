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
    <q-item>
      <q-item-section>
        <q-btn @click="changeZoom">zoom</q-btn>
      </q-item-section>
    </q-item>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const app: {
  activeTabs: () => Record<string, boolean>;
  openTab: (tab: string) => void;
} | undefined = inject('helpers');

function changeZoom() {
  const qSize = localStorage.getItem('qSize');
  const currentLevel = (JSON.stringify(qSize) as any)?.level || 0;
  let level = currentLevel + 1;

  if (level > 1) {
    level = 1;
  }
  else if (level < -1) {
    level = -1;
  }

  console.log('changeZoom', { qSize, level, currentLevel });

  localStorage.setItem('qSize', JSON.stringify({ level }));
}
</script>
