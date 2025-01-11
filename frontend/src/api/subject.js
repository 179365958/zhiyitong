import request from '@/utils/request'

export function getSubjects() {
  return request({
    url: '/subjects',
    method: 'get'
  })
}

export function addSubject(data) {
  return request({
    url: '/subjects',
    method: 'post',
    data
  })
}

export function updateSubject(data) {
  return request({
    url: `/subjects/${data.id}`,
    method: 'put',
    data
  })
}

export function toggleSubjectStatus(id) {
  return request({
    url: `/subjects/${id}/status`,
    method: 'patch'
  })
}

export function importSubjects() {
  return request({
    url: '/subjects/import',
    method: 'post'
  })
}

export function exportSubjects() {
  return request({
    url: '/subjects/export',
    method: 'get'
  })
}