<template>
  <div class="system-settings-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">系统设置</span>
        </div>
      </template>
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="120px" status-icon>
        <el-form-item label="邮件服务器" prop="mailServer">
          <el-input v-model="form.mailServer" placeholder="请输入邮件服务器地址" clearable />
        </el-form-item>
        <el-form-item label="邮件端口" prop="mailPort">
          <el-input v-model="form.mailPort" placeholder="请输入邮件服务器端口" clearable />
        </el-form-item>
        <el-form-item label="邮件用户名" prop="mailUsername">
          <el-input v-model="form.mailUsername" placeholder="请输入邮件服务器用户名" clearable />
        </el-form-item>
        <el-form-item label="邮件密码" prop="mailPassword">
          <el-input v-model="form.mailPassword" type="password" placeholder="请输入邮件服务器密码" clearable />
        </el-form-item>
        <el-form-item label="通知设置" prop="notification">
          <el-switch v-model="form.notification" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemSettings, updateSystemSettings } from '@/api/system'

const formRef = ref(null)

const form = reactive({
  mailServer: '',
  mailPort: '',
  mailUsername: '',
  mailPassword: '',
  notification: false
})

const formRules = {
  mailServer: [
    { required: true, message: '请输入邮件服务器地址', trigger: 'blur' }
  ],
  mailPort: [
    { required: true, message: '请输入邮件服务器端口', trigger: 'blur' }
  ],
  mailUsername: [
    { required: true, message: '请输入邮件服务器用户名', trigger: 'blur' }
  ],
  mailPassword: [
    { required: true, message: '请输入邮件服务器密码', trigger: 'blur' }
  ]
}

// 获取系统设置
const fetchSystemSettings = async () => {
  try {
    const response = await getSystemSettings()
    Object.assign(form, response.data)
  } catch (error) {
    console.error('获取系统设置失败:', error)
    ElMessage.error(error.message || '获取系统设置失败')
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateSystemSettings(form)
        ElMessage.success('设置保存成功')
      } catch (error) {
        ElMessage.error(error.message || '设置保存失败')
      }
    }
  })
}

fetchSystemSettings()
</script>

<style scoped>
.system-settings-container {
  background-color: #f5f7fa;
  height: 100vh;
  padding: 20px;
}

.box-card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style>