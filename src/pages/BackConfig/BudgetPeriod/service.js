import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 创建标准期间(创建后不能修改和删除) */
export async function createNormalPeriod(data) {
  const url = `${SERVER_PATH}/bems-v6/period/createNormalPeriod`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 保存自定义期间 */
export async function saveCustomizePeriod(data) {
  const url = `${SERVER_PATH}/bems-v6/period/saveCustomizePeriod`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除自定义closePeriods */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/period/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}

/** 关闭期间 */
export async function closeAndOpenPeriods(data) {
  const { id, status } = data;
  const url = `${SERVER_PATH}/bems-v6/period/setPeriodStatus/${id}/${status}`;
  return request({
    url,
    method: 'POST',
    data: {},
  });
}
