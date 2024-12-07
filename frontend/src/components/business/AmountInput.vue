<template>
  <el-input
    v-model="displayValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :size="size"
    @blur="handleBlur"
    @focus="handleFocus"
    @change="handleChange"
  >
    <template #prefix v-if="showCurrency">
      <span class="currency-symbol">{{ currencySymbol }}</span>
    </template>
  </el-input>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  // 小数位数
  precision: {
    type: Number,
    default: 2
  },
  // 最大值
  max: {
    type: Number,
    default: 999999999999.99
  },
  // 最小值
  min: {
    type: Number,
    default: -999999999999.99
  },
  // 是否显示千分位
  thousands: {
    type: Boolean,
    default: true
  },
  // 是否显示货币符号
  showCurrency: {
    type: Boolean,
    default: false
  },
  // 货币符号
  currencySymbol: {
    type: String,
    default: '¥'
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请输入金额'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 输入框大小
  size: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

// 显示值
const displayValue = ref('')

// 格式化金额
const formatAmount = (value) => {
  if (!value && value !== 0) return ''
  
  // 转换为数字
  let num = parseFloat(value)
  if (isNaN(num)) return ''
  
  // 检查范围
  if (num > props.max) {
    ElMessage.warning(`输入值不能大于${props.max}`)
    num = props.max
  }
  if (num < props.min) {
    ElMessage.warning(`输入值不能小于${props.min}`)
    num = props.min
  }
  
  // 处理精度
  num = Number(num.toFixed(props.precision))
  
  // 转换为字符串
  let str = num.toString()
  
  // 添加千分位
  if (props.thousands) {
    const parts = str.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    str = parts.join('.')
  }
  
  return str
}

// 解析金额
const parseAmount = (value) => {
  if (!value && value !== 0) return ''
  // 移除千分位
  const str = value.toString().replace(/,/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? '' : num
}

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  displayValue.value = formatAmount(newVal)
}, { immediate: true })

// 处理值变化
const handleChange = (value) => {
  const numValue = parseAmount(value)
  emit('update:modelValue', numValue)
  emit('change', numValue)
}

// 处理失焦
const handleBlur = (event) => {
  displayValue.value = formatAmount(displayValue.value)
  emit('blur', event)
}

// 处理聚焦
const handleFocus = (event) => {
  // 聚焦时显示无格式的数值
  displayValue.value = parseAmount(displayValue.value)
  emit('focus', event)
}
</script>

<style scoped>
.currency-symbol {
  color: #909399;
  margin-right: 4px;
}

:deep(.el-input__wrapper) {
  padding-right: 8px;
}

:deep(.el-input__inner) {
  text-align: right;
}
</style>
