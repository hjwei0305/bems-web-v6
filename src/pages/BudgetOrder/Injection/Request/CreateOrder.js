import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { ExtModal } from 'suid';
import { constants } from '@/utils';
import Order from '../Order';
import styles from './Request.less';

const { REQUEST_ORDER_ACTION } = constants;

class CreateOrder extends PureComponent {
  static propTypes = {
    showCreate: PropTypes.bool,
    onCloseModal: PropTypes.func,
  };

  handlerCloseModal = needRefresh => {
    const { onCloseModal } = this.props;
    onCloseModal(needRefresh);
  };

  render() {
    const { showCreate } = this.props;
    const modalProps = {
      mask: false,
      closable: false,
      keyboard: false,
      wrapClassName: styles['request-order-box'],
      visible: showCreate,
      fullScreen: true,
      footer: null,
      destroyOnClose: true,
    };
    const orderProps = {
      title: '预算下达申请',
      action: REQUEST_ORDER_ACTION.ADD,
      onCloseModal: this.handlerCloseModal,
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

export default CreateOrder;
