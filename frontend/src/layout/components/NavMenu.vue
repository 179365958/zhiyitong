<template>
  <el-menu
    :default-active="activeMenu"
    class="nav-menu"
    :collapse="isCollapse"
    background-color="#001529"
    text-color="#fff"
    active-text-color="#1890ff"
  >
    <template v-for="item in menuItems" :key="item.path">
      <el-sub-menu v-if="item.children" :index="item.path">
        <template #title>
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </template>
        <el-menu-item
          v-for="child in item.children"
          :key="item.path + '/' + child.path"
          :index="item.path + '/' + child.path"
          @click="handleMenuClick(item.path + '/' + child.path)"
        >
          {{ child.name }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="item.path" @click="handleMenuClick(item.path)">
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.name }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  menuItems: {
    type: Array,
    required: true
  },
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const handleMenuClick = (path) => {
  router.push(path)
}
</script>

<style scoped>
.nav-menu {
  border-right: none;
}

.nav-menu:not(.el-menu--collapse) {
  width: 240px;
}
</style>
