import { defineStore } from 'pinia'

const THEME_KEY = 'app-theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light',
  }),

  getters: {
    isDark: (state) => state.mode === 'dark',
  },

  actions: {
    apply() {
      document.documentElement.dataset.theme = this.mode
      document.documentElement.style.colorScheme = this.mode
    },

    toggle() {
      this.mode = this.isDark ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, this.mode)
      this.apply()
    },
  },
})
