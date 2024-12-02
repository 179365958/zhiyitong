<template>
  <div class="user-settings">
    <div class="header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>新增用户
      </el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag>{{ scope.row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" align="center" />
      <el-table-column label="操作" width="280" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="handleResetPassword(scope.row)">
              重置密码
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="财务" value="finance" />
            <el-option label="出纳" value="cashier" />
            <el-option label="审核员" value="reviewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
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
import { ElMessageBox, ElMessage } from 'element-plus'

// 表格数据
const tableData = ref([
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    role: '管理员',
    phone: '13800138000',
    email: 'admin@example.com',
    status: 'active',
    lastLoginTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    username: 'finance',
    name: '张财务',
    role: '财务',
    phone: '13800138001',
    email: 'finance@example.com',
    status: 'active',
    lastLoginTime: '2024-01-15 09:30:00'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const form = ref({
  username: '',
  name: '',
  role: '',
  phone: '',
  email: ''
})

// 显示新增对话框
const showAddDialog = () => {
  dialogType.value = 'add'
  form.value = {
    username: '',
    name: '',
    role: '',
    phone: '',
    email: ''
  }
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 重置密码
const handleResetPassword = (row) => {
  ElMessageBox.confirm(
    '确定要重置该用户的密码吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '密码已重置为初始密码',
      })
    })
    .catch(() => {})
}

// 切换状态
const handleToggleStatus = (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}该用户吗？`,
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

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？',
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

// 保存用户
const handleSave = () => {
  if (dialogType.value === 'add') {
    // 添加新用户
    const newUser = {
      id: Date.now(),
      ...form.value,
      status: 'active',
      lastLoginTime: '-'
    }
    tableData.value.unshift(newUser)
  } else {
    // 更新现有用户
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

// 每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}
</script>

<style scoped>
.user-settings {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
