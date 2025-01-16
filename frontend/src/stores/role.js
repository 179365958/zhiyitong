import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getRoles, createRole, updateRole, deleteRole } from '@/api/role';

export const useRoleStore = defineStore('role', () => {
  const roles = ref([]);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      roles.value = response.data;
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  const addRole = async (role) => {
    try {
      await createRole(role);
      fetchRoles();
    } catch (error) {
      console.error('创建角色失败:', error);
    }
  };

  const editRole = async (id, role) => {
    try {
      await updateRole(id, role);
      fetchRoles();
    } catch (error) {
      console.error('更新角色失败:', error);
    }
  };

  const removeRole = async (id) => {
    try {
      await deleteRole(id);
      fetchRoles();
    } catch (error) {
      console.error('删除角色失败:', error);
    }
  };

  return {
    roles,
    fetchRoles,
    addRole,
    editRole,
    removeRole
  };
});