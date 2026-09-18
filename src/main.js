import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.scss'
import App from './App.vue'
import pinia from './stores'
import { useThemeStore } from './stores/theme'
import router from './router'

useThemeStore(pinia).apply()
createApp(App).use(pinia).use(router).use(ElementPlus).mount('#app')
