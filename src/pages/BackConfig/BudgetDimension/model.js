import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { del, save, getAllDimension } from './service';

const { dvaModel, pathMatchRegexp } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'budgetDimension',

  state: {
    rowData: null,
    showModal: false,
    allDimensionData: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/budgetConfig/budgetDimension', location.pathname)) {
          dispatch({
            type: 'getAllDimension',
          });
        }
      });
    },
  },
  effects: {
    *getAllDimension(_, { call, put }) {
      const res = yield call(getAllDimension);
      message.destroy();
      if (res.success) {
        const allDimensionData = res.data || [];
        yield put({
          type: 'updateState',
          payload: {
            allDimensionData,
          },
        });
      } else {
        message.error(res.message);
      }
    },
    *save({ payload, callback }, { call }) {
      const re = yield call(save, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *del({ payload, callback }, { call }) {
      const re = yield call(del, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
