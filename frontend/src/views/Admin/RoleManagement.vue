<template>
  <div class="role-management-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">角色管理</span>
          <el-button type="primary" @click="handleCreate" icon="Plus">新建角色</el-button>
        </div>
      </template>
      <div class="search-bar">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable style="width: 200px;" />
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
        <el-table-column prop="roleName" label="角色名称" width="200" align="center" />
        <el-table-column prop="description" label="描述" width="300" align="center" />
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
          @current-change="fetchRoleList"
          @size-change="fetchRoleList"
        />
      </div>
    </el-card>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" :close-on-click-modal="false" width="500px">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="120px" status-icon>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述" clearable />
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
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建角色')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const formRef = ref(null)

const searchForm = reactive({
  roleName: ''
})

const form = reactive({
  id: null,
  roleName: '',
  description: ''
})

const formRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ]
}

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const response = await getRoleList({
      page: currentPage.value,
      pageSize: pageSize.value,
      roleName: searchForm.roleName
    })
    
    const data = response.data || response
    const { list = [], total: totalCount = 0, page, pageSize: fetchedPageSize } = data
    
    tableData.value = list
    total.value = totalCount
    currentPage.value = page || currentPage.value
    pageSize.value = fetchedPageSize || pageSize.value

    console.log('获取角色列表成功:', tableData.value)
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error(error.message || '获取角色列表失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  fetchRoleList()
}

// 重置查询
const resetSearch = () => {
  searchForm.roleName = ''
  currentPage.value = 1
  fetchRoleList()
}

// 新建角色
const handleCreate = () => {
  dialogVisible.value = true
  dialogTitle.value = '新建角色'
  form.id = null
  form.roleName = ''
  form.description = ''
}

// 编辑角色
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑角色'
  form.id = row.id
  form.roleName = row.roleName
  form.description = row.description
}

// 删除角色
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 [${row.roleName}] 吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRole(row.id)
      ElMessage.success('删除成功')
      fetchRoleList()
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
          await updateRole(form.id, form)
          ElMessage.success('编辑成功')
        } else {
          // 新建
          await createRole(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchRoleList()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped>
.role-management-container {
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