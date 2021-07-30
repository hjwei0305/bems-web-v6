import React, { Component } from 'react';
import cls from 'classnames';
import { Popover } from 'antd';
import { ExtIcon } from 'suid';
import Form from './Form';
import styles from './index.less';

class BudgetEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handlerPopoverHide = () => {
    this.setState({
      visible: false,
    });
  };

  handlerShowChange = visible => {
    this.setState({ visible });
  };

  render() {
    const { visible } = this.state;
    const popoverProps = {
      handlerPopoverHide: this.handlerPopoverHide,
      ...this.props,
    };
    return (
      <Popover
        trigger="click"
        placement="rightTop"
        visible={visible}
        key="form-popover-box"
        destroyTooltipOnHide
        onVisibleChange={v => this.handlerShowChange(v)}
        overlayClassName={cls(styles['form-popover-box'])}
        content={<Form {...popoverProps} />}
      >
        <span className={cls('form-popover-box-trigger', 'action-item')}>
          <ExtIcon type="edit" antd />
        </span>
      </Popover>
    );
  }
}

export default BudgetEdit;
