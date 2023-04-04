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
    </template>
  </SimpleLayout>
</template>

<script>
import Pivotal from '../mixins/Pivotal';
import DbMixin from '../mixins/jsondb';
import GitMixin from '../mixins/git';
import SimpleLayout from './SimpleLayout';
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
    return {
      cache: {
        tokens: {
          gitlab: localStorage.getItem('gitlabToken'),
          pivotal: localStorage.getItem('pivotalToken')
        },
        pivotalProjectId: localStorage.getItem('pivotalProjectId')
      },
      pivotalProjectId: localStorage.getItem('pivotalProjectId'),
      tokens: {
        gitlab: localStorage.getItem('gitlabToken'),
        pivotal: localStorage.getItem('pivotalToken')
      }
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
      localStorage.setItem(`${service}Token`, this.tokens[service]);
    },
    revertToken(service)
    {
      localStorage.setItem(`${service}Token`, this.cache.tokens[service]);
    },
    setSetting(setting)
    {
      console.log('setSetting', setting);
      localStorage.setItem(setting, this[setting]);
      this.cache[setting] = this[setting];
      this.$log('setting', `set setting "${setting}" to ${this[setting]}`);
      console.log(`set setting "${setting}" to ${this[setting]}`);
    },
    revertSetting(setting)
    {
      localStorage.setItem(setting, this.cache[setting]);
    }
  }
};
</script>