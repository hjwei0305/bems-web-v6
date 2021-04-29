export default [
  {
    path: '/user',
    component: '../layouts/LoginLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './Login' },
    ],
  },
  {
    path: '/',
    component: '../layouts/AuthLayout',
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', component: './Dashboard' },
      {
        path: '/budgetConfig',
        name: '预算配置',
        routes: [
          { path: '/budgetConfig/budgetStrategy', component: './BackConfig/BudgetStrategy' },
          { path: '/budgetConfig/budgetDimension', component: './BackConfig/BudgetDimension' },
          { path: '/budgetConfig/budgetSubject', component: './BackConfig/BudgetSubject' },
          {
            path: '/budgetConfig/budgetMasterSubject',
            component: './BackConfig/BudgetMasterSubject',
          },
          { path: '/budgetConfig/budgetMaster', component: './BackConfig/BudgetMaster' },
          { path: '/budgetConfig/budgetPeriod', component: './BackConfig/BudgetPeriod' },
          { path: '/budgetConfig/budgetType', component: './BackConfig/BudgetType' },
        ],
      },
      {
        path: '/budgetOrder',
        name: '预算单据',
        routes: [{ path: '/budgetOrder/budgetInjection', component: './BudgetOrder/Injection' }],
      },
    ],
  },
];
