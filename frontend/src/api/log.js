import request from '@/utils/request';

export function getLogList(params) {
  return request({
    url: '/api/logs',
    method: 'get',
    params
  });
}