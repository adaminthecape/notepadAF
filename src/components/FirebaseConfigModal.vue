<template>
    <SimpleModal full-width>
        <template #title>
            <h5>Firebase</h5>
        </template>
        <template #activator="{ open }">
            <q-btn label="Set firebase config" @click="open" />
            <br />
            <q-chip v-if="!!firebaseConfig" color="positive" dark square dense>Firebase config applied</q-chip>
            <q-chip v-else color="negative" dark square dense>No firebase config active!</q-chip>
        </template>
        <template #content>
            <q-card style="max-width: 100%">
                <q-item>
                    <q-item-section>
                        <q-input
                            v-model="firebaseConfig.appId" :type="visibilityToggles.appId ? 'text' : 'password'"
                            label="App ID" filled>
                            <template #append>
                                <q-icon
                                    :name="visibilityToggles.appId ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                    @click="visibilityToggles.appId = !visibilityToggles.appId" />
                            </template>
                        </q-input>
                        <q-input
                            v-model="firebaseConfig.apiKey" :type="visibilityToggles.apiKey ? 'text' : 'password'"
                            label="API Key" filled>
                            <template #append>
                                <q-icon
                                    :name="visibilityToggles.apiKey ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer" @click="visibilityToggles.apiKey = !visibilityToggles.apiKey" />
                            </template>
                        </q-input>
                        <q-input
                            v-model="firebaseConfig.messagingSenderId"
                            :type="visibilityToggles.messagingSenderId ? 'text' : 'password'" label="Messaging Sender ID"
                            filled>
                            <template #append>
                                <q-icon
                                    :name="visibilityToggles.messagingSenderId ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="visibilityToggles.messagingSenderId = !visibilityToggles.messagingSenderId" />
                            </template>
                        </q-input>
                        <q-input
                            v-model="firebaseConfig.projectId"
                            :type="visibilityToggles.projectId ? 'text' : 'password'" label="Project ID" filled
                            @input="computeFirebaseVars">
                            <template #append>
                                <q-icon
                                    :name="visibilityToggles.projectId ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer" @click="visibilityToggles.projectId = !visibilityToggles.projectId" />
                            </template>
                        </q-input>
                        <q-btn class="q-my-md" @click="setFirebaseConfig()">Save</q-btn>
                    </q-item-section>
                </q-item>
            </q-card>
        </template>
    </SimpleModal>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { getFromLocalStorage, localStorageNames, saveToLocalStorage } from 'src/utils';

const SimpleModal = defineAsyncComponent(() =>
    import('src/components/SimpleModal.vue'));

const firebaseConfig = ref<Record<string, any>>(getFromLocalStorage(
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
});
const visibilityToggles = ref<Record<string, boolean>>({
    appId: false,
    apiKey: false,
    projectId: false,
    messagingSenderId: false,
});

function setFirebaseConfig()
{
    let config = firebaseConfig.value;

    if (!config) {
        return;
    }

    firebaseConfig.value.authDomain = `${config.projectId}.firebaseapp.com`;
    firebaseConfig.value.databaseURL = `${config.projectId}.firebaseio.com`;
    firebaseConfig.value.storageBucket = `${config.projectId}.appspot.com`;

    try {
        if (typeof config === 'string') {
            config = JSON.parse(config);
        }
    } catch (e) {
        console.warn(e);
    }

    if (!config || typeof config !== 'object') {
        return;
    }

    saveToLocalStorage(localStorageNames.firebase_config, config);
}
</script>