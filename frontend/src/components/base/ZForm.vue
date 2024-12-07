<template>
  <el-form
    ref="formRef"
    :model="modelValue"
    :rules="rules"
    :label-width="labelWidth"
    :disabled="disabled"
    :size="size"
    :inline="inline"
    :label-position="labelPosition"
    :hide-required-asterisk="hideRequiredAsterisk"
    :scroll-to-error="scrollToError"
    @submit.prevent="handleSubmit"
  >
    <slot></slot>
    
    <el-form-item v-if="showButtons">
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ submitText }}
      </el-button>
      <el-button
        v-if="showCancel"
        @click="handleCancel"
      >
        {{ cancelText }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElForm, ElFormItem, ElButton } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  labelWidth: {
    type: String,
    default: '100px'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  },
  inline: {
    type: Boolean,
    default: false
  },
  labelPosition: {
    type: String,
    default: 'right'
  },
  hideRequiredAsterisk: {
    type: Boolean,
    default: false
  },
  scrollToError: {
    type: Boolean,
    default: true
  },
  showButtons: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  submitText: {
    type: String,
    default: '提交'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'submit',
  'cancel',
  'validate'
])

const formRef = ref(null)
const loading = ref(false)

// 表单验证方法
const validate = async () => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

// 表单重置方法
const resetForm = () => {
  formRef.value?.resetFields()
}

// 清除验证
const clearValidate = (props = []) => {
  formRef.value?.clearValidate(props)
}

// 滚动到第一个错误字段
const scrollToField = (field) => {
  formRef.value?.scrollToField(field)
}

// 提交处理
const handleSubmit = async () => {
  if (loading.value || props.disabled) return
  
  loading.value = true
  try {
    const valid = await validate()
    if (valid) {
      emit('submit', props.modelValue)
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    loading.value = false
  }
}

// 取消处理
const handleCancel = () => {
  emit('cancel')
}

// 替换 $on 事件监听
watch(() => formRef.value, (form) => {
  if (form) {
    // 使用 onValidate 替代 $on('validate')
    form.validate = (...args) => {
      emit('validate', ...args)
    }
  }
})

// 暴露方法
defineExpose({
  formRef,
  validate,
  resetForm,
  clearValidate,
  scrollToField
})
</script>

<style scoped>
.form-buttons {
  margin-top: 24px;
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-form-item.is-error) {
  margin-bottom: 22px;
}

:deep(.el-form-item__error) {
  padding-top: 4px;
}
</style>
