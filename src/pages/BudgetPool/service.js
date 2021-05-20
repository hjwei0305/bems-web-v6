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

/**
 * 停用
 * @ids arrary
 */
export async function poolItemDisable(data) {
  const url = `${SERVER_PATH}/bems-v6/pool/disable`;
  return request({
    method: 'POST',
    url,
    data,
  });
}

/**
 * 启用
 * @ids arrary
 */
export async function poolItemEnable(data) {
  const url = `${SERVER_PATH}/bems-v6/pool/enable`;
  return request({
    method: 'POST',
    url,
    data,
  });
}
