<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo">
        <h1>智易通</h1>
      </div>
      <nav-menu :menu-items="menuItems" />
    </aside>
    <div class="main-container">
      <header class="header">
        <div class="header-left">
          <button @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        <div class="header-right">
          <user-dropdown />
        </div>
      </header>
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavMenu from './components/NavMenu.vue'
import UserDropdown from './components/UserDropdown.vue'
import { menuItems } from '../router/modules/menu'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  color: white;
  transition: width 0.3s;
}

.sidebar.collapsed {
  width: 80px;
}

.logo {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  color: white;
  margin: 0;
  font-size: 20px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background-color: #f0f2f5;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
}

button:hover {
  color: #1890ff;
}
</style>
