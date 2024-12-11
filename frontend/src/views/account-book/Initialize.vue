<template>
  <div class="initialize-container">
    <el-card class="init-card">
      <el-button type="default" @click="() => $router.push('/login')" style="position: absolute; right: 20px; top: 20px;">返回</el-button>
      <template #header>
        <div class="card-header">
          <h2>系统初始化</h2>
        </div>
      </template>

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
          title="后台连接正常！"
        >
          <template #extra>
            <el-button type="primary" @click="nextStep">下一步</el-button>
          </template>
        </el-result>
      </div>

      <!-- 管理员设置步骤 -->
      <div v-if="activeStep === 1" class="step-content">
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
import { checkSystemInit, initializeSystem, validateDbConfig as testDbConnection, checkAndCreateDatabase } from '@/api/system'

const router = useRouter()

// 步骤控制
const activeStep = ref(0)
const checking = ref(true)
const checkError = ref('')
const checkErrorMessage = ref('')

// 管理员设置表单
const adminFormRef = ref(null)
const adminForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
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
      // 3. 检查 zyt_sys 数据库是否存在
      const initialized = await checkInitialized()
      if (initialized) {
        // 4. 数据库存在，继续进行后续步骤
        router.push('/next-step')
      } else {
        // 调用检查并创建数据库的函数
        await checkAndCreateDatabase()
        ElMessage.success('数据库初始化成功！')
        router.push('/next-step')
      }
      checking.value = false
    }
  } catch (error) {
    checking.value = false
    checkError.value = '环境检查失败,未能连接到后台服务'
    checkErrorMessage.value = error.message || '请检查系统配置'
  }
}

// 初始化系统
const handleInitialize = async () => {
  try {
    await adminFormRef.value?.validate()
    
    const data = {
      adminUser: {
        username: adminForm.value.username,
        password: adminForm.value.password
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
  position: relative;
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
