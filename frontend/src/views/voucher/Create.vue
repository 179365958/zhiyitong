<template>
  <div class="voucher-create">
    <h2>凭证录入</h2>
    <el-form :model="form" label-width="120px">
      <el-form-item label="凭证日期">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="凭证字号">
        <el-input v-model="form.number" />
      </el-form-item>
      <el-form-item label="摘要">
        <el-input v-model="form.summary" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  date: '',
  number: '',
  summary: ''
})
</script>

<style scoped>
.voucher-create {
  padding: 20px;
}
</style>
