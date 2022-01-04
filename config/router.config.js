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
          { path: '/budgetConfig/budgetEvent', component: './BackConfig/BudgetEvent' },
          { path: '/budgetConfig/dimensionStrategy', component: './BackConfig/DimensionStrategy' },
        ],
      },
      {
        path: '/budgetOrder',
        name: '预算单据',
        routes: [
          {
            name: '预算下达申请',
            path: '/budgetOrder/budgetInjection',
            component: './BudgetOrder/Injection',
          },
          {
            name: '预算调整申请',
            path: '/budgetOrder/budgetAdjust',
            component: './BudgetOrder/Adjust',
          },
          {
            name: '预算分解申请',
            path: '/budgetOrder/budgetSplit',
            component: './BudgetOrder/Split',
          },
        ],
      },
      {
        path: '/budgetOrderFlow',
        name: '预算单据流程审批',
        routes: [
          {
            name: '预算下达申请-显示',
            path: '/budgetOrderFlow/injectionView',
            component: './BudgetOrder/Injection/Flow/ViewOrder',
          },
          {
            name: '预算下达申请-修改',
            path: '/budgetOrderFlow/injectionUpdate',
            component: './BudgetOrder/Injection/Flow/UpdateOrder',
          },
          {
            name: '预算下达申请-审批',
            path: '/budgetOrderFlow/injectionApprove',
            component: './BudgetOrder/Injection/Flow/ApproveOrder',
          },
          {
            name: '预算调整申请-显示',
            path: '/budgetOrderFlow/adjustView',
            component: './BudgetOrder/Adjust/Flow/ViewOrder',
          },
          {
            name: '预算调整申请-修改',
            path: '/budgetOrderFlow/adjustUpdate',
            component: './BudgetOrder/Adjust/Flow/UpdateOrder',
          },
          {
            name: '预算调整申请-审批',
            path: '/budgetOrderFlow/adjustApprove',
            component: './BudgetOrder/Adjust/Flow/ApproveOrder',
          },
          {
            name: '预算分解申请-显示',
            path: '/budgetOrderFlow/splitView',
            component: './BudgetOrder/Split/Flow/ViewOrder',
          },
          {
            name: '预算分解申请-修改',
            path: '/budgetOrderFlow/splitUpdate',
            component: './BudgetOrder/Split/Flow/UpdateOrder',
          },
          {
            name: '预算分解申请-审批',
            path: '/budgetOrderFlow/splitApprove',
            component: './BudgetOrder/Split/Flow/ApproveOrder',
          },
        ],
      },
      {
        path: '/budgetPool',
        name: '预算池',
        routes: [{ path: '/budgetPool/poollist', component: './BudgetPool' }],
      },
      {
        path: '/report',
        routes: [
          {
            name: '概要分析',
            path: '/report/summaryAnalysis',
            component: './Report/SummaryAnalysis',
          },
          {
            name: '执行分析',
            path: '/report/executionAnalysis',
            component: './Report/ExecutionAnalysis',
          },
          {
            name: '执行日志',
            path: '/report/logRecord',
            component: './LogRecord',
          },
        ],
      },
    ],
  },
];
