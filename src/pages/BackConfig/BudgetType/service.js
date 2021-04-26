import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 创建 */
export async function create(data) {
  const url = `${SERVER_PATH}/bems-v6/category/create`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 保存 */
export async function save(data) {
  const url = `${SERVER_PATH}/bems-v6/category/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/category/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}

/** 冻结与解冻 */
export async function frozen(data) {
  const { id, freezing } = data;
  const action = freezing ? 'frozen' : 'unfrozen';
  const url = `${SERVER_PATH}/bems-v6/category/${action}/${id}`;
  return request({
    url,
    method: 'POST',
    data: {},
  });
}

/** 通用转私有 */
export async function privateReference(data) {
  const { subjectId, id } = data;
  const url = `${SERVER_PATH}/bems-v6/category/reference/${subjectId}/${id}`;
  return request({
    url,
    method: 'POST',
    data: {},
  });
}

/** 预算类型分配维度
 * @categoryId 预算类型Id
 * @dimensionCodes 维度代码
 */
export async function assign(data) {
  const url = `${SERVER_PATH}/bems-v6/category/assigne`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 预算类型维度移除
 * @categoryId 预算类型Id
 * @dimensionCodes 维度代码
 */
export async function unassign(data) {
  const url = `${SERVER_PATH}/bems-v6/category/unassigne`;
  return request({
    url,
    method: 'POST',
    data,
  });
}
