import { defineStore } from 'pinia'
import AuthApi from '@/api/auth'
import { clearToken, getToken, hasRememberedToken, setToken } from '@/utils/token'

function collectMenuPaths(menus) {
  return menus
    .flatMap((menu) => [normalizeMenuPath(menu.path), ...collectMenuPaths(menu.children || [])])
    .filter(Boolean)
}

function normalizeMenuPath(path) {
  if (!path) return ''
  return `/${String(path).replace(/^\/+/, '')}`
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    remember: hasRememberedToken(),
    userInfo: null,
    menus: [],
    initialized: false,
    sessionPromise: null,
  }),

  getters: {
    roles: (state) => state.userInfo?.roles || [],
    menuPaths: (state) => collectMenuPaths(state.menus),
  },

  actions: {
    async login(credentials, remember = false) {
      const session = await AuthApi.login(credentials)
      this.token = session.token
      this.remember = remember
      setToken(session.token, remember)
      await this.loadSession()
    },

    async loadSession() {
      if (this.initialized) return
      if (this.sessionPromise) return this.sessionPromise

      this.sessionPromise = Promise.all([AuthApi.getUserInfo(), AuthApi.getMenus()])
        .then(([userInfo, menus]) => {
          this.userInfo = userInfo
          this.menus = menus || []
          this.initialized = true
        })
        .catch((error) => {
          this.clearSession()
          throw error
        })
        .finally(() => {
          this.sessionPromise = null
        })

      return this.sessionPromise
    },

    async logout() {
      let succeeded = true

      try {
        if (this.token) await AuthApi.logout()
      } catch {
        succeeded = false
      } finally {
        this.clearSession()
      }

      return succeeded
    },

    clearSession() {
      clearToken()
      this.token = ''
      this.remember = false
      this.userInfo = null
      this.menus = []
      this.initialized = false
      this.sessionPromise = null
    },
  },
})
