import request from '@/utils/request'

// 检查系统初始化状态
export function checkSystemInit() {
  return request({
    url: '/system/check-init',
    method: 'get'
  })
}

// 初始化系统
export function initializeSystem(data) {
  return request({
    url: '/system/initialize',
    method: 'post',
    data
  })
}
