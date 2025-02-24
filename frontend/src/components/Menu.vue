<template>
  <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
    <div class="logo" @click="goToHome">
      <img src="../assets/logo.svg" alt="logo" />
      <span v-show="!isCollapse">智易通</span>
    </div>   
    <el-menu
      :default-active="$route.path"
      class="el-menu-vertical"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :popper-effect="'light'"
      :default-openeds="[]"
      :collapse-transition="true"
      router
      @select="handleSelect">
      <template v-for="item in menuItems" :key="item.path">
        <el-sub-menu v-if="item.children" :index="item.path">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
          </template>
          <el-menu-item v-for="child in item.children"
            :key="child.path"
            :index="`${item.path}/${child.path}`">
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </el-aside>
</template>

<script>
import { menuItems } from '@/router/modules/menu'
import { ArrowDown, Fold, Expand } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

export default {
  components: {
    ArrowDown,
    Fold,
    Expand
  },
  props: {
    isCollapse: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    menuItems() {
      return menuItems
    }
  },
  methods: {
    handleSelect(index) {
      this.$emit('select', index)
    },
    goToHome() {
      const router = useRouter()
      router.push('/')
    }
  }
}
</script>

<style scoped>
.aside {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #2b2f3a;
  overflow: hidden;
  cursor: pointer; /* 添加鼠标指针样式 */
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo span {
  color: #fff;
  font-size: 16px;
  margin-left: 12px;
  white-space: nowrap;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}
</style>