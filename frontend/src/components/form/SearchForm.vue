<template>
  <div class="search-form">
    <el-form
      ref="formRef"
      :model="formData"
      :inline="true"
      size="default"
    >
      <slot :form-data="formData"></slot>
      
      <el-form-item>
        <z-button type="primary" :loading="loading" @click="handleSearch">
          <el-icon><Search /></el-icon>
          查询
        </z-button>
        <z-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </z-button>
        <el-button
          v-if="showAdvanced"
          link
          type="primary"
          @click="toggleAdvanced"
        >
          {{ advanced ? '收起' : '展开' }}
          <el-icon>
            <component :is="advanced ? 'ArrowUp' : 'ArrowDown'" />
          </el-icon>
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 高级搜索区域 -->
    <el-collapse-transition>
      <div v-show="advanced" class="advanced-search">
        <slot name="advanced" :form-data="formData"></slot>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import ZButton from '../base/ZButton.vue'

const props = defineProps({
  // 是否显示高级搜索
  showAdvanced: {
    type: Boolean,
    default: false
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['search', 'reset'])

// 表单数据
const formData = reactive({})

// 表单引用
const formRef = ref(null)

// 是否显示高级搜索
const advanced = ref(false)

// 切换高级搜索
const toggleAdvanced = () => {
  advanced.value = !advanced.value
}

// 搜索
const handleSearch = () => {
  emit('search', formData)
}

// 重置
const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
}
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.advanced-search {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
</style>
