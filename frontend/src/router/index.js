import { createRouter, createWebHistory } from 'vue-router'
import { menuItems } from './modules/menu'
import { getToken, getUserInfo, fetchUserInfo, setUserInfo, setToken } from '@/utils/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Admin/Login.vue'
import { checkSystemInit } from '@/api/system'
import Profile from '@/views/settings/Profile.vue'
import { ElMessage } from 'element-plus' // 导入 ElMessage

import AdminHome from '@/views/Admin/AdminHome.vue';
import UserManagement from '@/views/Admin/UserManagement.vue';
import LogManagement from '@/views/Admin/LogManagement.vue';
import SystemSettings from '@/views/Admin/SystemSettings.vue';
import Dashboard from '@/views/Admin/Dashboard.vue';
import AccountManagement from '@/views/Admin/AccountManagement.vue';
import PermissionManagement from '@/views/Admin/PermissionManagement.vue';
import RoleManagement from '@/views/Admin/RoleManagement.vue';

// 动态导入组件的函数
const loadView = (view) => {
  // Vite 支持的动态导入格式
  return () => {
    // 处理不同类型的视图组件
    const componentMap = {
      // 基础组件
      'Dashboard': () => import('@/views/Dashboard.vue'),
      
      // 凭证管理
      'voucher/Create': () => import('@/views/voucher/Create.vue'),
      'voucher/Review': () => import('@/views/voucher/Review.vue'),
      'voucher/Query': () => import('@/views/voucher/Query.vue'),
      
      // 账簿管理
      'ledger/General': () => import('@/views/ledger/General.vue'),
      'ledger/Subsidiary': () => import('@/views/ledger/Subsidiary.vue'),
      'ledger/Balance': () => import('@/views/ledger/Balance.vue'),
      
      // 账套管理
      //'account-book/Initialize': () => import('@/views/account-book/Initialize.vue'),
      'account-book/Login': () => import('@/views/Admin/Login.vue'),
      // 财务报表
      'report/BalanceSheet': () => import('@/views/report/BalanceSheet.vue'),
      'report/Income': () => import('@/views/report/Income.vue'),
      'report/CashFlow': () => import('@/views/report/CashFlow.vue'),
      
      // 系统设置
      'settings/Company': () => import('@/views/settings/Company.vue'),
      'settings/Account': () => import('@/views/settings/Account.vue'),
      'settings/Subject': () => import('@/views/settings/Subject.vue'),
      'settings/User': () => import('@/views/settings/User.vue'),
      'settings/Role': () => import('@/views/settings/Role.vue'),
      'settings/Profile': () => import('@/views/settings/Profile.vue'), // 添加 Profile 路由

      // 管理页面 
      'admin/Dashboard': () => import('@/views/admin/Dashboard.vue'),
      'admin/UserManagement': () => import('@/views/admin/UserManagement.vue'),
      'admin/RoleManagement': () => import('@/views/admin/RoleManagement.vue'),
      'admin/PermissionManagement': () => import('@/views/admin/PermissionManagement.vue'),
      'admin/AccountManagement': () => import('@/views/admin/AccountManagement.vue'),
      'admin/LogManagement': () => import('@/views/admin/LogManagement.vue'),
      'admin/SystemSettings': () => import('@/views/admin/SystemSettings.vue'),
    }
    
    const loader = componentMap[view]
    if (!loader) {
      console.error(`视图组件 ${view} 未找到`)
      router.push('/404')
      return Promise.reject(new Error(`视图组件 ${view} 未找到`))
    }
    return loader()
  }
}

// 自动生成路由配置
function generateRoutes(menuItems) {
  const routes = []
  
  menuItems.forEach(item => {
    if (item.children) {
      // 子路由
      item.children.forEach(child => {
        routes.push({
          path: `${item.path}/${child.path}`,
          name: `${item.path.slice(1)}.${child.path}`,
          component: loadView(child.component),
          meta: { 
            title: child.name,
            parentTitle: item.name
          }
        })
      })
    } else {
      // 无子菜单的路由
      routes.push({
        path: item.path,
        name: item.path.slice(1),
        component: loadView(item.component),
        meta: { title: item.name }
      })
    }
  })
  
  return routes
}

// 基础路由
const baseRoutes = [
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import('@/views/Login.vue'),
    meta: { title: '用户登录' }
  },
  {
    path: '/Admin',
    name: 'AdminHome',
    component: AdminHome,
    meta: { title: '账套管理', requiresAuth: true, requiresAdmin: true },
    redirect: '/Admin/dashboard', // 添加这一行
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: Dashboard,
        meta: { title: '仪表盘' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: UserManagement,
        meta: { title: '用户管理' }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: RoleManagement,
        meta: { title: '角色管理' }
      },
      {
        path: 'permissions',
        name: 'PermissionManagement',
        component: PermissionManagement,
        meta: { title: '权限管理' }
      },
      {
        path: 'accounts',
        name: 'AccountManagement',
        component: AccountManagement,
        meta: { title: '账套管理' }
      },
      {
        path: 'logs',
        name: 'LogManagement',
        component: LogManagement,
        meta: { title: '日志管理' }
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: SystemSettings,
        meta: { title: '系统设置' }
      }
    ]
  },
  {
    path: '/Admin/login',
    name: 'AccountBookLogin',
    component: Login,
    meta: { title: '账套管理登录' }
  },
  {
    path: '/install',
    name: 'Install',
    component: () => import('@/views/install/Install.vue'),
    meta: { title: '账套初始化' }
  },
  {
    path: '/',
    component: Home,
    redirect: '/dashboard',
    children: generateRoutes(menuItems)
  },
  {
    path: '/settings/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '个人信息' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/404.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes
})

let isFetchingUserInfo = false; // 添加标志位

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = getToken()
  let userInfo = getUserInfo()
  
  // 不需要登录就可以访问的页面
  const publicPages = ['/login', '/install', '/Admin/login']
  const isPublicPage = publicPages.includes(to.path)

  if (isPublicPage) {
    if (token) {
      // 如果是从账套管理登录页登录
      if (to.path === '/Admin/login') {
        next('/Admin')
      } 
      // 如果是从主系统登录页登录
      else if (to.path === '/login') {
        next('/')
      } 
      else {
        next()
      }
    } else {
      next() // 允许访问公共页面
    }
  } else {
    if (token) {
      // 如果用户信息为空，从服务器获取最新的用户信息
      if (!userInfo && !isFetchingUserInfo) {
        isFetchingUserInfo = true;
        try {
          userInfo = await fetchUserInfo()
        } catch (error) {
          console.error('获取用户信息失败:', error)
          ElMessage.error('获取用户信息失败，请重新登录')
          setUserInfo(null)
          setToken(null)
          isFetchingUserInfo = false;
          return next('/login')
        }
        isFetchingUserInfo = false;
      }
      
      // 检查是否需要管理员权限
      if (to.matched.some(record => record.meta.requiresAdmin) && (!userInfo || !userInfo.isAdmin)) {
        ElMessage.error('您没有权限访问此页面')
        setUserInfo(null)
        setToken(null)
        return next('/login')
      } else {
        next() // 已登录用户可以访问其他页面
      }
    } else {
      // 未登录用户重定向到对应的登录页
      if (to.path.startsWith('/Admin')) {
        next('/Admin/login')
      } else {
        next('/login')
      }
    }
  }
})

export default router