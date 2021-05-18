import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { ExtModal } from 'suid';
import { constants } from '@/utils';
import Order from '../Order';
import styles from './Request.less';

const { REQUEST_ORDER_ACTION } = constants;

class ViewOrder extends PureComponent {
  static propTypes = {
    showView: PropTypes.bool,
    onCloseModal: PropTypes.func,
    requestId: PropTypes.string,
  };

  handlerCloseModal = needRefresh => {
    const { onCloseModal } = this.props;
    onCloseModal(needRefresh);
  };

  render() {
    const { showView, requestId } = this.props;
    const modalProps = {
      mask: false,
      closable: false,
      keyboard: false,
      wrapClassName: styles['request-order-box'],
      visible: showView,
      fullScreen: true,
      footer: null,
      destroyOnClose: true,
    };
    const orderProps = {
      title: '预算下达申请',
      action: REQUEST_ORDER_ACTION.VIEW,
      onCloseModal: this.handlerCloseModal,
      requestId,
    };
    return (
      <ExtModal {...modalProps}>
        <div className={cls('order-content-wapper')}>
          <Order {...orderProps} />
        </div>
      </ExtModal>
    );
  }
}

export default ViewOrder;
