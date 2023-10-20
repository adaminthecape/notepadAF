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
      <q-item-section>{{ tab.toLocaleUpperCase() }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-btn-group>
          <q-btn
            size="sm"
            icon="light_mode"
            @click.stop.prevent="setLightMode"
          />
          <q-btn
            size="sm"
            icon="dark_mode"
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
</script>
