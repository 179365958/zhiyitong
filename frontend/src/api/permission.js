import request from '@/utils/request';

export function getPermissionList(params) {
  return request({
    url: '/api/permissions',
    method: 'get',
    params
  });
}

export function createPermission(data) {
  return request({
    url: '/api/permissions',
    method: 'post',
    data
  });
}

export function updatePermission(id, data) {
  return request({
    url: `/api/permissions/${id}`,
    method: 'put',
    data
  });
}

export function deletePermission(id) {
  return request({
    url: `/api/permissions/${id}`,
    method: 'delete'
  });
}