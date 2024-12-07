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
