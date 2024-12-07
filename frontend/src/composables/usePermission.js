import { ref, watchEffect } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission(permission) {
  const userStore = useUserStore()
  const hasPermission = ref(true)

  watchEffect(() => {
    if (!permission) {
      hasPermission.value = true
      return
    }

    // 如果是超级管理员，拥有所有权限
    if (userStore.isSuperAdmin) {
      hasPermission.value = true
      return
    }

    // 检查用户是否拥有指定权限
    hasPermission.value = userStore.permissions.includes(permission)
  })

  return {
    hasPermission
  }
}
