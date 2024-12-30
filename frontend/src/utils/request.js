import axios from 'axios';
import { ElMessage } from 'element-plus';
import { getToken, clearAuth } from './auth';
import router from '../router';

// 初始化接口白名单
const INIT_API_PATHS = ['/check-init', '/validate-db', '/initialize'];

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', // 从环境变量获取API基础URL
  timeout: 15000, // 请求超时时间
  withCredentials: true, // 允许跨域携带cookie
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 调试日志（仅在开发环境启用）
    const isDev = import.meta.env.MODE === 'development';
    if (isDev) {
      console.log('Request URL:', config.url);
      console.log('Request Method:', config.method);
      console.log('Request Data:', config.data);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 调试日志（仅在开发环境启用）
    const isDev = import.meta.env.MODE === 'development';
    if (isDev) {
      console.log('Response URL:', response.config.url);
      console.log('Response Data:', res);
    }

    // 如果是初始化相关的接口，直接返回数据
    if (INIT_API_PATHS.some(path => response.config.url.includes(path))) {
      return res;
    }

    // 直接返回响应，让业务代码处理成功/失败
    return res;
  },
  (error) => {
    console.error('Response error:', error);

    // 更详细的错误日志
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }

    // 处理错误
    handleError(error);

    return Promise.reject(error);
  }
);

// 错误处理函数
const handleError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        ElMessage.error('登录状态已过期，请重新登录');
        clearAuth();
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
        break;
      case 403:
        ElMessage.error('没有权限访问');
        break;
      case 404:
        ElMessage.error('请求的资源不存在');
        break;
      case 500:
        ElMessage.error('服务器内部错误');
        break;
      default:
        ElMessage.error(error.response.data.message || '请求失败');
    }
  } else if (error.request) {
    ElMessage.error('网络错误，请检查您的网络连接');
  } else {
    ElMessage.error('请求发生错误');
  }
};

export default request;