<template>
  <div class="cash-flow-statement">
    <el-card class="filter-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="期间">
          <el-date-picker
            v-model="queryForm.period"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="显示零金额">
          <el-switch v-model="queryForm.showZero" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
          <el-button @click="handlePrint">打印</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="report-card">
      <div class="report-header">
        <h2>现金流量表</h2>
        <p>{{ reportPeriod }}</p>
        <p>单位：元</p>
      </div>

      <div class="report-content">
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          :show-header="false"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="name" label="项目" min-width="300" />
          <el-table-column prop="amount" label="本期金额" width="200" align="right" />
          <el-table-column prop="lastAmount" label="上期金额" width="200" align="right" />
        </el-table>

        <div class="summary-section">
          <div class="flow-summary">
            <h3>经营活动产生的现金流量净额：</h3>
            <div class="summary-item">
              <span>本期：</span>
              <span class="amount">{{ summary.operatingFlow }}</span>
            </div>
            <div class="summary-item">
              <span>上期：</span>
              <span class="amount">{{ summary.lastOperatingFlow }}</span>
            </div>
          </div>
          <div class="flow-summary">
            <h3>投资活动产生的现金流量净额：</h3>
            <div class="summary-item">
              <span>本期：</span>
              <span class="amount">{{ summary.investingFlow }}</span>
            </div>
            <div class="summary-item">
              <span>上期：</span>
              <span class="amount">{{ summary.lastInvestingFlow }}</span>
            </div>
          </div>
          <div class="flow-summary">
            <h3>筹资活动产生的现金流量净额：</h3>
            <div class="summary-item">
              <span>本期：</span>
              <span class="amount">{{ summary.financingFlow }}</span>
            </div>
            <div class="summary-item">
              <span>上期：</span>
              <span class="amount">{{ summary.lastFinancingFlow }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const queryForm = reactive({
  period: '',
  showZero: false
})

const tableData = ref([])
const summary = reactive({
  operatingFlow: '0.00',
  lastOperatingFlow: '0.00',
  investingFlow: '0.00',
  lastInvestingFlow: '0.00',
  financingFlow: '0.00',
  lastFinancingFlow: '0.00'
})

const reportPeriod = computed(() => {
  if (!queryForm.period) return ''
  return queryForm.period + ' 期间'
})

const handleQuery = () => {
  // TODO: 实现查询逻辑
  console.log('Query with:', queryForm)
}

const handleExport = () => {
  // TODO: 实现导出逻辑
  console.log('Export data')
}

const handlePrint = () => {
  // TODO: 实现打印逻辑
  console.log('Print report')
}
</script>

<style scoped>
.cash-flow-statement {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.report-card {
  margin-bottom: 20px;
}

.report-header {
  text-align: center;
  margin-bottom: 20px;
}

.report-header h2 {
  margin-bottom: 10px;
}

.report-header p {
  margin: 5px 0;
  color: #606266;
}

.report-content {
  margin-top: 20px;
}

.summary-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.flow-summary {
  margin-bottom: 15px;
}

.flow-summary h3 {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
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
