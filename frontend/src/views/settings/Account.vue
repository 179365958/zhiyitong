<template>
  <div class="account-settings">
    <div class="header">
      <h2>账套管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>新增账套
      </el-button>
    </div>

    <!-- 账套列表 -->
    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" label="账套名称" min-width="200" />
      <el-table-column prop="year" label="会计年度" width="120" align="center" />
      <el-table-column prop="startDate" label="启用日期" width="120" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
      <el-table-column label="操作" width="250" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(scope.row)"
              :disabled="scope.row.status === 'active'"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑账套对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增账套' : '编辑账套'"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="账套名称">
          <el-input v-model="form.name" placeholder="请输入账套名称" />
        </el-form-item>
        <el-form-item label="会计年度">
          <el-date-picker
            v-model="form.year"
            type="year"
            placeholder="选择年度"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="启用日期">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择启用日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '2024年度账套',
    year: '2024',
    startDate: '2024-01-01',
    status: 'active',
    createTime: '2024-01-01 00:00:00',
    remark: ''
  },
  {
    id: 2,
    name: '2023年度账套',
    year: '2023',
    startDate: '2023-01-01',
    status: 'inactive',
    createTime: '2023-01-01 00:00:00',
    remark: ''
  }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const form = ref({
  name: '',
  year: '',
  startDate: '',
  remark: ''
})

// 显示新增对话框
const showAddDialog = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    year: '',
    startDate: '',
    remark: ''
  }
  dialogVisible.value = true
}

// 编辑账套
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = (row) => {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}该账套吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      row.status = row.status === 'active' ? 'inactive' : 'active'
      ElMessage({
        type: 'success',
        message: `${action}成功`,
      })
    })
    .catch(() => {})
}

// 删除账套
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '删除后数据无法恢复，确定要删除该账套吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
      }
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {})
}

// 保存账套
const handleSave = () => {
  if (dialogType.value === 'add') {
    // 添加新账套
    const newAccount = {
      id: Date.now(),
      ...form.value,
      status: 'inactive',
      createTime: new Date().toLocaleString()
    }
    tableData.value.unshift(newAccount)
  } else {
    // 更新现有账套
    const index = tableData.value.findIndex(item => item.id === form.value.id)
    if (index > -1) {
      tableData.value[index] = { ...tableData.value[index], ...form.value }
    }
  }
  dialogVisible.value = false
  ElMessage({
    type: 'success',
    message: dialogType.value === 'add' ? '添加成功' : '更新成功',
  })
}
</script>

<style scoped>
.account-settings {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}

:deep(.el-button-group .el-button--link) {
  border: none;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
