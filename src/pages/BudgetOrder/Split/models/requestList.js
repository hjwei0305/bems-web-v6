import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { constants } from '@/utils';
import { del, checkSplitPrefab } from '../services/requestList';
import { effective } from '../services/order';

const { REQUEST_VIEW_STATUS, SEARCH_DATE_PERIOD } = constants;
const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const viewTypeData = Object.keys(REQUEST_VIEW_STATUS)
  .filter(key => key !== REQUEST_VIEW_STATUS.PREFAB.key)
  .map(key => REQUEST_VIEW_STATUS[key]);
const [defaultViewType] = viewTypeData;
const viewDateData = Object.keys(SEARCH_DATE_PERIOD).map(key => SEARCH_DATE_PERIOD[key]);
const [defaultViewDate] = viewDateData;

export default modelExtend(model, {
  namespace: 'splitRequestList',

  state: {
    recordItem: null,
    viewTypeData,
    currentViewType: defaultViewType,
    viewDateData,
    currentViewDate: defaultViewDate,
    showCreate: false,
    showUpdate: false,
    showView: false,
    showFilter: false,
    showPrefab: false,
    prefabData: [],
    filterData: {},
    includeOther: false,
  },
  effects: {
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
    *trash({ payload, callback }, { call }) {
      const re = yield call(del, payload);
      message.destroy();
      if (!re.success) {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *checkSplitPrefab({ payload }, { call, put }) {
      const res = yield call(checkSplitPrefab, payload);
      if (res.success) {
        const prefabData = res.data || [];
        if (prefabData.length > 0) {
          yield put({
            type: 'updateState',
            payload: {
              showPrefab: true,
              prefabData,
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              showCreate: true,
            },
          });
        }
      } else {
        message.destroy();
        message.error(res.message);
      }
    },
    *effective({ payload, callback }, { call }) {
      const res = yield call(effective, payload);
      message.destroy();
      if (res.success) {
        message.success('操作成功');
      } else {
        message.error(res.message);
      }
      if (callback && callback instanceof Function) {
        callback(res);
      }
    },
  },
});
