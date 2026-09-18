export const asyncRoutes = [
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true, skipMenuCheck: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          requiresAuth: true,
          roles: ['admin', 'user'],
        },
      },
      {
        path: 'system/users',
        name: 'system-users',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          requiresAuth: true,
          roles: ['admin'],
        },
      },
      {
        path: 'system/roles',
        name: 'system-roles',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
          requiresAuth: true,
          roles: ['admin'],
        },
      },
      {
        path: 'system/menus',
        name: 'system-menus',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'Menu',
          requiresAuth: true,
          roles: ['admin'],
        },
      },
    ],
  },
]
