<template>
  <div class="install-container">
    <el-card class="box-card">
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="用户协议" />
        <el-step title="检测环境" />
        <el-step title="管理员设置" />
        <el-step title="完成初始化" />
      </el-steps>

      <!-- 步骤1：用户协议 -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>用户协议</h3>
        <p>请仔细阅读以下用户协议内容...</p>
        <el-checkbox v-model="agreement">我同意用户协议</el-checkbox>
        <div class="actions" style="display: flex; justify-content: center;">
          <el-button type="default" @click="currentStep = 0">
            不同意
          </el-button>
          <el-button type="success" @click="nextStep">
            同意
          </el-button>
        </div>
      </div>

      <!-- 步骤2：检测环境 -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>检测环境</h3>
        <div class="info-item">
          <span class="label">数据库类型：</span>
          <span>{{ dbType }}</span>
        </div>
        <div class="info-item">
          <span class="label">数据版本：</span>
          <span>{{ dbVersion }}</span>
        </div>
        <div class="actions" style="display: flex; justify-content: center; margin: 0 auto; text-align: center;">
          <el-button type="default" @click="currentStep = 0">
            上一步
          </el-button>
          <el-button type="success" @click="nextStep">
            下一步
          </el-button>
        </div>
      </div>

      <!-- 步骤3：管理员设置 -->
      <div v-if="currentStep === 2" class="step-content">
        <h3>管理员信息设置</h3>
        <el-form ref="adminFormRef" :model="adminForm" :rules="adminRules" label-width="100px" class="admin-form">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="adminForm.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="adminForm.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="adminForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button @click="currentStep = 1">上一步</el-button>
            <el-button type="primary" @click="submitForm">确认</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤4：初始化完成 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="result-message">
          <el-result
            :icon="success ? 'success' : 'error'"
            :title="successMessage"
            :sub-title="success ? '系统初始化完成，请返回登录页面' : '初始化失败，请检查配置后重试'"
          >
            <template #extra>
              <el-button type="primary" @click="goBack">返回登录页</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { checkSystemInit } from '@/api/system';

const currentStep = ref(0);
const checking = ref(false);
const success = ref(false);
const successMessage = ref('');
const adminFormRef = ref(null);
const agreement = ref(false);

// 数据库连接状态

const connectionStatus = reactive({
  success: false,
  message: '',
  details: ''
});

// 数据库配置信息
/*
const dbConfig = reactive({
  host: 'localhost',
  port: 3306,
  database: 'zyt_sys'
});
*/
// 数据库类型和版本
const dbType = ref('');
const dbVersion = ref('');

// 管理员表单
const adminForm = reactive({
  username: 'admin',
  password: '',
  confirmPassword: ''
});

// 表单验证规则
const adminRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== adminForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 测试数据库连接
const testConnection = async () => {
  try {
    checking.value = true; // 开始检查状态
    const result = await checkSystemInit(); // 从后端获取数据库信息

    // 更新连接状态
    connectionStatus.success = result.success;
    connectionStatus.message = result.message || (result.success ? '连接成功' : '连接失败');

    // 更新数据库类型和版本
    if (result.success) {
      dbType.value = result.dbType; // 获取数据库类型
      dbVersion.value = result.dbVersion; // 获取数据库版本
      currentStep.value = 2; // 连接成功后跳转到下一步
    }
  } catch (error) {
    connectionStatus.success = false;
    connectionStatus.message = '连接失败：' + error.message; // 提供详细错误信息
  } finally {
    checking.value = false; // 结束检查状态
  }
};

// 下一步
const nextStep = () => {
  if (currentStep.value === 0 && agreement.value) {
    currentStep.value = 1; // 用户同意后跳转到第二步
    testConnection(); // 在跳转后立即尝试连接
  } else if (currentStep.value === 1) {
    currentStep.value = 2; // 只有在检测成功后才切换到下一步
  } else if (currentStep.value === 2) {
    // 处理管理员设置的逻辑
    currentStep.value = 3;
  }
};

// 提交表单
const submitForm = async () => {
  if (!adminFormRef.value) return;
  await adminFormRef.value.validate(async (valid) => {
    if (valid) {
      // 提交逻辑
      success.value = true;
      successMessage.value = '系统初始化成功';
      currentStep.value = 3;
    }
  });
};

// 返回登录页
const goBack = () => {
  window.location.href = '/login';
};

// 组件加载时自动测试连接
// testConnection();
</script>

<style scoped>
.install-container {
  max-width: 600px;
  margin: 100px auto;
  padding: 0 20px;
}
.box-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.step-content {
  margin-top: 30px;
  padding: 20px;
}
.info-item {
  margin: 10px 0;
  display: flex;
  align-items: center;
}
.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
}
.connection-status {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.status-item {
  margin-bottom: 10px;
}
.status-details {
  color: #666;
  font-size: 14px;
  margin-left: 90px;
}
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.admin-form {
  max-width: 500px;
  margin: 0 auto;
}
.result-message {
  text-align: center;
  margin: 30px 0;
}
</style>
