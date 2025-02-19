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
        // 获取路由的 meta.title 或使用路径作为默认名称
        const name = this.getRouteTitle(fullPath) || path.charAt(0).toUpperCase() + path.slice(1);
        return {
          name,
          path: fullPath,
        };
      });
    },
    getRouteTitle(path) {
      // 根据路径获取路由配置中的 meta.title
      const matchedRoute = this.$router.getRoutes().find(route => route.path === path);
      return matchedRoute?.meta?.title;
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