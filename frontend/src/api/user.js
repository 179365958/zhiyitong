import request from '../utils/request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

// 更新用户信息
export function updateUser(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

// 更新用户状态
export function updateUserStatus(id, status) {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 重置用户密码
export function resetUserPassword(id) {
  return request({
    url: `/users/${id}/reset-password`,
    method: 'post'
  })
}

// 获取用户角色列表
export function getUserRoles() {
  return request({
    url: '/user-roles',
    method: 'get'
  })
}

// 用户登录
export const login = (data) => {
  return request({
    url: '/api/system/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/api/system/userinfo',
    method: 'get'
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/api/system/logout',
    method: 'post'
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/api/system/change-password',
    method: 'post',
    data
  })
}
