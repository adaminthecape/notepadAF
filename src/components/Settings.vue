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
              :type="visibilityToggles.pivotalToken ? 'text' : 'password'"
              placeholder="Pivotal token"
              filled
            >
              <template #append>
                <q-icon
                  :name="
                    visibilityToggles.pivotalToken
                      ? 'visibility_off'
                      : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="
                    visibilityToggles.pivotalToken =
                      !visibilityToggles.pivotalToken
                  "
                />
                <q-btn
                  icon="check"
                  round
                  dense
                  color="secondary"
                    @click="setToken('pivotal')"
                />
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
              :type="visibilityToggles.pivotalProjectId ? 'text' : 'password'"
              placeholder="Pivotal project ID"
              filled
            >
              <template #append>
                <q-icon
                  :name="
                    visibilityToggles.pivotalProjectId
                      ? 'visibility_off'
                      : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="
                    visibilityToggles.pivotalProjectId =
                      !visibilityToggles.pivotalProjectId
                  "
                />
                <q-btn
                  icon="check"
                  round
                  dense
                  color="secondary"
                  @click="setSetting('pivotalProjectId')"
                />
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
                <q-btn label="Set firebase config" @click="open" />
                <br />
                <q-chip
                  v-if="!!firebaseConfig"
                  color="positive"
                  dark
                  square
                  dense
                  >Firebase config applied</q-chip
                >
                <q-chip v-else color="negative" dark square dense
                  >No firebase config active!</q-chip
                >
              </template>
              <template #content>
                <q-card style="max-width: 100%">
                  <q-item>
                    <q-item-section>
                      <q-input
                        v-model="firebaseConfig.appId"
                        :type="visibilityToggles.appId ? 'text' : 'password'"
                        label="App ID"
                        filled
                      >
                        <template #append>
                          <q-icon
                            :name="
                              visibilityToggles.appId
                                ? 'visibility_off'
                                : 'visibility'
                            "
                            class="cursor-pointer"
                            @click="
                              visibilityToggles.appId = !visibilityToggles.appId
                            "
                          />
                        </template>
                      </q-input>
                      <q-input
                        v-model="firebaseConfig.apiKey"
                        :type="visibilityToggles.apiKey ? 'text' : 'password'"
                        label="API Key"
                        filled
                      >
                        <template #append>
                          <q-icon
                            :name="
                              visibilityToggles.apiKey
                                ? 'visibility_off'
                                : 'visibility'
                            "
                            class="cursor-pointer"
                            @click="
                              visibilityToggles.apiKey =
                                !visibilityToggles.apiKey
                            "
                          />
                        </template>
                      </q-input>
                      <q-input
                        v-model="firebaseConfig.messagingSenderId"
                        :type="
                          visibilityToggles.messagingSenderId
                            ? 'text'
                            : 'password'
                        "
                        label="Messaging Sender ID"
                        filled
                      >
                        <template #append>
                          <q-icon
                            :name="
                              visibilityToggles.messagingSenderId
                                ? 'visibility_off'
                                : 'visibility'
                            "
                            class="cursor-pointer"
                            @click="
                              visibilityToggles.messagingSenderId =
                                !visibilityToggles.messagingSenderId
                            "
                          />
                        </template>
                      </q-input>
                      <q-input
                        v-model="firebaseConfig.projectId"
                        :type="
                          visibilityToggles.projectId ? 'text' : 'password'
                        "
                        label="Project ID"
                        filled
                        @input="computeFirebaseVars"
                      >
                        <template #append>
                          <q-icon
                            :name="
                              visibilityToggles.projectId
                                ? 'visibility_off'
                                : 'visibility'
                            "
                            class="cursor-pointer"
                            @click="
                              visibilityToggles.projectId =
                                !visibilityToggles.projectId
                            "
                          />
                        </template>
                      </q-input>
                      <q-btn class="q-my-md" @click="setFirebaseConfig()"
                        >Save</q-btn
                      >
                    </q-item-section>
                  </q-item>
                </q-card>
              </template>
            </SimpleModal>
          </q-item-section>
        </q-item>
      </q-card>
      <q-card v-if="$q.platform.is.desktop" class="q-mb-sm">
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
                <q-btn label="Open backup handler" @click="open" />
              </template>
              <template #content>
                <BackupHandler />
              </template>
            </SimpleModal>
          </q-item-section>
        </q-item>
      </q-card>
      <div>
        <!--<q-card class="q-mb-sm">-->
        <!--  <q-item>-->
        <!--    <q-item-section>-->
        <!--      <h5>User</h5>-->
        <!--    </q-item-section>-->
        <!--    <q-item-section>-->
        <!--      <q-btn-->
        <!--        label="Clear user"-->
        <!--        @click="isConfirmingUserDeletion = true"-->
        <!--      />-->
        <!--      <q-dialog v-model="isConfirmingUserDeletion">-->
        <!--        <q-card>-->
        <!--          <q-item>-->
        <!--            <q-item-section>-->
        <!--              Really delete user? You will not be able to use the app until you log in again!-->
        <!--            </q-item-section>-->
        <!--          </q-item>-->
        <!--          <q-item>-->
        <!--            <q-item-section>-->
        <!--              <q-space />-->
        <!--              <q-btn-->
        <!--                  color="negative"-->
        <!--                  @click="forgetUser"-->
        <!--              >Delete</q-btn>-->
        <!--            </q-item-section>-->
        <!--          </q-item>-->
        <!--        </q-card>-->
        <!--      </q-dialog>-->
        <!--    </q-item-section>-->
        <!--  </q-item>-->
        <!--</q-card>-->
      </div>
      <q-card class="q-mb-sm">
        <q-item>
          <q-item-section>
            <h5>Theme</h5>
          </q-item-section>
          <q-item-section>
            <q-btn-group class="row full-width">
              <q-btn
                :disable="!$q.dark.isActive"
                label="Light mode"
                style="flex-grow: 1"
                @click="toggleDarkMode"
              />
              <q-btn
                :disable="$q.dark.isActive"
                label="Dark mode"
                style="flex-grow: 1"
                :dark="true"
                @click="toggleDarkMode"
              />
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
                color="primary"
                icon="remove"
                size="md"
                class="full-width"
                dense
                flat
                @click.stop.prevent="addZoom(-10)"
              />
              <q-btn :label="currentZoomLevel" no-caps />
              <q-btn
                color="primary"
                icon="add"
                size="md"
                class="full-width"
                dense
                flat
                @click.stop.prevent="addZoom(10)"
              />
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
                  <q-checkbox
                    v-model="tab.active"
                    :label="tab.label"
                    :disable="tab.name === 'settings'"
                  />
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
            <q-input
              v-model="customSetting.label"
              class="q-mb-xs"
              type="text"
              filled
              dense
            />
            <q-input
              v-model="customSetting.value"
              class="q-mb-xs"
              type="text"
              filled
              dense
            />
            <q-btn icon="save" @click="setCustomValue" />
          </q-item-section>
        </q-item>
      </q-card>
    </template>
  </SimpleLayout>
