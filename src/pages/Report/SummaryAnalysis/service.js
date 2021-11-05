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
    method: 'GET',
    url,
  });
}

/**
 * 预算概览报表数据
 */
export async function getOverviewData(data) {
  const url = `${SERVER_PATH}/bems-v6/report/overview`;
  return request({
    method: 'POST',
    url,
    data,
  });
}
