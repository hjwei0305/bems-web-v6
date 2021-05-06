import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 删除 */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/order/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}
