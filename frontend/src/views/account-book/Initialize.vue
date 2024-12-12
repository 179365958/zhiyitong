<template>
  <div class="initialize-container">
    <el-card class="init-card">
      <el-button type="default" @click="goBack" style="position: absolute; right: 20px; top: 20px;">返回</el-button>
      <template #header>
        <h2>系统初始化</h2>
      </template>
      
      <!-- 检查结果显示 -->
      <div v-if="checking" class="check-status">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在检查系统环境...</span>
      </div>

      <div v-else-if="checkError" class="check-error">
        <el-result
          icon="error"
          :title="checkError"
          :sub-title="checkErrorMessage"
        >
          <template #extra>
            <el-button type="primary" @click="checkEnvironment">重新检查</el-button>
          </template>
        </el-result>
      </div>

      <div v-else-if="success" class="check-success">
        <el-result
          icon="success"
          :title="successMessage"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">返回登录</el-button>
          </template>
        </el-result>
      </div>

      <!-- 初始化确认对话框 -->
      <el-dialog
        v-model="showDbInitConfirm"
        title="系统初始化确认"
        width="400px"
      >
        <p>系统检测到数据库尚未初始化，是否现在初始化系统？</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDbInitConfirm = false">取消</el-button>
            <el-button type="primary" @click="initializeDatabase">确认初始化</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { checkSystemInit, initializeDatabase as initDb } from '@/api/system';

const router = useRouter();

// 状态变量
const checking = ref(true);
const checkError = ref('');
const checkErrorMessage = ref('');
const success = ref(false);
const successMessage = ref('');
const showDbInitConfirm = ref(false);

// 返回登录页
const goBack = () => {
  router.push('/login');
};

// 检查环境
const checkEnvironment = async () => {
  checking.value = true;
  checkError.value = '';
  checkErrorMessage.value = '';
  success.value = false;
  showDbInitConfirm.value = false;
  successMessage.value = '';

  try {
    const result = await checkSystemInit();
    if (!result.success) {
      throw new Error(result.message);
    }

    if (!result.initialized) {
      checking.value = false;
      showDbInitConfirm.value = true;
      return;
    }

    checking.value = false;
    success.value = true;
    successMessage.value = '系统检查完成，可以登录系统';
  } catch (error) {
    checking.value = false;
    checkError.value = '环境检查失败';
    checkErrorMessage.value = error.message || '请检查系统配置';
  }
};

// 初始化数据库
const initializeDatabase = async () => {
  try {
    checking.value = true;
    showDbInitConfirm.value = false;
    const result = await initDb();
    if (result.success) {
      ElMessage.success('系统初始化成功！');
      success.value = true;
      successMessage.value = '系统初始化完成，可以登录系统';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    checkError.value = '系统初始化失败';
    checkErrorMessage.value = error.message || '请检查系统配置';
  } finally {
    checking.value = false;
  }
};

// 组件挂载时自动检查环境
checkEnvironment();
</script>

<style scoped>
.initialize-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
}

.init-card {
  width: 100%;
  max-width: 600px;
}

.check-status,
.check-error,
.check-success {
  text-align: center;
  padding: 20px;
}

.check-status .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>