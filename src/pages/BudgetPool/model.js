import { utils, message } from 'suid';
import { constants } from '@/utils';
import { getDimensionAll, poolItemDisable, poolItemEnable, trundle } from './service';

const { dvaModel, pathMatchRegexp } = utils;
const { modelExtend, model } = dvaModel;
const { PERIOD_TYPE } = constants;
const setSubDimensionFields = dimensionsData => {
  const subDimensionFields = [];
  dimensionsData.forEach(d => {
    if (d.required === false) {
      subDimensionFields.push({
        dimension: d.code,
        value: `${d.code}Name`,
        title: d.name,
      });
    }
  });
  return subDimensionFields;
};

const PERIOD_TYPE_DATA = Object.keys(PERIOD_TYPE).map(key => PERIOD_TYPE[key]);
const [defaultPeriodType] = PERIOD_TYPE_DATA;

export default modelExtend(model, {
  namespace: 'budgetPool',

  state: {
    recordItem: null,
    subDimensionFields: [],
    showFilter: false,
    filterData: {},
    showLog: false,
    selectPeriodType: defaultPeriodType,
    periodTypeData: PERIOD_TYPE_DATA,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/budgetPool/poollist', location.pathname)) {
          dispatch({
            type: 'getDimensionAll',
          });
        }
      });
    },
  },
  effects: {
    *getDimensionAll(_, { call, put }) {
      const re = yield call(getDimensionAll);
      message.destroy();
      if (re.success) {
        const subDimensionFields = setSubDimensionFields(re.data);
        yield put({
          type: 'updateState',
          payload: {
            subDimensionFields,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *poolItemEnable({ payload, callback }, { call }) {
      const re = yield call(poolItemEnable, payload);
      message.destroy();
      if (re.success) {
        message.success('解冻成功');
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *poolItemDisable({ payload, callback }, { call }) {
      const re = yield call(poolItemDisable, payload);
      message.destroy();
      if (re.success) {
        message.success('冻结成功');
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *trundle({ payload, callback }, { call }) {
      const re = yield call(trundle, payload);
      message.destroy();
      if (re.success) {
        message.success('滚动结转成功');
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
