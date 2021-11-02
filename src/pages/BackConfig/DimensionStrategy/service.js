import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 通用与私有转换操作 */
export async function transformSubmit(params) {
  const url = `${SERVER_PATH}/bems-v6/subjectDimension/setSubjectDimension`;
  return request({
    url,
    method: 'POST',
    params,
    data: {},
  });
}

/**
 * 维度策略设置
 */
export async function strategySubmit(params) {
  const url = `${SERVER_PATH}/bems-v6/subjectDimension/setDimensionStrategy`;
  return request({
    url,
    method: 'POST',
    params,
    data: {},
  });
}
