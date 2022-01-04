import React, { useCallback } from 'react';
import { withRouter } from 'umi';
import { get } from 'lodash';
import { utils, WorkFlow } from 'suid';
import { constants } from '@/utils';
import Order from '../Order';
import styles from './Request.less';

const { Approve } = WorkFlow;
const { eventBus } = utils;
const { REQUEST_ORDER_ACTION } = constants;

let requestOrderRef;

const UpdateOrder = ({ location }) => {
  const onRequestOrderRef = useCallback(ref => {
    requestOrderRef = ref;
  }, []);

  /** 提交执行完成后的回调函数 */
  const submitComplete = useCallback(
    data => {
      if (data.success) {
        const taskId = get(location, 'query.taskId');
        eventBus.emit('closeTab', [taskId]);
      }
    },
    [location],
  );

  const beforeSubmit = useCallback(params => {
    const { actionType } = params;
    return new Promise(resolve => {
      if (actionType === 'end' || actionType === 'reject') {
        resolve({ success: true });
      } else {
        requestOrderRef.linkSaveOrder(res => {
          resolve(res);
        });
      }
    });
  }, []);

  const getApproveProps = useCallback(() => {
    const businessId = get(location, 'query.id');
    const taskId = get(location, 'query.taskId');
    const instanceId = get(location, 'query.instanceId');
    return {
      businessId,
      taskId,
      instanceId,
      submitComplete,
      beforeSubmit,
    };
  }, [beforeSubmit, location, submitComplete]);

  const getOrderProps = useCallback(() => {
    return {
      title: '预算分解申请',
      action: REQUEST_ORDER_ACTION.UPDATE_APPROVE_FLOW,
      requestId: get(location, 'query.id'),
      onOrderRef: onRequestOrderRef,
    };
  }, [location, onRequestOrderRef]);

  return (
    <Approve className={styles['approve-wrapper']} {...getApproveProps()}>
      <div className="approve-order-content">
        <Order {...getOrderProps()} />
      </div>
    </Approve>
  );
};

export default withRouter(UpdateOrder);
