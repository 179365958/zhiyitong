<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :top="top"
    :modal="modal"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :center="center"
    :destroy-on-close="destroyOnClose"
    :fullscreen="fullscreen"
    :draggable="draggable"
    :before-close="handleBeforeClose"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!-- 自定义头部 -->
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>

    <!-- 内容区域 -->
    <div
      ref="contentRef"
      class="dialog-content"
      :class="{
        'is-scrollable': scrollable,
        'is-fullscreen': fullscreen
      }"
      :style="contentStyle"
    >
      <slot></slot>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <slot name="footer">
        <div v-if="showFooter" class="dialog-footer">
          <el-button
            v-if="showCancelButton"
            :size="buttonSize"
            :disabled="confirmLoading"
            @click="handleCancel"
          >
            {{ cancelButtonText }}
          </el-button>
          <el-button
            v-if="showConfirmButton"
            :size="buttonSize"
            type="primary"
            :loading="confirmLoading"
            @click="handleConfirm"
          >
            {{ confirmButtonText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElDialog, ElButton, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '50%'
  },
  top: {
    type: String,
    default: '15vh'
  },
  modal: {
    type: Boolean,
    default: true
  },
  appendToBody: {
    type: Boolean,
    default: true
  },
  lockScroll: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  center: {
    type: Boolean,
    default: false
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  draggable: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelButtonText: {
    type: String,
    default: '取消'
  },
  confirmButtonText: {
    type: String,
    default: '确定'
  },
  buttonSize: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['large', 'default', 'small'].includes(value)
    }
  },
  scrollable: {
    type: Boolean,
    default: false
  },
  contentHeight: {
    type: [String, Number],
    default: ''
  },
  beforeClose: {
    type: Function,
    default: null
  },
  beforeConfirm: {
    type: Function,
    default: null
  }
})

const emit = defineEmits([
  'update:modelValue',
  'open',
  'opened',
  'close',
  'closed',
  'cancel',
  'confirm'
])

const contentRef = ref(null)
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const confirmLoading = ref(false)

// 内容区域样式
const contentStyle = computed(() => {
  const style = {}
  if (props.contentHeight) {
    style.maxHeight = typeof props.contentHeight === 'number'
      ? `${props.contentHeight}px`
      : props.contentHeight
    style.overflowY = 'auto'
  }
  return style
})

// 关闭前的处理
const handleBeforeClose = async (done) => {
  if (props.beforeClose) {
    try {
      await props.beforeClose()
      done()
    } catch {
      // 如果 beforeClose 抛出错误或返回 false，则阻止关闭
    }
  } else {
    done()
  }
}

// 打开弹窗
const handleOpen = () => {
  emit('open')
}

// 弹窗打开动画结束
const handleOpened = () => {
  emit('opened')
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
  confirmLoading.value = false
}

// 弹窗关闭动画结束
const handleClosed = () => {
  emit('closed')
  confirmLoading.value = false
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

// 确认
const handleConfirm = async () => {
  if (confirmLoading.value) return

  try {
    confirmLoading.value = true

    if (props.beforeConfirm) {
      await props.beforeConfirm()
    }

    emit('confirm')
    dialogVisible.value = false
  } catch (error) {
    // 如果 beforeConfirm 抛出错误，显示错误消息
    if (error?.message) {
      ElMessageBox.alert(error.message, '错误', {
        type: 'error',
        confirmButtonText: '确定'
      })
    }
  } finally {
    confirmLoading.value = false
  }
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.isComposing && dialogVisible.value) {
    handleConfirm()
  }
}

// 监听键盘事件
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  contentRef,
  dialogVisible,
  confirmLoading
})
</script>

<style lang="scss" scoped>
.dialog-content {
  position: relative;
  padding: 8px 0;
  margin: 0;
  min-height: 100px;

  &.is-scrollable {
    overflow-y: auto;
    max-height: 60vh;
  }

  &.is-fullscreen {
    height: calc(100vh - 108px);
    overflow-y: auto;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 16px;

  .el-button {
    margin-left: 8px;

    &:first-child {
      margin-left: 0;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid #dcdfe6;
  }

  &__body {
    padding: 20px;
  }

  &__footer {
    padding: 10px 20px 20px;
    border-top: 1px solid #dcdfe6;
  }

  &.is-fullscreen {
    .dialog-content {
      height: calc(100vh - 108px);
      overflow-y: auto;
    }
  }
}
</style>
