import React, { PureComponent } from 'react';
import { withRouter } from 'umi';
import { utils, WorkFlow } from 'suid';
import { constants } from '@/utils';
import Order from '../Order';
import styles from './Request.less';

const { Approve } = WorkFlow;
const { eventBus } = utils;
const { REQUEST_ORDER_ACTION } = constants;

@withRouter
class UpdateOrder extends PureComponent {
  static requestOrderRef;

  constructor(props) {
    super(props);
    const { location } = props;
    const { id, taskId, instanceId } = location.query;
    this.state = {
      id,
      taskId,
      instanceId,
    };
  }

  onRequestOrderRef = ref => {
    this.requestOrderRef = ref;
  };

  /** 提交执行完成后的回调函数 */
  submitComplete = data => {
    if (data.success) {
      const { taskId } = this.state;
      eventBus.emit('closeTab', [taskId]);
    }
  };

  beforeSubmit = params => {
    const { actionType } = params;
    return new Promise(resolve => {
      if (actionType === 'end' || actionType === 'reject') {
        resolve({ success: true });
      } else {
        this.requestOrderRef.linkSaveOrder(res => {
          resolve(res);
        });
      }
    });
  };

  render() {
    const { id, taskId, instanceId } = this.state;
    const approveProps = {
      businessId: id,
      taskId,
      instanceId,
      submitComplete: this.submitComplete,
      beforeSubmit: this.beforeSubmit,
    };
    return (
      <Approve className={styles['approve-wrapper']} {...approveProps}>
        <div className="approve-order-content">
          <Order
            title="预算分解申请"
            requestId={id}
            onOrderRef={this.onRequestOrderRef}
            action={REQUEST_ORDER_ACTION.UPDATE_APPROVE_FLOW}
          />
        </div>
      </Approve>
    );
  }
}

export default UpdateOrder;
