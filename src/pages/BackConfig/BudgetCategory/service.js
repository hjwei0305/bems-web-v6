import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 预算分类的预算期间的启用与禁用 */
export async function enableDisable(data) {
  const { id, enable } = data;
  const url = `${SERVER_PATH}/bems-v6/orderConfig/updateConfig/${id}`;
  return request({
    url,
    method: 'POST',
    data: {},
    params: {
      enable,
    },
  });
}
