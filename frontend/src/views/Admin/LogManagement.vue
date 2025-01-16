<template>
  <div class="log-management-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">日志管理</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" element-loading-text="正在加载..." border stripe>
        <el-table-column prop="timestamp" label="时间" width="180" align="center" />
        <el-table-column prop="user" label="用户" width="150" align="center" />
        <el-table-column prop="action" label="操作" width="300" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" effect="light">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
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
          @current-change="fetchLogList"
          @size-change="fetchLogList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getLogList } from '@/api/log';

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);

const fetchLogList = async () => {
  loading.value = true;
  try {
    const response = await getLogList({
      page: currentPage.value,
      pageSize: pageSize.value
    });
    const data = response.data || response;
    tableData.value = data.list || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取日志列表失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLogList();
});
</script>

<style scoped>
.log-management-container {
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