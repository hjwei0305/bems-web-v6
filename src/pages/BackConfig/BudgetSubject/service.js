import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH, LOCAL_PATH } = constants;

/** 保存 */
export async function save(data) {
  const url = `${SERVER_PATH}/bems-v6/item/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/item/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}

/** 冻结与解冻 */
export async function frozen(data) {
  const url = `${SERVER_PATH}/bems-v6/item/disabled`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/**
 * 获取导入模板
 */
export async function getImportTemplate() {
  const url = `${LOCAL_PATH}/local/budgetSubjectTemplate.xlsx`;
  return request({
    url,
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 * 预算科目导入
 */
export async function importData(data) {
  const url = `${SERVER_PATH}/bems-v6/item/import`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/**
 * 预算科目导出
 */
export async function exportData(data) {
  const url = `${SERVER_PATH}/bems-v6/item/export`;
  return request({
    url,
    method: 'POST',
    data,
  });
}
