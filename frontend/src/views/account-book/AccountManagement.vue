<template>
  <div class="account-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>账套管理</span>
          <el-button type="primary" @click="handleCreate">新建账套</el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true">
          <el-form-item label="账套名称">
            <el-input v-model="searchForm.name" placeholder="请输入账套名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
              <el-option label="启用" value="active" />
              <el-option label="停用" value="inactive" />
              <el-option label="未初始化" value="uninitialized" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="code" label="账套代码" />
        <el-table-column prop="name" label="账套名称" />
        <el-table-column prop="code" label="当前会计期间" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="350">
          <template #default="{ row }">
            <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button type="warning" @click="handleBackup(row)">备份</el-button>
            <el-button type="success" @click="handleRestore(row)">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form" ref="formRef">
        <el-form-item label="账套名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入账套名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="未初始化" value="uninitialized" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建账套')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])

const searchForm = reactive({
  name: '',
  status: ''
})

const form = reactive({
  name: '',
  status: ''
})

const handleSearch = () => {
  // TODO: 实现查询逻辑
  console.log('查询', searchForm)
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
}

const handleCreate = () => {
  dialogVisible.value = true
  dialogTitle.value = '新建账套'
  form.name = ''
  form.status = 'uninitialized'
}

const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑账套'
  form.name = row.name
  form.status = row.status
}

const handleDelete = (row) => {
  // TODO: 实现删除逻辑
  console.log('删除', row)
}

const handleBackup = async (row) => {
  try {
    const response = await axios.post('/api/backup', {
      id: row.id,
      name: row.name,
      currentPeriod: row.currentPeriod,
      status: row.status
    })
    if (response.status === 200) {
      ElMessage.success('备份成功')
    } else {
      ElMessage.error('备份失败')
    }
  } catch (error) {
    ElMessage.error('备份失败')
  }
}

const handleRestore = async (row) => {
  try {
    const response = await axios.post('/api/restore', {
      id: row.id,
      name: row.name,
      currentPeriod: row.currentPeriod,
      status: row.status
    })
    if (response.status === 200) {
      ElMessage.success('恢复成功')
    } else {
      ElMessage.error('恢复失败')
    }
  } catch (error) {
    ElMessage.error('恢复失败')
  }
}

const handleSubmit = () => {
  // TODO: 实现提交逻辑
  console.log('提交', form)
  dialogVisible.value = false
}

onMounted(() => {
  // TODO: 获取账套数据
  tableData.value = [
    { id: 1, code: '2024', name: '2024年度账套', currentPeriod: '2024-01', status: 'active' },
    { id: 2, code: '2023', name: '2023年度账套', currentPeriod: '2023-12', status: 'inactive' }
  ]
})
</script>

<style scoped>
.account-management-container {
  padding: 20px;
}
</style>
