<!-- src/components/Breadcrumb.vue -->
<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
        <router-link v-if="index < breadcrumbs.length - 1" :to="crumb.path">{{ crumb.name }}</router-link>
        <span v-else>{{ crumb.name }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbs: [],
    };
  },
  watch: {
    $route(to) {
      this.updateBreadcrumbs(to);
    },
  },
  created() {
    this.updateBreadcrumbs(this.$route);
  },
  methods: {
    updateBreadcrumbs(route) {
      const paths = route.path.split('/').filter(path => path);
      let fullPath = '';
      this.breadcrumbs = paths.map((path, index) => {
        fullPath += `/${path}`;
        console.log('Generated fullPath:', fullPath); // 调试日志
        const name = this.getRouteTitle(fullPath) || this.getDefaultTitle(path);
        return {
          name,
          path: fullPath,
        };
      });

      // 如果面包屑为空，添加首页
      if (this.breadcrumbs.length === 0) {
        this.breadcrumbs.push({
          name: '首页',
          path: '/',
        });
      }
    },
    getRouteTitle(path) {
      // 根据路径获取路由配置中的 meta.title
      const matchedRoute = this.$router.options.routes.find(route => route.path === path);
      console.log('Matched Route:', matchedRoute); // 调试日志
      return matchedRoute?.meta?.title;
    },
    getDefaultTitle(path) {
      // 使用中文作为默认标题
      const pathMap = {
        /*
        home: '首页',
        dashboard: '工作台',
        create: '凭证录入',
        review: '凭证审核',
        query: '凭证查询',
        general: '总账',
        subsidiary: '明细账',
        balance: '余额表',
        'balance-sheet': '资产负债表',
        income: '利润表',
        'cash-flow': '现金流量表',
        company: '企业信息',
        account: '账套管理',
        subject: '科目设置',
        user: '用户管理',
        role: '角色权限',
        setting: '系统设置',
        // 其他路径映射...
        */
      };
      return pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
    },
  },
};
</script>

<style scoped>
.breadcrumb {
  background-color: #f8f9fa;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  list-style: none;
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: none;
}
</style>