<template>
  <el-dropdown trigger="click">
    <span class="user-dropdown-link">
      <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
      <span class="username">{{ username }}</span>
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="handleCommand('profile')">个人信息</el-dropdown-item>
        <el-dropdown-item @click="handleCommand('settings')">系统设置</el-dropdown-item>
        <el-dropdown-item divided @click="handleCommand('logout')">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('Admin') // 这里应该从用户状态管理中获取

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      // 这里应该调用登出API
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
}

.username {
  margin: 0 8px;
}
</style>
