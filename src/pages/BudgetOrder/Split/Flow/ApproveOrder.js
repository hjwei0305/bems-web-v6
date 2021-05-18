import React, { PureComponent } from 'react';
import { withRouter } from 'umi';
import { WorkFlow, utils } from 'suid';
import { constants } from '@/utils';
import Order from '../Order';
import styles from './Request.less';

const { REQUEST_ORDER_ACTION } = constants;
const { Approve } = WorkFlow;
const { eventBus } = utils;

@withRouter
class ApproveOrder extends PureComponent {
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

  /** 提交执行完成后的回调函数 */
  submitComplete = data => {
    if (data.success) {
      const { taskId } = this.state;
      eventBus.emit('closeTab', [taskId]);
    }
  };

  render() {
    const { id, taskId, instanceId } = this.state;
    const approveProps = {
      businessId: id,
      taskId,
      instanceId,
      submitComplete: this.submitComplete,
    };
    return (
      <Approve className={styles['approve-wrapper']} {...approveProps}>
        <div className="approve-order-content">
          <Order title="预算分解申请" requestId={id} action={REQUEST_ORDER_ACTION.APPROVE_FLOW} />
        </div>
      </Approve>
    );
  }
}

export default ApproveOrder;
