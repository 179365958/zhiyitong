import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearAuth } from './auth'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 从环境变量获取API基础URL
  timeout: 15000 // 请求超时时间
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

    // 如果响应是原始数据，直接返回
    if (res.initialized !== undefined) {
      return res
    }

    // 处理标准响应格式
    if (res.code === 0) {
      return res.data
    }

    // 处理特定的错误码
    if (res.code === 401) {
      // token过期或无效
      ElMessage({
        message: '登录已过期，请重新登录',
        type: 'error',
        duration: 3000
      })
      clearAuth()
      router.push(`/login?redirect=${router.currentRoute.value.fullPath}`)
      return Promise.reject(new Error(res.message || '未授权'))
    }

    // 其他错误
    ElMessage({
      message: res.message || '请求失败',
      type: 'error',
      duration: 3000
    })
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    console.error('Response error:', error)
    
    // 处理网络错误
    let message = '网络请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          clearAuth()
          router.push(`/login?redirect=${router.currentRoute.value.fullPath}`)
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败: ${error.response.status}`
      }
    } else if (error.request) {
      message = '服务器无响应'
    }

    ElMessage({
      message,
      type: 'error',
      duration: 3000
    })
    return Promise.reject(error)
  }
)

export default request
