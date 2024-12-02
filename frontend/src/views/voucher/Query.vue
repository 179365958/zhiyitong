<template>
  <div class="voucher-query">
    <h2>凭证查询</h2>
    
    <!-- 查询表单 -->
    <el-form :model="queryForm" :inline="true" class="query-form">
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
        />
      </el-form-item>
      <el-form-item label="凭证字号">
        <el-input v-model="queryForm.voucherNo" placeholder="请输入凭证字号" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="已审核" value="approved" />
          <el-option label="未审核" value="pending" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="date" label="日期" width="120" align="center" />
      <el-table-column prop="voucherNo" label="凭证字号" width="120" align="center" />
      <el-table-column prop="summary" label="摘要" min-width="200" />
      <el-table-column prop="debit" label="借方金额" width="150" align="right">
        <template #default="scope">
          {{ formatAmount(scope.row.debit) }}
        </template>
      </el-table-column>
      <el-table-column prop="credit" label="贷方金额" width="150" align="right">
        <template #default="scope">
          {{ formatAmount(scope.row.credit) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  }
]

// 查询表单数据
const queryForm = ref({
  dateRange: [],
  voucherNo: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    date: '2024-01-15',
    voucherNo: 'VP001',
    summary: '支付办公用品费用',
    debit: 1500.00,
    credit: 1500.00,
    status: 'approved'
  },
  {
    date: '2024-01-15',
    voucherNo: 'VP002',
    summary: '收到货款',
    debit: 5000.00,
    credit: 5000.00,
    status: 'pending'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 格式化金额
const formatAmount = (amount) => {
  return amount.toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    approved: '已审核',
    pending: '未审核',
    rejected: '已驳回'
  }
  return texts[status] || '未知'
}

// 查询方法
const handleQuery = () => {
  console.log('查询条件：', queryForm.value)
}

// 重置查询
const resetQuery = () => {
  queryForm.value = {
    dateRange: [],
    voucherNo: '',
    status: ''
  }
}

// 查看凭证
const handleView = (row) => {
  console.log('查看凭证：', row)
}

// 编辑凭证
const handleEdit = (row) => {
  console.log('编辑凭证：', row)
}

// 删除凭证
const handleDelete = (row) => {
  console.log('删除凭证：', row)
}

// 每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}
</script>

<style scoped>
.voucher-query {
  padding: 20px;
}

.query-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-button-group .el-button--link) {
  border: none;
}
</style>
