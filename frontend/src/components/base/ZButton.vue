<template>
  <el-button
    v-if="hasPermission"
    ref="buttonRef"
    :type="type"
    :size="size"
    :plain="plain"
    :round="round"
    :circle="circle"
    :loading="loading"
    :disabled="disabled || !hasPermission"
    :icon="icon"
    :autofocus="autofocus"
    :native-type="nativeType"
    @click="handleClick"
  >
    <slot></slot>
  </el-button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElButton, ElMessageBox } from 'element-plus'
import { usePermission } from '@/composables/usePermission'
import { debounce, throttle } from 'lodash-es'

const props = defineProps({
  // 按钮类型
  type: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['primary', 'success', 'warning', 'danger', 'info', 'text', 'default'].includes(value)
    }
  },
  // 按钮尺寸
  size: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['large', 'default', 'small'].includes(value)
    }
  },
  // 是否朴素按钮
  plain: {
    type: Boolean,
    default: false
  },
  // 是否圆角按钮
  round: {
    type: Boolean,
    default: false
  },
  // 是否圆形按钮
  circle: {
    type: Boolean,
    default: false
  },
  // 是否加载中状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否禁用状态
  disabled: {
    type: Boolean,
    default: false
  },
  // 图标类名
  icon: {
    type: String,
    default: ''
  },
  // 是否默认聚焦
  autofocus: {
    type: Boolean,
    default: false
  },
  // 原生type属性
  nativeType: {
    type: String,
    default: 'button',
    validator: (value) => {
      return ['button', 'submit', 'reset'].includes(value)
    }
  },
  // 权限控制
  permission: {
    type: String,
    default: ''
  },
  // 防抖延迟时间（毫秒）
  debounce: {
    type: Number,
    default: 0
  },
  // 节流延迟时间（毫秒）
  throttle: {
    type: Number,
    default: 0
  },
  // 确认配置
  confirmConfig: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['click'])
const buttonRef = ref(null)

// 权限检查
const { hasPermission } = usePermission(props.permission)

// 确认对话框
const showConfirm = async () => {
  if (!props.confirmConfig) return true

  try {
    await ElMessageBox.confirm(
      props.confirmConfig.message || '确认执行此操作？',
      props.confirmConfig.title || '确认',
      {
        confirmButtonText: props.confirmConfig.confirmButtonText || '确定',
        cancelButtonText: props.confirmConfig.cancelButtonText || '取消',
        type: props.confirmConfig.type || 'warning'
      }
    )
    return true
  } catch {
    return false
  }
}

// 点击事件处理
const handleClick = async (event) => {
  if (props.disabled || !hasPermission.value) return

  // 确认对话框
  if (props.confirmConfig) {
    const confirmed = await showConfirm()
    if (!confirmed) return
  }

  emit('click', event)
}

// 防抖处理
let debouncedClick = null
if (props.debounce > 0) {
  debouncedClick = debounce(handleClick, props.debounce)
}

// 节流处理
let throttledClick = null
if (props.throttle > 0) {
  throttledClick = throttle(handleClick, props.throttle)
}

// 清理防抖和节流
onBeforeUnmount(() => {
  debouncedClick?.cancel()
  throttledClick?.cancel()
})

defineExpose({
  buttonRef,
  hasPermission
})
</script>

<style lang="scss">
.el-button {
  &:not(:last-child) {
    margin-right: 8px;
    margin-bottom: 8px;
  }

  &[disabled] {
    cursor: not-allowed;
  }
}
</style>
