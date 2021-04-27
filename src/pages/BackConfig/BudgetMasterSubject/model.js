import { formatMessage } from 'umi-plugin-react/locale';
import { get } from 'lodash';
import { utils, message } from 'suid';
import { del, save, assign, frozen, checkSubjectInit, subjectInit } from './service';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'budgetMasterSubject',

  state: {
    rowData: null,
    showModal: false,
    showAssign: false,
    showInit: false,
    currentMaster: null,
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
    *frozen({ payload, callback }, { call }) {
      const re = yield call(frozen, payload);
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
    *assign({ payload, callback }, { call }) {
      const re = yield call(assign, payload);
      message.destroy();
      if (re.success) {
        message.success('科目创建成功');
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *checkSubjectInit(_, { call, put, select }) {
      const { currentMaster } = yield select(sel => sel.budgetMasterSubject);
      const re = yield call(checkSubjectInit, { subjectId: get(currentMaster, 'id') });
      message.destroy();
      if (re.success) {
        yield put({
          type: 'updateState',
          payload: {
            showInit: true,
          },
        });
      } else {
        message.error(re.message);
      }
    },
    *subjectInit({ payload, callback }, { call, select }) {
      const { referenceId } = payload;
      const { currentMaster } = yield select(sel => sel.budgetMasterSubject);
      const re = yield call(subjectInit, { referenceId, currentId: get(currentMaster, 'id') });
      message.destroy();
      if (re.success) {
        message.success('科目初始化成功');
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
