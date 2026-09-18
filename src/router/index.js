import { createRouter, createWebHistory } from 'vue-router'
import { asyncRoutes } from './async-routes'
import { setupRouterGuard } from './guard'
import { staticRoutes } from './static-routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [...staticRoutes, ...asyncRoutes],
})

setupRouterGuard(router)

export default router
