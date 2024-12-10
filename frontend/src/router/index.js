import { createRouter, createWebHistory } from 'vue-router'
import { menuItems } from './modules/menu'
import { getToken } from '@/utils/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/account-book/Login.vue'
import { checkSystemInit } from '@/api/system'
import Initialize from '@/views/account-book/Initialize.vue'

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
      'account-book/Initialize': () => import('@/views/account-book/Initialize.vue'),
      
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
    path: '/account-book',
    name: 'AccountBook',
    component: () => import('@/views/account-book/AccountManagement.vue'),
    meta: { title: '账套管理' }
  },
  {
    path: '/account-book/login',
    name: 'AccountBookLogin',
    component: () => import('@/views/account-book/Login.vue'),
    meta: { title: '账套管理登录' }
  },
  {
    path: '/init',
    name: 'Initialize',
    component: Initialize,
    meta: { title: '账套初始化' }
  },
  {
    path: '/',
    component: Home,
    redirect: '/dashboard',
    children: generateRoutes(menuItems)
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

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = getToken()
  
  // 不需要登录就可以访问的页面
  const publicPages = ['/login', '/init', '/account-book', '/account-book/login']
  const isPublicPage = publicPages.includes(to.path)

  if (isPublicPage) {
    if (token && to.path === '/login') {
      next('/') // 已登录用户访问登录页，重定向到首页
    } else {
      next() // 允许访问公共页面
    }
  } else {
    if (token) {
      next() // 已登录用户可以访问其他页面
    } else {
      next('/login') // 未登录用户重定向到登录页
    }
  }
})

export default router
