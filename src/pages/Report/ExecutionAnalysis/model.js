import { utils } from 'suid';
import { getSubjectYears, getMasterDimension } from './service';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const defaultYear = new Date().getFullYear();

export default modelExtend(model, {
  namespace: 'executionAnalysis',

  state: {
    year: defaultYear,
    years: [defaultYear],
    currentMaster: null,
    rowData: null,
    showTrend: false,
    filterData: {},
    subDimensions: [],
  },
  effects: {
    *getSubjectDependenceData({ payload }, { call, put }) {
      const re = yield call(getSubjectYears, payload);
      const result = yield call(getMasterDimension, payload);
      const years = re.data || [];
      const subDimensions = (result.data || []).filter(d => d.required === false);
      yield put({
        type: 'updateState',
        payload: {
          years,
          subDimensions,
        },
      });
    },
  },
});
