import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { login as loginApi, getCurrentUser } from '@/api/auth';
import { setToken, clearAuth, getUserInfo, setUserInfo, getToken } from '@/utils/auth';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    id: '',
    username: '',
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    companyIds: [], // 添加有权限的账套 ID 列表
    recentCompanyId: null // 最近使用的账套 ID
  });

  // 安全地获取用户信息
  async function safeGetUserInfo() {
    try {
      console.log('safeGetUserInfo: 开始获取用户信息');
      
      // 先尝试从本地存储获取
      const storedUserInfo = getUserInfo();
      console.log('safeGetUserInfo: 本地存储用户信息', storedUserInfo);
      
      // 如果本地存储没有，则调用接口获取
      if (!storedUserInfo) {
        const response = await fetchUserInfoFromAPI();
        userInfo.value = response.data;
        setUserInfo(response.data);
      } else {
        userInfo.value = storedUserInfo;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      clearAuth();
      router.push('/login');
    }
  }

  // 在创建 store 时立即调用
  safeGetUserInfo();

  // 监听 userInfo 变化，同步到 sessionStorage
  watch(userInfo, (newValue) => {
    try {
      setUserInfo(newValue);
    } catch (error) {
      console.error('同步用户信息到 sessionStorage 失败:', error);
    }
  }, { deep: true });

  // 登录
  async function login(loginForm) {
    try {
      const response = await loginApi(loginForm);
      setToken(response.data.token);
      await safeGetUserInfo();

      // 处理账套权限
      await handleCompanyPermissions();
    } catch (error) {
      console.error('登录失败:', error);
    }
  }

  // 处理账套权限
  async function handleCompanyPermissions() {
    const { companyIds, recentCompanyId } = userInfo.value;

    if (companyIds.length === 0) {
      // 没有任何账套权限，跳转到新建账套页面
      router.push('/settings/account');
    } else if (companyIds.length === 1) {
      // 只有一个账套权限，直接切换到该账套对应的数据库
      await switchDatabase(companyIds[0]);
    } else {
      // 有多个账套权限，切换到最近使用的账套
      const companyId = recentCompanyId || companyIds[0];
      await switchDatabase(companyId);
    }
  }

  // 切换数据库
  async function switchDatabase(companyId) {
    try {
      const response = await fetch('/api/system/switch-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ companyId, userId: userInfo.value.id })
      });
      const result = await response.json();
      if (result.success) {
        console.log('Database switched successfully');
        // 更新当前账套信息
        userInfo.value.recentCompanyId = companyId;
      } else {
        console.error('Failed to switch database:', result.message);
      }
    } catch (error) {
      console.error('Error switching database:', error);
    }
  }

  // 退出登录
  function logout() {
    clearAuth();
    userInfo.value = {
      id: '',
      username: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: [],
      companyIds: [],
      recentCompanyId: null
    };
    router.push('/login');
  }

  // 更新用户信息
  function updateUserInfo(info) {
    userInfo.value = {
      ...userInfo.value,
      ...info
    };
  }

  // 检查权限
  function hasPermission(permission) {
    return userInfo.value.permissions.includes(permission);
  }

  // 检查角色
  function hasRole(role) {
    return userInfo.value.roles.includes(role);
  }

  return {
    userInfo,
    login,
    logout,
    updateUserInfo,
    hasPermission,
    hasRole,
    // 暴露 safeGetUserInfo 方法，以便在需要时手动刷新用户信息
    safeGetUserInfo
  };
});