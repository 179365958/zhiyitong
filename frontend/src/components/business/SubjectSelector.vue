<template>
  <div class="subject-selector">
    <el-popover
      v-model:visible="popoverVisible"
      trigger="click"
      placement="bottom-start"
      :width="500"
      @show="handlePopoverShow"
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
            <el-icon><Notebook /></el-icon>
          </template>
          <template #suffix>
            <el-icon><ArrowDown /></el-icon>
          </template>
        </el-input>
      </template>

      <!-- 弹出层内容 -->
      <div class="selector-content">
        <!-- 搜索框 -->
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索科目编码或名称"
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>

        <!-- 科目树 -->
        <div class="tree-container">
          <el-scrollbar>
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              :highlight-current="true"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              node-key="id"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <span class="subject-code">{{ data.code }}</span>
                  <span class="subject-name">{{ data.name }}</span>
                  <span 
                    v-if="data.direction !== undefined" 
                    class="subject-direction"
                  >
                    {{ data.direction === 1 ? '借' : '贷' }}
                  </span>
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>

        <!-- 底部操作栏 -->
        <div class="action-bar">
          <el-button @click="popoverVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Notebook, ArrowDown, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 是否只能选择明细科目
  detailOnly: {
    type: Boolean,
    default: true
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请选择科目'
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
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 弹出层显示状态
const popoverVisible = ref(false)
// 搜索关键词
const searchKeyword = ref('')
// 树形组件引用
const treeRef = ref(null)
// 当前选中的节点
const currentNode = ref(null)
// 显示值
const displayValue = ref('')

// 树形配置
const defaultProps = {
  children: 'children',
  label: 'name'
}

// 模拟科目数据 - 实际项目中应该从API获取
const treeData = ref([
  {
    id: '1001',
    code: '1001',
    name: '库存现金',
    direction: 1,
    isDetail: true
  },
  {
    id: '1002',
    code: '1002',
    name: '银行存款',
    direction: 1,
    isDetail: true
  },
  {
    id: '2001',
    code: '2001',
    name: '应付账款',
    direction: -1,
    children: [
      {
        id: '2001001',
        code: '2001001',
        name: '供应商A',
        direction: -1,
        isDetail: true
      },
      {
        id: '2001002',
        code: '2001002',
        name: '供应商B',
        direction: -1,
        isDetail: true
      }
    ]
  }
])

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    displayValue.value = ''
    currentNode.value = null
    return
  }
  // 根据ID查找节点并更新显示值
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === newVal) {
        displayValue.value = `${node.code} ${node.name}`
        currentNode.value = node
        return true
      }
      if (node.children && findNode(node.children)) {
        return true
      }
    }
    return false
  }
  findNode(treeData.value)
}, { immediate: true })

// 监听搜索关键词变化
watch(searchKeyword, (val) => {
  treeRef.value?.filter(val)
})

// 节点过滤方法
const filterNode = (value, data) => {
  if (!value) return true
  const searchStr = value.toLowerCase()
  return (
    data.code.toLowerCase().includes(searchStr) ||
    data.name.toLowerCase().includes(searchStr)
  )
}

// 弹出层显示时的处理
const handlePopoverShow = () => {
  searchKeyword.value = ''
  nextTick(() => {
    if (currentNode.value) {
      treeRef.value?.setCurrentKey(currentNode.value.id)
    }
  })
}

// 节点点击处理
const handleNodeClick = (data) => {
  if (props.detailOnly && !data.isDetail) {
    ElMessage.warning('请选择明细科目')
    return
  }
  currentNode.value = data
  displayValue.value = `${data.code} ${data.name}`
}

// 确认选择
const handleConfirm = () => {
  if (!currentNode.value) {
    ElMessage.warning('请选择科目')
    return
  }
  emit('update:modelValue', currentNode.value.id)
  emit('change', currentNode.value)
  popoverVisible.value = false
}

// 清除选择
const handleClear = () => {
  currentNode.value = null
  emit('update:modelValue', '')
  emit('change', null)
}

// 搜索处理
const handleSearch = () => {
  // 实际项目中可以在这里调用后端搜索API
}
</script>

<style scoped>
.subject-selector {
  display: inline-block;
  width: 100%;
}

.selector-content {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.search-bar {
  padding: 0 0 12px 0;
}

.tree-container {
  flex: 1;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.subject-code {
  color: #606266;
  margin-right: 8px;
}

.subject-name {
  color: #303133;
  flex: 1;
}

.subject-direction {
  color: #909399;
  font-size: 12px;
  padding: 2px 6px;
  background-color: #f4f4f5;
  border-radius: 2px;
}

.action-bar {
  padding: 12px 0 0 0;
  text-align: right;
}

:deep(.el-scrollbar__wrap) {
  height: 100%;
}

:deep(.el-tree-node__content) {
  height: 32px;
}
</style>
