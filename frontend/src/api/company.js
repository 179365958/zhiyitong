import request from '../utils/request'

// 获取企业信息
export function getCompanyInfo() {
  return request({
    url: '/company',
    method: 'get'
  })
}

// 更新企业信息
export function updateCompanyInfo(data) {
  return request({
    url: '/company',
    method: 'put',
    data
  })
}

// 获取账套列表
export function getAccountList() {
  return request({
    url: '/accounts',
    method: 'get'
  })
}

// 创建账套
export function createAccount(data) {
  return request({
    url: '/accounts',
    method: 'post',
    data
  })
}

// 更新账套信息
export function updateAccount(id, data) {
  return request({
    url: `/accounts/${id}`,
    method: 'put',
    data
  })
}

// 删除账套
export function deleteAccount(id) {
  return request({
    url: `/accounts/${id}`,
    method: 'delete'
  })
}

// 切换账套状态（启用/停用）
export function toggleAccountStatus(id, status) {
  return request({
    url: `/accounts/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 获取当前账套
export function getCurrentAccount() {
  return request({
    url: '/accounts/current',
    method: 'get'
  })
}

// 切换当前账套
export function switchAccount(id) {
  return request({
    url: `/accounts/${id}/switch`,
    method: 'post'
  })
}
