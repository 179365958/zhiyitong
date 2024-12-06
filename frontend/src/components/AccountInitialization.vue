<!-- src/components/AccountInitialization.vue -->
<template>
  <div class="account-initialization">
    <h1>账套管理</h1>
    <div class="create-account">
      <h2>创建新账套</h2>
      <form @submit.prevent="createAccount">
        <label for="accountName">账套名称:</label>
        <input type="text" id="accountName" v-model="newAccountName" required />
        <button type="submit">创建</button>
      </form>
    </div>
    <div class="account-list">
      <h2>账套列表</h2>
      <ul>
        <li v-for="account in accounts" :key="account.id">
          {{ account.account_name }}
          <button @click="deleteAccount(account.id)">删除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      newAccountName: '',
      accounts: []
    };
  },
  created() {
    this.fetchAccounts();
  },
  methods: {
    async createAccount() {
      try {
        const response = await axios.post('/api/accounts', {
          user_id: 1, // 假设当前用户 ID 为 1
          account_name: this.newAccountName
        });
        this.accounts.push(response.data);
        this.newAccountName = '';
      } catch (error) {
        console.error('创建账套失败:', error);
      }
    },
    async fetchAccounts() {
      try {
        const response = await axios.get('/api/accounts', {
          params: { user_id: 1 } // 假设当前用户 ID 为 1
        });
        this.accounts = response.data;
      } catch (error) {
        console.error('获取账套列表失败:', error);
      }
    },
    async deleteAccount(accountId) {
      try {
        await axios.delete(`/api/accounts/${accountId}`);
        this.accounts = this.accounts.filter(account => account.id !== accountId);
      } catch (error) {
        console.error('删除账套失败:', error);
      }
    }
  }
};
</script>

<style scoped>
.account-initialization {
  padding: 20px;
}

.create-account, .account-list {
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
}

input {
  margin-bottom: 10px;
  padding: 5px;
}

button {
  padding: 5px 10px;
}
</style>