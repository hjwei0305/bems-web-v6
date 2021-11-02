import { utils, message } from 'suid';
import { strategySubmit, transformSubmit } from './service';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'dimensionStrategy',

  state: {
    rowData: null,
    currentMaster: null,
  },
  effects: {
    *transformSubmit({ payload, callback }, { call }) {
      const re = yield call(transformSubmit, payload);
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
    *strategySubmit({ payload, callback }, { call }) {
      const re = yield call(strategySubmit, payload);
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
