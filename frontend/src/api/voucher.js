import request from '../utils/request'

// 获取凭证列表
export function getVoucherList(params) {
  return request({
    url: '/vouchers',
    method: 'get',
    params
  })
}

// 创建凭证
export function createVoucher(data) {
  return request({
    url: '/vouchers',
    method: 'post',
    data
  })
}

// 更新凭证
export function updateVoucher(id, data) {
  return request({
    url: `/vouchers/${id}`,
    method: 'put',
    data
  })
}

// 删除凭证
export function deleteVoucher(id) {
  return request({
    url: `/vouchers/${id}`,
    method: 'delete'
  })
}

// 获取凭证详情
export function getVoucherDetail(id) {
  return request({
    url: `/vouchers/${id}`,
    method: 'get'
  })
}

// 提交凭证审核
export function submitVoucherReview(id) {
  return request({
    url: `/vouchers/${id}/submit`,
    method: 'post'
  })
}

// 审核凭证
export function reviewVoucher(id, data) {
  return request({
    url: `/vouchers/${id}/review`,
    method: 'post',
    data
  })
}

// 批量审核凭证
export function batchReviewVouchers(data) {
  return request({
    url: '/vouchers/batch-review',
    method: 'post',
    data
  })
}

// 获取凭证号
export function getNextVoucherNumber(params) {
  return request({
    url: '/vouchers/next-number',
    method: 'get',
    params
  })
}

// 获取科目列表
export function getAccountSubjects() {
  return request({
    url: '/account-subjects',
    method: 'get'
  })
}

// 获取常用摘要
export function getCommonAbstracts() {
  return request({
    url: '/vouchers/common-abstracts',
    method: 'get'
  })
}

// 保存常用摘要
export function saveCommonAbstract(data) {
  return request({
    url: '/vouchers/common-abstracts',
    method: 'post',
    data
  })
}

// 获取辅助核算项目
export function getAuxiliaryItems(params) {
  return request({
    url: '/auxiliary-items',
    method: 'get',
    params
  })
}

// 导出凭证
export function exportVouchers(params) {
  return request({
    url: '/vouchers/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入凭证
export function importVouchers(data) {
  return request({
    url: '/vouchers/import',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}
