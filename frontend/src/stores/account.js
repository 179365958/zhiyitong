import { defineStore } from 'pinia';

export const useAccountStore = defineStore('account', {
  state: () => ({
    currentAccount: null,
  }),
  actions: {
    setCurrentAccount(account) {
      this.currentAccount = account;
    },
  },
});