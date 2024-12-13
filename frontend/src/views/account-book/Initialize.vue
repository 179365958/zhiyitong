<template>
  <div class="initialize-container">
    <el-card class="box-card">
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="数据库连接" />
        <el-step title="管理员设置" />
        <el-step title="完成初始化" />
      </el-steps>

      <!-- 步骤1：数据库连接信息 -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>数据库连接信息</h3>
        <div class="info-item">
          <span class="label">主机：</span>
          <span>{{ dbConfig.host }}</span>
        </div>
        <div class="info-item">
          <span class="label">端口：</span>
          <span>{{ dbConfig.port }}</span>
        </div>
        <div class="info-item">
          <span class="label">数据库：</span>
          <span>{{ dbConfig.database }}</span>
        </div>
        <div class="connection-status">
          <div class="status-item">
            <span class="label">连接状态：</span>
            <el-tag :type="connectionStatus.success ? 'success' : 'danger'">
              {{ connectionStatus.message }}
            </el-tag>
          </div>
          <div class="status-details">{{ connectionStatus.details }}</div>
        </div>
        <div class="actions">
          <el-button type="primary" @click="testConnection" :loading="checking">
            测试连接
          </el-button>
          <el-button type="success" @click="nextStep" :disabled="!connectionStatus.success">
            下一步
          </el-button>
        </div>
      </div>

      <!-- 步骤2：管理员设置 -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>管理员信息设置</h3>
        <el-form
          ref="adminFormRef"
          :model="adminForm"
          :rules="adminRules"
          label-width="100px"
          class="admin-form"
        >
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
            <el-button @click="currentStep = 0">上一步</el-button>
            <el-button type="primary" @click="submitForm">确认</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3：初始化完成 -->
      <div v-if="currentStep === 2" class="step-content">
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
import { ElMessage } from 'element-plus';
import { checkSystemInit, initializeDatabase } from '@/api/system';

const currentStep = ref(0);
const checking = ref(false);
const success = ref(false);
const successMessage = ref('');
const adminFormRef = ref(null);

// 数据库连接状态
const connectionStatus = reactive({
  success: false,
  message: '等待连接',
  details: '请点击"测试连接"按钮测试数据库连接'
});

// 数据库配置信息
const dbConfig = reactive({
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: import.meta.env.VITE_DB_PORT || 3306,
  database: import.meta.env.VITE_DB_NAME || 'zyt_sys'
});

// 管理员表单
const adminForm = reactive({
  username: 'admin',
  password: '',
  confirmPassword: ''
});

// 表单验证规则
const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
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
    checking.value = true;
    const result = await checkSystemInit();
    connectionStatus.success = result.success;
    connectionStatus.message = result.success ? '连接成功' : '连接失败';
    connectionStatus.details = result.message;
  } catch (error) {
    connectionStatus.success = false;
    connectionStatus.message = '连接失败';
    connectionStatus.details = error.message;
  } finally {
    checking.value = false;
  }
};

// 下一步
const nextStep = () => {
  if (connectionStatus.success) {
    currentStep.value = 1;
  }
};

// 提交表单
const submitForm = async () => {
  if (!adminFormRef.value) return;
  
  await adminFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        checking.value = true;
        console.log('Submitting form with:', adminForm); // Debug: log adminForm
        const result = await initializeDatabase({
          username: adminForm.username,
          password: adminForm.password
        });
        console.log('Initialization result:', result); // Debug: log result
        if (result.success) {
          ElMessage.success('系统初始化成功！');
          success.value = true;
          successMessage.value = '系统初始化成功';
          currentStep.value = 2;
        } else {
          ElMessage.error(result.message);
          success.value = false;
          successMessage.value = result.message;
        }
      } catch (error) {
        console.error('初始化失败:', error);
        ElMessage.error(error.message || '系统初始化失败');
        success.value = false;
        successMessage.value = '系统初始化失败';
      } finally {
        checking.value = false;
      }
    }
  });
};

// 返回登录页
const goBack = () => {
  window.location.href = '/login';
};

// 组件加载时自动测试连接
testConnection();
</script>

<style scoped>
.initialize-container {
  max-width: 600px;  /* 减小最大宽度 */
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