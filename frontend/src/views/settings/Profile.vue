<template>
  <div class="profile-settings">
    <el-tabs v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form
          ref="basicForm"
          :model="basicInfo"
          label-width="100px"
          class="profile-form"
        >
          <el-form-item label="用户名">
            <el-input v-model="basicInfo.username" disabled />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="basicInfo.name" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="basicInfo.phone" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="basicInfo.email" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBasicInfo">保存修改</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 修改密码 -->
      <el-tab-pane label="修改密码" name="password">
        <el-form
          ref="passwordForm"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
          class="profile-form"
        >
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input
              v-model="passwordForm.currentPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 通知设置 -->
      <el-tab-pane label="通知设置" name="notification">
        <el-form
          ref="notificationForm"
          :model="notificationSettings"
          label-width="200px"
          class="profile-form"
        >
          <el-form-item label="待审核单据提醒">
            <el-switch v-model="notificationSettings.pendingReview" />
          </el-form-item>
          <el-form-item label="单据审核结果通知">
            <el-switch v-model="notificationSettings.reviewResult" />
          </el-form-item>
          <el-form-item label="系统更新通知">
            <el-switch v-model="notificationSettings.systemUpdate" />
          </el-form-item>
          <el-form-item label="接收通知方式">
            <el-checkbox-group v-model="notificationSettings.methods">
              <el-checkbox label="email">邮件</el-checkbox>
              <el-checkbox label="sms">短信</el-checkbox>
              <el-checkbox label="system">系统消息</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveNotificationSettings">
              保存设置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

// 当前激活的标签页
const activeTab = ref('basic')

// 监听路由参数，切换到指定标签页
onMounted(() => {
  const { tab } = route.query
  if (tab && ['basic', 'password', 'notification'].includes(tab)) {
    activeTab.value = tab
  }
})

// 基本信息表单
const basicInfo = ref({
  username: 'admin',
  name: '系统管理员',
  phone: '13800138000',
  email: 'admin@example.com'
})

// 保存基本信息
const saveBasicInfo = () => {
  // 这里应该调用API保存用户信息
  ElMessage({
    type: 'success',
    message: '基本信息已更新'
  })
}

// 密码表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 修改密码
const changePassword = () => {
  const passwordFormEl = document.querySelector('form')
  if (!passwordFormEl) return
  
  passwordFormEl.validate((valid) => {
    if (valid) {
      // 这里应该调用API修改密码
      ElMessage({
        type: 'success',
        message: '密码修改成功'
      })
      // 清空表单
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  })
}

// 通知设置
const notificationSettings = ref({
  pendingReview: true,
  reviewResult: true,
  systemUpdate: true,
  methods: ['email', 'system']
})

// 保存通知设置
const saveNotificationSettings = () => {
  // 这里应该调用API保存通知设置
  ElMessage({
    type: 'success',
    message: '通知设置已更新'
  })
}
</script>

<style scoped>
.profile-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-form {
  margin-top: 20px;
  max-width: 500px;
}

:deep(.el-tabs__nav) {
  margin-bottom: 20px;
}
</style>
