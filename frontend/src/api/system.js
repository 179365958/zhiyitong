import request from '@/utils/request'

// 检查系统初始化状态
export function checkSystemInit() {
  return request({
    url: '/api/system/check-init',
    method: 'get'
  })
}

// 验证数据库配置
export function validateDbConfig(data) {
  return request({
    url: '/api/system/validate-db',
    method: 'post',
    data
  })
}

// 初始化系统
export function initializeSystem(data) {
  return request({
    url: '/api/system/initialize',
    method: 'post',
    data
  })
}

// 获取企业账套列表
export function getCompanyList() {
  return request({
    url: '/api/system/companies',
    method: 'get'
  }).then(response => {
    // 确保返回的数据符合前端预期
    if (response.success && response.data) {
      return response
    } else {
      throw new Error(response.message || '获取企业账套列表失败')
    }
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/api/system/login',
    method: 'post',
    data
  }).then(response => {
    // 确保返回的数据符合前端预期
    if (response.success && response.data) {
      return response
    } else {
      throw new Error(response.message || '登录失败')
    }
  })
}
