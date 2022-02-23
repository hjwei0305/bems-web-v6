import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 保存 */
export async function save(data) {
  const url = `${SERVER_PATH}/bems-v6/subject/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/subject/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}

/** 批量创建保存
 * @classification string
 * @corpCodes array
 * @strategyId string
 */
export async function batchSave(data) {
  const url = `${SERVER_PATH}/bems-v6/subject/batchCreate`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/**
 * 获取可以批量创建预算公司
 * @classification string
 */
export async function getBatchCorpData(params) {
  const url = `${SERVER_PATH}/bems-v6/subject/findCorporations`;
  return request({
    url,
    params,
  });
}
