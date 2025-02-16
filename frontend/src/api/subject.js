import request from '@/utils/request'

export function getSubjects() {
  return request({
    url: '/api/subjects',
    method: 'get'
  })
}

export function addSubject(data) {
  return request({
    url: '/api/subjects',
    method: 'post',
    data
  })
}

export function updateSubject(data) {
  return request({
    url: `/api/subjects/${data.id}`,
    method: 'put',
    data
  })
}

export function toggleSubjectStatus(id) {
  return request({
    url: `/api/subjects/${id}/status`,
    method: 'patch'
  })
}

export function importSubjects() {
  return request({
    url: '/api/subjects/import',
    method: 'post'
  })
}

export function exportSubjects() {
  return request({
    url: '/api/subjects/export',
    method: 'get'
  })
}