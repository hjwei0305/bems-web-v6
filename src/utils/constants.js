/*
 * @Author: Eason
 * @Date: 2020-02-21 18:03:16
 * @Last Modified by: Eason
 * @Last Modified time: 2022-03-14 16:27:20
 */
import { base } from '../../public/app.config.json';

/** 服务接口基地址，默认是当前站点的域名地址 */
const BASE_DOMAIN = '/';

/** 网关地址 */
const GATEWAY = 'api-gateway';

/**
 * 非生产环境下是使用mocker开发，还是与真实后台开发或联调
 * 注：
 *    yarn start 使用真实后台开发或联调
 *    yarn start:mock 使用mocker数据模拟
 */
const getServerPath = () => {
  if (process.env.NODE_ENV !== 'production') {
    if (process.env.MOCK === 'yes') {
      return '/mocker.api';
    }
    return '/api-gateway';
  }
  return `${BASE_DOMAIN}${GATEWAY}`;
};

const getWebSocketPath = () => {
  if (process.env.NODE_ENV !== 'production') {
    return 'ws://dsei.changhong.com';
  }
  const { protocol } = window.location;
  if (protocol.indexOf('https') !== -1) {
    return `wss://${window.location.host}`;
  }
  return `ws://${window.location.host}`;
};

const WSBaseUrl = getWebSocketPath();

/** 项目的站点基地址 */
const APP_BASE = base;

/** 站点的地址，用于获取本站点的静态资源如json文件，xls数据导入模板等等 */
const LOCAL_PATH = process.env.NODE_ENV !== 'production' ? '..' : `../${APP_BASE}`;

const SERVER_PATH = getServerPath();

const LOGIN_STATUS = {
  SUCCESS: 'success',
  MULTI_TENANT: 'multiTenant',
  CAPTCHA_ERROR: 'captchaError',
  FROZEN: 'frozen',
  LOCKED: 'locked',
  FAILURE: 'failure',
};

/** 业务模块功能项示例 */
const APP_MODULE_BTN_KEY = {
  CREATE: `${APP_BASE}_CREATE`,
  EDIT: `${APP_BASE}_EDIT`,
  DELETE: `${APP_BASE}_DELETE`,
};

/** 策略类别 */
const STRATEGY_TYPE = {
  DIMENSION: { key: 'DIMENSION', title: '维度', color: '#108ee9' },
  EXECUTION: { key: 'EXECUTION', title: '执行', color: '#87d068' },
};

/** 预算维度组件 */
const BUDGET_DIMENSION_UI_COMPONENT = {
  SUBJECT: { code: 'Subject', name: '科目' },
  ORGANIZATION: { code: 'Organization', name: '组织机构' },
  PROJECTLIST: { code: 'ProjectList', name: '项目(列表)' },
  PERIOD: { code: 'Period', name: '期间' },
};

/** 期间类型 */
const PERIOD_TYPE = {
  ALL: { key: 'ALL', title: '全部', backColor: '' },
  ANNUAL: { key: 'ANNUAL', title: '年度', backColor: '#c8ce3e' },
  SEMIANNUAL: { key: 'SEMIANNUAL', title: '半年度', backColor: '#29b3f0' },
  QUARTER: { key: 'QUARTER', title: '季度', backColor: '#3885ea' },
  MONTHLY: { key: 'MONTHLY', title: '月度', backColor: '#b111b9' },
  CUSTOMIZE: { key: 'CUSTOMIZE', title: '自定义', backColor: '#e88214' },
};

/** 主数据类型分类 */
const TYPE_CLASS = {
  GENERAL: { key: 'GENERAL', title: '通用', color: '#29b3f0', alias: '通用' },
  PRIVATE: { key: 'PRIVATE', title: '私有', color: '#fa8c15', alias: '私有' },
};

/** 操作类型 */
const ACTION_TYPE = {
  GENERAL: { key: '', title: '注入' },
  CUSTOMIZE: { key: '', title: '使用' },
};

