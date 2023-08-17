<template>
  <SimpleLayout :page-offset="100" :page-classes="['q-mx-sm']" header>
    <template #header-left> </template>
    <template #header-title> Settings </template>
    <template #header-right> </template>
    <template #page-content>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>GitLab token</h5>
          </q-item-section>
          <q-item-section>
            <q-input v-model="tokens.gitlab" type="password" filled placeholder="Gitlab token">
              <template #append>
                <div>
                  <q-btn icon="check" round dense color="secondary" @click="setToken('gitlab')" />
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
v-model="tokens.pivotal" :type="visibilityToggles.pivotalToken ? 'text' : 'password'"
              placeholder="Pivotal token" filled>
              <template #append>
                <div>
                  <q-btn icon="check" round dense color="secondary" @click="setToken('pivotal')" />
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
v-model="pivotalProjectId" :type="visibilityToggles.pivotalProjectId ? 'text' : 'password'"
              placeholder="Pivotal project ID" filled>
              <template #append>
                <div>
                  <q-btn icon="check" round dense color="secondary" @click="setSetting('pivotalProjectId')" />
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
            <q-input v-model="gitModuleBasePath" type="text" filled placeholder="Git base directory">
              <template #append>
                <div>
                  <q-btn icon="check" round dense color="secondary" @click="setSetting('gitModuleBasePath')" />
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
            <FirebaseConfigModal />
          </q-item-section>
        </q-item>
      </q-card>
<!--      <q-card v-if="$q.platform.is.desktop" class="q-mb-sm">-->
<!--        <q-item>-->
<!--          <q-item-section>-->
<!--            <h5>Backups</h5>-->
<!--          </q-item-section>-->
<!--          <q-item-section>-->
<!--            <SimpleModal full-width>-->
<!--              <template #title>-->
<!--                <h5>Backups</h5>-->
<!--              </template>-->
<!--              <template #activator="{ open }">-->
<!--                <q-btn label="Open backup handler" @click="open" />-->
<!--              </template>-->
<!--              <template #content>-->
<!--                &lt;!&ndash; <BackupHandler /> &ndash;&gt;-->
<!--              </template>-->
<!--            </SimpleModal>-->
<!--          </q-item-section>-->
<!--        </q-item>-->
<!--      </q-card>-->
      <div>
        <q-card class="q-mb-sm">
          <q-item>
            <q-item-section>
              <h5>User</h5>
            </q-item-section>
            <q-item-section>
              <q-btn label="Clear user" @click="isConfirmingUserDeletion = true" />
              <q-dialog v-model="isConfirmingUserDeletion">
                <q-card>
                  <q-item>
                    <q-item-section>
                      Really delete user? You will not be able to use the app until you log in again!
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-space />
                      <q-btn color="negative" @click="forgetUser">Delete</q-btn>
                    </q-item-section>
                  </q-item>
                </q-card>
              </q-dialog>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Theme</h5>
          </q-item-section>
          <q-item-section>
            <q-btn-group class="row full-width">
              <q-btn :disable="!$q.dark.isActive" label="Light mode" style="flex-grow: 1" @click="toggleDarkMode" />
              <q-btn
:disable="$q.dark.isActive" label="Dark mode" style="flex-grow: 1" :dark="true"
                @click="toggleDarkMode" />
            </q-btn-group>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Zoom</h5>
          </q-item-section>
          <q-item-section>
            <q-btn-group>
              <q-btn
color="primary" icon="remove" size="md" class="full-width" dense flat
                @click.stop.prevent="addZoom(-10)" />
              <q-btn :label="currentZoomLevel" no-caps />
              <q-btn
