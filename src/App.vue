<template>
  <div v-if="!hasAccount">
    <SetAccountDetails />
  </div>
  <div
      v-else
      id="q-app"
  >
    <div class="row items-center">
      <q-tabs
          v-model="currentTab"
          class="shadow-5 full-width"
          activeColor="primary"
          indicatorColor="primary"
          narrowIndicator
          dense
          dark
      >
        <q-tab
            v-for="tab in activeAppTabs"
            :key="`tab-${tab.name}`"
            :name="tab.name"
            :label="tab.label"
            :icon="tab.icon"
        />
      </q-tabs>
    </div>

    <div v-if="currentTab === 'tasks'">
      <TasksActivity
          :key="tasksRenderIndex"
      />
    </div>
    <div v-if="currentTab === 'activity'">
      <TaskDetailView
          :task-id="desiredTaskId"
          :key="tasksRenderIndex"
      />
    </div>
    <div v-if="currentTab === 'tickets'">
      <MyTickets
          class="q-pa-md"
          :cachedTickets="ticketCache"
          @updatedTickets="setTicketCache"
      />
    </div>
    <div v-if="currentTab === 'settings'">
      <Settings class="q-pa-md" />
    </div>
  </div>
</template>

<script>
  import TasksActivity from './components/TasksActivity';
  import MyTickets from './components/MyTickets';
  import Settings from './components/Settings';
  import SetAccountDetails from './components/SetAccountDetails';
  import {
    getFromLocalStorage, localStorageIntervalCheck, localStorageNames, saveToLocalStorage
  } from "src/utils";
  import TaskDetailView from "components/TaskDetailView";

  export default {
    name: 'App',
    components: {
      TaskDetailView,
      TasksActivity,
      MyTickets,
      Settings,
      SetAccountDetails
    },
    data()
    {
      const user = getFromLocalStorage(localStorageNames.user_account, true);
      const storedTabs = getFromLocalStorage(localStorageNames.appTabs, true);
      const defaultTabs = [
        {
          name: 'tasks',
          label: 'Tasks',
          active: true
        },
        {
          name: 'activity',
          label: 'Activity',
          active: true
        },
        {
          name: 'tickets',
          label: 'Tickets',
          active: true
        },
        {
          name: 'settings',
          label: 'Settings',
          active: true
        }
      ];
      const appTabs = [];

      if(storedTabs)
      {
        defaultTabs.forEach((tab) =>
        {
          const stored = storedTabs.find((t) => t.name === tab.name);

          if(stored)
          {
            appTabs.push(stored);
          }
          else
          {
            appTabs.push(tab);
          }
        });

      }
      else
      {
        appTabs.push(...defaultTabs);
      }

      return {
        hasAccount: !!user,
        currentTab: 'tasks',
        isLogDrawerOpen: false,
        activityCache: null,
        ticketCache: null,
        desiredNoteId: null,
        notesRenderIndex: 0,
        desiredTaskId: getFromLocalStorage(localStorageNames.desiredTaskId),
        tasksRenderIndex: 0,
        appTabs
      };
    },
    provide()
    {
      return {
        // $openNote: this.openNote,
        $openTab: this.openTab
      };
    },
    computed: {
      activeAppTabs()
      {
        return this.appTabs.filter((t) => t.active);
      },
      activeTheme()
      {
        return this.$store.getters['notes/activeTheme'];
      },
      activeThemeData()
      {
        return this.$store.getters['themes/getActiveThemeData'];
      }
    },
    mounted()
    {
      const appTabs = getFromLocalStorage(localStorageNames.appTabs, true);

      if(!Object.keys(appTabs || {}).length)
      {
        saveToLocalStorage(localStorageNames.appTabs, this.appTabs);
      }

      saveToLocalStorage(localStorageNames.currentTabQueue, []);

      localStorageIntervalCheck(
          localStorageNames.currentTabQueue,
          (queue) =>
          {
            this.currentTab = queue[0];
          }
      );

      // set dark mode to the user's preference
      this.$q.dark.set(this.$store.getters['themes/getActiveTheme'] === 'dark');

      const zoom = getFromLocalStorage(localStorageNames.zoomLevel);

      if(zoom)
      {
        document.getElementsByTagName('body')[0].style.zoom = zoom;
      }
    },
    watch: {
      currentTab(newVal, oldVal)
      {
        // check for stored task id & set it
        this.desiredTaskId = getFromLocalStorage(localStorageNames.desiredTaskId);
        saveToLocalStorage(localStorageNames.currentTab, newVal);
      }
    },
    methods: {
      // openNote(noteId)
      // {
      //   this.desiredNoteId = noteId;
      //   this.currentTab = 'notes';
      //   this.notesRenderIndex += 1;
      // },
      openTab(tab)
      {
        this.currentTab = tab;
      },
      setTicketCache(data)
      {
        this.ticketCache = data;
      }
    }
  }
</script>

<style>
  .bordered {
    border: 1px solid #bbb;
    border-radius: 4px;
  }

  * {
    font-family: 'Verdana';
    letter-spacing: 0.4px;
  }

  body, body *, .styleScroll, .styleScroll * {
    /* firefox support - limited customizability compared to chrome */
    scrollbar-color: #a0a0a5  #f4f4f4;
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