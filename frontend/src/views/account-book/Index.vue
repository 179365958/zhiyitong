<template>
  <div class="account-book-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>账簿管理</span>
          <el-select v-model="bookType" placeholder="选择账簿类型">
            <el-option label="总账" value="general" />
            <el-option label="明细账" value="detail" />
            <el-option label="科目余额表" value="balance" />
          </el-select>
        </div>
      </template>
      
      <div class="search-bar">
        <el-form :inline="true">
          <el-form-item label="会计期间">
            <el-date-picker
              v-model="period"
              type="month"
              placeholder="选择会计期间"
            />
          </el-form-item>
          <el-form-item label="科目">
            <el-select v-model="subject" placeholder="选择科目">
              <el-option label="1001 库存现金" value="1001" />
              <el-option label="1002 银行存款" value="1002" />
              <el-option label="2001 应付账款" value="2001" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="voucherNo" label="凭证号" width="120" />
        <el-table-column prop="summary" label="摘要" />
        <el-table-column prop="debit" label="借方" width="120" />
        <el-table-column prop="credit" label="贷方" width="120" />
        <el-table-column prop="balance" label="余额" width="120" />
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

const bookType = ref('general')
const period = ref('')
const subject = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const tableData = ref([
  {
    date: '2024-01-09',
    voucherNo: 'V2024010901',
    summary: '销售收入',
    debit: '10000.00',
    credit: '0.00',
    balance: '10000.00'
  },
  {
    date: '2024-01-09',
    voucherNo: 'V2024010902',
    summary: '支付工资',
    debit: '0.00',
    credit: '5000.00',
    balance: '5000.00'
  }
])

const handleQuery = () => {
  // TODO: 实现查询功能
  console.log('查询', { bookType: bookType.value, period: period.value, subject: subject.value })
}

const handleExport = () => {
  // TODO: 实现导出功能
  console.log('导出账簿')
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
.account-book-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
