import axios from 'axios'
import { ElMessage } from 'element-plus'
const http = axios.create({ baseURL: '/api', timeout: 10000 })
http.interceptors.request.use((config) => { const token = localStorage.getItem('token'); if (token) config.headers.Authorization = token; return config })
http.interceptors.response.use((response) => { const result = response.data; if (result?.code === 1) { ElMessage.error(result.message || '请求失败'); return Promise.reject(new Error(result.message || '请求失败')) } return result?.data ?? result }, (error) => { const message = error.response?.status === 401 ? '登录已失效，请重新登录' : '网络请求失败，请检查后端服务'; if (error.response?.status === 401) localStorage.removeItem('token'); ElMessage.error(message); return Promise.reject(error) })
export default http
