import request from '../utils/request'

// 获取凭证号
export function getVoucherNumber(params) {
  return request({
    url: '/api/vouchers/number', // 添加 /api 前缀
    method: 'get',
    params
  })
}

// 获取凭证列表
export function getVoucherList(params) {
  return request({
    url: '/api/vouchers', // 添加 /api 前缀
    method: 'get',
    params
  })
}

// 创建凭证
export function createVoucher(data) {
  return request({
    url: '/api/vouchers', // 添加 /api 前缀
    method: 'post',
    data
  })
}

// 更新凭证
export function updateVoucher(id, data) {
  return request({
    url: `/api/vouchers/${id}`, // 添加 /api 前缀
    method: 'put',
    data
  })
}

// 删除凭证
export function deleteVoucher(id) {
  return request({
    url: `/api/vouchers/${id}`, // 添加 /api 前缀
    method: 'delete'
  })
}

// 获取凭证详情
export function getVoucherDetail(id) {
  return request({
    url: `/api/vouchers/${id}`, // 添加 /api 前缀
    method: 'get'
  })
}

// 提交凭证审核
export function submitVoucherReview(id) {
  return request({
    url: `/api/vouchers/${id}/submit`, // 添加 /api 前缀
    method: 'post'
  })
}

// 审核凭证
export function reviewVoucher(id, data) {
  return request({
    url: `/api/vouchers/${id}/review`, // 添加 /api 前缀
    method: 'post',
    data
  })
}

// 批量审核凭证
export function batchReviewVouchers(data) {
  return request({
    url: '/api/vouchers/batch-review', // 添加 /api 前缀
    method: 'post',
    data
  })
}

// 获取凭证号
export function getNextVoucherNumber(params) {
  return request({
    url: '/api/vouchers/next-number', // 添加 /api 前缀
    method: 'get',
    params
  })
}

// 获取科目列表
export function getAccountSubjects() {
  return request({
    url: '/api/account-subjects', // 添加 /api 前缀
    method: 'get'
  })
}

// 获取常用摘要
export function getCommonAbstracts() {
  return request({
    url: '/api/vouchers/common-abstracts', // 添加 /api 前缀
    method: 'get'
  })
}

// 保存常用摘要
export function saveCommonAbstract(data) {
  return request({
    url: '/api/vouchers/common-abstracts', // 添加 /api 前缀
    method: 'post',
    data
  })
}

// 获取辅助核算项目
export function getAuxiliaryItems(params) {
  return request({
    url: '/api/auxiliary-items', // 添加 /api 前缀
    method: 'get',
    params
  })
}

// 导出凭证
export function exportVouchers(params) {
  return request({
    url: '/api/vouchers/export', // 添加 /api 前缀
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入凭证
export function importVouchers(data) {
  return request({
    url: '/api/vouchers/import', // 添加 /api 前缀
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}