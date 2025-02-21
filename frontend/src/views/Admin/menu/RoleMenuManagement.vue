<template>
  <div>
    <el-select v-model="selectedRole" placeholder="请选择角色" @change="fetchRoleMenus">
      <el-option
        v-for="role in roles"
        :key="role.id"
        :label="role.role_name"
        :value="role.id">
      </el-option>
    </el-select>
    <el-transfer
      v-model="selectedMenus"
      filterable
      :filter-method="filterMethod"
      filter-placeholder="请输入菜单名称"
      :titles="['所有菜单', '已分配菜单']"
      :data="allMenus">
    </el-transfer>
    <el-button type="primary" @click="handleSave">保存</el-button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      roles: [],
      selectedRole: null,
      allMenus: [],
      selectedMenus: []
    };
  },
  created() {
    this.fetchRoles();
    this.fetchAllMenus();
  },
  methods: {
    fetchRoles() {
      axios.get('/api/roles').then(response => {
        this.roles = response.data;
      });
    },
    fetchAllMenus() {
      axios.get('/api/menus').then(response => {
        this.allMenus = response.data.map(menu => ({
          key: menu.id,
          label: menu.name
        }));
      });
    },
    fetchRoleMenus() {
      axios.get(`/api/roles/${this.selectedRole}/menus`).then(response => {
        this.selectedMenus = response.data.map(menu => menu.id);
      });
    },
    handleSave() {
      axios.post(`/api/roles/${this.selectedRole}/menus`, { menu_ids: this.selectedMenus }).then(() => {
        this.$message.success('保存成功');
      });
    },
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    }
  }
};
</script>

<style scoped>
.el-transfer {
  margin-top: 20px;
}
</style>