import { utils, message } from 'suid';
import { getSubjectYears } from './service';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const defaultYear = new Date().getFullYear();

export default modelExtend(model, {
  namespace: 'annualAnalysis',

  state: {
    year: defaultYear,
    years: [defaultYear],
    currentMaster: null,
    rowData: null,
    showTrend: false,
    itemCodes: [],
  },
  effects: {
    *getSubjectYears({ payload }, { call, put }) {
      const re = yield call(getSubjectYears, payload);
      message.destroy();
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            years: re.data,
          },
        });
      } else {
        message.error(re.message);
      }
    },
  },
});
