export const menuItems = [
  {
    path: '/dashboard',
    name: '工作台',
    icon: 'HomeFilled',
    component: 'Dashboard'
  },
  {
    path: '/voucher',
    name: '凭证管理',
    icon: 'Document',
    children: [
      {
        path: 'create',
        name: '凭证录入',
        component: 'voucher/Create'
      },
      {
        path: 'review',
        name: '凭证审核',
        component: 'voucher/Review'
      },
      {
        path: 'query',
        name: '凭证查询',
        component: 'voucher/Query'
      }
    ]
  },
  {
    path: '/ledger',
    name: '账簿管理',
    icon: 'Notebook',
    children: [
      {
        path: 'general',
        name: '总账',
        component: 'ledger/General'
      },
      {
        path: 'subsidiary',
        name: '明细账',
        component: 'ledger/Subsidiary'
      },
      {
        path: 'balance',
        name: '余额表',
        component: 'ledger/Balance'
      }
    ]
  },
  {
    path: '/report',
    name: '财务报表',
    icon: 'PieChart',
    children: [
      {
        path: 'balance-sheet',
        name: '资产负债表',
        component: 'report/BalanceSheet'
      },
      {
        path: 'income',
        name: '利润表',
        component: 'report/Income'
      },
      {
        path: 'cash-flow',
        name: '现金流量表',
        component: 'report/CashFlow'
      }
    ]
  },
  {
    path: '/settings',
    name: '系统设置',
    icon: 'Setting',
    children: [
      {
        path: 'company',
        name: '企业信息',
        component: 'settings/Company'
      },
      {
        path: 'account',
        name: '账套管理',
        component: 'settings/Account'
      },
      {
        path: 'subject',
        name: '科目设置',
        component: 'settings/Subject'
      },
      {
        path: 'user',
        name: '用户管理',
        component: 'settings/User'
      },
      {
        path: 'role',
        name: '角色权限',
        component: 'settings/Role'
      }
    ]
  }
]
