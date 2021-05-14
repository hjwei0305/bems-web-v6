import { utils, message } from 'suid';
import { getDimensionAll } from './service';

const { dvaModel, pathMatchRegexp } = utils;
const { modelExtend, model } = dvaModel;

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

export default modelExtend(model, {
  namespace: 'budgetPool',

  state: {
    recordItem: null,
    subDimensionFields: [],
    showFilter: false,
    filterData: {},
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
  },
});
