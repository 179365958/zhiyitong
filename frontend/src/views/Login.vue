<template>
  <div class="login-container">
    <el-form 
      ref="loginFormRef" 
      :model="loginForm" 
      :rules="loginRules" 
      class="login-form"
      label-width="100px"
    >
      <h2 class="login-title">智易通 - 财务管理系统</h2>
      
      <el-form-item label="账套选择" prop="companyId">
        <el-select 
          v-model="loginForm.companyId" 
          placeholder="请选择企业账套"
          filterable
        >
          <el-option 
            v-for="company in companyList" 
            :key="company.id" 
            :label="`[${company.company_code}] ${company.company_name}`"
            :value="company.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input 
          v-model="loginForm.username" 
          placeholder="请输入用户名"
          prefix-icon="User"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="请输入密码"
          show-password
          prefix-icon="Lock"
        />
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
      </el-form-item>

      <el-form-item>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <el-button type="primary" @click="() => $router.push('/account-book/login')" style="width: 49%">账套管理</el-button>
          <el-button 
            type="primary" 
            @click="submitLogin" 
            :loading="loading"
            style="width: 49%"
          >
            登 录
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { getCompanyList } from '@/api/system'
import { setToken, setUserInfo, clearAuth, getToken, setCurrentCompany } from '@/utils/auth'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)
const companyList = ref([])

const loginForm = reactive({
  username: '',
  password: '',
  companyId: null,
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  companyId: [
    { required: true, message: '请选择企业账套', trigger: 'change' }
  ]
}

// 获取企业账套列表
const fetchCompanyList = async () => {
  try {
    const response = await getCompanyList({
      page: 1,
      pageSize: 1000  // 获取所有账套
    })
    
    const data = response.data || response
    const { list = [] } = data
    
    if (list && list.length > 0) {
      companyList.value = list
    } else {
      ElMessage.warning('未检测到企业账套，请先在账套管理中添加企业账套')
    }
  } catch (error) {
    console.error('获取企业账套列表失败:', error)
    ElMessage.error(error.message || '获取企业账套列表失败')
  }
}

// 提交登录
const submitLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const loginData = {
          username: loginForm.username,
          password: loginForm.password,
          companyId: loginForm.companyId
        }
        
        // 调用登录接口
        const response = await login(loginData)
        
        // 统一用户信息设置
        const userInfo = response.data.user || response.data
        
        // 存储用户信息和 Token
        setToken(response.data.token)
        setUserInfo(userInfo)
        
        // 如果有企业账套信息，设置当前企业
        if (response.data.company) {
          setCurrentCompany(response.data.company)
        }
        
        // 如果选择了记住密码，保存登录信息
        if (loginForm.rememberMe) {
          localStorage.setItem('loginInfo', JSON.stringify({
            username: loginForm.username,
            password: btoa(loginForm.password) // 简单加密密码
          }))
        } else {
          localStorage.removeItem('loginInfo')
        }
        
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } catch (error) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 退出登录
const logout = () => {
  clearAuth()  // 清除所有认证信息
  sessionStorage.removeItem('currentCompany')
  router.push('/login')
}

onMounted(() => {
  // 检查是否已登录，如果已登录则退出
  if (getToken()) {
    logout()
  }
  
  // 获取记住的登录信息
  const savedLoginInfo = localStorage.getItem('loginInfo')
  if (savedLoginInfo) {
    const { username, password } = JSON.parse(savedLoginInfo)
    loginForm.username = username
    loginForm.password = atob(password) // 解密密码
    loginForm.rememberMe = true
  }
  
  fetchCompanyList()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-form {
  width: 450px;
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #409EFF;
}
</style>
