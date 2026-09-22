import pinia from '@/stores'
import { useAuthStore } from '@/stores/auth'
import { buildMenuRoutes } from './async-routes'

let menuRoutesSignature = ''

function getMenuRoutesSignature(menus) {
  return menus
    .flatMap((menu) => [menu.path, ...getMenuRoutesSignatureParts(menu.children || [])])
    .filter(Boolean)
    .join('|')
}

function getMenuRoutesSignatureParts(menus) {
  return menus.flatMap((menu) => [menu.path, ...getMenuRoutesSignatureParts(menu.children || [])])
}

function findMenuByPath(menus, path) {
  for (const menu of menus) {
    if (`/${String(menu.path || '').replace(/^\/+/, '')}` === path) return menu

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

    const nextMenuRoutesSignature = getMenuRoutesSignature(authStore.menus)
    if (nextMenuRoutesSignature !== menuRoutesSignature) {
      const menuRoutes = buildMenuRoutes(authStore.menus)
      menuRoutes.forEach((route) => {
        if (!router.hasRoute(route.name)) router.addRoute('admin-layout', route)
      })
      menuRoutesSignature = nextMenuRoutesSignature

      if (menuRoutes.some((route) => `/${route.path}` === to.path)) {
        return { path: to.fullPath, replace: true }
      }
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
