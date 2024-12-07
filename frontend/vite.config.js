import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 生产环境移除 console
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  test: {
    // 启用类似 jest 的全局测试 API
    globals: true,
    // 使用 jsdom 环境
    environment: 'jsdom',
    // 支持 tsx 组件
    transformMode: {
      web: [/.[tj]sx$/]
    },
    // 测试设置文件
    setupFiles: ['./src/test/setup.js'],
    // CSS 相关配置
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/assets/',
        'dist/',
        '**/*.d.ts',
        'tests/',
        'test-utils/',
        '**/*.test.ts',
        'src/test/setup.js'
      ]
    }
  }
})
