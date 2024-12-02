<template>
  <div class="voucher-review">
    <h2>凭证审核</h2>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="number" label="凭证号" width="180" />
      <el-table-column prop="summary" label="摘要" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleApprove(scope.row)">审核</el-button>
          <el-button size="small" type="danger" @click="handleReject(scope.row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    date: '2024-01-15',
    number: 'VP001',
    summary: '支付办公用品费用',
    status: '待审核'
  },
  {
    date: '2024-01-15',
    number: 'VP002',
    summary: '收到货款',
    status: '待审核'
  }
])

const handleApprove = (row) => {
  console.log('审核通过', row)
}

const handleReject = (row) => {
  console.log('驳回', row)
}
</script>

<style scoped>
.voucher-review {
  padding: 20px;
}
</style>
