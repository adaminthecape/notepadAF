<template>
  <div id="q-app" style="background: #eee">
    <div class="row items-center">
      <q-tabs
          v-model="currentTab"
          class="text-grey-9 shadow-5 full-width"
          activeColor="primary"
          indicatorColor="primary"
          align="left"
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
    <div v-if="currentTab === 'notes'">
      <Notes
          :desiredNoteId="desiredNoteId"
          :key="notesRenderIndex"
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
  import Notes from './components/Notes';
  import TasksActivity from './components/TasksActivity';
  import MyTickets from './components/MyTickets';
  import Settings from './components/Settings';
  import { cudTask, getFromLocalStorage, openInBrowser, saveToLocalStorage } from "src/utils";
  import { v4 as uuidv4 } from 'uuid';

  export default {
    name: 'App',
    components: {
      Notes,
      Settings,
      MyTickets,
      TasksActivity
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
        $notify: this.notify,
        $openLink: openInBrowser,
        $openNote: this.openNote,
        $openTab: this.openTab,
        $addOrUpdateTask: this.addOrUpdateTask
      };
    },
    computed: {
      activeAppTabs()
      {
        return this.appTabs.filter((t) => t.active);
      },
      tasksList()
      {
        const note = this.$store.getters['notes/getNote']('tasks');

        if(note)
        {
          return note.tasks.map((t) => ({ ...t, id: t.id || uuidv4() }));
        }

        return null;
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
      /**
       * Update task via db interface. Do NOT use any other fn to dispatch task updates,
       * unless it goes through this.
       * @param {Object} taskData
       * @param {boolean} deleteTask
       */
      async addOrUpdateTask(taskData, deleteTask = false)
      {
        const storeFn = async (tasks) =>
        {
          await this.$store.dispatch('notes/update', {
            note: {
              id: 'tasks',
              tasks
            }
          })
        };

        await cudTask(
            this.tasksList,
            storeFn,
            taskData,
            deleteTask
        );
      },
      openNote(noteId)
      {
        this.desiredNoteId = noteId;
        this.currentTab = 'notes';
        this.notesRenderIndex += 1;
      },
      openTab(tab)
      {
        this.currentTab = tab;
      },
      setActivityCache(data)
      {
        this.activityCache = data;
      },
      setTicketCache(data)
      {
        this.ticketCache = data;
      },
      notify(message, opts, action)
      {
        opts = opts ?
            {
              progress: typeof opts.progress === 'boolean' ? opts.progress : true,
              timeout: opts.timeout || 2000,
              position: opts.progress || 'bottom',
              color: opts.color || 'primary'
            } :
            {
              progress: true,
              timeout: 2000,
              position: 'bottom',
              color: 'primary'
            };

        this.$q.notify({
          message,
          color: opts.color,
          position: opts.position,
          timeout: opts.timeout,
          progress: opts.progress,
          actions: !action ? undefined : [
            {
              label: action.label,
              color: 'negative',
              handler: () =>
              {
                this.$q.dialog({
                  title: action.title,
                  message: action.message,
                  cancel: true,
                  persistent: true
                })
                    .onOk(() =>
                    {
                      if(typeof action.onSuccess === 'function')
                      {
                        action.onSuccess();
                      }
                    })
                    .onCancel(() =>
                    {
                      if(typeof action.onCancel === 'function')
                      {
                        action.onCancel();
                      }
                    });
              }
            },
            {
              label: 'Dismiss',
              color: 'white'
            }
          ]
        });
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