import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { constants } from '@/utils';
import { del, createNormalPeriod, saveCustomizePeriod, closeAndOpenPeriods } from './service';

const { PERIOD_TYPE } = constants;
const PERIOD_TYPE_DATA = Object.keys(PERIOD_TYPE).map(key => PERIOD_TYPE[key]);
const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const [defaultPeriodType] = PERIOD_TYPE_DATA;

export default modelExtend(model, {
  namespace: 'budgetPeriod',

  state: {
    rowData: null,
    showModal: false,
    currentMaster: null,
    selectPeriodType: defaultPeriodType,
    periodTypeData: PERIOD_TYPE_DATA,
  },
  effects: {
    *createNormalPeriod({ payload, callback }, { call }) {
      const re = yield call(createNormalPeriod, payload);
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
    *saveCustomizePeriod({ payload, callback }, { call }) {
      const re = yield call(saveCustomizePeriod, payload);
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
    *closeAndOpenPeriods({ payload, callback }, { call }) {
      const re = yield call(closeAndOpenPeriods, payload);
      message.destroy();
      if (re.success) {
        message.success('关闭成功');
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
