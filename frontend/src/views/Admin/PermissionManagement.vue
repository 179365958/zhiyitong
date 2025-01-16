<template>
  <div class="permission-management-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">权限管理</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" element-loading-text="正在加载..." border stripe>
        <el-table-column prop="name" label="权限名称" width="200" align="center" />
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
          @current-change="fetchPermissionList"
          @size-change="fetchPermissionList"
        />
      </div>
    </el-card>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" :close-on-click-modal="false" width="500px">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="120px" status-icon>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" clearable />
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPermissionList, createPermission, updatePermission, deletePermission } from '@/api/permission';

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新建权限');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const formRef = ref(null);

const form = reactive({
  id: null,
  name: '',
  description: ''
});

const formRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ]
};

const fetchPermissionList = async () => {
  loading.value = true;
  try {
    const response = await getPermissionList({
      page: currentPage.value,
      pageSize: pageSize.value
    });
    const data = response.data || response;
    tableData.value = data.list || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取权限列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  dialogVisible.value = true;
  dialogTitle.value = '新建权限';
  form.id = null;
  form.name = '';
  form.description = '';
};

const handleEdit = (row) => {
  dialogVisible.value = true;
  dialogTitle.value = '编辑权限';
  form.id = row.id;
  form.name = row.name;
  form.description = row.description;
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除权限 [${row.name}] 吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await deletePermission(row.id);
      ElMessage.success('删除成功');
      fetchPermissionList();
    } catch (error) {
      ElMessage.error('删除失败：' + (error.message || '未知错误'));
    }
  }).catch(() => {});
};

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          await updatePermission(form.id, form);
          ElMessage.success('编辑成功');
        } else {
          await createPermission(form);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        fetchPermissionList();
      } catch (error) {
        ElMessage.error(error.message || '操作失败');
      }
    }
  });
};

onMounted(() => {
  fetchPermissionList();
});
</script>

<style scoped>
.permission-management-container {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>