<template>
  <div v-if="!hasAccount">
    <SetAccountDetails />
  </div>
  <div v-else id="q-app" style="background: #eee">
    <div class="row items-center">
      <q-tabs
          v-model="currentTab"
          class="text-grey-9 shadow-5 full-width"
          activeColor="primary"
          indicatorColor="primary"
          narrowIndicator
          activeBgColor="blue-2"
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
    </div>

    <div v-if="currentTab === 'tasks'">
      <TasksActivity
          :desiredNoteId="desiredTaskId"
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
    getFromLocalStorage,
    saveToLocalStorage
  } from "src/utils";

  export default {
    name: 'App',
    components: {
      TasksActivity,
      MyTickets,
      Settings,
      SetAccountDetails
    },
    data()
    {
      return {
        currentTab: 'tasks',
        isLogDrawerOpen: false,
        activityCache: null,
        ticketCache: null,
        desiredNoteId: null,
        notesRenderIndex: 0,
        desiredTaskId: null,
        tasksRenderIndex: 0,
        appTabs: getFromLocalStorage('appTabs', true) || [
          {
            name: 'tasks',
            label: 'Tasks',
            active: true
          },
          {
            name: 'notes',
            label: 'Notes',
            active: true
          },
          // {
          //   name: 'activity',
          //   label: 'Activity',
          //   active: true
          // },
          {
            name: 'tickets',
            label: 'Tickets',
            active: true
          },
          // {
          //   name: 'wiki',
          //   label: 'Wiki',
          //   active: true
          // },
          // {
          //   name: 'git_history',
          //   label: 'Git Log',
          //   active: true
          // },
          // {
          //   name: 'events',
          //   label: 'Events',
          //   active: true
          // },
          {
            name: 'settings',
            label: 'Settings',
            active: true
          }
        ]
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
      hasAccount()
      {
        return getFromLocalStorage('user_account', true);
      }
    },
    mounted()
    {
      const appTabs = getFromLocalStorage('appTabs', true);

      if(!Object.keys(appTabs || {}).length)
      {
        saveToLocalStorage('appTabs', this.appTabs);
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
      width: 7px;
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
      width: 7px;
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