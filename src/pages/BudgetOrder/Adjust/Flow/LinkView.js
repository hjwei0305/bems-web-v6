/**
 * 第三方调用服务订单-显示
 */
import React, { useCallback } from 'react';
import { withRouter } from 'umi';
import { get } from 'lodash';
import { ScrollBar } from 'suid';
import { constants } from '@/utils';
import Order from '../Order';
import styles from './LinkView.less';

const { REQUEST_ORDER_ACTION } = constants;

const LinkView = ({ location }) => {
  const getOrderProps = useCallback(() => {
    const action = get(location, 'query.action') || REQUEST_ORDER_ACTION.LINK_VIEW;
    return {
      title: '预算调整申请',
      action,
      requestId: get(location, 'query.id'),
    };
  }, [location]);

  return (
    <div className={styles['order-content-wapper']}>
      <ScrollBar className="wapper-scroll">
        <Order {...getOrderProps()} />
      </ScrollBar>
    </div>
  );
};

export default withRouter(LinkView);
