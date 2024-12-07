export default function loadView(view) {
  const componentMap = {
    // 基础组件
    'Dashboard': () => import('@/views/Dashboard.vue'),
    
    // 凭证管理
    'voucher/Create': () => import('@/views/voucher/Create.vue'),
    'voucher/Review': () => import('@/views/voucher/Review.vue'),
    'voucher/Query': () => import('@/views/voucher/Query.vue'),
    
    // 账簿管理
    'ledger/General': () => import('@/views/ledger/General.vue'),
    'ledger/Subsidiary': () => import('@/views/ledger/Subsidiary.vue'),
    'ledger/Balance': () => import('@/views/ledger/Balance.vue'),
    
    // 财务报表
    'report/BalanceSheet': () => import('@/views/report/BalanceSheet.vue'),
    'report/Income': () => import('@/views/report/Income.vue'),
    'report/CashFlow': () => import('@/views/report/CashFlow.vue'),
    
    // 系统设置
    'settings/Company': () => import('@/views/settings/Company.vue'),
    'settings/Account': () => import('@/views/settings/Account.vue'),
    'settings/Subject': () => import('@/views/settings/Subject.vue'),
    'settings/User': () => import('@/views/settings/User.vue'),
    'settings/Role': () => import('@/views/settings/Role.vue'),
    'settings/AccountInitialization': () => import('@/views/settings/AccountInitialization.vue') // 新增账套管理
  }
  
  const loader = componentMap[view];
  if (!loader) {
    console.error(`Component not found: ${view}`);
    return Promise.reject(new Error(`Component not found: ${view}`));
  }
  
  return loader();
}