import request from '@/utils/request'

// 获取会计制度列表
export function getAccountingSystems() {
  return request({
    url: '/api/account/accounting-systems',
    method: 'get'
  })
}

// 获取账套列表
export function getCompanies() {
  return request({
    url: '/api/account/companies',
    method: 'get'
  })
}

// 创建账套
export function createCompany(data) {
  return request({
    url: '/api/account/companies',
    method: 'post',
    data
  })
}

// 更新账套
export function updateCompany(id, data) {
  return request({
    url: `/api/account/companies/${id}`,
    method: 'put',
    data
  })
}

// 删除账套
export function deleteCompany(id) {
  return request({
    url: `/api/account/companies/${id}`,
    method: 'delete'
  })
}

// 切换账套状态
export function toggleCompanyStatus(id, status) {
  return request({
    url: `/api/account/companies/${id}/status`,
    method: 'put',
    params: { status }
  })
}
