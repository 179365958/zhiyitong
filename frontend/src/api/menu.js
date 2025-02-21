// D:\zhiyitong\frontend\src\api\menu.js
import axios from 'axios';

// 基础 URL，可以根据实际情况调整
const BASE_URL = '/api';

// 获取菜单列表
export const getMenuList = () => {
  return axios.get(`${BASE_URL}/menus`);
};

// 创建菜单
export const createMenu = (menuData) => {
  return axios.post(`${BASE_URL}/menus`, menuData);
};

// 更新菜单
export const updateMenu = (menuId, menuData) => {
  return axios.put(`${BASE_URL}/menus/${menuId}`, menuData);
};

// 删除菜单
export const deleteMenu = (menuId) => {
  return axios.delete(`${BASE_URL}/menus/${menuId}`);
};

// 获取角色菜单
export const getRoleMenus = (roleId) => {
  return axios.get(`${BASE_URL}/roles/${roleId}/menus`);
};

// 分配角色菜单
export const assignRoleMenus = (roleId, menuIds) => {
  return axios.post(`${BASE_URL}/roles/${roleId}/menus`, { menu_ids: menuIds });
};