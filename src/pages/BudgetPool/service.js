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
 * 冻结
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
 * 解冻
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

/**
 * 滚动结转
 * @id string
 */
export async function trundle(params) {
  const url = `${SERVER_PATH}/bems-v6/pool/trundle`;
  return request({
    method: 'POST',
    url,
    params,
    data: {},
  });
}
