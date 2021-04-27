import React, { PureComponent } from 'react';
import { get } from 'lodash';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { Button, Input, Tooltip } from 'antd';
import { ExtModal, ListCard, Space } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;

class AssignSubject extends PureComponent {
  static listCardRef;

  static propTypes = {
    currentMaster: PropTypes.object,
    showModal: PropTypes.bool,
    assign: PropTypes.func,
    assignLoading: PropTypes.bool,
    closeModal: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],
    };
  }

  handerSelectChange = selectedKeys => {
    this.setState({ selectedKeys });
  };

  handlerSearchChange = v => {
    this.listCardRef.handlerSearchChange(v);
  };

  handlerPressEnter = () => {
    this.listCardRef.handlerPressEnter();
  };

  handlerSearch = v => {
    this.listCardRef.handlerSearch(v);
  };

  handlerCloseModal = () => {
    const { closeModal } = this.props;
    if (closeModal) {
      closeModal();
      this.setState({ selectedKeys: [] });
    }
  };

  assign = () => {
    const { selectedKeys } = this.state;
    const { assign } = this.props;
    assign(selectedKeys);
  };

  assignCancel = () => {
    this.setState({ selectedKeys: [] });
  };

  renderCustomTool = () => {
    const { selectedKeys } = this.state;
    const { assignLoading } = this.props;
    const hasSelected = selectedKeys.length > 0;
    return (
      <>
        <div>
          <Space>
            <Button
              type="danger"
              ghost
              disabled={!hasSelected || assignLoading}
              onClick={this.assignCancel}
            >
              清空选择
            </Button>
            <Button
              type="primary"
              disabled={!hasSelected}
              loading={assignLoading}
              onClick={this.assign}
            >
              {`确定(${selectedKeys.length})`}
            </Button>
          </Space>
        </div>
        <div>
          <Tooltip title="输入科目代码、名称关键字">
            <Search
              placeholder="输入科目代码、名称关键字"
              onChange={e => this.handlerSearchChange(e.target.value)}
              onSearch={this.handlerSearch}
              onPressEnter={this.handlerPressEnter}
              style={{ width: 200 }}
            />
          </Tooltip>
        </div>
      </>
    );
  };

  render() {
    const { currentMaster, showModal } = this.props;
    const { selectedKeys } = this.state;
    const extModalProps = {
      destroyOnClose: true,
      maskClosable: false,
      onCancel: this.handlerCloseModal,
      wrapClassName: cls(styles['assign-modal-box']),
      visible: showModal,
      centered: true,
      width: 480,
      bodyStyle: { padding: 0, height: 560, overflow: 'hidden' },
      footer: null,
      title: '请选择要添加的科目',
    };
    const listCardProps = {
      className: 'anyone-user-box',
      bordered: false,
      checkbox: true,
      selectedKeys,
      rowKey: 'code',
      itemField: {
        title: item => item.name,
        description: item => item.code,
      },
      showArrow: false,
      showSearch: false,
      remotePaging: true,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subjectItem/getUnassigned/${get(currentMaster, 'id')}`,
      },
      onListCardRef: ref => (this.listCardRef = ref),
      onSelectChange: this.handerSelectChange,
      customTool: this.renderCustomTool,
    };
    return (
      <ExtModal {...extModalProps}>
        <ListCard {...listCardProps} />
      </ExtModal>
    );
  }
}

export default AssignSubject;
