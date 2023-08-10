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

<script>
import { localStorageNames, saveToLocalStorage } from "src/utils";
export default {
    data()
    {
        return {
            email: '',
            password: ''
        };
    },
    methods: {
        setCredentials()
        {
            saveToLocalStorage(localStorageNames.user_account, {
                email: this.email,
                password: this.password
            });

            window.location.reload();
        }
    }
};
</script>
