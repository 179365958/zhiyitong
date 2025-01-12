import request from '@/utils/request'

export function getSubjects() {
  return request({
    url: '/api/system/subjects',
    method: 'get'
  })
}

export function addSubject(data) {
  return request({
    url: '/api/system/subjects',
    method: 'post',
    data
  })
}

export function updateSubject(data) {
  return request({
    url: `/api/system/subjects/${data.id}`,
    method: 'put',
    data
  })
}

export function toggleSubjectStatus(id) {
  return request({
    url: `/api/system/subjects/${id}/status`,
    method: 'patch'
  })
}

export function importSubjects() {
  return request({
    url: '/api/system/subjects/import',
    method: 'post'
  })
}

export function exportSubjects() {
  return request({
    url: '/api/system/subjects/export',
    method: 'get'
  })
}