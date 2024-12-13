import request from '@/utils/request'

// 检查系统初始化状态
export function checkSystemInit() {
  return request({
    url: '/api/system/check-init',
    method: 'get'
  })
}

// 初始化系统
export function initializeDatabase(data) {
  return request({
    url: '/api/system/initialize',
    method: 'post',
    data
  })
}

// 获取系统状态
export function getSystemStatus() {
  return request({
    url: '/api/system/status',
    method: 'get'
  })
}

// 获取企业账套列表
export function getCompanies() {
  return request({
    url: '/api/system/companies',
    method: 'get'
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/api/system/login',
    method: 'post',
    data
  })
}