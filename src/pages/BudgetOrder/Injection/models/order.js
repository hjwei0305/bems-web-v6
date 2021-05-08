/*
 * @Author: Eason
 * @Date: 2020-07-07 15:20:15
 * @Last Modified by: Eason
 * @Last Modified time: 2021-05-08 11:45:57
 */
import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import {
  save,
  del,
  checkDimension,
  getDimension,
  clearOrderItems,
  addOrderDetails,
} from '../services/order';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'injectionOrder',

  state: {
    headData: null,
    showDimensionSelection: false,
    dimensionsData: [],
    showProgressResult: false,
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
    *addOrderDetails({ payload, successCallback }, { call, put, select }) {
      const { headData: originHeadData } = yield select(sel => sel.injectionOrder);
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
    *clearOrderItems({ payload, successCallback }, { call }) {
      const re = yield call(clearOrderItems, payload);
      message.destroy();
      if (re.success) {
        if (successCallback && successCallback instanceof Function) {
          successCallback(re);
        }
      } else {
        message.error(re.message);
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
          yield put({
            type: 'updateState',
            payload: {
              headData,
              showDimensionSelection: true,
              dimensionsData: resDimension.data,
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
  },
});
