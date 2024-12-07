<template>
  <div class="initialize-container">
    <el-card class="init-card">
      <template #header>
        <div class="card-header">
          <h2>系统初始化</h2>
        </div>
      </template>

      <el-steps :active="activeStep" finish-status="success">
        <el-step title="检查环境" />
        <el-step title="数据库配置" />
        <el-step title="管理员设置" />
      </el-steps>

      <!-- 检查环境步骤 -->
      <div v-if="activeStep === 0" class="step-content">
        <el-result
          v-if="checking"
          icon="info"
          title="正在检查系统环境..."
        >
          <template #icon>
            <el-icon class="is-loading"><Loading /></el-icon>
          </template>
        </el-result>
        <el-result
          v-else-if="checkError"
          icon="error"
          :title="checkError"
          :sub-title="checkErrorMessage"
        >
          <template #extra>
            <el-button type="primary" @click="checkEnvironment">重试</el-button>
          </template>
        </el-result>
        <el-result
          v-else
          icon="success"
          title="环境检查通过"
        >
          <template #extra>
            <el-button type="primary" @click="nextStep">下一步</el-button>
          </template>
        </el-result>
      </div>

      <!-- 数据库配置步骤 -->
      <div v-if="activeStep === 1" class="step-content">
        <el-form
          ref="dbFormRef"
          :model="dbForm"
          :rules="dbRules"
          label-width="120px"
        >
          <el-form-item label="数据库主机" prop="host">
            <el-input v-model="dbForm.host" />
          </el-form-item>
          <el-form-item label="端口" prop="port">
            <el-input v-model="dbForm.port" />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="dbForm.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="dbForm.password" type="password" />
          </el-form-item>
        </el-form>
        <div class="step-buttons">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="validateDbConfig">下一步</el-button>
        </div>
      </div>

      <!-- 管理员设置步骤 -->
      <div v-if="activeStep === 2" class="step-content">
        <el-form
          ref="adminFormRef"
          :model="adminForm"
          :rules="adminRules"
          label-width="120px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="adminForm.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="adminForm.password" type="password" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="adminForm.confirmPassword" type="password" />
          </el-form-item>
          <el-form-item label="姓名" prop="realName">
            <el-input v-model="adminForm.realName" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="adminForm.email" />
          </el-form-item>
        </el-form>
        <div class="step-buttons">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="handleInitialize">完成初始化</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkSystemInit, initializeSystem, validateDbConfig as testDbConnection } from '@/api/system'

const router = useRouter()

// 步骤控制
const activeStep = ref(0)
const checking = ref(true)
const checkError = ref('')
const checkErrorMessage = ref('')

// 数据库配置表单
const dbFormRef = ref(null)
const dbForm = ref({
  host: 'localhost',
  port: '3306',
  username: 'root',
  password: ''
})
const dbRules = {
  host: [{ required: true, message: '请输入数据库主机', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 管理员设置表单
const adminFormRef = ref(null)
const adminForm = ref({
  username: 'admin',
  password: '',
  confirmPassword: '',
  realName: '',
  email: ''
})
const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== adminForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 检查环境
const checkEnvironment = async () => {
  checking.value = true
  checkError.value = ''
  checkErrorMessage.value = ''

  try {
    const res = await checkSystemInit()
    if (res.initialized) {
      // 系统已初始化，跳转到登录页
      router.push('/login')
    } else {
      checking.value = false
    }
  } catch (error) {
    checking.value = false
    checkError.value = '环境检查失败'
    checkErrorMessage.value = error.message || '请检查系统配置'
  }
}

// 验证数据库配置
const validateDbConfig = async () => {
  try {
    await dbFormRef.value?.validate()
    
    // 验证数据库配置
    const res = await testDbConnection(dbForm.value)
    if (res.success) {
      ElMessage.success('数据库连接成功')
      nextStep()
    } else {
      ElMessage.error(res.message || '数据库连接失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '验证失败')
  }
}

// 初始化系统
const handleInitialize = async () => {
  try {
    await adminFormRef.value?.validate()
    
    const data = {
      dbConfig: dbForm.value,
      adminUser: {
        username: adminForm.value.username,
        password: adminForm.value.password,
        realName: adminForm.value.realName,
        email: adminForm.value.email
      }
    }

    await initializeSystem(data)
    ElMessage.success('系统初始化成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error(error.message || '初始化失败')
  }
}

// 步骤控制
const nextStep = () => {
  activeStep.value++
}

const prevStep = () => {
  activeStep.value--
}

// 组件挂载时检查环境
checkEnvironment()
</script>

<style scoped>
.initialize-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.init-card {
  width: 600px;
}

.card-header {
  text-align: center;
}

.step-content {
  margin-top: 30px;
}

.step-buttons {
  margin-top: 20px;
  text-align: right;
}
</style>
