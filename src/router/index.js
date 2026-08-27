import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import UserView from '../views/UserView.vue'
import ArticleView from '../views/ArticleView.vue'
import CategoryView from '../views/CategoryView.vue'
const router = createRouter({ history:createWebHistory(), routes:[
  { path:'/login', name:'login', component:LoginView, meta:{ public:true } },
  { path:'/', component:AdminLayout, redirect:'/dashboard', children:[
    { path:'dashboard', name:'dashboard', component:DashboardView, meta:{ title:'首页' } },
    { path:'users', name:'users', component:UserView, meta:{ title:'用户管理' } },
    { path:'articles', name:'articles', component:ArticleView, meta:{ title:'文章管理' } },
    { path:'categories', name:'categories', component:CategoryView, meta:{ title:'分类管理' } },
  ] }, { path:'/:pathMatch(.*)*', redirect:'/dashboard' },
] })
router.beforeEach((to) => { const token=localStorage.getItem('token'); if (!to.meta.public && !token) return { name:'login' }; if(to.name==='login' && token) return { name:'dashboard' } })
export default router
