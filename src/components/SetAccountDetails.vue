<template>
    <div style="display: flex; flex-direction: column;" class="q-pa-lg">
        <q-input
            v-model="email"
            type="email"
        />
        <q-input
            v-model="password"
            type="password"
        />
        <q-btn
            label="Log in"
            @click="setCredentials"
        />
    </div>
</template>

<script>
import { saveToLocalStorage } from 'src/utils';
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
            saveToLocalStorage('user_account', {
                email: this.email,
                password: this.password
            });

            window.location.reload();
        }
    }
};
</script>
