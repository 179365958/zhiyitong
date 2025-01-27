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
        <el-table-column prop="tax_code" label="统一社会信用代码" width="200" align="center" />
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
              <el-button type="success" @click="openBackupDialog(row)" icon="el-icon-folder" size="small">备份和恢复</el-button>
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

    <!-- 新建/编辑账套对话框 -->
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
              <el-input v-model="form.company_code" placeholder="请输入账套代码" clearable @change="setDefaultDbName" />
            </el-form-item>
            <el-form-item label="数据库名" prop="db_name">
              <el-input v-model="form.db_name" placeholder="请输入账套数据库名" clearable />
            </el-form-item>
            <el-form-item label="公司名称" prop="company_name">
              <el-input v-model="form.company_name" placeholder="请输入公司名称" clearable />
            </el-form-item>
            <el-form-item label="会计准则" prop="accounting_system_id">
              <el-select v-model="form.accounting_system_id" placeholder="选择会计准则">
                <el-option label="小企业会计准则" value="1" />
                <el-option label="企业会计准则" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="会计年度" prop="fiscal_year">
              <el-input-number v-model="form.fiscal_year" placeholder="请输入会计年度" :min="1900" :max="2100" />
            </el-form-item>
            <el-form-item label="启用日期" prop="begin_date">
              <el-date-picker
                v-model="form.begin_date"
                type="date"
                placeholder="选择启用日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="本位币" prop="currency_code">
              <el-input v-model="form.currency_code" placeholder="请输入本位币" clearable />
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
            <el-form-item label="统一社会信用代码" prop="tax_code">
              <el-input v-model="form.tax_code" placeholder="请输入统一社会信用代码" clearable />
            </el-form-item>
            <el-form-item label="法人" prop="legal_person">
              <el-input v-model="form.legal_person" placeholder="请输入法人" clearable />
            </el-form-item>
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入联系人" clearable />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" clearable />
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" clearable />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="activeTab === 'basic'" type="primary" @click="handleNextStep">下一步</el-button>
        <el-button v-if="activeTab === 'additional'" type="primary" @click="handlePreviousStep">上一步</el-button>
        <el-button v-if="activeTab === 'additional'" type="primary" @click="handleSubmit">
          {{ form.id ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 恢复账套对话框 -->
    <el-dialog title="备份和恢复账套" v-model="restoreDialogVisible" width="60%">
      <el-button type="primary" @click="handleBackup(selectedRow)">备份</el-button>
      <el-button type="success" @click="handleUpload">上传</el-button>
      <el-table :data="backupList" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="name" label="备份名称" width="180"></el-table-column>
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="size" label="文件大小" width="180"></el-table-column>
        <el-table-column prop="operator" label="操作人" width="180"></el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="mini" @click="handleRestore(row)">恢复</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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

const restoreDialogVisible = ref(false)
const selectedRow = ref(null)
const upload = ref(null)



const searchForm = reactive({
  companyName: ''
})

const form = reactive({
  id: null,
  company_code: '',
  company_name: '',
  tax_code: '',
  legal_person: '',
  contact: '',
  phone: '',
  address: '',
  email: '',
  db_name: '',
  fiscal_year: new Date().getFullYear(), // 默认当前年份
  period_type: 1, // 默认12期间
  begin_date: new Date().toISOString().slice(0, 10), // 设置默认启用日期为今天
  currency_code: '', // 可以设置一个默认值
  accounting_system_id: '', // 可以设置一个默认值
  status: 1, // 默认启用状态
  created_at: '',
  created_by: '',
  updated_at: '',
  updated_by: ''
})

const formRules = {
  company_name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  company_code: [
    { required: true, message: '请输入账套代码', trigger: 'blur' }
  ],
  tax_code: [ 
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' }
  ],
  db_name: [
    { required: true, message: '请输入账套数据库名', trigger: 'blur' }
  ],
  start_date: [
    { required: true, message: '请选择启用日期', trigger: 'change' }
  ],
  fiscal_year: [
    { required: true, message: '请输入会计年度', trigger: 'blur' }
  ],
  begin_date: [
    { required: true, message: '请选择启用期间', trigger: 'change' }
  ],
  currency_code: [
    { required: true, message: '请输入本位币', trigger: 'blur' }
  ],
  accounting_system_id: [
    { required: true, message: '请选择会计制度ID', trigger: 'change' }
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
      userId   
    })
    
    const data = response.data || response
    const { list = [], total: totalCount = 0, page, pageSize: fetchedPageSize } = data
    
    tableData.value = list
    total.value = totalCount  
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
  form.db_name = '';
  form.legal_person = '';
  form.contact = '';
  form.phone = '';
  form.address = '';
  form.email = '';
  form.fiscal_year = new Date().getFullYear();
  form.period_type = 1;
  form.begin_date = getFirstDayOfMonth(); // 设置为当月第一天
  form.currency_code = 'CNY';
  form.accounting_system_id = '';
  form.status = 1;
  form.created_at = new Date(); // 设置当前时间为 created_at
  form.created_by = userInfo.value.id; // 设置当前登录用户的ID为 created_by
  form.updated_at = '';
  form.updated_by = '';

  try {
    const response = await getCompanyList({ page: 1, pageSize: 1000, userId: userStore.userInfo.id });
    const data = response.data || response;
    const existingCodes = data.list.map(item => item.company_code);

    form.company_code = generateNextCompanyCode(existingCodes);
    form.db_name = form.company_code; // 设置数据库名为账套代码
  } catch (error) {
    console.error('获取账套列表失败:', error);
    ElMessage.error(error.message || '获取账套列表失败');
  }
};

// 获取当月第一天
const getFirstDayOfMonth = () => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
};
// 编辑账套
const handleEdit = (row) => {
  dialogVisible.value = true;
  dialogTitle.value = '编辑账套';
  form.id = row.id;
  form.company_code = row.company_code;
  form.company_name = row.company_name;
  form.tax_code = row.tax_code;
  form.db_name = row.db_name || '';
  form.legal_person = row.legal_person || '';
  form.contact = row.contact || '';
  form.phone = row.phone || '';
  form.email = row.email || '';
  form.fiscal_year = row.fiscal_year || '';
  form.period_type = row.period_type || 1;
  form.begin_date = new Date(row.begin_date || ''); // 确保是 Date 对象
  form.currency_code = row.currency_code || '';
  form.accounting_system_id = row.accounting_system_id || '';
  form.status = row.status || 1;
  form.created_at = new Date(row.created_at || ''); // 确保是 Date 对象
  form.created_by = row.created_by || '';
  form.updated_at = new Date(row.updated_at || ''); // 确保是 Date 对象
  form.updated_by = userInfo.value.id || '';
};

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

