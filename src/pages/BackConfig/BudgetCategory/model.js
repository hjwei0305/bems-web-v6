import { utils, message } from 'suid';
import { constants } from '@/utils';
import { enableDisable } from './service';

const { ORDER_CATEGORY } = constants;
const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

const ORDER_CATEGORY_DATA = Object.keys(ORDER_CATEGORY).map(key => ORDER_CATEGORY[key]);
const [defaultCategory] = ORDER_CATEGORY_DATA;

export default modelExtend(model, {
  namespace: 'budgetCategory',

  state: {
    categoryData: ORDER_CATEGORY_DATA,
    currentCategory: defaultCategory,
    currentRowId: '',
  },
  effects: {
    *enableDisable({ payload, callback }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          currentRowId: payload.id,
        },
      });
      const re = yield call(enableDisable, payload);
      message.destroy();
      if (re.success) {
        message.success('操作成功');
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
