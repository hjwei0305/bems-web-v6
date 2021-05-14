import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 获取所有的维度 */
export async function getDimensionAll() {
  const url = `${SERVER_PATH}/bems-v6/dimension/findAll`;
  return request({
    url,
  });
}
