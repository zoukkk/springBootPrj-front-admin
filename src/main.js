import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.scss'
import App from './App.vue'
import pinia from './stores'
import { useThemeStore } from './stores/theme'
import router from './router'
import zhCn from "element-plus/es/locale/lang/zh-cn";

useThemeStore(pinia).apply()
createApp(App).use(pinia).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')
