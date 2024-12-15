<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日收入</span>
              <el-tag size="small" type="success">+15%</el-tag>
            </div>
          </template>
          <div class="card-body">
            <h2>¥12,350</h2>
            <div class="trend">
              <span>较昨日</span>
              <el-icon color="#67C23A"><ArrowUp /></el-icon>
              <span class="up">1,840</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>本月支出</span>
              <el-tag size="small" type="danger">-8%</el-tag>
            </div>
          </template>
          <div class="card-body">
            <h2>¥45,620</h2>
            <div class="trend">
              <span>较上月</span>
              <el-icon color="#F56C6C"><ArrowDown /></el-icon>
              <span class="down">3,960</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>待处理凭证</span>
              <el-tag size="small" type="warning">5</el-tag>
            </div>
          </template>
          <div class="card-body">
            <h2>28</h2>
            <div class="trend">
              <span>本周新增</span>
              <el-icon color="#E6A23C"><Plus /></el-icon>
              <span class="warning">5</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>账户余额</span>
              <el-tag size="small" type="info">正常</el-tag>
            </div>
          </template>
          <div class="card-body">
            <h2>¥168,530</h2>
            <div class="trend">
              <span>总资产</span>
              <el-icon color="#909399"><Wallet /></el-icon>
              <span>¥1,286,450</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>收支趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里将来放图表组件 -->
            <div class="chart-placeholder">
              收支趋势图表
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>支出分类</span>
              <el-select v-model="pieTimeRange" size="small" style="width: 100px">
                <el-option label="本月" value="month" />
                <el-option label="本季" value="quarter" />
                <el-option label="全年" value="year" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里将来放饼图组件 -->
            <div class="chart-placeholder">
              支出分类饼图
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项 -->
    <el-row :gutter="20" class="todo-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button type="primary" size="small" plain>添加</el-button>
            </div>
          </template>
          <el-table :data="todoList" style="width: 100%">
            <el-table-column prop="title" label="事项" />
            <el-table-column prop="deadline" label="截止日期" width="120" />
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="scope">
                <el-tag :type="getPriorityType(scope.row.priority)">
                  {{ scope.row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default>
                <el-button link type="primary">完成</el-button>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
              <el-tag size="small">3 条未读</el-tag>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(notice, index) in notices"
              :key="index"
              :type="notice.type"
              :timestamp="notice.time"
            >
              {{ notice.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowUp, ArrowDown, Plus, Wallet } from '@element-plus/icons-vue'

// 图表时间范围
const chartTimeRange = ref('month')
const pieTimeRange = ref('month')

// 待办事项数据
const todoList = ref([
  {
    title: '完成月度报表',
    deadline: '2024-01-20',
    priority: '高'
  },
  {
    title: '审核报销单据',
    deadline: '2024-01-18',
    priority: '中'
  },
  {
    title: '更新固定资产清单',
    deadline: '2024-01-25',
    priority: '低'
  }
])

// 系统公告数据
const notices = ref([
  {
    content: '系统将于本周日凌晨2点进行例行维护',
    time: '2024-01-15',
    type: 'warning'
  },
  {
    content: '新版财务制度已发布，请及时查看',
    time: '2024-01-14',
    type: 'success'
  },
  {
    content: '请各部门于本月20日前提交报销单据',
    time: '2024-01-13',
    type: 'info'
  }
])

// 获取优先级标签类型
const getPriorityType = (priority) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[priority]
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-body {
    text-align: center;

    h2 {
      margin: 10px 0;
      font-size: 24px;
      color: #303133;
    }

    .trend {
      color: #909399;
      font-size: 14px;

      .el-icon {
        margin: 0 4px;
      }

      .up {
        color: #67C23A;
      }

      .down {
        color: #F56C6C;
      }

      .warning {
        color: #E6A23C;
      }
    }
  }
}

.chart-row {
  margin-top: 20px;

  .chart-container {
    height: 300px;
  }

  .chart-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #909399;
  }
}

.todo-row {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-timeline-item__node) {
  background-color: transparent;
}

:deep(.el-timeline-item__node--success) {
  color: #67C23A;
}

:deep(.el-timeline-item__node--warning) {
  color: #E6A23C;
}

:deep(.el-timeline-item__node--info) {
  color: #909399;
}
</style>
