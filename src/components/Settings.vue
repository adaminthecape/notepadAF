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
                <div v-if="cache.tokens.gitlab !== tokens.gitlab">
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setToken('gitlab')"
                  />
                  <q-btn
                      icon="cancel"
                      round
                      dense
                      color="negative"
                      @click="revertToken('gitlab')"
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
                <div v-if="cache.tokens.pivotal !== tokens.pivotal">
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setToken('pivotal')"
                  />
                  <q-btn
                      icon="cancel"
                      round
                      dense
                      color="negative"
                      @click="revertToken('pivotal')"
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
                <div v-if="cache.pivotalProjectId !== pivotalProjectId">
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setSetting('pivotalProjectId')"
                  />
                  <q-btn
                      icon="cancel"
                      round
                      dense
                      color="negative"
                      @click="revertSetting('pivotalProjectId')"
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
                <div v-if="cache.gitModuleBasePath !== gitModuleBasePath">
                  <q-btn
                      icon="check"
                      round
                      dense
                      color="secondary"
                      @click="setSetting('gitModuleBasePath')"
                  />
                  <q-btn
                      icon="cancel"
                      round
                      dense
                      color="negative"
                      @click="revertSetting('gitModuleBasePath')"
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
import Pivotal from '../mixins/Pivotal.js';
import DbMixin from '../mixins/jsondb.js';
import GitMixin from '../mixins/git.js';
import SimpleLayout from './SimpleLayout.vue';
import SimpleModal from './SimpleModal.vue';
import { getFromLocalStorage, saveToLocalStorage } from "src/utils";
import BackupHandler from "./BackupHandler.vue";
// import PivotalAction from './PivotalAction';

export default {
  name: 'Settings',
  components: {
    BackupHandler,
    SimpleModal,
    SimpleLayout
  },
  mixins: [Pivotal, GitMixin, DbMixin],
  props: {},
  inject: ['$log'],
  data()
  {
    const cache = {
      tokens: {
        gitlab: getFromLocalStorage('gitlabToken'),
        pivotal: getFromLocalStorage('pivotalToken')
      },
      pivotalProjectId: getFromLocalStorage('pivotalProjectId'),
      gitModuleBasePath: getFromLocalStorage('gitModuleBasePath')
    };

    let appTabs;

    try
    {
      appTabs = JSON.parse(localStorage.getItem('appTabs'));
    }
    catch(e)
    {
      console.warn(e);
    }

    return {
      cache,
      ...cache,
      appTabs
    };
  },
  computed: {
  },
  async mounted()
  {
  },
  methods: {
    saveAppTabs()
    {
      if(Object.keys(this.appTabs || {}).length)
      {
        console.info('saving tabs:', this.appTabs);

        localStorage.setItem('appTabs', JSON.stringify(this.appTabs));
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
    }
  }
};
</script>