<template>
  <div class="voucher-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>凭证管理</span>
          <el-button type="primary" @click="handleAdd">新增凭证</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="voucherNo" label="凭证号" width="180" />
        <el-table-column prop="summary" label="摘要" />
        <el-table-column prop="amount" label="金额" width="180" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([
  {
    date: '2024-01-09',
    voucherNo: 'V2024010901',
    summary: '销售收入',
    amount: '10000.00',
    status: '已审核'
  },
  {
    date: '2024-01-09',
    voucherNo: 'V2024010902',
    summary: '支付工资',
    amount: '50000.00',
    status: '未审核'
  }
])

const handleAdd = () => {
  // TODO: 实现新增凭证功能
  console.log('新增凭证')
}

const handleEdit = (row) => {
  // TODO: 实现编辑凭证功能
  console.log('编辑凭证', row)
}

const handleDelete = (row) => {
  // TODO: 实现删除凭证功能
  console.log('删除凭证', row)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped>
.voucher-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