</template>

<script>
import SimpleLayout from "./SimpleLayout.vue";
import SimpleModal from "./SimpleModal.vue";
import BackupHandler from "./BackupHandler.vue";
import {
  getFromLocalStorage,
  localStorageNames,
  saveToLocalStorage,
} from "src/utils";

export default {
  name: "Settings",
  components: {
    BackupHandler,
    SimpleModal,
    SimpleLayout,
  },
  data() {
    const cache = {
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
        appId: "",
        apiKey: "",
        messagingSenderId: "",
        projectId: "",
        // computed from 'projectId':
        authDomain: "",
        databaseURL: "",
        storageBucket: "",
      },
    };
    const appTabs = getFromLocalStorage(localStorageNames.appTabs, true);

    return {
      cache,
      ...cache,
      appTabs,
      customSetting: {
        label: "",
        value: "",
      },
      currentZoomLevel:
        document.getElementsByTagName("body")[0].style.zoom || "100%",
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
    computeFirebaseVars(val) {
      if (typeof val !== "string") {
        return;
      }

      this.firebaseConfig.authDomain = `${val}.firebaseapp.com`;
      this.firebaseConfig.databaseURL = `${val}.firebaseio.com`;
      this.firebaseConfig.storageBucket = `${val}.appspot.com`;
    },
    addZoom(amount) {
      const current = parseInt(this.currentZoomLevel.split("%")[0], 10);
      const zoomLevel = `${current + amount}%`;

      document.getElementsByTagName("body")[0].style.zoom = zoomLevel;
      this.currentZoomLevel = zoomLevel;
      saveToLocalStorage(localStorageNames.zoomLevel, zoomLevel);
    },
    toggleDarkMode() {
      if (this.$q.dark.isActive) {
        this.$store.dispatch("themes/setLightMode");
        this.$q.dark.set(false);
      } else {
        this.$store.dispatch("themes/setDarkMode");
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
      saveToLocalStorage(localStorageNames.user_account, "");
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
    setFirebaseConfig() {
      let config = this.firebaseConfig;

      if (!config) {
        return;
      }

      // config = config
      //   .replace('appId: ', '"appId":')
      //   .replace('apiKey: ', '"apiKey":')
      //   .replace('authDomain: ', '"authDomain":')
      //   .replace('databaseURL: ', '"databaseURL":')
      //   .replace('messagingSenderId: ', '"messagingSenderId":')
      //   .replace('projectId: ', '"projectId":')
      //   .replace('storageBucket: ', '"storageBucket":')
      //   .replace(/\t/g, '')
      //   .replace(/"\n"/g, '",\n"');

      try {
        if (typeof config === "string") {
          config = JSON.parse(config);
        }
      } catch (e) {
        console.warn(e);
      }

      if (!config || typeof config !== "object") {
        return;
      }

      saveToLocalStorage(localStorageNames.firebase_config, config);
    },
  },
};
</script>
