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
      <el-table-column prop="company_name" label="账套名称" min-width="200" />
      <el-table-column prop="fiscal_year" label="会计年度" width="120" align="center" />
      <el-table-column prop="begin_date" label="启用日期" width="120" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180" align="center" />
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
              {{ scope.row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(scope.row)"
              :disabled="scope.row.status === 1"
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
      width="600px"
    >
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="100px"
      >
        <el-form-item 
          label="账套编码" 
          prop="company_code"
        >
          <el-input 
            v-model="form.company_code" 
            placeholder="请输入账套编码"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item 
          label="账套名称" 
          prop="company_name"
        >
          <el-input 
            v-model="form.company_name" 
            placeholder="请输入账套名称" 
          />
        </el-form-item>
        <el-form-item 
          label="会计制度" 
          prop="accounting_system_id"
        >
          <el-select 
            v-model="form.accounting_system_id" 
            placeholder="请选择会计制度"
            style="width: 100%"
          >
            <el-option
              v-for="item in accountingSystems"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item 
          label="会计年度" 
          prop="fiscal_year"
        >
          <el-date-picker
            v-model="form.fiscal_year"
            type="year"
            placeholder="选择年度"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item 
          label="启用日期" 
          prop="begin_date"
        >
          <el-date-picker
            v-model="form.begin_date"
            type="date"
            placeholder="选择启用日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item 
          label="税号" 
          prop="tax_code"
        >
          <el-input 
            v-model="form.tax_code" 
            placeholder="请输入税号" 
          />
        </el-form-item>
        <el-form-item 
          label="法人" 
          prop="legal_person"
        >
          <el-input 
            v-model="form.legal_person" 
            placeholder="请输入法人姓名" 
          />
        </el-form-item>
        <el-form-item 
          label="联系人" 
          prop="contact"
        >
          <el-input 
            v-model="form.contact" 
            placeholder="请输入联系人" 
          />
        </el-form-item>
        <el-form-item 
          label="联系电话" 
          prop="phone"
        >
          <el-input 
            v-model="form.phone" 
            placeholder="请输入联系电话" 
          />
        </el-form-item>
        <el-form-item 
          label="地址" 
          prop="address"
        >
          <el-input 
            v-model="form.address" 
            placeholder="请输入地址" 
          />
        </el-form-item>
        <el-form-item 
          label="邮箱" 
          prop="email"
        >
          <el-input 
            v-model="form.email" 
            placeholder="请输入邮箱" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getCompanies, createCompany, updateCompany, deleteCompany, toggleCompanyStatus } from '@/api/account'
import { getAccountingSystems } from '@/api/account'

// 表格数据
const tableData = ref([])
const accountingSystems = ref([])

// 加载账套列表
const loadCompanies = async () => {
  try {
    const data = await getCompanies()
    tableData.value = data
  } catch (error) {
    ElMessage.error('加载账套列表失败')
  }
}

// 加载会计制度列表
const loadAccountingSystems = async () => {
  try {
    const data = await getAccountingSystems()
    accountingSystems.value = data
  } catch (error) {
    ElMessage.error('加载会计制度列表失败')
  }
}

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const form = ref({
  company_code: '',
  company_name: '',
  tax_code: '',
  legal_person: '',
  contact: '',
  phone: '',
  address: '',
  email: '',
  db_name: '',
  fiscal_year: new Date().getFullYear(),
  period_type: 1,
  begin_date: '',
  currency_code: 'CNY',
  accounting_system_id: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const rules = {
  company_code: [
    { required: true, message: '请输入账套编码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  company_name: [
    { required: true, message: '请输入账套名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  accounting_system_id: [
    { required: true, message: '请选择会计制度', trigger: 'change' }
  ],
  fiscal_year: [
    { required: true, message: '请选择会计年度', trigger: 'change' }
  ],
  begin_date: [
    { required: true, message: '请选择启用日期', trigger: 'change' }
  ],
  tax_code: [
    { pattern: /^[A-Z0-9]{15,20}$/, message: '请输入正确的税号格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const formRef = ref(null)

// 显示新增对话框
const showAddDialog = () => {
  dialogType.value = 'add'
  form.value = {
    company_code: '',
    company_name: '',
    tax_code: '',
    legal_person: '',
    contact: '',
    phone: '',
    address: '',
    email: '',
    db_name: '',
    fiscal_year: new Date().getFullYear(),
    period_type: 1,
    begin_date: '',
    currency_code: 'CNY',
    accounting_system_id: '',
    status: 1,
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
const handleToggleStatus = async (row) => {
  const action = row.status === 1 ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}该账套吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await toggleCompanyStatus(row.id, row.status === 1 ? 0 : 1)
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// 删除账套
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '删除后数据无法恢复，确定要删除该账套吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteCompany(row.id)
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 保存账套
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (dialogType.value === 'add') {
      // 添加新账套
      const data = await createCompany(form.value)
      tableData.value.unshift(data)
      ElMessage.success('添加成功')
    } else {
      // 更新现有账套
      const data = await updateCompany(form.value.id, form.value)
      const index = tableData.value.findIndex(item => item.id === form.value.id)
      if (index > -1) {
        tableData.value[index] = data
      }
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
  } catch (error) {
    if (error.name === 'ValidationError') {
      // 表单验证失败
      return
    }
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
  }
}

// 初始化加载
onMounted(() => {
  loadCompanies()
  loadAccountingSystems()
})
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
