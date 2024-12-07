import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearAuth } from './auth'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', // 从环境变量获取API基础URL
  timeout: 15000, // 请求超时时间
  withCredentials: true // 允许跨域携带cookie
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 如果是初始化相关的接口，直接返回数据
    if (
      response.config.url.includes('/check-init') ||
      response.config.url.includes('/validate-db') ||
      response.config.url.includes('/initialize')
    ) {
      return res
    }

    // 处理标准响应格式
    if (res.success) {
      return res.data
    }

    // 处理错误响应
    ElMessage({
      message: res.message || '请求失败',
      type: 'error',
      duration: 3000
    })
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    console.error('Response error:', error)
    ElMessage({
      message: error.response?.data?.message || '网络请求失败',
      type: 'error',
      duration: 3000
    })
    
    // 处理特定的错误码
    if (error.response?.status === 401) {
      clearAuth()
      router.push('/login')
    }
    
    return Promise.reject(error)
  }
)

export default request
