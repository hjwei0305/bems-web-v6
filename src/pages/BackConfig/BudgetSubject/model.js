import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { constants, downFile, exportXls } from '@/utils';
import { del, save, frozen, getImportTemplate, importData, exportData } from './service';

const { TYPE_CLASS } = constants;
const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const TYPE_CLASS_DATA = Object.keys(TYPE_CLASS).map(key => TYPE_CLASS[key]);

export default modelExtend(model, {
  namespace: 'budgetSubject',

  state: {
    showImport: false,
    rowData: null,
    showModal: false,
    selectTypeClass: TYPE_CLASS.GENERAL,
    typeClassData: TYPE_CLASS_DATA,
    currentCorperation: null,
    selectedSubject: null,
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
    *disable({ payload, callback }, { call }) {
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
    *enable({ payload, callback }, { call }) {
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
    *getImportSalaryTemplate(_, { call }) {
      const ds = yield call(getImportTemplate);
      if (ds.success) {
        downFile(ds.data, '预算科目导入模板.xlsx');
      }
    },
    *sendImport({ payload, callback }, { call, put }) {
      const ds = yield call(importData, payload);
      message.destroy();
      if (ds.success) {
        message.success('预算科目导入成功');
        yield put({
          type: 'updateState',
          payload: {
            showImport: false,
          },
        });
      } else {
        message.error(ds.message);
      }
      if (callback && callback instanceof Function) {
        callback(ds);
      }
    },
    *exportData(_, { call }) {
      const ds = yield call(exportData);
      if (ds.success) {
        if (ds.data && ds.data.length > 0) {
          exportXls('预算科目', ['科目代码', '科目名称'], ds.data);
        } else {
          message.destroy();
          message.info('暂时没有数据');
        }
      }
    },
  },
});
