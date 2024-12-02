<template>
  <div class="report-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>报表管理</span>
          <el-select v-model="reportType" placeholder="选择报表类型">
            <el-option label="资产负债表" value="balance-sheet" />
            <el-option label="利润表" value="income-statement" />
            <el-option label="现金流量表" value="cash-flow" />
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
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleExport">导出</el-button>
            <el-button @click="handlePrint">打印</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 资产负债表示例 -->
      <div v-if="reportType === 'balance-sheet'" class="report-content">
        <h3 class="report-title">资产负债表</h3>
        <div class="report-header">
          <span>编制单位：XXX公司</span>
          <span>{{ formatPeriod }}</span>
        </div>
        <el-table :data="balanceSheetData" style="width: 100%">
          <el-table-column prop="assetName" label="资产" />
          <el-table-column prop="assetAmount" label="金额" width="180" />
          <el-table-column prop="liabilityName" label="负债和所有者权益" />
          <el-table-column prop="liabilityAmount" label="金额" width="180" />
        </el-table>
      </div>

      <!-- 利润表示例 -->
      <div v-if="reportType === 'income-statement'" class="report-content">
        <h3 class="report-title">利润表</h3>
        <div class="report-header">
          <span>编制单位：XXX公司</span>
          <span>{{ formatPeriod }}</span>
        </div>
        <el-table :data="incomeStatementData" style="width: 100%">
          <el-table-column prop="item" label="项目" />
          <el-table-column prop="amount" label="金额" width="180" />
        </el-table>
      </div>

      <!-- 现金流量表示例 -->
      <div v-if="reportType === 'cash-flow'" class="report-content">
        <h3 class="report-title">现金流量表</h3>
        <div class="report-header">
          <span>编制单位：XXX公司</span>
          <span>{{ formatPeriod }}</span>
        </div>
        <el-table :data="cashFlowData" style="width: 100%">
          <el-table-column prop="item" label="项目" />
          <el-table-column prop="amount" label="金额" width="180" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const reportType = ref('balance-sheet')
const period = ref('')

// 格式化会计期间显示
const formatPeriod = computed(() => {
  if (!period.value) return ''
  const date = new Date(period.value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
})

// 示例数据 - 资产负债表
const balanceSheetData = ref([
  {
    assetName: '流动资产',
    assetAmount: '100,000.00',
    liabilityName: '流动负债',
    liabilityAmount: '50,000.00'
  },
  {
    assetName: '非流动资产',
    assetAmount: '200,000.00',
    liabilityName: '非流动负债',
    liabilityAmount: '100,000.00'
  },
  {
    assetName: '',
    assetAmount: '',
    liabilityName: '所有者权益',
    liabilityAmount: '150,000.00'
  }
])

// 示例数据 - 利润表
const incomeStatementData = ref([
  {
    item: '营业收入',
    amount: '500,000.00'
  },
  {
    item: '营业成本',
    amount: '300,000.00'
  },
  {
    item: '营业利润',
    amount: '200,000.00'
  }
])

// 示例数据 - 现金流量表
const cashFlowData = ref([
  {
    item: '经营活动现金流入',
    amount: '400,000.00'
  },
  {
    item: '经营活动现金流出',
    amount: '300,000.00'
  },
  {
    item: '经营活动现金流量净额',
    amount: '100,000.00'
  }
])

const handleQuery = () => {
  // TODO: 实现查询功能
  console.log('查询报表', { type: reportType.value, period: period.value })
}

const handleExport = () => {
  // TODO: 实现导出功能
  console.log('导出报表')
}

const handlePrint = () => {
  // TODO: 实现打印功能
  console.log('打印报表')
}
</script>

<style scoped>
.report-container {
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

.report-content {
  margin-top: 20px;
}

.report-title {
  text-align: center;
  margin-bottom: 20px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  color: #666;
}

:deep(.el-table) {
  margin-bottom: 20px;
}
</style>