/** 预算管理类型 */
const ORDER_CATEGORY = {
  INJECTION: { key: 'INJECTION', title: '注入', color: '#108ee9' },
  ADJUSTMENT: { key: 'ADJUSTMENT', title: '调整', color: '#108ee9' },
  SPLIT: { key: 'SPLIT', title: '分解', color: '#108ee9' },
};

/** 预算科目操作 */
const BUDGET_SUBJECT_USER_ACTION = {
  EDIT: 'edit',
  DELETE: 'delete',
  FROZEN: 'frozen',
  UNFROZEN: 'unfrozen',
  REFERENCE: 'reference',
};

/** 预算期间操作 */
const BUDGET_PERIOD_USER_ACTION = {
  EDIT: 'edit',
  DELETE: 'delete',
  FROZEN: 'frozen',
  UNFROZEN: 'unfrozen',
};

/** 预算申请流程状态 */
const REQUEST_VIEW_STATUS = {
  ALL: { key: 'ALL', title: '全部', color: '' },
  PREFAB: { key: 'PREFAB', title: '预制', color: '' },
  DRAFT: { key: 'DRAFT', title: '草稿', color: '' },
  EFFECTING: { key: 'EFFECTING', title: '生效中', color: 'orange' },
  APPROVING: { key: 'APPROVING', title: '审批中', color: 'blue' },
  COMPLETED: { key: 'COMPLETED', title: '已生效', color: 'green' },
};

/** 预算申请行项目状态 */
const REQUEST_ITEM_STATUS = {
  ALL: { key: 'ALL', title: '全部', color: '' },
  NORMAL: { key: 'NORMAL', title: '正常', color: 'green' },
  ERROR: { key: 'ERROR', title: '异常', color: 'red' },
};

/** 全部、启用、停用枚举 */
const FILTER_ENABLE_DISABLE = {
  ALL: { key: 'ALL', title: '全部' },
  ENABLE: { key: 'ENABLE', title: '已启用' },
  DISABLE: { key: 'DISABLE', title: '已停用' },
};

const MASTER_CLASSIFICATION = {
  ALL: { key: 'ALL', title: '全部', color: '' },
  DEPARTMENT: { key: 'DEPARTMENT', title: '组织级', color: 'blue' },
  PROJECT: { key: 'PROJECT', title: '项目级', color: 'purple' },
  COST_CENTER: { key: 'COST_CENTER', title: '成本中心级', color: 'orange' },
};

/** 申请单操作 */
const REQUEST_ORDER_ACTION = {
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
  VIEW_APPROVE_FLOW: 'view_approve_flow',
  UPDATE_APPROVE_FLOW: 'update_approve_flow',
  LINK_VIEW: 'link_view',
};

/** 预算池的操作 */
const BUDGET_POOL_ACTION = {
  LOG: 'log_view',
  FROZEN: 'frozen',
  UNFROZEN: 'unfrozen',
};

/** 预算注入操作 */
const INJECTION_REQUEST_BTN_KEY = {
  CREATE: 'BEMS-INJECTION-CJ',
  EDIT: 'BEMS-INJECTION-XG',
  VIEW: 'BEMS-INJECTION-XS',
  DELETE: 'BEMS-INJECTION-SC',
  START_FLOW: 'BEMS-INJECTION-QDLC',
  FLOW_HISTORY: 'BEMS-INJECTION-LCLS',
  EFFECT: 'BEMS-INJECTION-EFFECT',
};

/** 预算调整操作 */
const ADJUST_REQUEST_BTN_KEY = {
  CREATE: 'BEMS-ADJUST-CJ',
  EDIT: 'BEMS-ADJUST-XG',
  VIEW: 'BEMS-ADJUST-XS',
  DELETE: 'BEMS-ADJUST-SC',
  START_FLOW: 'BEMS-ADJUST-QDLC',
  FLOW_HISTORY: 'BEMS-ADJUST-LCLS',
  EFFECT: 'BEMS-ADJUST-EFFECT',
};

