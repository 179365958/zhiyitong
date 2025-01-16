<template>
  <div class="admin-home">
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="activeIndex" class="el-menu-vertical-demo" @select="handleSelect">
          <el-menu-item index="home">首页</el-menu-item>
          <el-menu-item index="user-management">用户管理</el-menu-item>
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
import { ref } from 'vue';

export default {
  name: 'AdminHome',
  data() {
    return {
      activeIndex: 'home'
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      switch (key) {
        case 'home':
          this.$router.push({ path: '/admin/home' });
          break;
        case 'user-management':
          this.$router.push({ path: '/admin/user-management' });
          break;
        case 'log-management':
          this.$router.push({ path: '/admin/log-management' });
          break;
        case 'system-settings':
          this.$router.push({ path: '/admin/system-settings' });
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
  padding: 20px;
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