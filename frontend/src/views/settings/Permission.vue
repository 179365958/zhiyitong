<template>
  <div class="permission-settings">
    <div class="header">
      <h2>权限设置</h2>
    </div>

    <!-- 角色列表 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="role-list">
          <template #header>
            <div class="role-header">
              <span>角色列表</span>
              <el-button type="primary" link @click="showAddRoleDialog">
                <el-icon><Plus /></el-icon>新增角色
              </el-button>
            </div>
          </template>
          <el-menu
            :default-active="activeRole"
            @select="handleRoleSelect"
          >
            <el-menu-item 
              v-for="role in roles" 
              :key="role.id" 
              :index="role.id.toString()"
            >
              <template #title>
                <span>{{ role.name }}</span>
                <div class="role-actions" v-if="role.id !== 1">
                  <el-button type="primary" link @click.stop="handleEditRole(role)">
                    编辑
                  </el-button>
                  <el-button type="danger" link @click.stop="handleDeleteRole(role)">
                    删除
                  </el-button>
                </div>
              </template>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-card class="permission-list">
          <template #header>
            <div class="permission-header">
              <span>权限配置 - {{ currentRole?.name }}</span>
              <el-button type="primary" @click="handleSavePermissions">
                保存设置
              </el-button>
            </div>
          </template>
          
          <el-tree
            ref="permissionTree"
            :data="permissionData"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedPermissions"
            :props="defaultProps"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="400px"
    >
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRole">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 角色数据
const roles = ref([
  { id: 1, name: '超级管理员', description: '系统超级管理员，拥有所有权限' },
  { id: 2, name: '财务主管', description: '财务部门主管' },
  { id: 3, name: '会计', description: '会计人员' },
  { id: 4, name: '出纳', description: '出纳人员' },
  { id: 5, name: '审核员', description: '单据审核人员' }
])

// 权限树数据
const permissionData = ref([
  {
    id: 1,
    label: '凭证管理',
    children: [
      { id: 101, label: '新增凭证' },
      { id: 102, label: '编辑凭证' },
      { id: 103, label: '删除凭证' },
      { id: 104, label: '审核凭证' },
      { id: 105, label: '查询凭证' }
    ]
  },
  {
    id: 2,
    label: '账簿管理',
    children: [
      { id: 201, label: '总账' },
      { id: 202, label: '明细账' },
      { id: 203, label: '日记账' }
    ]
  },
  {
    id: 3,
    label: '报表管理',
    children: [
      { id: 301, label: '资产负债表' },
      { id: 302, label: '利润表' },
      { id: 303, label: '现金流量表' }
    ]
  },
  {
    id: 4,
    label: '系统设置',
    children: [
      { id: 401, label: '用户管理' },
      { id: 402, label: '角色管理' },
      { id: 403, label: '权限设置' },
      { id: 404, label: '账套管理' },
      { id: 405, label: '企业信息' }
    ]
  }
])

// 当前选中的角色
const activeRole = ref('1')
const currentRole = computed(() => 
  roles.value.find(role => role.id.toString() === activeRole.value)
)

// 角色对话框相关
const roleDialogVisible = ref(false)
const dialogType = ref('add')
const roleForm = ref({
  name: '',
  description: ''
})

// 权限树配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 当前角色的权限
const checkedPermissions = ref([
  101, 102, 103, 104, 105,
  201, 202, 203,
  301, 302, 303,
  401, 402, 403, 404, 405
])

// 权限树引用
const permissionTree = ref(null)

// 选择角色
const handleRoleSelect = (index) => {
  activeRole.value = index
  // 加载该角色的权限
  loadRolePermissions(index)
}

// 加载角色权限
const loadRolePermissions = (roleId) => {
  // 模拟从后端获取角色权限
  if (roleId === '1') {
    // 超级管理员拥有所有权限
    checkedPermissions.value = [
      101, 102, 103, 104, 105,
      201, 202, 203,
      301, 302, 303,
      401, 402, 403, 404, 405
    ]
  } else {
    // 其他角色的权限
    checkedPermissions.value = [101, 102, 105, 201, 202, 301]
  }
}

// 显示新增角色对话框
const showAddRoleDialog = () => {
  dialogType.value = 'add'
  roleForm.value = {
    name: '',
    description: ''
  }
  roleDialogVisible.value = true
}

// 编辑角色
const handleEditRole = (role) => {
  dialogType.value = 'edit'
  roleForm.value = { ...role }
  roleDialogVisible.value = true
}

// 删除角色
const handleDeleteRole = (role) => {
  ElMessageBox.confirm(
    '删除角色将同时删除该角色下的所有用户关联，是否继续？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = roles.value.findIndex(item => item.id === role.id)
      if (index > -1) {
        roles.value.splice(index, 1)
      }
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {})
}

// 保存角色
const handleSaveRole = () => {
  if (dialogType.value === 'add') {
    // 添加新角色
    const newRole = {
      id: roles.value.length + 1,
      ...roleForm.value
    }
    roles.value.push(newRole)
  } else {
    // 更新现有角色
    const index = roles.value.findIndex(item => item.id === roleForm.value.id)
    if (index > -1) {
      roles.value[index] = { ...roles.value[index], ...roleForm.value }
    }
  }
  roleDialogVisible.value = false
  ElMessage({
    type: 'success',
    message: dialogType.value === 'add' ? '添加成功' : '更新成功',
  })
}

// 保存权限设置
const handleSavePermissions = () => {
  const checkedKeys = permissionTree.value.getCheckedKeys()
  const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys()
  
  // 这里应该调用API保存权限设置
  console.log('Checked permissions:', checkedKeys)
  console.log('Half checked permissions:', halfCheckedKeys)
  
  ElMessage({
    type: 'success',
    message: '权限设置已保存',
  })
}
</script>

<style scoped>
.permission-settings {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}

.role-list {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-actions {
  display: none;
  position: absolute;
  right: 20px;
}

.el-menu-item:hover .role-actions {
  display: block;
}

:deep(.el-menu-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.permission-list {
  height: calc(100vh - 180px);
  overflow-y: auto;
}
</style>
