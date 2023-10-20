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
      v-for="tab in ['flow', 'tasks', 'activity', 'tickets', 'settings']"
      :key="`tab-selector-${tab}`"
      clickable
      :active="app?.activeTabs?.()?.[tab]"
      @click="app?.openTab?.(tab)"
    >
      <q-item-section>{{ getTabName(tab).toLocaleUpperCase() }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-btn-group outline style="border: 1px solid #666">
          <q-btn
            size="sm"
            icon="light_mode"
            color="yellow-9"
            flat
            @click.stop.prevent="setLightMode"
          />
          <q-btn
            size="sm"
            icon="dark_mode"
            color="blue-9"
            style="border-left: 1px solid #666"
            flat
            @click.stop.prevent="setDarkMode"
          />
        </q-btn-group>
      </q-item-section>
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

import { Dark } from 'quasar';
import useThemeStore from 'src/pinia/themeStore';

const themeStore = useThemeStore();
function setLightMode() {
  themeStore.setLightMode();
  Dark.set(false);
}
function setDarkMode() {
  themeStore.setDarkMode();
  Dark.set(true);
}

function getTabName(tab: string) {
  switch(tab)
  {
    case 'flow': return 'New UI';
    case 'tasks': return 'Tasks';
    case 'activity': return 'Detail';
    case 'tickets': return 'Pivotal';
    case 'settings': return 'Settings';
    default: return 'Unknown';
  }
}
</script>
