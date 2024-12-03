<template>
  <div class="role-management">
    <el-row :gutter="20">
      <!-- 角色列表 -->
      <el-col :span="6">
        <el-card class="role-list">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button type="primary" link @click="handleAddRole">新增角色</el-button>
            </div>
          </template>
          <el-menu
            :default-active="activeRole"
            @select="handleRoleSelect"
          >
            <el-menu-item v-for="role in roles" :key="role.id" :index="role.id">
              <span>{{ role.name }}</span>
              <el-dropdown trigger="click" @command="(cmd) => handleRoleCommand(cmd, role)">
                <el-icon class="more-actions"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 权限设置 -->
      <el-col :span="18">
        <el-card v-if="activeRole" class="permission-settings">
          <template #header>
            <div class="card-header">
              <span>权限设置 - {{ currentRole?.name }}</span>
              <el-button type="primary" @click="handleSavePermissions">保存</el-button>
            </div>
          </template>
          
          <el-tree
            ref="permissionTree"
            :data="permissions"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedPermissions"
            :props="{ label: 'name', children: 'children' }"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'

// 角色列表数据
const roles = ref([
  { id: '1', name: '系统管理员', description: '系统最高权限管理员' },
  { id: '2', name: '财务主管', description: '财务部门主管' },
  { id: '3', name: '财务会计', description: '普通财务会计' }
])

// 权限树数据
const permissions = ref([
  {
    id: '1',
    name: '凭证管理',
    children: [
      { id: '1-1', name: '凭证录入' },
      { id: '1-2', name: '凭证审核' },
      { id: '1-3', name: '凭证查询' }
    ]
  },
  {
    id: '2',
    name: '账簿管理',
    children: [
      { id: '2-1', name: '总账' },
      { id: '2-2', name: '明细账' },
      { id: '2-3', name: '余额表' }
    ]
  },
  {
    id: '3',
    name: '财务报表',
    children: [
      { id: '3-1', name: '资产负债表' },
      { id: '3-2', name: '利润表' },
      { id: '3-3', name: '现金流量表' }
    ]
  },
  {
    id: '4',
    name: '系统设置',
    children: [
      { id: '4-1', name: '企业信息' },
      { id: '4-2', name: '账套管理' },
      { id: '4-3', name: '科目设置' },
      { id: '4-4', name: '用户管理' },
      { id: '4-5', name: '角色权限' }
    ]
  }
])

const activeRole = ref('')
const dialogVisible = ref(false)
const dialogType = ref('add')
const permissionTree = ref(null)

const form = reactive({
  name: '',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

const currentRole = computed(() => {
  return roles.value.find(role => role.id === activeRole.value)
})

// 模拟已选中的权限
const checkedPermissions = ref(['1-1', '1-2', '2-1', '2-2'])

const handleRoleSelect = (roleId) => {
  activeRole.value = roleId
  // TODO: 加载该角色的权限
}

const handleAddRole = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  resetForm()
}

const handleRoleCommand = (command, role) => {
  if (command === 'edit') {
    dialogType.value = 'edit'
    dialogVisible.value = true
    Object.assign(form, role)
  } else if (command === 'delete') {
    ElMessageBox.confirm(
      '确定要删除该角色吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // TODO: 实现删除逻辑
      ElMessage.success('删除成功')
    })
  }
}

const handleSavePermissions = () => {
  if (!activeRole.value) return
  const checkedKeys = permissionTree.value.getCheckedKeys()
  const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys()
  // TODO: 保存权限设置
  console.log('Checked permissions:', [...checkedKeys, ...halfCheckedKeys])
  ElMessage.success('保存成功')
}

const handleSubmitRole = async () => {
  // TODO: 实现角色保存逻辑
  ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
  dialogVisible.value = false
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    description: ''
  })
}
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.role-list {
  height: calc(100vh - 100px);
}

.permission-settings {
  height: calc(100vh - 100px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.more-actions {
  margin-left: 8px;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}

:deep(.el-tree) {
  margin-top: 20px;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
