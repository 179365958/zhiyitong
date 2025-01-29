<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
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
    <el-container>
      <el-header height="50px" class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>
        </div>
        <div class="account-select">
          <el-select v-model="selectedAccount" placeholder="请选择账套" @change="handleAccountChange">
            <el-option
               v-for="item in accounts"
               :key="item.id"
               :label="item.company_name"
               :value="item.id">
          </el-option>
         </el-select>
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
      <el-container class="main-container">
        <!-- 标签页 -->
        <div class="tabs-bar">
          <el-tabs
            v-model="activeTab"
            type="card"
            closable
            @tab-remove="removeTab"
            @tab-click="handleTabClick"
          >
            <el-tab-pane
              v-for="item in tabs"
              :key="item.path"
              :label="item.title"
              :name="item.path"
              :closable="item.closable"
            >
            </el-tab-pane>
          </el-tabs>
          <!-- 标签页操作按钮 -->
          <div class="tabs-actions">
            <el-dropdown @command="handleTabsCommand">
              <el-button size="small">
                标签操作
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="closeOther">关闭其他</el-dropdown-item>
                  <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 路由视图 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <component :is="Component" ref="subjectComponent" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import { getCompanyList, switchDatabase } from '@/api/system';
import { setCurrentCompany, getCurrentCompany } from '@/utils/auth';
import { useUserStore } from '@/stores/user';
import { useAccountStore } from '@/stores/account'; // 引入 Pinia Store

export default {
  data() {
    return {
      selectedAccount: '',
      accounts: []
    };
  },
  computed: {
    userInfo() {
      const userStore = useUserStore();
      return userStore.userInfo;
    },
    roleName() {
    const userRoles = this.userInfo?.roles || [];
    
    // 定义角色映射
    const roleMapping = {
      'super_admin': '超级管理员',
      'admin': '管理员',
      // 可以继续添加其他角色映射
    };

    // 检查用户的角色
    for (const role of userRoles) {
      if (role.code in roleMapping) {
        return roleMapping[role.code];
      }
    }

    // 如果没有匹配到任何定义的角色，返回 '普通用户'
    return '普通用户';
  }
  },
  methods: {
    async fetchAccounts() {
      try {
        const userStore = useUserStore();
        const userId = userStore.userInfo.id;

        const response = await getCompanyList({ userId });
        console.log('fetchAccounts response:', response); // 添加日志输出

        const companies = response.data.list || [];
        if (Array.isArray(companies)) {
          this.accounts = companies.map(company => ({
            id: company.id,
            company_name: company.company_name
          }));
        } else {
          console.error('Unexpected response structure:', response);
          throw new Error('获取账套列表失败');
        }

        const currentCompany = getCurrentCompany();
        if (currentCompany) {
          this.selectedAccount = currentCompany.id;
        }
      } catch (error) {
        console.error('获取账套列表失败:', error);
      }
    },
    async handleAccountChange(value) {
      const userStore = useUserStore();
      const accountStore = useAccountStore(); // 使用 Pinia Store
      const userId = userStore.userInfo.id;
      const selectedCompany = this.accounts.find(account => account.id === value);
      if (selectedCompany) {
        setCurrentCompany(selectedCompany);
        console.log('Selected account:', selectedCompany);

        // 更新 Pinia Store 中的状态
        accountStore.setCurrentAccount(selectedCompany);

        // 发送选择的账套信息到后端
        await this.switchDatabase(selectedCompany, userId);

        // 手动触发 Subject.vue 中的 fetchSubjects 方法
        this.$refs.subjectComponent.fetchSubjects();
      }
    },
    async switchDatabase(company, userId) {
      try {
        const response = await switchDatabase({
          companyId: company.id,
          userId: userId
        });
        if (response.success) {
          console.log('Database switched successfully');
        } else {
          console.error('Failed to switch database:', response.message);
        }
      } catch (error) {
        console.error('Error switching database:', error);
      }
    },
    handleTabsCommand(command) {
      if (command === 'closeOther') {
        tabsStore.closeOtherTabs(route.path);
      } else if (command === 'closeAll') {
        tabsStore.closeAllTabs();
        router.push('/dashboard');
      }
    },
    handleCommand(command) {
      if (command === 'logout') {
        userStore.logout();
        router.push('/login');
      } else if (command === 'profile') {
        router.push('/settings/profile');
      }
    },
    handleSaveAndNew() {
      // 定义 handleSaveAndNew 方法的逻辑
      console.log('handleSaveAndNew 方法被调用');
    },
  },

  async mounted() {
    await this.fetchAccounts();
  }
};
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { menuItems } from '@/router/modules/menu'
import { useUserStore } from '@/stores/user'
import { ArrowDown, Fold, Expand } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const userStore = useUserStore()
const isCollapse = ref(false)

