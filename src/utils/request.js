import axios from 'axios'
import { ElMessage } from 'element-plus'
import { clearToken, getToken } from '@/utils/token'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

let redirectingToLogin = false

request.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    const result = response.data

    if (result?.code !== 0) {
      const message = result?.message || '请求失败'
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }

    return result.data
  },
  (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      (status === 401 ? '登录已失效，请重新登录' : '网络请求失败，请检查后端服务')

    if (status === 401) {
      clearToken()

      if (window.location.pathname !== '/login' && !redirectingToLogin) {
        redirectingToLogin = true
        const redirect = `${window.location.pathname}${window.location.search}`
        window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
      }
    }

    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export default request
