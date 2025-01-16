<template>
  <div class="dashboard-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">仪表盘</span>
        </div>
      </template>
      <div>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card>
              <div slot="header" class="clearfix">
                <span>用户总数</span>
              </div>
              <div class="text item">{{ userCount }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div slot="header" class="clearfix">
                <span>账套总数</span>
              </div>
              <div class="text item">{{ accountCount }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div slot="header" class="clearfix">
                <span>角色总数</span>
              </div>
              <div class="text item">{{ roleCount }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div slot="header" class="clearfix">
                <span>日志总数</span>
              </div>
              <div class="text item">{{ logCount }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserCount, getAccountCount, getRoleCount, getLogCount } from '@/api/dashboard';

const userCount = ref(0);
const accountCount = ref(0);
const roleCount = ref(0);
const logCount = ref(0);

const fetchDashboardData = async () => {
  try {
    const userCountResponse = await getUserCount();
    userCount.value = userCountResponse.data;

    const accountCountResponse = await getAccountCount();
    accountCount.value = accountCountResponse.data;

    const roleCountResponse = await getRoleCount();
    roleCount.value = roleCountResponse.data;

    const logCountResponse = await getLogCount();
    logCount.value = logCountResponse.data;
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  font-size: 18px;
  font-weight: bold;
}
.text.item {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}
</style>