// 菜单相关
const activeMenu = computed(() => route.path)

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 标签页相关
const tabs = computed(() => tabsStore.tabs)
const activeTab = computed({
  get: () => tabsStore.activeTab,
  set: (val) => {
    tabsStore.activeTab = val
  }
})

// 处理菜单选择
const handleSelect = (index) => {
  if (index === route.path) return
  router.push(index)
}

// 处理标签页点击
const handleTabClick = (tab) => {
  if (tab.props.name === route.path) return
  router.push(tab.props.name)
}

// 处理标签页移除
const removeTab = (targetPath) => {
  tabsStore.removeTab(targetPath)
  if (route.path === targetPath) {
    const lastTab = tabsStore.tabs[tabsStore.tabs.length - 1]
    if (lastTab) {
      router.push(lastTab.path)
    }
  }
}

// 处理标签页操作
const handleTabsCommand = (command) => {
  if (command === 'closeOther') {
    tabsStore.closeOtherTabs(route.path)
  } else if (command === 'closeAll') {
    tabsStore.closeAllTabs()
    router.push('/dashboard')
  }
}

// 处理用户下拉菜单操作
const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/settings/profile')
  }
}

// 监听路由变化，添加标签页
onMounted(async () => {
  try {
    console.log('Home onMounted: 开始获取用户信息')
    console.log('当前用户信息:', userStore.userInfo)
    
    // 检查并更新用户信息
    await userStore.safeGetUserInfo()
    
    console.log('Home onMounted: 获取用户信息完成')
    console.log('更新后用户信息:', userStore.userInfo)

    if (route.name) {
      tabsStore.addTab(route)
    }
  } catch (error) {
    console.error('初始化标签页时出错:', error)
    router.push('/login')
  }
})
</script>
<style scoped>
.layout-container {
  height: 100vh;
}

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

:deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
  border-left: 3px solid #409EFF;
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

:deep(.el-menu-item) {
  border-left: 3px solid transparent;
}

.el-icon {
  margin-right: 12px;
  width: 1em;
  height: 1em;
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

.user-info .user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info .user-avatar {
  margin-right: 10px;
}

.user-info .user-name-wrapper {
  display: flex;
  flex-direction: column;
  margin-right: 10px;
}

.user-info .user-name {
  font-size: 14px;
}

.user-info .user-role {
  font-size: 12px;
  color: #999;
}

.main-container {
  flex-direction: column;
  height: calc(100vh - 50px);
}

.tabs-bar {
  padding: 6px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-content {
  padding: 16px;
  background-color: #f0f2f5;
  height: 100%;
  overflow-y: auto;
}

.aside::-webkit-scrollbar {
  width: 0;
}

.aside::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.aside::-webkit-scrollbar-track {
  background-color: transparent;
}



.account-select {
  width: 200px;
  margin-left: auto;  /* 添加这行，将账套选择推到右边 */
  margin-right: 20px; /* 添加这行，与用户信息保持间距 */
}

</style>

