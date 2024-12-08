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
      
      <el-form-item label="服务器地址" prop="serverAddress">
        <el-input 
          v-model="loginForm.serverAddress" 
          placeholder="请输入服务器地址"
          prefix-icon="Connection"
        >
          <template #prepend>
            <el-select 
              v-model="loginForm.protocol" 
              style="width: 100px"
            >
              <el-option label="HTTP" value="http://" />
              <el-option label="HTTPS" value="https://" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="账套选择" prop="companyId">
        <el-select 
          v-model="loginForm.companyId" 
          placeholder="请选择企业账套"
          filterable
        >
          <el-option 
            v-for="company in companyList" 
            :key="company.id" 
            :label="company.name" 
            :value="company.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="登录日期" prop="loginDate">
        <el-date-picker
          v-model="loginForm.loginDate"
          type="date"
          placeholder="选择登录日期"
          :disabled-date="disabledDate"
        />
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
        <el-button 
          type="primary" 
          @click="submitLogin" 
          :loading="loading"
          style="width: 100%"
        >
          登 录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getCompanyList, login } from '@/api/system'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  serverAddress: 'localhost',
  protocol: 'http://',
  companyId: null,
  loginDate: new Date(),
  username: '',
  password: ''
})

const companyList = ref([])

const loginRules = {
  serverAddress: [
    { required: true, message: '请输入服务器地址', trigger: 'blur' }
  ],
  companyId: [
    { required: true, message: '请选择企业账套', trigger: 'change' }
  ],
  loginDate: [
    { required: true, message: '请选择登录日期', trigger: 'change' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 获取企业账套列表
const fetchCompanyList = async () => {
  try {
    loading.value = true
    const response = await getCompanyList()
    
    // 检查响应数据
    if (response.success && response.data && response.data.length > 0) {
      companyList.value = response.data
    } else {
      ElMessage.warning('未找到可用的企业账套')
      companyList.value = [{
        id: 0,
        code: 'TEST001',
        name: '智易通测试企业'
      }]
    }
  } catch (error) {
    ElMessage.error(error.message || '获取企业账套列表失败')
    
    // 设置默认企业账套
    companyList.value = [{
      id: 0,
      code: 'TEST001',
      name: '智易通测试企业'
    }]
  } finally {
    loading.value = false
  }
}

// 提交登录
const submitLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const fullServerAddress = `${loginForm.protocol}${loginForm.serverAddress}`
        const loginData = {
          serverAddress: fullServerAddress,
          companyId: loginForm.companyId,
          username: loginForm.username,
          password: loginForm.password,
          loginDate: loginForm.loginDate
        }
        
        // 调用登录接口
        const response = await login(loginData)
        
        // 存储用户信息和 Token
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        
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

onMounted(() => {
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
