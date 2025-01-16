<template>
  <div class="user-management-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">用户管理</span>
          <el-button type="primary" @click="handleCreate" icon="Plus">新建用户</el-button>
        </div>
      </template>
      <div class="search-bar">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px;" />
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="handleSearch" icon="Search">查询</el-button>
              <el-button @click="resetSearch" icon="Refresh">重置</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" element-loading-text="正在加载..." border stripe>
        <el-table-column prop="username" label="用户名" width="150" align="center" />
        <el-table-column prop="name" label="姓名" width="150" align="center" />
        <el-table-column prop="email" label="邮箱" width="200" align="center" />
        <el-table-column prop="role" label="角色" width="150" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="handleEdit(row)" icon="Edit" size="small">编辑</el-button>
              <el-button type="danger" @click="handleDelete(row)" icon="Delete" size="small">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchUserList"
          @size-change="fetchUserList"
        />
      </div>
    </el-card>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" :close-on-click-modal="false" width="500px">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="120px" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建用户')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const formRef = ref(null)

const searchForm = reactive({
  username: ''
})

const form = reactive({
  id: null,
  username: '',
  name: '',
  email: '',
  role: 'user'
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const response = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.username
    })
    
    const data = response.data || response
    const { list = [], total: totalCount = 0, page, pageSize: fetchedPageSize } = data
    
    tableData.value = list
    total.value = totalCount
    currentPage.value = page || currentPage.value
    pageSize.value = fetchedPageSize || pageSize.value

    console.log('获取用户列表成功:', tableData.value)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error(error.message || '获取用户列表失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置查询
const resetSearch = () => {
  searchForm.username = ''
  currentPage.value = 1
  fetchUserList()
}

// 新建用户
const handleCreate = () => {
  dialogVisible.value = true
  dialogTitle.value = '新建用户'
  form.id = null
  form.username = ''
  form.name = ''
  form.email = ''
  form.role = 'user'
}

// 编辑用户
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑用户'
  form.id = row.id
  form.username = row.username
  form.name = row.name
  form.email = row.email
  form.role = row.role
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 [${row.username}] 吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    } catch (error) {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          // 编辑
          await updateUser(form.id, form)
          ElMessage.success('编辑成功')
        } else {
          // 新建
          await createUser(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchUserList()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management-container {
  background-color: #f5f7fa;
  height: 100vh;
  padding: 20px;
}

.box-card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>