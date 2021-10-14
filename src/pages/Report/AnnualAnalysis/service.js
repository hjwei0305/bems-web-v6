import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/**
 * 获取预算年度清单
 */
export async function getSubjectYears(params) {
  const { subjectId } = params;
  const url = `${SERVER_PATH}/bems-v6/report/getYears/${subjectId}`;
  return request({
    method: 'POST',
    url,
    data: {},
  });
}

/** 根据主体获取维度 */
export async function getMasterDimension(params) {
  const url = `${SERVER_PATH}/bems-v6/report/getDimensionsBySubjectId`;
  return request({
    url,
    params,
  });
}
