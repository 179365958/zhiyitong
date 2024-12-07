import { createRouter, createWebHistory } from 'vue-router'
import { menuItems } from './modules/menu'
import { getToken } from '@/utils/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import { checkSystemInit } from '@/api/system'
import Initialize from '@/views/Initialize.vue'

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
    path: '/init',
    name: 'Initialize',
    component: Initialize,
    meta: { title: '系统初始化' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登录' }
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

  // 登录页面逻辑
  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else if (to.path === '/init') {
    next() // 直接跳转到初始化页面
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})


export default router
