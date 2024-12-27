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
        <div class="actions">
          <el-button type="default" @click="resetSteps">不同意</el-button>
          <el-button type="success" @click="nextStep" :disabled="!agreement">同意</el-button>
        </div>
      </div>

      <!-- 步骤2：检测环境 -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>检测环境</h3>
        <div class="info-item">
          <span class="label">数据库版本：</span>
          <span>{{ dbVersion || '未知' }}</span>
        </div>
        <div class="connection-status">
          <span class="label">连接状态：</span>
          <el-tag :type="connectionStatus.success ? 'success' : 'danger'">
            {{ connectionStatus.message }}
          </el-tag>
        </div>
        <div class="actions">
          <el-button type="default" @click="prevStep">上一步</el-button>
          <el-button type="success" @click="nextStep" :disabled="!connectionStatus.success">下一步</el-button>
        </div>
      </div>

      <!-- 步骤3：管理员设置 -->
      <div v-if="currentStep === 2" class="step-content">
        <h3>管理员信息设置</h3>
        <el-form ref="adminFormRef" :model="adminForm" :rules="adminRules" label-width="100px" class="admin-form">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="adminForm.username" placeholder="请输入管理员用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="adminForm.password" type="password" show-password placeholder="请输入管理员密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="adminForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
          </el-form-item>
          <el-form-item>
            <el-button @click="prevStep">上一步</el-button>
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
              <el-button v-if="!success" type="warning" @click="retry">重试</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { checkSystemInit} from '@/api/system';

const currentStep = ref(0);
const checking = ref(false);
const success = ref(false);
const successMessage = ref('');
const adminFormRef = ref(null);
const agreement = ref(false);

// 数据库连接状态
const connectionStatus = reactive({
  success: false,
  message: '未检测',
});

// 数据库版本
const dbVersion = ref('');

// 管理员表单
const adminForm = reactive({
  username: 'admin',
  password: '',
  confirmPassword: '',
});

// 表单验证规则
const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为 6 到 20 个字符', trigger: 'blur' },
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
      trigger: 'blur',
    },
  ],
};

// 测试数据库连接
const testConnection = async () => {
  try {
    checking.value = true;
    connectionStatus.message = '检测中...';
    const result = await checkSystemInit();

    if (result.success) {
      dbVersion.value = result.dbVersion || '未知';
      connectionStatus.success = true;
      connectionStatus.message = '连接成功';
      ElMessage.success('数据库连接成功');
    } else {
      dbVersion.value = '未知';
      connectionStatus.success = false;
      connectionStatus.message = '连接失败';
      ElMessage.error('数据库连接失败：' + result.message);
    }
  } catch (error) {
    dbVersion.value = '未知';
    connectionStatus.success = false;
    connectionStatus.message = '连接失败';
    ElMessage.error('数据库连接失败：' + error.message);
  } finally {
    checking.value = false;
  }
};

// 监听步骤变化，自动检测数据库连接
watch(currentStep, (newStep) => {
  if (newStep === 1) {
    testConnection(); // 进入步骤2时自动检测数据库连接
  }
});

// 下一步
const nextStep = () => {
  if (currentStep.value === 0 && !agreement.value) {
    ElMessage.warning('请先同意用户协议');
    return;
  }
  if (currentStep.value === 1 && !connectionStatus.success) {
    ElMessage.warning('请先完成数据库连接测试');
    return;
  }
  currentStep.value++;
};

// 上一步
const prevStep = () => {
  currentStep.value--;
};

// 重置步骤
const resetSteps = () => {
  currentStep.value = 0;
  agreement.value = false;
};

// 提交表单
const submitForm = async () => {
  if (!adminFormRef.value) return;
  await adminFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await initializeSystem(adminForm.username, adminForm.password);
        if (response.success) {
          success.value = true;
          successMessage.value = '系统初始化成功';
          currentStep.value = 3; // 跳转到完成初始化步骤
        } else {
          success.value = false;
          successMessage.value = '初始化失败：' + response.message;
        }
      } catch (error) {
        success.value = false;
        successMessage.value = '初始化失败：' + error.message;
      }
    }
  });
};

// 返回登录页
const goBack = () => {
  window.location.href = '/login';
};

// 重试
const retry = () => {
  currentStep.value = 2; // 返回到管理员设置步骤
  adminForm.username = 'admin'; // 重置表单
  adminForm.password = '';
  adminForm.confirmPassword = '';
};
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
  display: flex;
  align-items: center;
}
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
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