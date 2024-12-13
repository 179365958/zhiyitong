<template>
  <div class="login-container">
    <el-button type="default" @click="() => $router.push('/login')" style="position: absolute; right: 20px; top: 20px;">返回</el-button>
    <el-form :model="loginForm" ref="loginFormRef" label-width="100px">
      <h2 class="login-title" style="color: #2196F3;">账套管理</h2>
      <el-form-item label="用户名" style="margin-top: 10px;">
        <el-input v-model="loginForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" style="margin-top: 10px;">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
      </el-form-item>
      <el-form-item style="margin-top: 10px;">
        <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkSystemInit } from '@/api/system'
import request from '@/utils/request'
import { setToken, setUserInfo } from '@/utils/auth'

const loginFormRef = ref(null)
const loading = ref(false)
const router = useRouter()

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  loading.value = true
  try {
    // 先检查系统初始化状态
    const initResponse = await checkSystemInit()
    
    if (!initResponse.initialized) {
      router.push('/init')
      return
    }

    // 尝试登录
    const response = await request({
      url: '/api/system/login',  
      method: 'post',
      data: {
        username: loginForm.value.username,
        password: loginForm.value.password,
        type: 'account'  
      }
    })

    if (response.success) {  
      setToken(response.data.token)
      setUserInfo(response.data)
      
      // 记住密码功能
      if (loginForm.value.rememberMe) {
        localStorage.setItem('accountBookLoginInfo', JSON.stringify({
          username: loginForm.value.username,
          password: btoa(loginForm.value.password) // 简单加密
        }))
      } else {
        localStorage.removeItem('accountBookLoginInfo')
      }
      
      ElMessage.success('登录成功')
      router.push({ name: 'AccountBook' })  
    } else {
      ElMessage.error(response.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时检查是否有保存的登录信息
onMounted(() => {
  const savedLoginInfo = localStorage.getItem('accountBookLoginInfo')
  if (savedLoginInfo) {
    const { username, password } = JSON.parse(savedLoginInfo)
    loginForm.value.username = username
    loginForm.value.password = atob(password) // 解密
    loginForm.value.rememberMe = true
  }
})
</script>

<style scoped>
.login-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: auto;
  margin-top: calc(50vh - 200px);
  position: relative;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}
</style>
