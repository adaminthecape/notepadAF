import { defineStore } from 'pinia';
import {
  getFromLocalStorage,
  LocalStorageName,
  saveToLocalStorage,
} from 'src/utils';

type RootState = {
  activeTheme: string;
};

const useThemeStore = defineStore('themeStore', {
  state: () =>
    ({
      activeTheme: getFromLocalStorage(LocalStorageName.activeTheme) || 'light',
    } as RootState),
  getters: {
    getActiveTheme: (state) => state.activeTheme,
  },
  actions: {
    setLightMode() {
      this.SET_ACTIVE_THEME('light');
    },
    setDarkMode() {
      this.SET_ACTIVE_THEME('dark');
    },
    SET_ACTIVE_THEME(themeName: string) {
      this.activeTheme = themeName;
      saveToLocalStorage(LocalStorageName.activeTheme, themeName);
    },
  },
});

export default useThemeStore;
