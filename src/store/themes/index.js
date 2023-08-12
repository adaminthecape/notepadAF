import Vue from 'vue';
import {
    getFromLocalStorage,
    localStorageNames, 
    saveToLocalStorage
} from "src/utils";
import { themeTypes } from 'src/constants.js';

const state = {
    activeTheme: getFromLocalStorage(localStorageNames.activeTheme) || themeTypes.light,
    themes: {
        light: {
            app: {
                background: '#EEE'
            }
        },
        dark: {
            app: {
                background: '#222'
            }
        }
    }
};

const mutations = {
    SET_ACTIVE_THEME(state, themeName)
    {
        Vue.set(state, localStorageNames.activeTheme, themeName);
        saveToLocalStorage(localStorageNames.activeTheme, themeName);
    }
};

const actions = {
    setLightMode({ commit })
    {
        commit('SET_ACTIVE_THEME', themeTypes.light);
    },
    setDarkMode({ commit })
    {
        commit('SET_ACTIVE_THEME', themeTypes.dark);
    }
};

const getters = {
    getActiveTheme: (state) => state.activeTheme,
    getActiveThemeData: (state) => state.themes[state.activeTheme]
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
