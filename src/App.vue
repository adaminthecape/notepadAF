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
      >
        <q-tab name="notes" label="Notes" />
        <q-tab name="activity" label="My Activity" />
        <q-tab name="tickets" label="My Tickets" />
        <q-tab name="settings" label="Settings" />
        <q-space />

        <q-btn
            label="Log"
            dense
            flat
            @click="isLogDrawerOpen = true"
        />
      </q-tabs>
    </div>

    <div v-if="currentTab === 'notes'">
      <Notes />
    </div>
    <div v-if="currentTab === 'activity'">
      <MyActivity
          class="q-pa-md"
          :cachedActivity="activityCache"
          @updatedActivity="setActivityCache"
      />
    </div>
    <div v-if="currentTab === 'tickets'">
      <MyTickets
          class="q-pa-md"
          :cachedTickets="ticketCache"
          @updatedTickets="setActivityCache"
      />
    </div>
    <div v-if="currentTab === 'settings'">
      <Settings class="q-pa-md" />
    </div>

    <div v-if="isLogDrawerOpen" style="position: fixed; top: 0; right: 0; width: 400px; background: #66666680">
      <LogEntries
          class="q-pa-md"
          :logEntries="logEntries"
          @close="isLogDrawerOpen = false"
      />
    </div>
  </div>
</template>

<script>
  import Notes from './components/Notes';
  import MyActivity from './components/MyActivity';
  import MyTickets from './components/MyTickets';
  import Settings from './components/Settings';
  import LogEntries from './components/LogEntries';

  export default {
    name: 'App',
    components: {
      Notes,
      Settings,
      LogEntries,
      MyActivity,
      MyTickets
    },
    data()
    {
      const storedLogTypes = localStorage.getItem('logTypesToIgnore');

      return {
        currentTab: 'notes',
        logEntries: [],
        isLogDrawerOpen: false,
        activityCache: null,
        ticketCache: null
      };
    },
    provide()
    {
      return {
        $log: this.audit,
        $notify: this.notify,
        $debug: this.debug,
        $openLink: this.openInBrowser
      };
    },
    computed: {
    },
    // watch: {
    //   currentTab(newVal, oldVal)
    //   {
    //     this.audit(`Tab changed from "${oldVal}" to "${newVal}"`, { notify: true, timeout: 2000 });
    //   }
    // },
    methods: {
      openInBrowser(link)
      {
        const { shell } = require('electron');

        shell.openExternal(link);
      },
      setActivityCache(data)
      {
        this.activityCache = data;
      },
      setTicketCache(data)
      {
        this.ticketCache = data;
      },
      debug(...args)
      {
        console.info(...args);
        this.audit('debug', args[0]);
      },
      audit(type, msg, opts)
      {
        console.log('__AUDIT__', type, msg, opts);
        if(!opts)
        {
          opts = {};
        }

        if(opts.notify === false)
        {
          delete opts.notify;
        }
        else
        {
          const ignoreAllLogTypes = JSON.parse(localStorage.getItem('ignoreAllLogTypes'));
          const logTypesToIgnore = JSON.parse(localStorage.getItem('logTypesToIgnore'));

          if(
              !ignoreAllLogTypes &&
              (logTypesToIgnore && !logTypesToIgnore.includes(type))
          )
          {
            this.notify(msg, opts);
          }
        }

        if(this.logEntries)
        {
          this.logEntries.push({
            type,
            time: new Date().getTime(),
            msg,
            opts
          });
        }
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
    border: 1px solid #ccc;
    border-radius: 6px;
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