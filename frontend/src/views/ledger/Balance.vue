<template>
  <div class="balance-sheet">
    <el-card class="filter-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="科目级次">
          <el-select v-model="queryForm.level" placeholder="请选择科目级次">
            <el-option label="全部" value="0" />
            <el-option label="一级科目" value="1" />
            <el-option label="二级科目" value="2" />
            <el-option label="三级科目" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="期间">
          <el-date-picker
            v-model="queryForm.period"
            type="month"
            placeholder="选择月份"
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
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        height="calc(100vh - 280px)"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="code" label="科目编码" width="120" />
        <el-table-column prop="name" label="科目名称" min-width="200" />
        <el-table-column label="期初余额" width="200">
          <template #default="scope">
            <div>{{ scope.row.beginningBalance }}</div>
            <div class="direction">{{ scope.row.beginningDirection }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="debit" label="本期借方" width="150" align="right" />
        <el-table-column prop="credit" label="本期贷方" width="150" align="right" />
        <el-table-column label="期末余额" width="200">
          <template #default="scope">
            <div>{{ scope.row.endingBalance }}</div>
            <div class="direction">{{ scope.row.endingDirection }}</div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const queryForm = reactive({
  level: '0',
  period: ''
})

const tableData = ref([])

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
.balance-sheet {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.direction {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
