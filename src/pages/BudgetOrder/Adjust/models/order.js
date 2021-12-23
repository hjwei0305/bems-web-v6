/*
 * @Author: Eason
 * @Date: 2020-07-07 15:20:15
 * @Last Modified by: Eason
 * @Last Modified time: 2021-12-23 14:33:45
 */
import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { get, pick } from 'lodash';
import * as XLSX from 'xlsx';
import { constants } from '@/utils';
import {
  save,
  removeOrderItems,
  checkDimension,
  getDimension,
  clearOrderItems,
  addOrderDetails,
  getHead,
  saveItemMoney,
  effective,
  getAdjustData,
  confirm,
  cancel,
  dataExport,
} from '../services/order';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const { REQUEST_VIEW_STATUS } = constants;
const setSubDimensionFields = dimensionsData => {
  const subDimensionFields = [];
  dimensionsData.forEach(d => {
    if (d.required === false) {
      subDimensionFields.push({
        dimension: d.code,
        value: `${d.code}Name`,
        title: d.name,
      });
    }
  });
  return subDimensionFields;
};

export default modelExtend(model, {
  namespace: 'adjustOrder',

  state: {
    headData: null,
    showDimensionSelection: false,
    dimensionsData: [],
    showProgressResult: false,
    subDimensionFields: [],
  },
  effects: {
    *save({ payload, callback }, { call, put }) {
      const { beforeStartFlow, ...rest } = payload;
      const re = yield call(save, rest);
      /**
       * 如果是工作流期间的保存，保存结果及消息交给工作流组件
       */
      if (!beforeStartFlow) {
        message.destroy();
        if (re.success) {
          const headData = re.data;
          const summary = yield call(getAdjustData, { orderId: get(headData, 'id') });
          yield put({
            type: 'updateState',
            payload: {
              headData: {
                ...headData,
                updownAmount: {
                  up: get(summary, 'data.ADD', 0),
                  down: get(summary, 'data.SUB', 0),
                },
              },
            },
          });
          message.success(formatMessage({ id: 'global.save-success', defaultMessage: '保存成功' }));
        } else {
          message.error(re.message);
        }
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *getHead({ payload, callback }, { call, put }) {
      const summary = yield call(getAdjustData, { orderId: get(payload, 'id') });
      const res = yield call(getHead, payload);
      if (res.success) {
        const { dimensions, ...rest } = res.data;
        const subDimensionFields = setSubDimensionFields(dimensions);
        const processing = get(rest, 'processing') || false;
        yield put({
          type: 'updateState',
          payload: {
            headData: {
              ...rest,
              updownAmount: { up: get(summary, 'data.ADD', 0), down: get(summary, 'data.SUB', 0) },
            },
            subDimensionFields,
            showProgressResult: processing,
          },
        });
      } else {
        message.destroy();
        message.error(res.message);
      }
      if (callback && callback instanceof Function) {
        callback(res);
      }
    },
    *renewHead(_, { call, put, select }) {
      const { headData } = yield select(sel => sel.adjustOrder);
      const orderId = get(headData, 'id');
      if (orderId) {
        const res = yield call(getHead, { id: orderId });
        if (res.success) {
          const summary = yield call(getAdjustData, { orderId });
          const processing = get(res.data, 'processing') || false;
          yield put({
            type: 'updateState',
            payload: {
              headData: {
                ...res.data,
                updownAmount: {
                  up: get(summary, 'data.ADD', 0),
                  down: get(summary, 'data.SUB', 0),
                },
              },
              showProgressResult: processing,
            },
          });
        } else {
          message.destroy();
          message.error(res.message);
        }
      } else {
        yield put({
          type: 'updateState',
          payload: {
            showProgressResult: false,
          },
        });
      }
    },
    *addOrderDetails({ payload, successCallback }, { call, put, select }) {
      const { headData: originHeadData } = yield select(sel => sel.adjustOrder);
      const re = yield call(addOrderDetails, payload);
      message.destroy();
      if (re.success) {
        const orderId = re.data;
        const headData = { ...(originHeadData || {}) };
        Object.assign(headData, { id: orderId });
        yield put({
          type: 'updateState',
          payload: {
            headData,
            dimensionsData: [],
            showDimensionSelection: false,
            showProgressResult: true,
          },
        });
        if (successCallback && successCallback instanceof Function) {
          successCallback(orderId);
        }
      } else {
        message.error(re.message);
      }
    },
    *saveItemMoney({ payload, callback }, { call, select, put }) {
      const { rowItem } = payload;
      const re = yield call(saveItemMoney, {
        detailId: get(rowItem, 'id'),
        amount: get(rowItem, 'amount'),
      });
      message.destroy();
      if (re.success) {
        const { headData } = yield select(sel => sel.adjustOrder);
        const summary = yield call(getAdjustData, { orderId: get(headData, 'id') });
        yield put({
          type: 'updateState',
          payload: {
            headData: {
              ...headData,
              updownAmount: { up: get(summary, 'data.ADD', 0), down: get(summary, 'data.SUB', 0) },
            },
          },
        });
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *removeOrderItems({ payload, successCallback }, { call, select, put }) {
      const ids = [...payload];
      const re = yield call(removeOrderItems, ids);
      message.destroy();
      if (re.success) {
        if (successCallback && successCallback instanceof Function) {
          successCallback(re);
        }
        const { headData } = yield select(sel => sel.adjustOrder);
        const summary = yield call(getAdjustData, { orderId: get(headData, 'id') });
        yield put({
          type: 'updateState',
          payload: {
            headData: {
              ...headData,
              updownAmount: { up: get(summary, 'data.ADD', 0), down: get(summary, 'data.SUB', 0) },
            },
          },
        });
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
      } else {
        message.error(re.message);
      }
    },
    *clearOrderItems({ successCallback }, { call, select, put }) {
      const { headData } = yield select(sel => sel.adjustOrder);
      const orderId = get(headData, 'id');
      message.destroy();
      if (orderId) {
        const re = yield call(clearOrderItems, { orderId });
        if (re.success) {
          if (successCallback && successCallback instanceof Function) {
            successCallback(re);
          }
          yield put({
            type: 'updateState',
            payload: {
              headData: {
                ...headData,
                updownAmount: { up: 0, down: 0 },
              },
            },
          });
        } else {
          message.error(re.message);
        }
      } else {
        message.error('未获取到单据的Id');
      }
    },
    *checkDimensionForSelect({ payload, callback }, { call, put }) {
      const { headData } = payload;
      const { id, subjectId, categoryId } = headData;
      let re = { success: true };
      if (id) {
        re = yield call(checkDimension, {
          subjectId,
          categoryId,
          orderId: id,
        });
      }
      message.destroy();
      if (re.success) {
        const resDimension = yield call(getDimension, { categoryId });
        if (resDimension.success) {
          const dimensionsData = resDimension.data;
          const subDimensionFields = setSubDimensionFields(dimensionsData);
          yield put({
            type: 'updateState',
            payload: {
              headData,
              showDimensionSelection: true,
              dimensionsData,
              subDimensionFields,
            },
          });
        }
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *effective({ payload, callbackSuccess }, { call, put }) {
      const res = yield call(effective, payload);
      message.destroy();
      if (res.success) {
        const resHeadData = res.data;
        const summary = yield call(getAdjustData, { orderId: get(resHeadData, 'id') });
        const processing = get(resHeadData, 'processing') || false;
        yield put({
          type: 'updateState',
          payload: {
            headData: {
              ...resHeadData,
              updownAmount: { up: get(summary, 'data.ADD', 0), down: get(summary, 'data.SUB', 0) },
            },
            showProgressResult: processing,
          },
        });
        if (callbackSuccess && callbackSuccess instanceof Function) {
          callbackSuccess(res);
        }
        message.success('操作成功');
      } else {
        message.error(res.message);
      }
    },
    *confirm({ payload, callbackSuccess }, { put, call, select }) {
      const { headData: originHeadData } = yield select(sel => sel.adjustOrder);
      const head = { ...originHeadData };
      Object.assign(head, { ...payload });
      message.destroy();
      const status = get(head, 'status');
      let re = { success: true, data: head };
      if (status === REQUEST_VIEW_STATUS.PREFAB.key || status === REQUEST_VIEW_STATUS.DRAFT.key) {
        re = yield call(save, head);
      }
      if (re.success) {
        const reHeadData = re.data;
        const res = yield call(confirm, { orderId: get(reHeadData, 'id') });
        if (res.success) {
          const resHeadData = res.data;
          const summary = yield call(getAdjustData, { orderId: get(resHeadData, 'id') });
          const processing = get(resHeadData, 'processing') || false;
          yield put({
            type: 'updateState',
            payload: {
              headData: {
                ...resHeadData,
                updownAmount: {
                  up: get(summary, 'data.ADD', 0),
                  down: get(summary, 'data.SUB', 0),
                },
              },
              showProgressResult: processing,
            },
          });
          if (callbackSuccess && callbackSuccess instanceof Function) {
            callbackSuccess(res);
          }
          message.success('操作成功');
        } else {
          message.error(res.message);
        }
      } else {
        message.error(re.message);
      }
    },
    *cancel({ payload, callbackSuccess }, { put, call }) {
      const res = yield call(cancel, payload);
      message.destroy();
      if (res.success) {
        const resHeadData = res.data;
        const summary = yield call(getAdjustData, { orderId: get(resHeadData, 'id') });
        const processing = get(resHeadData, 'processing') || false;
        yield put({
          type: 'updateState',
          payload: {
            headData: {
              ...resHeadData,
              updownAmount: { up: get(summary, 'data.ADD', 0), down: get(summary, 'data.SUB', 0) },
            },
            showProgressResult: processing,
          },
        });
        if (callbackSuccess && callbackSuccess instanceof Function) {
          callbackSuccess(res);
        }
        message.success('操作成功');
      } else {
        message.error(res.message);
      }
    },
    *updateUpdownAmount(_, { call, select, put }) {
      const { headData } = yield select(sel => sel.adjustOrder);
      const summary = yield call(getAdjustData, { orderId: get(headData, 'id') });
      yield put({
        type: 'updateState',
        payload: {
          headData: {
            ...headData,
            updownAmount: { up: get(summary, 'data.ADD', 0), down: get(summary, 'data.SUB', 0) },
          },
        },
      });
    },
    *dataExport({ payload }, { call, select }) {
      const { headData } = yield select(sel => sel.adjustOrder);
      const subjectName = get(headData, 'subjectName');
      const categoryName = get(headData, 'categoryName');
      const res = yield call(dataExport, payload);
      if (res.success) {
        const { head, data } = res.data;
        const pickData = [];
        const pickHead = [];
        (head || []).forEach(it => {
          const { filed, value } = it;
          pickHead.push(value);
          pickData.push(filed);
        });
        const fileTitle = `${subjectName}-${categoryName}-调整明细`;
        const header = [...pickHead];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([header]);
        const exportData = (data || []).map(it => {
          return pick(it, pickData);
        });

        XLSX.utils.sheet_add_json(ws, exportData, { skipHeader: true, origin: 'A2' });
        ws['!cols'] = [];
        header.forEach(() => ws['!cols'].push({ wpx: 260 }));
        XLSX.utils.book_append_sheet(wb, ws, fileTitle);
        XLSX.writeFile(wb, `${fileTitle}.xlsx`);
      } else {
        message.destroy();
        message.error(res.message);
      }
    },
  },
});
