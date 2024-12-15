<template>
  <div class="z-table">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="table-toolbar">
      <div class="left-tools">
        <slot name="tools-left">
          <el-button
            v-if="showRefresh"
            :icon="Refresh"
            circle
            @click="handleRefresh"
          />
          <el-button
            v-if="showDensity"
            :icon="Scale"
            circle
            @click="densityVisible = true"
          >
            <el-dropdown
              v-model="density"
              trigger="click"
              :hide-on-click="true"
              @command="handleDensity"
            >
              <span class="el-dropdown-link">
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="large">宽松</el-dropdown-item>
                  <el-dropdown-item command="default">默认</el-dropdown-item>
                  <el-dropdown-item command="small">紧凑</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-button>
          <el-button
            v-if="showSetting"
            :icon="Setting"
            circle
            @click="settingVisible = true"
          />
        </slot>
      </div>
      <div class="right-tools">
        <slot name="tools-right"></slot>
      </div>
    </div>

    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :height="height"
      :max-height="maxHeight"
      :stripe="stripe"
      :border="border"
      :size="density"
      :row-key="rowKey"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      :show-summary="showSummary"
      :sum-text="sumText"
      :summary-method="summaryMethod"
      :selection-type="selectionType"
      :highlight-current-row="highlightCurrentRow"
      @selection-change="handleSelectionChange"
      @current-change="handleCurrentChange"
      @row-click="handleRowClick"
      @sort-change="handleSortChange"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selectionType === 'checkbox'"
        type="selection"
        width="50"
        align="center"
        fixed="left"
      />
      <el-table-column
        v-if="selectionType === 'radio'"
        width="50"
        align="center"
        fixed="left"
      >
        <template #default="{ row }">
          <el-radio
            v-model="currentRow"
            :value="row[rowKey]"
            @change="() => handleRadioChange(row)"
          >
            <span></span>
          </el-radio>
        </template>
      </el-table-column>

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        width="50"
        label="序号"
        align="center"
        fixed="left"
      />

      <!-- 数据列 -->
      <slot></slot>

      <!-- 操作列 -->
      <el-table-column
        v-if="$slots.operation"
        :label="operationLabel"
        :width="operationWidth"
        :fixed="operationFixed"
        align="center"
      >
        <template #default="scope">
          <slot name="operation" v-bind="scope"></slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 列设置抽屉 -->
    <el-drawer
      v-model="settingVisible"
      title="列设置"
      size="300px"
    >
      <el-checkbox-group v-model="visibleColumns">
        <div v-for="col in allColumns" :key="col.prop" class="column-item">
          <el-checkbox :label="col.prop">{{ col.label }}</el-checkbox>
        </div>
      </el-checkbox-group>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, useSlots } from 'vue'
import { Refresh, Setting, Scale, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: ''
  },
  // 最大高度
  maxHeight: {
    type: [String, Number],
    default: ''
  },
  // 是否显示斑马纹
  stripe: {
    type: Boolean,
    default: true
  },
  // 是否显示边框
  border: {
    type: Boolean,
    default: true
  },
  // 行数据的Key
  rowKey: {
    type: String,
    default: 'id'
  },
  // 树形数据配置
  treeProps: {
    type: Object,
    default: () => ({
      children: 'children',
      hasChildren: 'hasChildren'
    })
  },
  // 是否默认展开所有行
  defaultExpandAll: {
    type: Boolean,
    default: false
  },
  // 展开行的keys
  expandRowKeys: {
    type: Array,
    default: () => []
  },
  // 选择类型：none, checkbox, radio
  selectionType: {
    type: String,
    default: 'none'
  },
  // 是否高亮当前行
  highlightCurrentRow: {
    type: Boolean,
    default: false
  },
  // 是否显示合计行
  showSummary: {
    type: Boolean,
    default: false
  },
  // 合计行第一列的文本
  sumText: {
    type: String,
    default: '合计'
  },
  // 自定义的合计计算方法
  summaryMethod: {
    type: Function,
    default: null
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 是否显示刷新按钮
  showRefresh: {
    type: Boolean,
    default: true
  },
  // 是否显示密度设置
  showDensity: {
    type: Boolean,
    default: true
  },
  // 是否显示列设置
  showSetting: {
    type: Boolean,
    default: true
  },
  // 是否显示序号列
  showIndex: {
    type: Boolean,
    default: true
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 分页大小选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  // 分页布局
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  // 操作列标签
  operationLabel: {
    type: String,
    default: '操作'
  },
  // 操作列宽度
  operationWidth: {
    type: [String, Number],
    default: ''
  },
  // 操作列是否固定
  operationFixed: {
    type: String,
    default: 'right'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:data',
  'selection-change',
  'current-change',
  'row-click',
  'sort-change',
  'refresh',
  'size-change',
  'current-page-change'
])

// 表格引用
const tableRef = ref(null)
// 表格数据
const tableData = computed(() => props.data)
// 当前选中行
const currentRow = ref(null)
// 表格密度
const density = ref('default')
// 列设置抽屉可见性
const settingVisible = ref(false)
// 密度下拉可见性
const densityVisible = ref(false)
// 分页相关
const currentPage = ref(1)
const pageSize = ref(props.pageSizes[0])
const total = ref(0)

// 获取所有列
const slots = useSlots()
const allColumns = computed(() => {
  const columns = []
  if (slots.default) {
    slots.default().forEach(vnode => {
      if (vnode.type.name === 'ElTableColumn' && vnode.props) {
        columns.push({
          prop: vnode.props.prop,
          label: vnode.props.label
        })
      }
    })
  }
  return columns
})

// 可见列
const visibleColumns = ref([])

// 监听数据变化
watch(() => props.data, (newVal) => {
  if (props.showPagination) {
    total.value = newVal.length
  }
}, { immediate: true })

// 表格方法
const methods = {
  // 刷新
  refresh() {
    emit('refresh')
  },
  // 重置
  reset() {
    currentPage.value = 1
    pageSize.value = props.pageSizes[0]
    currentRow.value = null
    if (tableRef.value) {
      tableRef.value.clearSelection()
      tableRef.value.clearSort()
      tableRef.value.clearFilter()
    }
  },
  // 获取选中的行数据
  getSelectionRows() {
    return tableRef.value?.getSelectionRows() || []
  },
  // 切换行选中状态
  toggleRowSelection(row, selected) {
    tableRef.value?.toggleRowSelection(row, selected)
  }
}

// 事件处理
const handleRefresh = () => {
  methods.refresh()
}

const handleDensity = (command) => {
  density.value = command
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleCurrentChange = (currentRow, oldCurrentRow) => {
  emit('current-change', currentRow, oldCurrentRow)
}

const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event)
}

const handleSortChange = (sort) => {
  emit('sort-change', sort)
}

const handleRadioChange = (row) => {
  emit('current-change', row)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  emit('size-change', val)
}

const handlePageChange = (val) => {
  currentPage.value = val
  emit('current-page-change', val)
}

// 暴露方法
defineExpose(methods)
</script>

<style scoped>
.z-table {
  background-color: #fff;
  border-radius: 4px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #ebeef5;
}

.left-tools,
.right-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.column-item {
  padding: 8px 16px;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
}

:deep(.el-table__header) {
  background-color: #f5f7fa;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-radio) {
  margin-right: 0;
}
</style>
