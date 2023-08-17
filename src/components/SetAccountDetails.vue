<template>
    <div style="display: flex; flex-direction: column;" class="q-pa-lg">
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

<script setup>
import { ref } from 'vue';
import { localStorageNames, saveToLocalStorage } from 'src/utils.js';

const email = ref('');
const password = ref('');

function setCredentials() {
  saveToLocalStorage(localStorageNames.user_account, {
    email: email.value,
    password: password.value
  });

  window.location.reload();
}
</script>
