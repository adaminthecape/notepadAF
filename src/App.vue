<template>
  <div v-if="!hasAccount">
    <SetAccountDetails />
  </div>
  <div v-else id="q-app">
    <!-- <div class="row items-center">
      <q-tabs
        v-model="currentTab"
        class="shadow-5 full-width"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
        dense
        dark
      >
        <q-tab
          v-for="tab in activeAppTabs"
          :key="`tab-${tab.name}`"
          :name="tab.name"
          :label="tab.label"
        />
      </q-tabs>
    </div> -->

    <div v-if="currentTab === 'tasks'">
      <TasksActivity />
    </div>
    <div v-if="currentTab === 'activity'">
      <TaskDetailView :task-id="desiredTaskId" />
    </div>
    <div v-if="currentTab === 'tickets'">
      <MyTickets class="q-pa-md" :cached-tickets="ticketCache" />
    </div>
    <div v-if="currentTab === 'settings'">
      <Settings class="q-pa-md" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getFromLocalStorage,
  localStorageIntervalCheck,
  LocalStorageName,
  saveToLocalStorage,
} from '@/utils';
import { defaultTabs } from 'src/constants';
import useThemeStore from 'src/pinia/themeStore';
import { ref, computed, defineAsyncComponent, onMounted, watch, provide } from 'vue';
import { Dark } from 'quasar';
import useTaskStore from './pinia/taskStore';

const SetAccountDetails = defineAsyncComponent(() =>
  import('src/components/SetAccountDetails.vue'));
const TaskDetailView = defineAsyncComponent(() =>
  import('src/components/TaskDetailView.vue'));
const TasksActivity = defineAsyncComponent(() =>
  import('src/components/TasksActivity.vue'));
const MyTickets = defineAsyncComponent(() =>
  import('src/components/MyTickets.vue'));
const Settings = defineAsyncComponent(() =>
  import('src/components/SettingsHandler.vue'));

const storedTabs = getFromLocalStorage(LocalStorageName.appTabs, true);
const appTabsToUse = [];

if (storedTabs) {
  defaultTabs.forEach((tab) => {
    appTabsToUse.push(storedTabs.find((t: any) => t.name === tab.name) || tab);
  });
} else {
  appTabsToUse.push(...defaultTabs);
}

const hasAccount = ref(!!getFromLocalStorage(
  LocalStorageName.user_account,
  true
));
const currentTab = ref<string>(getFromLocalStorage(LocalStorageName.currentTab) || 'tasks');
const ticketCache = ref();
const desiredTaskId = ref(getFromLocalStorage(LocalStorageName.desiredTaskId) || undefined);
const appTabs = ref(appTabsToUse);

const activeAppTabs = computed(() => {
  return appTabs.value.filter((t) => t.active);
});

provide('helpers', {
  activeTabs: () => ({
    tasks: currentTab.value === 'tasks',
    activity: currentTab.value === 'activity',
    tickets: currentTab.value === 'tickets',
    settings: currentTab.value === 'settings'
  }),
  openTab: (name: string) => {
    currentTab.value = name;
  }
});

function setTabs() {
  const appTabsFromStorage = getFromLocalStorage(LocalStorageName.appTabs, true);

  if (!Object.keys(appTabsFromStorage || {}).length) {
    saveToLocalStorage(LocalStorageName.appTabs, appTabs.value);
  }
};
function setZoom() {
  const zoom = getFromLocalStorage(LocalStorageName.zoomLevel);

  if (zoom) {
    // document.getElementsByTagName('body')[0].style.zoom = zoom;
  }
};
function setTheme() {
  const themes = useThemeStore();
  // set dark mode to the user's preference
  const theme = themes.getActiveTheme;
  const isDark = (theme === 'dark');
  Dark.set(isDark);
};
function watchTabChanges() {
  saveToLocalStorage(LocalStorageName.currentTabQueue, []);

  localStorageIntervalCheck(LocalStorageName.currentTabQueue, (queue: any[]) => {
    currentTab.value = queue[0];
  });
};

watch(currentTab, (n, o) => {
  desiredTaskId.value = getFromLocalStorage(LocalStorageName.desiredTaskId);
  saveToLocalStorage(LocalStorageName.currentTab, n);
});

onMounted(() => {
  setTheme();
  setZoom();
  setTabs();
  watchTabChanges();
});

const taskStore = useTaskStore();

taskStore.watchCloudDb();
</script>

<style lang="postcss">
.story-hint {
  display: inline;
}

.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
}

.bordered {
  border: 1px solid #bbb;
  border-radius: 4px;
}

* {
  font-family: "Verdana";
  letter-spacing: 0.4px;
}

pre {
  white-space: pre-wrap;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  line-height: 1em;
}

h1 {
  font-size: 2em;
}

h2 {
  font-size: 1.8em;
}

h3 {
  font-size: 1.6em;
}

h4 {
  font-size: 1.4em;
}

h5 {
  font-size: 1.2em;
}

h6 {
  font-size: 1em;
}

body,
body *,
.styleScroll,
.styleScroll * {
  /* firefox support - limited customizability compared to chrome */
  scrollbar-color: #a0a0a5 #f4f4f4;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    /* background-color: transparent; */
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    /* background-color: transparent; */
    background-color: rgba(250, 250, 250, 0.4);
  }

  /* stylelint-disable a11y/no-display-none  */
  &::-webkit-scrollbar-button {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #98989d;
    /* border: 4px solid #f4f4f4; */
    width: 4px;
    border-radius: 10px;
  }

  &:hover::-webkit-scrollbar,
  &:focus::-webkit-scrollbar {
    width: 6px;
  }

  /* &:hover::-webkit-scrollbar-track {
      background-color: rgba(250, 250, 250, 0.4);
    } */

  &:hover::-webkit-scrollbar-track,
  &:focus::-webkit-scrollbar-track {
    background-color: rgba(250, 250, 250, 0.6);
  }

  &:hover::-webkit-scrollbar-thumb,
  &:focus::-webkit-scrollbar-thumb {
    background-color: #75757a;
    /* border: 5px solid #fff; */
    width: 6px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
  opacity: 1;
  max-height: revert;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
