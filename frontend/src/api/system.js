import request from '@/utils/request'
import { getToken } from '@/utils/auth';

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
/*
export function getCompanies() {
  return request({
    url: '/api/system/companies',
    method: 'get'
  })
}  */

// 用户登录
export function login(data) {
  return request({
    url: '/api/system/login',
    method: 'post',
    data
  })
}

// 获取企业账套列表
export const getCompanyList = (params) => {
  const token = localStorage.getItem('jwtToken'); // 从 localStorage 获取 token
  return request({
    url: '/api/system/companies', // 确保URL格式正确
    method: 'get',
    headers: {
      Authorization: `Bearer ${getToken()}`, // 使用 auth.js 中的 getToken 方法
    },
    params
  }).then(response => {
    console.log('getCompanyList response:', response); // 添加日志输出
    
    // 兼容不同的响应结构
    if (response.success && response.data) {
      return response;
    } else if (response.code === 200 && response.data) {
      return response;
    } else {
      throw new Error('获取账套列表失败');
    }
  });
};

// 切换数据库
export const switchDatabase = (data) => {
  return request({
    url: '/api/system/switch-database',
    method: 'post',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    data
  }).then(response => {
    console.log('switchDatabase response:', response);
    if (response.success) {
      return response;
    } else {
      console.error('切换数据库失败:', response);
      throw new Error(response.message || '切换数据库失败');
    }
  }).catch(error => {
    console.error('switchDatabase error:', error);
    throw error;
  });
};
// 获取企业账套列表
/*
export const getCompanyList = (params) => {
  return request({
    url: 'api/system/companies',
    method: 'get',
    params
  }).then(response => {
    // 打印完整响应用于调试
    console.log('getCompanyList response:', response);
    
    // 兼容不同的响应结构
    if (response.success && response.data) {
      return response;
    } else if (response.code === 200 && response.data) {
      return response;
    } else {
      console.error('获取账套列表失败:', response);
      throw new Error(response.message || '获取账套列表失败');
    }
  }).catch(error => {
    console.error('getCompanyList error:', error);
    throw error;
*/
// 创建账套
export const createCompany = (data) => {
  return request({
    url: '/api/system/companies',
    method: 'post',
    data
  })
}

// 更新账套
export const updateCompany = (id, data) => {
  return request({
    url: `/api/system/companies/${id}`,
    method: 'put',
    data
  })
}

// 删除账套
export const deleteCompany = (id) => {
  return request({
    url: `/api/system/companies/${id}`,
    method: 'delete'
  })
}

// 备份账套
export const backupCompany = (id) => {
  return request({
    url: `/api/system/companies/${id}/backup`,
    method: 'post'
  })
}

// 恢复账套
export const restoreCompany = (id) => {
  return request({
    url: `/api/system/companies/${id}/restore`,
    method: 'post'
  })
}