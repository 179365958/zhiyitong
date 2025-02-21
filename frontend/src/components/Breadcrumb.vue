<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li v-for="(crumb, index) in crumbs" :key="index" class="breadcrumb-item">
        <router-link v-if="index < crumbs.length - 1" :to="crumb.path">{{ crumb.title }}</router-link>
        <span v-else>{{ crumb.title }}</span>
      </li>
    </ol>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute();

    const crumbs = computed(() => {
      const pathArray = route.path.split('/').filter(path => path);
      const crumbs = [];
      let fullPath = '';

      pathArray.forEach((path, index) => {
        fullPath += `/${path}`;
        const matchedRoute = route.matched.find(r => r.path === fullPath);

        if (matchedRoute) {
          crumbs.push({
            path: fullPath,
            title: matchedRoute.meta.title || path
          });
        }
      });

      return crumbs;
    });

    return {
      crumbs
    };
  }
};
</script>

<style scoped>
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  list-style: none;
  background-color: #e9ecef;
  border-radius: 0.25rem;
}

.breadcrumb-item {
  display: flex;
}

.breadcrumb-item + .breadcrumb-item::before {
  display: inline-block;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  color: #6c757d;
  content: "/";
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item span {
  color: #6c757d;
}
</style>