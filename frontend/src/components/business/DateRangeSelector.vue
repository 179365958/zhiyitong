<template>
  <div class="date-range-selector">
    <el-popover
      v-model:visible="popoverVisible"
      trigger="click"
      placement="bottom-start"
      :width="300"
    >
      <template #reference>
        <el-input
          v-model="displayValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :size="size"
          :clearable="clearable"
          readonly
          @clear="handleClear"
        >
          <template #prefix>
            <el-icon><Calendar /></el-icon>
          </template>
          <template #suffix>
            <el-icon><ArrowDown /></el-icon>
          </template>
        </el-input>
      </template>

      <div class="selector-content">
        <!-- 快捷选项 -->
        <div class="shortcuts">
          <el-radio-group v-model="shortcutType" size="small">
            <el-radio-button value="month">月</el-radio-button>
            <el-radio-button value="quarter">季度</el-radio-button>
            <el-radio-button value="year">年</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 年份选择 -->
        <div class="year-selector">
          <el-button-group>
            <el-button size="small" @click="changeYear(-1)">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button size="small">{{ currentYear }}年</el-button>
            <el-button size="small" @click="changeYear(1)">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </el-button-group>
        </div>

        <!-- 期间选择网格 -->
        <div class="period-grid">
          <template v-if="shortcutType === 'month'">
            <el-button
              v-for="month in 12"
              :key="month"
              size="small"
              :type="isSelectedMonth(month) ? 'primary' : ''"
              @click="selectMonth(month)"
            >
              {{ month }}月
            </el-button>
          </template>

          <template v-if="shortcutType === 'quarter'">
            <el-button
              v-for="quarter in 4"
              :key="quarter"
              size="small"
              :type="isSelectedQuarter(quarter) ? 'primary' : ''"
              @click="selectQuarter(quarter)"
            >
              第{{ quarter }}季度
            </el-button>
          </template>

          <template v-if="shortcutType === 'year'">
            <el-button
              size="small"
              :type="isSelectedYear ? 'primary' : ''"
              @click="selectYear"
            >
              {{ currentYear }}年
            </el-button>
          </template>
        </div>

        <!-- 底部操作栏 -->
        <div class="action-bar">
          <el-button size="small" @click="popoverVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Calendar, ArrowDown, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      startDate: '',
      endDate: ''
    })
  },
  // 最小可选日期
  minDate: {
    type: String,
    default: '2000-01-01'
  },
  // 最大可选日期
  maxDate: {
    type: String,
    default: '2099-12-31'
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请选择日期范围'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 尺寸
  size: {
    type: String,
    default: 'default'
  },
  // 是否可清除
  clearable: {
    type: Boolean,
    default: true
  },
  // 日期格式
  format: {
    type: String,
    default: 'YYYY-MM-DD'
  },
  // 显示格式
  displayFormat: {
    type: String,
    default: 'YYYY年MM月'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 弹出层显示状态
const popoverVisible = ref(false)
// 快捷选项类型
const shortcutType = ref('month')
// 当前年份
const currentYear = ref(dayjs().year())
// 临时选择的日期范围
const tempRange = ref({
  startDate: '',
  endDate: ''
})

// 显示值
const displayValue = computed(() => {
  if (!props.modelValue.startDate || !props.modelValue.endDate) {
    return ''
  }
  const start = dayjs(props.modelValue.startDate)
  const end = dayjs(props.modelValue.endDate)
  return `${start.format(props.displayFormat)} - ${end.format(props.displayFormat)}`
})

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  if (newVal.startDate && newVal.endDate) {
    tempRange.value = { ...newVal }
    currentYear.value = dayjs(newVal.startDate).year()
  }
}, { immediate: true })

// 改变年份
const changeYear = (delta) => {
  const newYear = currentYear.value + delta
  const minYear = dayjs(props.minDate).year()
  const maxYear = dayjs(props.maxDate).year()
  
  if (newYear >= minYear && newYear <= maxYear) {
    currentYear.value = newYear
    // 清除当前选择
    tempRange.value = {
      startDate: '',
      endDate: ''
    }
  }
}

// 判断月份是否被选中
const isSelectedMonth = (month) => {
  if (!tempRange.value.startDate) return false
  const start = dayjs(tempRange.value.startDate)
  return start.year() === currentYear.value && start.month() + 1 === month
}

// 判断季度是否被选中
const isSelectedQuarter = (quarter) => {
  if (!tempRange.value.startDate) return false
  const start = dayjs(tempRange.value.startDate)
  return start.year() === currentYear.value && Math.floor(start.month() / 3) + 1 === quarter
}

// 判断年份是否被选中
const isSelectedYear = computed(() => {
  if (!tempRange.value.startDate) return false
  const start = dayjs(tempRange.value.startDate)
  return start.year() === currentYear.value
})

// 选择月份
const selectMonth = (month) => {
  const startDate = dayjs()
    .year(currentYear.value)
    .month(month - 1)
    .startOf('month')
    .format(props.format)
  const endDate = dayjs()
    .year(currentYear.value)
    .month(month - 1)
    .endOf('month')
    .format(props.format)
  
  tempRange.value = { startDate, endDate }
}

// 选择季度
const selectQuarter = (quarter) => {
  const startMonth = (quarter - 1) * 3
  const startDate = dayjs()
    .year(currentYear.value)
    .month(startMonth)
    .startOf('month')
    .format(props.format)
  const endDate = dayjs()
    .year(currentYear.value)
    .month(startMonth + 2)
    .endOf('month')
    .format(props.format)
  
  tempRange.value = { startDate, endDate }
}

// 选择年份
const selectYear = () => {
  const startDate = dayjs()
    .year(currentYear.value)
    .startOf('year')
    .format(props.format)
  const endDate = dayjs()
    .year(currentYear.value)
    .endOf('year')
    .format(props.format)
  
  tempRange.value = { startDate, endDate }
}

// 确认选择
const handleConfirm = () => {
  if (!tempRange.value.startDate || !tempRange.value.endDate) {
    return
  }
  emit('update:modelValue', { ...tempRange.value })
  emit('change', { ...tempRange.value })
  popoverVisible.value = false
}

// 清除选择
const handleClear = () => {
  tempRange.value = {
    startDate: '',
    endDate: ''
  }
  emit('update:modelValue', { ...tempRange.value })
  emit('change', { ...tempRange.value })
}
</script>

<style scoped>
.date-range-selector {
  display: inline-block;
  width: 100%;
}

.selector-content {
  padding: 8px;
}

.shortcuts {
  margin-bottom: 12px;
  text-align: center;
}

.year-selector {
  margin-bottom: 12px;
  text-align: center;
}

.period-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.period-grid .el-button {
  width: 100%;
}

.action-bar {
  text-align: right;
  border-top: 1px solid #dcdfe6;
  padding-top: 12px;
}

:deep(.el-input__wrapper) {
  padding-right: 8px;
}
</style>
