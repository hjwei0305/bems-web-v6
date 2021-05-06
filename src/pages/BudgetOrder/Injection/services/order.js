import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 保存 */
export async function save(data) {
  const url = `${SERVER_PATH}/bems-v6/order/saveOrder`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/order/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}

/** 检查是否可以添加明细包括导入
 * @subjectId
 * @categoryId
 * @orderId
 */
export async function checkDimension(params) {
  const url = `${SERVER_PATH}/bems-v6/order/checkDimension`;
  return request({
    url,
    params,
  });
}

/** 根据预算类型Id获取预算的维度
 * @categoryId
 */
export async function getDimension(params) {
  const url = `${SERVER_PATH}/bems-v6/category/getAssigned`;
  return request({
    url,
    params,
  });
}

/**
 * 清空申请明细
 * @orderId string
 */
export async function clearOrderItems(params) {
  const url = `${SERVER_PATH}/bems-v6/order/clearOrderItems`;
  return request({
    url,
    method: 'POST',
    data: {},
    params,
  });
}

/**
 * 批量添加一个预算申请单行项明细
 */
export async function addOrderDetails(data) {
  const url = `${SERVER_PATH}/bems-v6/order/addOrderDetails`;
  return request({
    url,
    method: 'POST',
    data,
  });
}
