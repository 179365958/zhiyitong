import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { login as loginApi } from '@/api/auth'
import { setToken, clearAuth, getUserInfo, setUserInfo } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(getUserInfo() || {
    id: '',
    username: '',  
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  })

  // 监听 userInfo 变化，同步到 sessionStorage
  watch(userInfo, (newValue) => {
    setUserInfo(newValue)
  }, { deep: true })

  // 登录
  async function login(loginForm) {
    try {
      const { token, user } = await loginApi(loginForm)
      setToken(token)
      userInfo.value = user
      return true
    } catch (error) {
      return false
    }
  }

  // 退出登录
  function logout() {
    clearAuth()
    userInfo.value = {
      id: '',
      username: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }
  }

  // 更新用户信息
  function updateUserInfo(info) {
    userInfo.value = {
      ...userInfo.value,
      ...info
    }
  }

  // 检查权限
  function hasPermission(permission) {
    return userInfo.value.permissions.includes(permission)
  }

  // 检查角色
  function hasRole(role) {
    return userInfo.value.roles.includes(role)
  }

  return {
    userInfo,
    login,
    logout,
    updateUserInfo,
    hasPermission,
    hasRole
  }
})