// 备份恢复账套
const handleBackup = async (row) => {
  try {
    await backupCompany(row.id)
    ElMessage.success('备份成功')
  } catch (error) {
    ElMessage.error('备份失败：' + (error.message || '未知错误'))
  }
}

// 打开备份和恢复对话框
const openBackupDialog = (row) => {
  selectedRow.value = row;
  restoreDialogVisible.value = true;
//  fetchBackupList(row.id);
};


// 上传前的验证
const beforeRestoreUpload = (file) => {
  const isZip = file.type === 'application/zip'
  if (!isZip) {
    ElMessage.error('只能上传 zip 格式的文件!')
  }
  return isZip
}

// 上传成功后的处理
const handleRestoreSuccess = (response, file, fileList) => {
  ElMessage.success('恢复成功')
  restoreDialogVisible.value = false
  fetchCompanyList()
}

// 上传失败后的处理
const handleRestoreError = (err, file, fileList) => {
  ElMessage.error('恢复失败：' + (err.message || '未知错误'))
}

// 提交表单
// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formattedForm = { ...form };
        formattedForm.begin_date = formatDate(form.begin_date, 'YYYY-MM-DD');
        formattedForm.created_at = formatDate(form.created_at, 'YYYY-MM-DD HH:mm:ss');
        formattedForm.updated_at = formatDate(form.updated_at, 'YYYY-MM-DD HH:mm:ss');
        formattedForm.updated_by = userInfo.value.id || '';

        if (form.id) {
          await updateCompany(form.id, formattedForm);
          ElMessage.success('编辑成功');
        } else {
          const isCodeUnique = await checkCompanyCodeExists(form.company_code);
          const isDbNameUnique = await checkDbNameExists(form.db_name);

          if (isCodeUnique) {
            ElMessage.error('账套代码已存在，请更换编号');
            return;
          }

          if (isDbNameUnique) {
            ElMessage.error('数据库名已存在，请更换数据库名');
            return;
          }

          await createCompany(formattedForm);
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

// 格式化日期函数
const formatDate = (date, format) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  } else if (format === 'YYYY-MM-DD HH:mm:ss') {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return date;
};

// 设置数据库名默认值
const setDefaultDbName = () => {
  if (!form.db_name) {
    form.db_name = form.company_code;
  }
}

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
    const response = await getCompanyList({ companyName: companyCode });
    if (!response || !response.data || !response.data.list) {
      console.warn('API 响应格式不正确');
      return false;
    }

    const list = response.data.list;
    const exists = list.some(item => item.company_code === companyCode);
    return exists;
  } catch (error) {
    console.error('检查账套代码唯一性失败:', error);
    throw new Error('检查账套代码唯一性失败');
  }
};

// 检查数据库名是否存在
const checkDbNameExists = async (dbName) => {
  try {
    const response = await getCompanyList({ dbName });
    if (!response || !response.data || !response.data.list) {
      console.warn('API 响应格式不正确');
      return false;
    }

    const list = response.data.list;
    const exists = list.some(item => item.db_name === dbName);
    return exists;
  } catch (error) {
    console.error('检查数据库名唯一性失败:', error);
    throw new Error('检查数据库名唯一性失败');
  }
};

onMounted(async () => {
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