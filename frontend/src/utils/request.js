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
    
    // 调试日志
    console.log('Request URL:', config.url)
    console.log('Request Method:', config.method)
    console.log('Request Data:', config.data)
    
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

    // 调试日志
    console.log('Response URL:', response.config.url)
    console.log('Response Data:', res)

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
    })
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    console.error('Response error:', error)
    
    // 更详细的错误日志
    if (error.response) {
      console.error('Error response status:', error.response.status)
      console.error('Error response data:', error.response.data)
    }

    // 处理不同的错误情况
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('登录状态已过期，请重新登录')
          clearAuth()
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      // 在设置请求时发生了错误
      ElMessage.error('请求发生错误')
    }

    return Promise.reject(error)
  }
)

export default request
