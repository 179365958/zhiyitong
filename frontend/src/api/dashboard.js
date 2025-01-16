import request from '@/utils/request';

export function getUserCount() {
  return request({
    url: '/api/dashboard/user-count',
    method: 'get'
  });
}

export function getAccountCount() {
  return request({
    url: '/api/dashboard/account-count',
    method: 'get'
  });
}

export function getRoleCount() {
  return request({
    url: '/api/dashboard/role-count',
    method: 'get'
  });
}

export function getLogCount() {
  return request({
    url: '/api/dashboard/log-count',
    method: 'get'
  });
}