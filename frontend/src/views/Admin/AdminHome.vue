<template>
  <div class="admin-home">
    <el-container style="height: 100vh;">
      <el-aside width="200px">
        <el-menu :default-active="activeIndex" class="el-menu-vertical-demo" @select="handleSelect">
          <el-menu-item index="dashboard">仪表盘</el-menu-item>
          <el-menu-item index="user-management">用户管理</el-menu-item>
          <el-menu-item index="role-management">角色管理</el-menu-item>
          <el-menu-item index="permission-management">权限管理</el-menu-item>
          <el-menu-item index="account-management">账套管理</el-menu-item>
          <el-menu-item index="log-management">日志管理</el-menu-item>
          <el-menu-item index="system-settings">系统设置</el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header height="50px" class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
              <Fold v-if="!isCollapse"/>
              <Expand v-else/>
            </el-icon>
          </div>
          <div class="user-info">
            <el-dropdown @command="handleCommand" class="user-dropdown">
              <div class="user-dropdown-link">
                <el-avatar 
                  :src="userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642ab9b686a4768png.png'" 
                  :size="40" 
                  class="user-avatar"
                />
                <div class="user-name-wrapper">
                  <span class="user-name">{{ userInfo?.username || userInfo?.name || '未登录' }}</span>
                  <span class="user-role">{{ roleName }}</span>
                </div>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue';

export default {
  name: 'AdminHome',
  data() {
    return {
      activeIndex: 'dashboard',
      isCollapse: false
    };
  },
  computed: {
    userInfo() {
      const userStore = useUserStore();
      return userStore.userInfo;
    },
    roleName() {
      const userRoles = this.userInfo?.roles || [];
      const role = userRoles.find(role => role.code === 'super_admin');
      return role ? role.name : '普通用户';
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      switch (key) {
        case 'dashboard':
          this.$router.push({ path: '/admin/dashboard' });
          break;
        case 'user-management':
          this.$router.push({ path: '/admin/users' });
          break;
        case 'role-management':
          this.$router.push({ path: '/admin/roles' });
          break;
        case 'permission-management':
          this.$router.push({ path: '/admin/permissions' });
          break;
        case 'account-management':
          this.$router.push({ path: '/admin/accounts' });
          break;
        case 'log-management':
          this.$router.push({ path: '/admin/logs' });
          break;
        case 'system-settings':
          this.$router.push({ path: '/admin/settings' });
          break;
      }
    },
    handleCommand(command) {
      const userStore = useUserStore();
      if (command === 'logout') {
        userStore.logout();
        this.$router.push('/login');
      } else if (command === 'profile') {
        this.$router.push('/settings/profile');
      }
    }
  }
};
</script>

<style scoped>
/* 你的样式保持不变 */
</style>

<style scoped>
.admin-home {
  height: 100vh;
}
.el-menu-vertical-demo {
  background-color: #545c64;
  color: #fff;
  height: 100%;
}
.el-menu-vertical-demo .el-menu-item {
  color: #fff;
}
.el-menu-vertical-demo .el-menu-item:hover {
  background-color: #1f2d3d;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.header-left {
  display: flex;
  align-items: center;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}
.collapse-btn:hover {
  color: #409EFF;
}
.user-info {
  display: flex;
  align-items: center;
}
.user-dropdown-link {
  display: flex;
  align-items: center;
  color: #666;
  cursor: pointer;
}
.user-dropdown-link:hover {
  color: #409EFF;
}
.user-avatar {
  margin-right: 12px;
}
.user-name-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.user-name {
  font-size: 14px;
  margin-bottom: 4px;
}
.user-role {
  font-size: 12px;
  color: #999;
}
</style>