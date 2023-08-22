<template>
  <SimpleLayout :page-offset="100" :page-classes="['q-mx-sm']" header>
    <template #header-left> </template>
    <template #header-title> Settings </template>
    <template #header-right><AppTabSelector /></template>
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
              <q-btn :disable="!Dark.isActive" label="Light mode" style="flex-grow: 1" @click="toggleDarkMode" />
              <q-btn
:disable="Dark.isActive" label="Dark mode" style="flex-grow: 1" :dark="true"
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

<script setup lang="ts">
import { getFromLocalStorage, LocalStorageName, saveToLocalStorage } from 'src/utils';
import { defineAsyncComponent, ref } from 'vue';
import useThemeStore from 'src/pinia/themeStore';
import { Dark } from 'quasar';

import AppTabSelector from 'src/components/AppTabSelector.vue';
import SimpleLayout from 'src/components/SimpleLayout.vue';
const SimpleModal = defineAsyncComponent(() => import('src/components/SimpleModal.vue'));
const FirebaseConfigModal = defineAsyncComponent(() => import('src/components/FirebaseConfigModal.vue'));
const themeStore = useThemeStore();

const tokens = ref({
  gitlab: getFromLocalStorage(LocalStorageName.gitlabToken),
  pivotal: getFromLocalStorage(LocalStorageName.pivotalToken),
});
const pivotalProjectId = ref(getFromLocalStorage(LocalStorageName.pivotalProjectId));
const gitModuleBasePath = ref(getFromLocalStorage(
  LocalStorageName.gitModuleBasePath
));
const appTabs = ref(getFromLocalStorage(LocalStorageName.appTabs, true));
const customSetting = ref({
  label: '',
  value: '',
});
const currentZoomLevel = ref((document.getElementsByTagName('body')[0].style as any).zoom || '100%');
const isConfirmingUserDeletion = ref(false);
const visibilityToggles = ref({
  pivotalProjectId: false,
  pivotalToken: false,
  appId: false,
  apiKey: false,
  projectId: false,
  messagingSenderId: false,
});

function addZoom(amount: number) {
  const current = parseInt(currentZoomLevel.value.split('%')[0], 10);
  const zoomLevel = `${current + amount}%`;

  (document.getElementsByTagName('body')[0].style as any).zoom = zoomLevel;
  currentZoomLevel.value = zoomLevel;
  saveToLocalStorage(LocalStorageName.zoomLevel, zoomLevel);
}
function toggleDarkMode() {
  if (Dark.isActive) {
    themeStore.setLightMode();
    Dark.set(false);
  } else {
    themeStore.setDarkMode();
    Dark.set(true);
  }
}
function setCustomValue() {
  if (!customSetting.value.label || !customSetting.value.value) {
    return;
  }

  if (LocalStorageName[customSetting.value.label as LocalStorageName]) {
    saveToLocalStorage(
      customSetting.value.label as LocalStorageName,
      customSetting.value.value
    );
  }
}
function forgetUser() {
  saveToLocalStorage(LocalStorageName.user_account, '');
  setTimeout(() => {
    window.location.reload();
  }, 500);
}
function saveAppTabs() {
  if (Object.keys(appTabs.value || {}).length) {
    saveToLocalStorage(LocalStorageName.appTabs, appTabs.value);
  }
}
function setToken(service: 'gitlab' | 'pivotal') {
  saveToLocalStorage(
    `${service}Token` as LocalStorageName,
    tokens.value[service]
  );
}
function setSetting(name: string) {
  switch (name) {
    case 'pivotalProjectId':
      saveToLocalStorage(LocalStorageName.pivotalProjectId, pivotalProjectId.value);
      break;
    case 'gitModuleBasePath':
      saveToLocalStorage(LocalStorageName.gitModuleBasePath, gitModuleBasePath.value);
    default:
      break;
  }
}
</script>
