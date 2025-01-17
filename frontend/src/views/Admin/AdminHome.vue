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
        <el-header>
          <h2>管理首页</h2>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'AdminHome',
  data() {
    return {
      activeIndex: 'dashboard'
    };
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
    }
  },
  mounted() {
    // 组件挂载后执行的代码
  }
};
</script>

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
</style>