import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 保存 */
export async function create(data) {
  const url = `${SERVER_PATH}/bems-v6/category/create`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 保存 */
export async function save(data) {
  const url = `${SERVER_PATH}/bems-v6/category/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除自定义closePeriods */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/category/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}
