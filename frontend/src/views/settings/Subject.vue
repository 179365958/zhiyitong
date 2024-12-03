<template>
  <div class="subject-settings">
    <el-card class="operation-card">
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAdd">新增科目</el-button>
        <el-button @click="handleImport">导入科目</el-button>
        <el-button @click="handleExport">导出科目</el-button>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        height="calc(100vh - 240px)"
      >
        <el-table-column prop="code" label="科目编码" width="120" />
        <el-table-column prop="name" label="科目名称" min-width="180" />
        <el-table-column prop="category" label="科目类别" width="120" />
        <el-table-column prop="direction" label="余额方向" width="100">
          <template #default="scope">
            {{ scope.row.direction === 'debit' ? '借' : '贷' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary" @click="handleAddChild(scope.row)">添加子科目</el-button>
            <el-button 
              link 
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 科目编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增科目' : '编辑科目'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级科目" v-if="dialogType === 'addChild'">
          <el-input v-model="parentSubject" disabled />
        </el-form-item>
        <el-form-item label="科目编码" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="科目名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="科目类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择科目类别">
            <el-option label="资产" value="asset" />
            <el-option label="负债" value="liability" />
            <el-option label="权益" value="equity" />
            <el-option label="成本" value="cost" />
            <el-option label="损益" value="profit-loss" />
          </el-select>
        </el-form-item>
        <el-form-item label="余额方向" prop="direction">
          <el-radio-group v-model="form.direction">
            <el-radio label="debit">借</el-radio>
            <el-radio label="credit">贷</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add') // add, edit, addChild
const parentSubject = ref('')

const form = reactive({
  code: '',
  name: '',
  category: '',
  direction: 'debit'
})

const rules = {
  code: [
    { required: true, message: '请输入科目编码', trigger: 'blur' },
    { pattern: /^\d+$/, message: '科目编码必须为数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入科目名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择科目类别', trigger: 'blur' }
  ],
  direction: [
    { required: true, message: '请选择余额方向', trigger: 'blur' }
  ]
}

const formRef = ref()

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  resetForm()
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

const handleAddChild = (row) => {
  dialogType.value = 'addChild'
  dialogVisible.value = true
  resetForm()
  parentSubject.value = `${row.code} - ${row.name}`
}

const handleImport = () => {
  // TODO: 实现导入逻辑
  console.log('Import subjects')
}

const handleExport = () => {
  // TODO: 实现导出逻辑
  console.log('Export subjects')
}

const handleToggleStatus = (row) => {
  // TODO: 实现状态切换逻辑
  console.log('Toggle status:', row)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      console.log('Submit form:', form)
      dialogVisible.value = false
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    code: '',
    name: '',
    category: '',
    direction: 'debit'
  })
}
</script>

<style scoped>
.subject-settings {
  padding: 20px;
}

.operation-card {
  margin-bottom: 20px;
}

.operation-buttons {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}
</style>
