<template>
  <div class="login-container">
    <el-button type="default" @click="() => $router.push('/login')" style="position: absolute; right: 20px; top: 20px;">返回</el-button>
    <el-form :model="loginForm" ref="loginFormRef" label-width="100px">
      <h2 class="login-title" style="color: #2196F3;">账套管理</h2>
      <el-form-item label="用户名" style="margin-top: 10px;">
        <el-input v-model="loginForm.username" placeholder="请输入用户名" :value="loginForm.username || 'admin'" />
      </el-form-item>
      <el-form-item label="密码" style="margin-top: 10px;">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item style="margin-top: 10px;">
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios' // 引入axios

const loginForm = ref({
  username: '',
  password: ''
})

const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/connect', {
      username: loginForm.username,
      password: loginForm.password
    });

    if (response.data.success) {
      // 连接成功，执行登录逻辑
      ElMessage.success('登录成功');
      router.push('/account-book'); // 跳转到账套管理
    } else {
      // 连接失败，跳转到初始化页面
      router.push('/init');
    }
  } catch (error) {
    console.error('连接数据库失败:', error);
    // 连接失败，跳转到初始化页面
    router.push('/init');
  }
};
</script>

<style scoped>
.login-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: auto;
  margin-top: calc(50vh - 200px); /* 调整为适当的高度 */
  position: relative; /* 添加相对定位 */
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}
</style>
