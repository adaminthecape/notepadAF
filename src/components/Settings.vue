<template>
  <SimpleLayout header>
    <template #header-left>
    </template>
    <template #header-title>
      Settings
    </template>
    <template #header-right>
    </template>
    <template #page-content>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>GitLab token</h5>
          </q-item-section>
          <q-item-section>
            <q-input
                v-model="tokens.gitlab"
                type="password"
                filled
                placeholder="Gitlab token"
            >
              <template #append>
                <div>
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setToken('gitlab')"
                  />
                </div>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Pivotal token</h5>
          </q-item-section>
          <q-item-section>
            <q-input
                v-model="tokens.pivotal"
                type="password"
                filled
                placeholder="Pivotal token"
            >
              <template #append>
                <div>
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setToken('pivotal')"
                  />
                </div>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Pivotal project ID</h5>
          </q-item-section>
          <q-item-section>
            <q-input
                v-model="pivotalProjectId"
                type="password"
                filled
                placeholder="Pivotal project ID"
            >
              <template #append>
                <div>
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setSetting('pivotalProjectId')"
                  />
                </div>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Git base directory</h5>
          </q-item-section>
          <q-item-section>
            <q-input
                v-model="gitModuleBasePath"
                type="text"
                filled
                placeholder="Git base directory"
            >
              <template #append>
                <div>
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setSetting('gitModuleBasePath')"
                  />
                </div>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Firebase</h5>
          </q-item-section>
          <q-item-section>
            <SimpleModal fullWidth>
              <template #title>
                <h5>Firebase</h5>
              </template>
              <template #activator="{ open }">
                <q-btn
                    label="Set firebase config"
                    @click="open"
                />
                <br />
                <q-chip
                  v-if="!!firebaseConfig"
                  color="positive"
                  dark
                  square
                  dense
                >Firebase config applied</q-chip>
                <q-chip
                  v-else
                  color="negative"
                  dark
                  square
                  dense
                >No firebase config active!</q-chip>
              </template>
              <template #content>
                <q-card style="max-width:100%;">
                  <q-item>
                    <q-item-section>
                      <div class="q-mb-md">Paste your firebase configuration settings (including your API key) as a JSON object below.</div>
                      <q-input
                        v-model="firebaseConfig"
                        type="textarea"
                        filled
                      />
                      <q-card>
                        <q-item>
                          <q-item-section>
                            {{ firebaseConfig || 'none' }}
                          </q-item-section>
                        </q-item>
                      </q-card>
                      <q-btn
                        class="q-my-md"
                        @click="setFirebaseConfig()"
                      >Save</q-btn>
                    </q-item-section>
                  </q-item>
                </q-card>
              </template>
            </SimpleModal>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Backups</h5>
          </q-item-section>
          <q-item-section>
            <SimpleModal fullWidth>
              <template #title>
                <h5>Backups</h5>
              </template>
              <template #activator="{ open }">
                <q-btn
                    label="Open backup handler"
                    @click="open"
                />
              </template>
              <template #content>
                <BackupHandler />
              </template>
            </SimpleModal>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>User</h5>
          </q-item-section>
          <q-item-section>
            <q-btn
              label="Clear user"
              @click="forgetUser"
            />
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Set item</h5>
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="customSetting.label"
              type="text"
            />
            <q-input
              v-model="customSetting.value"
              type="text"
            />
            <q-btn
              icon="save"
              @click="setCustomValue"
            />
          </q-item-section>
        </q-item>
      </q-card>
      <q-card v-if="appTabs">
        <q-item>
          <q-item-section>
            <h5>Tabs</h5>
          </q-item-section>
          <q-item-section>
            <SimpleModal>
              <template #title>
                <h5>Tabs</h5>
              </template>
              <template #activator="{ open }">
                <q-btn
                    label="Adjust tabs"
                    @click="open"
                />
              </template>
              <template #content>
                <q-item
                    v-for="tab in appTabs"
                    :key="tab.name"
                >
                  <q-checkbox
                      v-model="tab.active"
                      :label="tab.label"
                      :disable="tab.name === 'settings'"
                  />
                </q-item>
                <q-item>
                  <q-space />
                  <q-btn
                      label="Save"
                      @click="saveAppTabs"
                  />
                </q-item>
              </template>
            </SimpleModal>
          </q-item-section>
        </q-item>
      </q-card>
    </template>
  </SimpleLayout>
</template>

<script>
import SimpleLayout from './SimpleLayout.vue';
import SimpleModal from './SimpleModal.vue';
import BackupHandler from "./BackupHandler.vue";
import { getFromLocalStorage, saveToLocalStorage } from "src/utils";

export default {
  name: 'Settings',
  components: {
    BackupHandler,
    SimpleModal,
    SimpleLayout
  },
  data()
  {
    const cache = {
      tokens: {
        gitlab: getFromLocalStorage('gitlabToken'),
        pivotal: getFromLocalStorage('pivotalToken')
      },
      pivotalProjectId: getFromLocalStorage('pivotalProjectId'),
      gitModuleBasePath: getFromLocalStorage('gitModuleBasePath'),
      firebaseConfig: getFromLocalStorage('firebase_config', true)
    };
    const appTabs = getFromLocalStorage('appTabs', true);

    return {
      cache,
      ...cache,
      appTabs,
      customSetting: {
        label: '',
        value: ''
      }
    };
  },
  methods: {
    setCustomValue()
    {
      if(
        !this.customSetting.label ||
        !this.customSetting.value
      )
      {
        return;
      }

      saveToLocalStorage(
        this.customSetting.label,
        this.customSetting.value
      );
    },
    forgetUser()
    {
      saveToLocalStorage('user_account', '');
      setTimeout(() =>
      {
        window.location.reload();
      }, 500);
    },
    saveAppTabs()
    {
      if(Object.keys(this.appTabs || {}).length)
      {
        saveToLocalStorage('appTabs', this.appTabs);
      }
    },
    setToken(service)
    {
      saveToLocalStorage(`${service}Token`, this.tokens[service]);
    },
    revertToken(service)
    {
      saveToLocalStorage(`${service}Token`, this.cache.tokens[service]);
    },
    setSetting(setting)
    {
      saveToLocalStorage(setting, this[setting]);
      this.cache[setting] = this[setting];
    },
    revertSetting(setting)
    {
      saveToLocalStorage(setting, this.cache[setting]);
      this[setting] = this.cache[setting];
    },
    setFirebaseConfig()
    {
      let config = this.firebaseConfig;

      if(!config)
      {
        return;
      }

      config = config
        .replace('appId: ', '"appId":')
        .replace('apiKey: ', '"apiKey":')
        .replace('authDomain: ', '"authDomain":')
        .replace('databaseURL: ', '"databaseURL":')
        .replace('messagingSenderId: ', '"messagingSenderId":')
        .replace('projectId: ', '"projectId":')
        .replace('storageBucket: ', '"storageBucket":')
        .replace(/\t/g, '')
        .replace(/"\n"/g, '",\n"');

      try
      {
        if(typeof config === 'string')
        {
          config = JSON.parse(config);
        }
      }
      catch(e)
      {
        console.warn(e);
      }

      if(!config || typeof config !== 'object')
      {
        return;
      }

      saveToLocalStorage('firebase_config', config);
    }
  }
};
</script>