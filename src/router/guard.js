import pinia from '@/stores'
import { useAuthStore } from '@/stores/auth'

function hasRequiredRole(route, roles) {
  const requiredRoles = route.meta.roles
  return !requiredRoles?.length || requiredRoles.some((role) => roles.includes(role))
}

function isAuthorizedMenu(route, menuPaths) {
  return route.meta.skipMenuCheck || menuPaths.includes(route.path)
}

export function setupRouterGuard(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore(pinia)

    if (to.meta.public) {
      if (!authStore.token) return true

      try {
        await authStore.loadSession()
        return { name: 'dashboard' }
      } catch {
        return true
      }
    }

    if (!authStore.token) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    try {
      await authStore.loadSession()
    } catch {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (!hasRequiredRole(to, authStore.roles) || !isAuthorizedMenu(to, authStore.menuPaths)) {
      return to.name === 'forbidden' ? true : { name: 'forbidden' }
    }

    return true
  })
}
