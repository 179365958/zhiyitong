import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref([])
  const activeTab = ref('')

  // 添加新标签页
  function addTab(route) {
    const isExist = tabs.value.some(tab => tab.path === route.path)
    if (!isExist) {
      tabs.value.push({
        title: route.meta.title || route.name,
        path: route.path,
        name: route.name,
        closable: true
      })
    }
    activeTab.value = route.path
  }

  // 关闭标签页
  function closeTab(targetPath) {
    const targetIndex = tabs.value.findIndex(tab => tab.path === targetPath)
    if (targetIndex === -1) return

    tabs.value.splice(targetIndex, 1)
    
    // 如果关闭的是当前激活的标签页，需要激活其他标签页
    if (targetPath === activeTab.value) {
      if (tabs.value.length) {
        // 优先激活右侧标签页，如果没有则激活左侧标签页
        const nextTab = tabs.value[targetIndex] || tabs.value[targetIndex - 1]
        activeTab.value = nextTab.path
        return nextTab
      }
    }
  }

  // 关闭其他标签页
  function closeOtherTabs(path) {
    const keepTab = tabs.value.find(tab => tab.path === path)
    if (keepTab) {
      tabs.value = [keepTab]
      activeTab.value = keepTab.path
    }
  }

  // 关闭所有标签页
  function closeAllTabs() {
    tabs.value = []
    activeTab.value = ''
  }

  return {
    tabs,
    activeTab,
    addTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs
  }
})
