import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'annualAnalysis',

  state: {
    year: new Date().getFullYear(),
    currentMaster: null,
    rowData: null,
    showTrend: false,
    itemCodes: [],
  },
  effects: {
    *save({ payload, callback }, { call }) {
      const re = yield call('', payload);
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
  },
});
