// Token 相关操作
const TOKEN_KEY = 'zyt_token'
const USER_INFO_KEY = 'zyt_user_info'
const COMPANY_KEY = 'zyt_current_company'

// 获取 Token
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

// 设置 Token
export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

// 移除 Token
export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

// 获取用户信息
export function getUserInfo() {
  try {
    const userInfo = sessionStorage.getItem(USER_INFO_KEY)
    return userInfo && userInfo !== 'undefined' ? JSON.parse(userInfo) : {
      id: '',
      username: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      id: '',
      username: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }
  }
}

// 设置用户信息
export function setUserInfo(userInfo) {
  sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

// 移除用户信息
export function removeUserInfo() {
  sessionStorage.removeItem(USER_INFO_KEY)
}

// 获取当前公司信息
export function getCurrentCompany() {
  const company = sessionStorage.getItem(COMPANY_KEY)
  return company ? JSON.parse(company) : null
}

// 设置当前公司信息
export function setCurrentCompany(company) {
  sessionStorage.setItem(COMPANY_KEY, JSON.stringify(company))
}

// 移除当前公司信息
export function removeCurrentCompany() {
  sessionStorage.removeItem(COMPANY_KEY)
}

// 清除所有认证信息
export function clearAuth() {
  removeToken()
  removeUserInfo()
  removeCurrentCompany()
}

// 检查是否已登录
export function isAuthenticated() {
  return !!getToken()
}
