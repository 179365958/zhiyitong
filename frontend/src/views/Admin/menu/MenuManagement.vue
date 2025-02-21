<template>
  <div>
    <el-button type="primary" @click="handleAdd">新增菜单</el-button>
    <el-tree
      :data="menus"
      :props="defaultProps"
      default-expand-all
      node-key="id"
      :expand-on-click-node="false"
      :render-content="renderContent">
    </el-tree>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form :model="form" label-width="120px">
        <el-form-item label="父菜单">
          <el-select v-model="form.parent_id" placeholder="请选择父菜单">
            <el-option label="无" value="0"></el-option>
            <el-option
              v-for="item in menus"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-select v-model="form.type" placeholder="请选择菜单类型">
            <el-option label="菜单" value="1"></el-option>
            <el-option label="目录" value="2"></el-option>
            <el-option label="外链" value="3"></el-option>
            <el-option label="按钮" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路由名称">
          <el-input v-model="form.route_name"></el-input>
        </el-form-item>
        <el-form-item label="路由路径">
          <el-input v-model="form.route_path"></el-input>
        </el-form-item>
        <el-form-item label="组件路径">
          <el-input v-model="form.component"></el-input>
        </el-form-item>
        <el-form-item label="权限标识">
          <el-input v-model="form.perm"></el-input>
        </el-form-item>
        <el-form-item label="是否始终显示">
          <el-switch v-model="form.always_show" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
        <el-form-item label="是否开启缓存">
          <el-switch v-model="form.keep_alive" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-switch v-model="form.visible" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon"></el-input>
        </el-form-item>
        <el-form-item label="跳转路径">
          <el-input v-model="form.redirect"></el-input>
        </el-form-item>
        <el-form-item label="路由参数">
          <el-input v-model="form.params"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getMenuList, createMenu, updateMenu, deleteMenu } from '@/api/menu';

export default {
  data() {
    return {
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        parent_id: 0,
        name: '',
        type: '1',
        route_name: '',
        route_path: '',
        component: '',
        perm: '',
        always_show: 1,
        keep_alive: 1,
        visible: 1,
        sort: 1,
        icon: '',
        redirect: '',
        params: {},
        status: 1
      }
    };
  },
  created() {
    this.fetchMenus();
  },
  methods: {
    fetchMenus() {
      getMenuList().then(response => {
        this.menus = response.data;
      });
    },
    handleAdd() {
      this.dialogTitle = '新增菜单';
      this.form = {
        id: null,
        parent_id: 0,
        name: '',
        type: '1',
        route_name: '',
        route_path: '',
        component: '',
        perm: '',
        always_show: 1,
        keep_alive: 1,
        visible: 1,
        sort: 1,
        icon: '',
        redirect: '',
        params: {},
        status: 1
      };
      this.dialogVisible = true;
    },
    handleEdit(data) {
      this.dialogTitle = '编辑菜单';
      this.form = { ...data };
      this.dialogVisible = true;
    },
    handleDelete(data) {
      deleteMenu(data.id).then(() => {
        this.fetchMenus();
      });
    },
    handleSave() {
      if (this.form.id) {
        updateMenu(this.form.id, this.form).then(() => {
          this.dialogVisible = false;
          this.fetchMenus();
        });
      } else {
        createMenu(this.form).then(() => {
          this.dialogVisible = false;
          this.fetchMenus();
        });
      }
    },
    renderContent(h, { node, data, store }) {
      return (
        <span class="custom-tree-node">
          <span>{node.label}</span>
          <span>
            <el-button type="text" size="mini" onClick={() => this.handleEdit(data)}>编辑</el-button>
            <el-button type="text" size="mini" onClick={() => this.handleDelete(data)}>删除</el-button>
          </span>
        </span>
      );
    }
  }
};
</script>

<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>