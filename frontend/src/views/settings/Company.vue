<template>
  <div class="company-settings">
    <h2>企业信息</h2>
    <el-form :model="form" label-width="120px">
      <el-form-item label="企业名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="统一社会信用代码">
        <el-input v-model="form.creditCode" />
      </el-form-item>
      <el-form-item label="法定代表人">
        <el-input v-model="form.legalPerson" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="企业地址">
        <el-input v-model="form.address" type="textarea" />
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
  name: '',
  creditCode: '',
  legalPerson: '',
  phone: '',
  address: ''
})
</script>

<style scoped>
.company-settings {
  padding: 20px;
}
</style>
