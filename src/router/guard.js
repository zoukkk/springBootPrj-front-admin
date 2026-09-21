import pinia from '@/stores'
import { useAuthStore } from '@/stores/auth'

function findMenuByPath(menus, path) {
  for (const menu of menus) {
    if (menu.path === path) return menu

    const matched = findMenuByPath(menu.children || [], path)
    if (matched) return matched
  }

  return null
}

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

    if (to.meta.menuFallback) {
      const menu = findMenuByPath(authStore.menus, to.path)

      if (menu) {
        to.meta.title = menu.name
        to.meta.icon = menu.icon || 'Menu'
      }
    }

    if (!hasRequiredRole(to, authStore.roles) || !isAuthorizedMenu(to, authStore.menuPaths)) {
      return to.name === 'forbidden' ? true : { name: 'forbidden' }
    }

    return true
  })
}