color="primary" icon="add" size="md" class="full-width" dense flat
                @click.stop.prevent="addZoom(10)" />
            </q-btn-group>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card v-if="appTabs" class="q-mb-sm">
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
                <q-btn label="Adjust tabs" @click="open" />
                <q-btn label="Adjust tabs" @click="open" />
              </template>
              <template #content>
                <q-item v-for="tab in appTabs" :key="tab.name">
                  <q-checkbox v-model="tab.active" :label="tab.label" :disable="tab.name === 'settings'" />
                </q-item>
                <q-item>
                  <q-space />
                  <q-btn label="Save" @click="saveAppTabs" />
                </q-item>
              </template>
            </SimpleModal>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card>
        <q-item>
          <q-item-section>
            <h5>Set item</h5>
          </q-item-section>
          <q-item-section>
            <q-input v-model="customSetting.label" class="q-mb-xs" type="text" filled dense />
            <q-input v-model="customSetting.value" class="q-mb-xs" type="text" filled dense />
            <q-btn icon="save" @click="setCustomValue" />
          </q-item-section>
        </q-item>
      </q-card>
    </template>
  </SimpleLayout>
</template>

<script>
import SimpleLayout from 'src/components/SimpleLayout.vue';
import SimpleModal from 'src/components/SimpleModal.vue';
import FirebaseConfigModal from 'src/components/FirebaseConfigModal.vue';
import { getFromLocalStorage, localStorageNames, saveToLocalStorage } from 'src/utils';
import { useThemeStore } from 'src/pinia/themeStore';

export default {
  name: 'SettingsManager',
  components: {
    SimpleModal,
    SimpleLayout,
    FirebaseConfigModal
  },
  data() {
    const settings = {
      tokens: {
        gitlab: getFromLocalStorage(localStorageNames.gitlabToken),
        pivotal: getFromLocalStorage(localStorageNames.pivotalToken),
      },
      pivotalProjectId: getFromLocalStorage(localStorageNames.pivotalProjectId),
      gitModuleBasePath: getFromLocalStorage(
        localStorageNames.gitModuleBasePath
      ),
      firebaseConfig: getFromLocalStorage(
        localStorageNames.firebase_config,
        true
      ) || {
        appId: '',
        apiKey: '',
        messagingSenderId: '',
        projectId: '',
        // computed from 'projectId':
        authDomain: '',
        databaseURL: '',
        storageBucket: '',
      },
    };
    const appTabs = getFromLocalStorage(localStorageNames.appTabs, true);

    return {
        settings,
        appTabs,
        customSetting: {
            label: '',
            value: '',
        },
        currentZoomLevel:
        document.getElementsByTagName('body')[0].style.zoom || '100%',
        isConfirmingUserDeletion: false,
        visibilityToggles: {
        pivotalProjectId: false,
        pivotalToken: false,
        appId: false,
        apiKey: false,
        projectId: false,
        messagingSenderId: false,
      },
    };
  },
  methods: {
    addZoom(amount) {
      const current = parseInt(this.currentZoomLevel.split('%')[0], 10);
      const zoomLevel = `${current + amount}%`;

      document.getElementsByTagName('body')[0].style.zoom = zoomLevel;
      this.currentZoomLevel = zoomLevel;
      saveToLocalStorage(localStorageNames.zoomLevel, zoomLevel);
    },
    toggleDarkMode() {
      const themes = useThemeStore();
      if (this.$q.dark.isActive) {
        themes.setLightMode();
        this.$q.dark.set(false);
      } else {
        themes.setDarkMode();
        this.$q.dark.set(true);
      }
    },
    setCustomValue() {
      if (!this.customSetting.label || !this.customSetting.value) {
        return;
      }

      saveToLocalStorage(this.customSetting.label, this.customSetting.value);
    },
    forgetUser() {
      saveToLocalStorage(localStorageNames.user_account, '');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    saveAppTabs() {
      if (Object.keys(this.appTabs || {}).length) {
        saveToLocalStorage(localStorageNames.appTabs, this.appTabs);
      }
    },
    setToken(service) {
      saveToLocalStorage(`${service}Token`, this.tokens[service]);
    },
    revertToken(service) {
      saveToLocalStorage(`${service}Token`, this.cache.tokens[service]);
    },
    setSetting(setting) {
      saveToLocalStorage(setting, this[setting]);
      this.cache[setting] = this[setting];
    },
    revertSetting(setting) {
      saveToLocalStorage(setting, this.cache[setting]);
      this[setting] = this.cache[setting];
    },
  },
};
</script>
