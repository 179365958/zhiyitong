<template>
  <div class="account-management-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">账套管理</span>
          </div>
          <div class="header-right"></div>
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
          <el-form-item label="公司名称">
            <el-input 
              v-model="searchForm.companyName" 
              placeholder="请输入公司名称" 
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
        <el-table-column prop="company_name" label="公司名称" width="200" align="center" />
        <el-table-column prop="tax_code" label="统一社会信用代码" width="200" align="center" /> <!-- 修改：将 db_name 改为 tax_code -->
        <el-table-column prop="db_name" label="数据库名" width="200" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="light">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作"  align="center">
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
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
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
            <el-form-item label="公司名称" prop="company_name">
              <el-input v-model="form.company_name" placeholder="请输入公司名称" clearable />
            </el-form-item>
            <el-form-item label="统一社会信用代码" prop="tax_code"> <!-- 修改：将 db_name 改为 tax_code -->
              <el-input v-model="form.tax_code" placeholder="请输入统一社会信用代码" clearable />
            </el-form-item>
            <el-form-item label="会计准则" prop="accounting_standard">
              <el-select v-model="form.accounting_standard" placeholder="选择会计准则">
                <el-option label="准则1" value="standard1" />
                <el-option label="准则2" value="standard2" />
                <!-- 根据实际情况添加更多选项 -->
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="其他信息" name="additional">
          <el-form 
            :model="form" 
            ref="formRef" 
            label-width="120px"
            status-icon
          >
            <el-form-item label="联系人" prop="contact_person">
              <el-input v-model="form.contact_person" placeholder="请输入联系人" clearable />
            </el-form-item>
            <el-form-item label="联系电话" prop="contact_phone">
              <el-input v-model="form.contact_phone" placeholder="请输入联系电话" clearable />
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" clearable />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer v-if="activeTab === 'basic'">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleNextStep">下一步</el-button>
      </template>
      <template #footer v-else-if="activeTab === 'additional'">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="handlePreviousStep">上一步</el-button>
        <el-button type="primary" @click="handleSubmit">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
const activeTab = ref('basic')

const searchForm = reactive({
  companyName: ''
})

const form = reactive({
  id: null,
  company_code: '',
  company_name: '',
  tax_code: '', // 修改：将 db_name 改为 tax_code
  accounting_standard: '',
  contact_person: '',
  contact_phone: '',
  address: ''
})

const formRules = {
  company_name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  company_code: [
    { required: true, message: '请输入账套代码', trigger: 'blur' }
  ],
  tax_code: [ // 修改：将 db_name 改为 tax_code
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' }
  ],
  contact_person: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ],
  accounting_standard: [
    { required: true, message: '请选择会计准则', trigger: 'change' }
  ]
}

// 获取账套列表
const fetchCompanyList = async () => {
  loading.value = true
  try {  
    if (!userStore.userInfo?.id) {
      ElMessage.warning('用户信息未获取，请重新登录')
      return
    }
    
    const userId = userStore.userInfo.id
    const response = await getCompanyList({
      page: currentPage.value,
      pageSize: pageSize.value,
      companyName: searchForm.companyName,
      userId   // 只添加这一个参数
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
const handleCreate = async () => {
  dialogVisible.value = true;
  dialogTitle.value = '新建账套';
  form.id = null;
  form.company_name = '';
  form.tax_code = '';
  form.accounting_standard = '';
  form.contact_person = '';
  form.contact_phone = '';
  form.address = '';
  activeTab.value = 'basic'; // 初始标签页为基本信息

  try {
    const response = await getCompanyList({ page: 1, pageSize: 1000, userId: userStore.userInfo.id });
    const data = response.data || response;
    const existingCodes = data.list.map(item => item.company_code);

    // 生成账套代码
    form.company_code = generateNextCompanyCode(existingCodes);
  } catch (error) {
    console.error('获取账套列表失败:', error);
    ElMessage.error(error.message || '获取账套列表失败');
  }
};

// 编辑账套
const handleEdit = (row) => {
  dialogVisible.value = true
  dialogTitle.value = '编辑账套'
  form.id = row.id
  form.company_code = row.company_code
  form.company_name = row.company_name
  form.tax_code = row.tax_code // 修改：将 db_name 改为 tax_code
  form.accounting_standard = row.accounting_standard
  form.contact_person = row.contact_person
  form.contact_phone = row.contact_phone
  form.address = row.address
  activeTab.value = 'basic' // 初始标签页为基本信息
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
          await updateCompany(form.id, form);
          ElMessage.success('编辑成功');
        } else {
          // 新建
          const isCodeUnique = await checkCompanyCodeExists(form.company_code);
          if (isCodeUnique) {
            ElMessage.error('账套代码已存在，请更换编号');
            return;
          }
          await createCompany(form);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        fetchCompanyList();
      } catch (error) {
        ElMessage.error(error.message || '操作失败');
      }
    }
  });
};

// 下一步按钮逻辑
const handleNextStep = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      activeTab.value = 'additional' // 切换到其他信息标签页
    }
  })
}

// 上一步按钮逻辑
const handlePreviousStep = () => {
  activeTab.value = 'basic' // 切换到基本信息标签页
}

// 生成下一个账套代码
const generateNextCompanyCode = (existingCodes) => {
  const year = new Date().getFullYear().toString();
  const prefix = `ZYT_${year}`;
  const existingNumbers = existingCodes
    .filter(code => code.startsWith(prefix))
    .map(code => parseInt(code.substring(prefix.length), 10))
    .sort((a, b) => a - b);

  let nextNumber = 1;
  if (existingNumbers.length > 0) {
    nextNumber = existingNumbers[existingNumbers.length - 1] + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

// 检查账套代码是否存在
const checkCompanyCodeExists = async (companyCode) => {
  try {
    const response = await getCompanyList({ companyCode: companyCode });
    //console.log('API Response:', response); // 打印 API 响应内容，便于调试
    
    if (!response || !response.data || !response.data.list) {
      console.warn('API 响应格式不正确');
      return false;
    }

    const list = response.data.list;

    // 检查列表中是否存在匹配的 company_code
    const exists = list.some(item => item.company_code === companyCode);
  //  console.log('Matching List:', list.filter(item => item.company_code === companyCode)); // 打印匹配的账套列表
    
    return exists; // 如果有匹配项，返回 true，否则返回 false
  } catch (error) {
    console.error('检查账套代码唯一性失败:', error);
    throw new Error('检查账套代码唯一性失败'); // 抛出异常，让调用方处理
  }
};

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

.el-table__body-wrapper {
  display: flex;
}

.el-table .cell {
  flex: 1;
}

.el-table-column.operation-column {
  flex: 0 0 auto;
}

@media (max-width: 768px) {
  .el-table-column.operation-column {
    width: 100%;
    text-align: center;
  }
}
</style>