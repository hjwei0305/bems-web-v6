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
        ],
      },
    ],
  },
];
