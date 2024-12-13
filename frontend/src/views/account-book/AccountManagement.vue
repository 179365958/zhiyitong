<template>
  <div class="account-management-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button 
              type="info" 
              icon="Back" 
              @click="goBack" 
              circle 
              plain
              title="返回登录"
            />
            <span class="header-title">账套管理</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand" class="user-dropdown">
              <div class="user-dropdown-link">
                <el-avatar 
                  :src="userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642ab9b686a4768png.png'" 
                  :size="40" 
                  class="user-avatar"
                />
                <div class="user-name-wrapper">
                  <span class="user-name">{{ userInfo?.username || userInfo?.name || '未登录' }}</span>
                  <span class="user-role">{{ userInfo?.roles?.[0] || '普通用户' }}</span>
                </div>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleCreate" 
              icon="Plus"
            >
              新建账套
            </el-button>
          </el-form-item>
          <el-form-item label="账套名称">
            <el-input 
              v-model="searchForm.companyName" 
              placeholder="请输入账套名称" 
              clearable 
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="handleSearch" icon="Search">查询</el-button>
              <el-button @click="resetSearch" icon="Refresh">重置</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </div>

      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        element-loading-text="正在加载..."
        border
        stripe
      >
        <el-table-column prop="company_code" label="账套代码" width="120" align="center" />
        <el-table-column prop="company_name" label="账套名称" width="200" align="center" />
        <el-table-column prop="db_name" label="数据库名" width="200" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="light">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="handleEdit(row)" icon="Edit" size="small">编辑</el-button>
              <el-button type="danger" @click="handleDelete(row)" icon="Delete" size="small">删除</el-button>
              <el-button type="warning" @click="handleBackup(row)" icon="Folder" size="small">备份</el-button>
              <el-button type="success" @click="handleRestore(row)" icon="Refresh" size="small">恢复</el-button>
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
          @current-change="fetchCompanyList"
          @size-change="fetchCompanyList"
        />
      </div>
    </el-card>

    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      :close-on-click-modal="false"
      width="500px"
    >
      <el-form 
        :model="form" 
        :rules="formRules" 
        ref="formRef" 
        label-width="120px"
        status-icon
      >
        <el-form-item label="账套代码" prop="company_code">
          <el-input v-model="form.company_code" placeholder="请输入账套代码" clearable />
        </el-form-item>
        <el-form-item label="账套名称" prop="company_name">
          <el-input v-model="form.company_name" placeholder="请输入账套名称" clearable />
        </el-form-item>
        <el-form-item label="数据库名" prop="db_name">
          <el-input v-model="form.db_name" placeholder="请输入数据库名" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { 
  getCompanyList, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  backupCompany,
  restoreCompany 
} from '@/api/system'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const router = useRouter()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建账套')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const formRef = ref(null)

const searchForm = reactive({
  companyName: ''
})

const form = reactive({
  id: null,
  company_code: '',
  company_name: '',
  db_name: '',
  status: 1
})

const formRules = {
  company_code: [
    { required: true, message: '请输入账套代码', trigger: 'blur' },
    { min: 3, max: 10, message: '账套代码长度在3-10个字符', trigger: 'blur' }
  ],
  company_name: [
    { required: true, message: '请输入账套名称', trigger: 'blur' }
  ],
  db_name: [
    { required: true, message: '请输入数据库名', trigger: 'blur' }
  ]
}

// 获取账套列表
const fetchCompanyList = async () => {
  loading.value = true
  try {
    const response = await getCompanyList({
      page: currentPage.value,
      pageSize: pageSize.value,
      companyName: searchForm.companyName
    })
    
    // 兼容不同的响应结构
    const data = response.data || response
    const { list = [], total: totalCount = 0, page, pageSize: fetchedPageSize } = data
    
    tableData.value = list
    total.value = totalCount  // 使用不同的变量名避免冲突
    currentPage.value = page || currentPage.value
    pageSize.value = fetchedPageSize || pageSize.value

    console.log('获取账套列表成功:', tableData.value)
  } catch (error) {
    console.error('获取账套列表失败:', error)
    ElMessage.error(error.message || '获取账套列表失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  fetchCompanyList()
}

// 重置查询
const resetSearch = () => {
  searchForm.companyName = ''
  currentPage.value = 1
  fetchCompanyList()
}

// 新建账套
const handleCreate = () => {
  dialogVisible.value = true
  dialogTitle.value = '新建账套'
  form.id = null
  form.company_code = ''
  form.company_name = ''
  form.db_name = ''
  form.status = 1
}

// 编辑账套
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑账套'
  form.id = row.id
  form.company_code = row.company_code
  form.company_name = row.company_name
  form.db_name = row.db_name
  form.status = row.status
}

// 删除账套
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除账套 [${row.company_code}] ${row.company_name} 吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCompany(row.id)
      ElMessage.success('删除成功')
      fetchCompanyList()
    } catch (error) {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }).catch(() => {})
}

// 备份账套
const handleBackup = async (row) => {
  try {
    await backupCompany(row.id)
    ElMessage.success('备份成功')
  } catch (error) {
    ElMessage.error('备份失败：' + (error.message || '未知错误'))
  }
}

// 恢复账套
const handleRestore = async (row) => {
  ElMessageBox.confirm(`确定要恢复账套 [${row.company_code}] ${row.company_name} 吗？`, '恢复确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await restoreCompany(row.id)
      ElMessage.success('恢复成功')
      fetchCompanyList()
    } catch (error) {
      ElMessage.error('恢复失败：' + (error.message || '未知错误'))
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
          await updateCompany(form.id, form)
          ElMessage.success('编辑成功')
        } else {
          // 新建
          await createCompany(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchCompanyList()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

// 处理用户下拉菜单操作
const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/settings/profile')
  }
}

// 返回登录页
const goBack = () => {
  router.push('/login')
}

onMounted(async () => {
  // 检查并更新用户信息
  await userStore.safeGetUserInfo()
  
  fetchCompanyList()
})
</script>

<style scoped>
.account-management-container {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-title {
  margin-left: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.user-dropdown {
  cursor: pointer;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  margin-right: 10px;
}

.user-name-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.user-role {
  font-size: 14px;
  color: #606266;
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
