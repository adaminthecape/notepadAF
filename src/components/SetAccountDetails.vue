<template>
    <div style="display: flex; flex-direction: column;" class="q-pa-lg">
        <div class="q-pa-sm">
            <FirebaseConfigModal />
        </div>
        <q-input
            v-model="email"
            type="email"
            class="q-mb-md"
            filled
        />
        <q-input
            v-model="password"
            type="password"
            class="q-mb-md"
            filled
        />
        <q-btn
            label="Log in"
            @click="setCredentials"
        />
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { LocalStorageName, saveToLocalStorage } from 'src/utils';

const FirebaseConfigModal = defineAsyncComponent(() =>
  import('src/components/FirebaseConfigModal.vue'));

const email = ref('');
const password = ref('');

function setCredentials() {
  saveToLocalStorage(LocalStorageName.user_account, {
    email: email.value,
    password: password.value
  });

  window.location.reload();
}
</script>
