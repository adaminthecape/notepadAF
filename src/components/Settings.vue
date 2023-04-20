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
    </template>
  </SimpleLayout>
</template>

<script>
import Pivotal from '../mixins/Pivotal';
import DbMixin from '../mixins/jsondb';
import GitMixin from '../mixins/git';
import SimpleLayout from './SimpleLayout';
import { getFromLocalStorage, saveToLocalStorage } from "src/utils";
// import PivotalAction from './PivotalAction';

export default {
  name: 'Settings',
  components: {
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

    return {
      cache,
      ...cache
    };
  },
  computed: {
  },
  async mounted()
  {
  },
  methods: {
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