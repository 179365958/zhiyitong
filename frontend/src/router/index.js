import { createRouter, createWebHistory } from 'vue-router'
import { menuItems } from './modules/menu'
import { getToken } from '@/utils/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'

// 自动生成路由配置
function generateRoutes(menuItems) {
  const routes = []
  
  menuItems.forEach(item => {
    if (item.children) {
      // 父级路由
      const parentRoute = {
        path: item.path,
        component: Home,
        redirect: `${item.path}/${item.children[0].path}`,
        meta: { title: item.name },
        children: []
      }
      
      // 子路由
      item.children.forEach(child => {
        parentRoute.children.push({
          path: child.path,
          name: `${item.path.slice(1)}.${child.path}`,
          component: () => import(`@/views/${child.component}.vue`),
          meta: { 
            title: child.name,
            parentTitle: item.name
          }
        })
      })
      
      routes.push(parentRoute)
    } else {
      // 无子菜单的路由
      routes.push({
        path: item.path,
        name: item.path.slice(1),
        component: () => import(`@/views/${item.component}.vue`),
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
    name: 'login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/',
    name: 'root',
    component: Home,
    redirect: '/dashboard',
    children: generateRoutes(menuItems)
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = getToken()
  
  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
