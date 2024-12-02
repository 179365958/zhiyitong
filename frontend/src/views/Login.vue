<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="../assets/vue.svg" alt="Logo" class="logo">
        <h2>智易通</h2>
        <p>小微企业财务管理系统</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item class="remember-me">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="login-footer">
      <p>Copyright  2024 智易通 All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { setToken, setUserInfo } from '../utils/auth'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const formRef = ref(null)

// 登录表单
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟登录请求
      setTimeout(() => {
        // 这里应该调用实际的登录 API
        if (loginForm.value.username === 'admin' && loginForm.value.password === '123456') {
          const token = 'dummy-token'
          const userInfo = {
            id: 1,
            username: 'admin',
            name: '系统管理员',
            role: 'admin'
          }
          
          // 保存认证信息
          setToken(token)
          setUserInfo(userInfo)

          // 如果选择记住我，保存用户名
          if (loginForm.value.remember) {
            localStorage.setItem('remembered_username', loginForm.value.username)
          } else {
            localStorage.removeItem('remembered_username')
          }

          // 登录成功提示
          ElMessage({
            type: 'success',
            message: '登录成功'
          })

          // 跳转到重定向页面或首页
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          ElMessage({
            type: 'error',
            message: '用户名或密码错误'
          })
        }
        loading.value = false
      }, 1000)
    }
  })
}

// 如果记住密码，自动填充用户名
onMounted(() => {
  const savedUsername = localStorage.getItem('remembered_username')
  if (savedUsername) {
    loginForm.value.username = savedUsername
    loginForm.value.remember = true
  }
})
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1f4037 0%, #99f2c8 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header .logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.login-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.remember-me {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
}

.login-footer {
  margin-top: 40px;
  text-align: center;
  color: #ffffff;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-checkbox__label) {
  color: #606266;
}

:deep(.el-form-item__error) {
  color: #f56c6c;
}
</style>
