import { formatMessage } from 'umi-plugin-react/locale';
import { orderBy, toLower } from 'lodash';
import { utils, message } from 'suid';
import { constants } from '@/utils';
import { del, save, batchSave, getBatchCorpData } from './service';

const { MASTER_CLASSIFICATION } = constants;
const MASTER_CLASSIFICATION_DATA = Object.keys(MASTER_CLASSIFICATION)
  .map(key => MASTER_CLASSIFICATION[key])
  .filter(it => it.key !== MASTER_CLASSIFICATION.ALL.key);
const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const SORT_DATA = [
  { fieldName: 'code', title: '公司代码' },
  { fieldName: 'name', title: '公司名称' },
];

const [defaultSort] = SORT_DATA;

export default modelExtend(model, {
  namespace: 'budgetMaster',

  state: {
    rowData: null,
    showModal: false,
    classificationData: MASTER_CLASSIFICATION_DATA,
    currentClassification: {},
    showBatchModal: false,
    currentSort: defaultSort,
    sortType: 'ASC',
    sortData: SORT_DATA,
    corpData: [],
  },
  effects: {
    *save({ payload, callback }, { call, put }) {
      const re = yield call(save, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            showModal: false,
          },
        });
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
    *batchSave({ payload, callback }, { call, put }) {
      const re = yield call(batchSave, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        yield put({
          type: 'updateState',
          payload: {
            showBatchModal: false,
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *getBatchCorpData({ payload }, { call, put, select }) {
      const { currentSort, sortType } = yield select(sel => sel.budgetMaster);
      const re = yield call(getBatchCorpData, payload);
      message.destroy();
      if (re.success) {
        const corpData = orderBy([...re.data], [currentSort.fieldName], [toLower(sortType)]);
        yield put({
          type: 'updateState',
          payload: {
            corpData,
          },
        });
      } else {
        message.error(re.message);
      }
    },
  },
});
