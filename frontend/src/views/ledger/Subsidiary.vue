<template>
  <div class="subsidiary-ledger">
    <el-card class="filter-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="科目">
          <el-cascader
            v-model="queryForm.subject"
            :options="subjectOptions"
            placeholder="请选择科目"
            clearable
          />
        </el-form-item>
        <el-form-item label="期间">
          <el-date-picker
            v-model="queryForm.period"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" border style="width: 100%" height="calc(100vh - 280px)">
        <el-table-column prop="date" label="日期" width="100" />
        <el-table-column prop="voucherNo" label="凭证号" width="100" />
        <el-table-column prop="summary" label="摘要" min-width="200" />
        <el-table-column prop="debit" label="借方" width="120" align="right" />
        <el-table-column prop="credit" label="贷方" width="120" align="right" />
        <el-table-column prop="balance" label="余额" width="120" align="right" />
        <el-table-column prop="direction" label="方向" width="80" />
      </el-table>

      <div class="summary-section">
        <div class="summary-item">
          <span>本期借方发生额：</span>
          <span class="amount">{{ summary.totalDebit }}</span>
        </div>
        <div class="summary-item">
          <span>本期贷方发生额：</span>
          <span class="amount">{{ summary.totalCredit }}</span>
        </div>
        <div class="summary-item">
          <span>期末余额：</span>
          <span class="amount">{{ summary.endingBalance }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const queryForm = reactive({
  subject: [],
  period: []
})

const subjectOptions = ref([])
const tableData = ref([])
const summary = reactive({
  totalDebit: '0.00',
  totalCredit: '0.00',
  endingBalance: '0.00'
})

const handleQuery = () => {
  // TODO: 实现查询逻辑
  console.log('Query with:', queryForm)
}

const handleExport = () => {
  // TODO: 实现导出逻辑
  console.log('Export data')
}
</script>

<style scoped>
.subsidiary-ledger {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.summary-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.summary-item {
  display: inline-block;
  margin-right: 30px;
}

.amount {
  font-weight: bold;
  color: #409EFF;
  margin-left: 8px;
}
</style>
