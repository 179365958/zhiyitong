<template>
  <div class="balance-sheet-report">
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
        <el-form-item label="显示零余额">
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
        <h2>资产负债表</h2>
        <p>{{ reportPeriod }}</p>
        <p>单位：元</p>
      </div>

      <div class="report-content">
        <el-row :gutter="20">
          <!-- 资产部分 -->
          <el-col :span="12">
            <el-table
              :data="assetsData"
              border
              style="width: 100%"
              :show-header="false"
              row-key="id"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
              <el-table-column prop="name" label="资产" min-width="200" />
              <el-table-column prop="amount" label="金额" width="150" align="right" />
              <el-table-column prop="lastAmount" label="上期金额" width="150" align="right" />
            </el-table>
          </el-col>

          <!-- 负债和所有者权益部分 -->
          <el-col :span="12">
            <el-table
              :data="liabilitiesData"
              border
              style="width: 100%"
              :show-header="false"
              row-key="id"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
              <el-table-column prop="name" label="负债和所有者权益" min-width="200" />
              <el-table-column prop="amount" label="金额" width="150" align="right" />
              <el-table-column prop="lastAmount" label="上期金额" width="150" align="right" />
            </el-table>
          </el-col>
        </el-row>
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

const assetsData = ref([])
const liabilitiesData = ref([])

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
.balance-sheet-report {
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
</style>
