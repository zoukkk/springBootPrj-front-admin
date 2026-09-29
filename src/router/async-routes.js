import PendingMenuView from '@/views/error/PendingMenuView.vue'

const menuRouteMap = {
  // Dynamic menu visibility is already filtered by /api/auth/menus. Keeping
  // role names here would reject custom roles that were granted the menu.
  dashboard: () => ({ component: () => import('@/views/dashboard/index.vue'), meta: { title: '首页', icon: 'HomeFilled' } }),
  user: () => ({ component: () => import('@/views/system/user/index.vue'), meta: { title: '用户管理', icon: 'User' } }),
  'system/users': () => ({ component: () => import('@/views/system/user/index.vue'), meta: { title: '用户管理', icon: 'User' } }),
  'system/role': () => ({ component: () => import('@/views/system/role/index.vue'), meta: { title: '角色管理', icon: 'UserFilled' } }),
  'system/roles': () => ({ component: () => import('@/views/system/role/index.vue'), meta: { title: '角色管理', icon: 'UserFilled' } }),
  'system/menus': () => ({ component: () => import('@/views/system/menu/index.vue'), meta: { title: '菜单管理', icon: 'Menu' } }),
  depts: () => ({ component: () => import('@/views/faction/index.vue'), meta: { title: '阵营管理', icon: 'OfficeBuilding' } }),
  position: () => ({ component: () => import('@/views/position/index.vue'), meta: { title: '岗位管理', icon: 'Postcard' } }),
  employee: () => ({ component: () => import('@/views/employee/index.vue'), meta: { title: '员工管理', icon: 'User' } }),
}

function normalizePath(path = '') {
  return `/${String(path).replace(/^\/+|\/+$/g, '')}`
}

function getRouteKey(path) {
  return normalizePath(path).slice(1)
}

function getRouteName(path) {
  return `menu-${getRouteKey(path).replace(/[^a-zA-Z0-9_-]/g, '-') || 'root'}`
}

function createMenuRoute(menu) {
  const fullPath = normalizePath(menu.path)
  const routeKey = getRouteKey(fullPath)
  const definition = menuRouteMap[routeKey]?.() || {
    component: PendingMenuView,
    meta: { title: menu.name || '页面待建设', icon: menu.icon || 'Menu', menuFallback: true },
  }

  return {
    path: fullPath.slice(1),
    name: getRouteName(fullPath),
    component: definition.component,
    meta: {
      requiresAuth: true,
      ...definition.meta,
      title: menu.name || definition.meta?.title || '页面待建设',
      icon: menu.icon || definition.meta?.icon || 'Menu',
      menuFallback: !menuRouteMap[routeKey],
    },
  }
}

function flattenMenus(menus = []) {
  return menus.flatMap((menu) => [menu, ...flattenMenus(menu.children || [])])
}

export function buildMenuRoutes(menus = []) {
  const seen = new Set()
  return flattenMenus(menus)
    .filter((menu) => menu.path)
    .map(createMenuRoute)
    .filter((route) => {
      if (seen.has(route.path)) return false
      seen.add(route.path)
      return true
    })
}

export const asyncRoutes = [
  {
    path: '/',
    name: 'admin-layout',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: ':pathMatch(.*)*',
        name: 'authorized-menu-fallback',
        component: PendingMenuView,
        meta: { title: '页面待建设', icon: 'Menu', requiresAuth: true, menuFallback: true },
      },
    ],
  },
]

export { menuRouteMap }
