/*
 * @Author: Eason
 * @Date: 2020-07-07 15:20:15
 * @Last Modified by: Eason
 * @Last Modified time: 2021-05-17 15:35:28
 */
import { formatMessage } from 'umi-plugin-react/locale';
import { utils, message } from 'suid';
import { get } from 'lodash';
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
} from '../services/order';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

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
          yield put({
            type: 'updateState',
            payload: {
              headData: re.data,
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
        yield put({
          type: 'updateState',
          payload: {
            headData: {
              ...rest,
              updownAmount: { up: get(summary, 'data.ADD', 0), down: get(summary, 'data.SUB', 0) },
            },
            subDimensionFields,
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
    *saveItemMoney({ payload, callback }, { call }) {
      const { rowItem } = payload;
      const re = yield call(saveItemMoney, {
        detailId: get(rowItem, 'id'),
        amount: get(rowItem, 'amount'),
      });
      message.destroy();
      if (!re.success) {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
    *removeOrderItems({ payload, successCallback }, { call }) {
      const ids = [...payload];
      const re = yield call(removeOrderItems, ids);
      message.destroy();
      if (re.success) {
        if (successCallback && successCallback instanceof Function) {
          successCallback(re);
        }
        message.success(formatMessage({ id: 'global.delete-success', defaultMessage: '删除成功' }));
      } else {
        message.error(re.message);
      }
    },
    *clearOrderItems({ successCallback }, { call, select }) {
      const { headData } = yield select(sel => sel.adjustOrder);
      const orderId = get(headData, 'id');
      message.destroy();
      if (orderId) {
        const re = yield call(clearOrderItems, { orderId });
        if (re.success) {
          if (successCallback && successCallback instanceof Function) {
            successCallback(re);
          }
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
    *effective({ payload, callback }, { call }) {
      const res = yield call(effective, payload);
      if (res.success) {
        message.success('操作成功');
      } else {
        message.destroy();
        message.error(res.message);
      }
      if (callback && callback instanceof Function) {
        callback(res);
      }
    },
  },
});
