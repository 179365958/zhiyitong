import { beforeAll, afterAll, afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局注册 Element Plus
config.global.plugins = [ElementPlus]

// 全局注册 Element Plus 图标
config.global.components = ElementPlusIconsVue

// 清理 DOM
afterEach(() => {
  document.body.innerHTML = ''
})