/** 预算分解操作 */
const SPLIT_REQUEST_BTN_KEY = {
  CREATE: 'BEMS-SPLIT-CJ',
  EDIT: 'BEMS-SPLIT-XG',
  VIEW: 'BEMS-SPLIT-XS',
  DELETE: 'BEMS-SPLIT-SC',
  START_FLOW: 'BEMS-SPLIT-QDLC',
  FLOW_HISTORY: 'BEMS-SPLIT-LCLS',
  EFFECT: 'BEMS-SPLIT-EFFECT',
};

const ORDER_BTN_KEY = {
  INJECTION_BHTRDJ: `BEMS-V6-HTPZ-INJECTION-BHTRDJ`,
  ADJUST_BHTRDJ: `BEMS-V6-HTPZ-ADJUST-BHTRDJ`,
  SPLIT_BHTRDJ: `BEMS-V6-HTPZ-SPLIT-BHTRDJ`,
};

/** 日期枚举 */
const SEARCH_DATE_PERIOD = {
  THIS_MONTH: {
    value: 0,
    name: 'THIS_MONTH',
    remark: '本月',
    anEnum: 'THIS_MONTH',
  },
  THIS_WEEK: {
    value: 1,
    name: 'THIS_WEEK',
    remark: '本周',
    anEnum: 'THIS_WEEK',
  },
  TODAY: {
    value: 2,
    name: 'TODAY',
    remark: '今日',
    anEnum: 'TODAY',
  },
  PERIOD: {
    value: 3,
    name: 'PERIOD',
    remark: '自定义',
    anEnum: 'PERIOD',
  },
};

/** 日期枚举 */
const SEARCH_DATE_TIME_PERIOD = {
  ALL: {
    name: 'ALL',
    remark: '全部',
  },
  THIS_5M: {
    name: 'THIS_5M',
    remark: '近5分钟',
  },
  THIS_30M: {
    name: 'THIS_30M',
    remark: '近30分钟',
  },
  THIS_60M: {
    name: 'THIS_60M',
    remark: '近1小时',
  },
  TODAY: {
    name: 'TODAY',
    remark: '今日',
  },
  PERIOD: {
    name: 'PERIOD',
    remark: '自定义',
  },
};

/** 预算池操作类型 */
const POOL_OPERATION = {
  ALL: { key: 'ALL', title: '全部', color: '' },
  FREED: { key: 'FREED', title: '释放', color: 'orange' },
  RELEASE: { key: 'RELEASE', title: '注入', color: 'green' },
  USE: { key: 'USE', title: '占用', color: 'blue' },
};

export default {
  APP_BASE,
  LOCAL_PATH,
  SERVER_PATH,
  APP_MODULE_BTN_KEY,
  LOGIN_STATUS,
  STRATEGY_TYPE,
  BUDGET_DIMENSION_UI_COMPONENT,
  PERIOD_TYPE,
  TYPE_CLASS,
  ORDER_CATEGORY,
  ACTION_TYPE,
  BUDGET_SUBJECT_USER_ACTION,
  REQUEST_VIEW_STATUS,
  INJECTION_REQUEST_BTN_KEY,
  ADJUST_REQUEST_BTN_KEY,
  SPLIT_REQUEST_BTN_KEY,
  REQUEST_ORDER_ACTION,
  WSBaseUrl,
  BUDGET_PERIOD_USER_ACTION,
  REQUEST_ITEM_STATUS,
  SEARCH_DATE_PERIOD,
  BUDGET_POOL_ACTION,
  POOL_OPERATION,
  SEARCH_DATE_TIME_PERIOD,
  MASTER_CLASSIFICATION,
  FILTER_ENABLE_DISABLE,
  ORDER_BTN_KEY,
};
