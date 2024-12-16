import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { login as loginApi, getCurrentUser } from '@/api/auth'
import { setToken, clearAuth, getUserInfo, setUserInfo } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    id: '',
    username: '',  
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  })

  // 安全地获取用户信息
  async function safeGetUserInfo() {
    try {
      console.log('safeGetUserInfo: 开始获取用户信息')
      
      // 先尝试从本地存储获取
      const storedUserInfo = getUserInfo()
      console.log('safeGetUserInfo: 本地存储用户信息', storedUserInfo)
      
      // 如果本地存储没有，则调用接口获取
      if (!storedUserInfo || !storedUserInfo.username) {
        console.log('safeGetUserInfo: 本地存储用户信息不完整，尝试调用接口')
        const response = await getCurrentUser()
        const fetchedUserInfo = response.data || response
        console.log('safeGetUserInfo: 接口获取用户信息', fetchedUserInfo)
        
        if (fetchedUserInfo && fetchedUserInfo.username) {
          userInfo.value = fetchedUserInfo
          setUserInfo(fetchedUserInfo)
          console.log('safeGetUserInfo: 更新用户信息成功')
        }
      } else {
        userInfo.value = storedUserInfo
        console.log('safeGetUserInfo: 使用本地存储用户信息')
      }
      
      console.log('safeGetUserInfo: 获取用户信息完成', userInfo.value)
    } catch (error) {
      console.error('获取用户信息时出错:', error)
      // 重置为默认值
      userInfo.value = {
        id: '',
        username: '',
        name: '',
        avatar: '',
        roles: [],
        permissions: []
      }
    }
  }

  // 在创建 store 时立即调用
  safeGetUserInfo()

  // 监听 userInfo 变化，同步到 sessionStorage
  watch(userInfo, (newValue) => {
    try {
      setUserInfo(newValue)
    } catch (error) {
      console.error('保存用户信息时出错:', error)
    }
  }, { deep: true })

  // 登录
  async function login(loginForm) {
    try {
      const { token, user } = await loginApi(loginForm)
      setToken(token)
      userInfo.value = user
      setUserInfo(user)
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
    hasRole,
    // 暴露 safeGetUserInfo 方法，以便在需要时手动刷新用户信息
    safeGetUserInfo
  }
})
