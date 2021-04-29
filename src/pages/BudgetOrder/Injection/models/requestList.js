import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { constants } from '@/utils';
import { del, save } from '../services/requestList';

const { REQUEST_VIEW_STATUS } = constants;
const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const viewTypeData = Object.keys(REQUEST_VIEW_STATUS).map(key => REQUEST_VIEW_STATUS[key]);
const [defaultViewType] = viewTypeData;

export default modelExtend(model, {
  namespace: 'injectionRequestList',

  state: {
    recordItem: null,
    viewTypeData,
    currentViewType: defaultViewType,
    showCreate: false,
    showEdit: false,
    showView: false,
    showFilter: false,
    filterData: {},
  },
  effects: {
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
