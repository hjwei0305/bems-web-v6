import { utils } from 'suid';
import { constants } from '@/utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 保存 */
export async function save(data) {
  const url = `${SERVER_PATH}/bems-v6/subjectItem/save`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 删除 */
export async function del(params) {
  const url = `${SERVER_PATH}/bems-v6/subjectItem/delete/${params.id}`;
  return request({
    url,
    method: 'DELETE',
  });
}

/** 预算主体分配科目
 * @subjectId string
 * @itemCodes array
 */
export async function assign(data) {
  const url = `${SERVER_PATH}/bems-v6/subjectItem/assigne`;
  return request({
    url,
    method: 'POST',
    data,
  });
}

/** 预算主体科目冻结与解冻 */
export async function frozen(data) {
  const { id, freezing } = data;
  const action = freezing ? 'frozen' : 'unfrozen';
  const url = `${SERVER_PATH}/bems-v6/subjectItem/${action}`;
  return request({
    url,
    method: 'POST',
    data: [id],
  });
}

/** 预算主体检查是否可初始化科目
 * @subjectId string
 */
export async function checkSubjectInit(params) {
  const url = `${SERVER_PATH}/bems-v6/subjectItem/checkReference`;
  return request({
    url,
    params,
  });
}

/** 预算主体初始化科目
 * @currentId string
 * @referenceId string
 */
export async function subjectInit(params) {
  const url = `${SERVER_PATH}/bems-v6/subjectItem/reference`;
  return request({
    url,
    method: 'POST',
    params,
  });
}

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

/**
 * 维护是否可结转
 */
export async function subjectPeriodRoll(params) {
  const { id, roll } = params;
  const url = `${SERVER_PATH}/bems-v6/subjectDimension/setDimensionStrategy/${id}`;
  return request({
    url,
    method: 'POST',
    data: roll,
  });
}

/**
 * 维护业务是否可使用
 */
export async function subjectPeriodUse(params) {
  const { id, use } = params;
  const url = `${SERVER_PATH}/bems-v6/subjectPeriod/use/${id}`;
  return request({
    url,
    method: 'POST',
    data: use,
  });
}
