import { get } from 'lodash';
import { utils } from 'suid';
import { constants } from '@/utils';
import { getSubjectYears, getOverviewData } from './service';

const { PERIOD_TYPE } = constants;
const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const defaultYear = new Date().getFullYear();
const PERIOD_TYPE_DATA = Object.keys(PERIOD_TYPE)
  .map(key => PERIOD_TYPE[key])
  .filter(it => it.key !== PERIOD_TYPE.ALL.key && it.key !== PERIOD_TYPE.CUSTOMIZE.key);
export default modelExtend(model, {
  namespace: 'summaryAnalysis',

  state: {
    years: [defaultYear],
    compareYears: [],
    selectCompareYear: null,
    selectPeriodType: PERIOD_TYPE.ANNUAL,
    periodTypeData: PERIOD_TYPE_DATA,
    currentMaster: null,
    reportData: [],
  },
  effects: {
    *getSubjectDependenceData({ payload }, { call, put }) {
      const re = yield call(getSubjectYears, payload);
      const years = (re.data || []).filter(y => y !== defaultYear);
      yield put({
        type: 'updateState',
        payload: {
          compareYears: years,
        },
      });
    },
    *getOverviewData(_, { call, put, select }) {
      const { years, selectPeriodType, currentMaster, selectCompareYear } = yield select(
        sel => sel.summaryAnalysis,
      );
      const payload = {
        subjectId: get(currentMaster, 'id'),
        periodType: selectPeriodType.key,
        years: [...years],
      };
      if (selectCompareYear) {
        payload.years.push(selectCompareYear);
      }
      const re = yield call(getOverviewData, payload);
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            reportData: re.data,
          },
        });
      }
    },
  },
});
