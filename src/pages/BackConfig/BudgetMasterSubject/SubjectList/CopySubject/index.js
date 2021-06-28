import React, { PureComponent } from 'react';
import { get } from 'lodash';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { Button, Input, Tooltip, Radio, Descriptions, Tag } from 'antd';
import { ExtModal, ListCard, Space } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;

class CopySubject extends PureComponent {
  static listCardRef;

  static propTypes = {
    currentMaster: PropTypes.object,
    showModal: PropTypes.bool,
    init: PropTypes.func,
    initLoading: PropTypes.bool,
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

  init = () => {
    const { selectedKeys } = this.state;
    const { init } = this.props;
    const [referenceId] = selectedKeys;
    init(referenceId);
  };

  initCancel = () => {
    const { closeModal } = this.props;
    this.setState({ selectedKeys: [] }, closeModal);
  };

  renderCustomTool = () => {
    const { selectedKeys } = this.state;
    const { initLoading } = this.props;
    const hasSelected = selectedKeys.length > 0;
    return (
      <>
        <div>
          <Space>
            <Button type="danger" ghost disabled={initLoading} onClick={this.initCancel}>
              取消
            </Button>
            <Button
              type="primary"
              disabled={!hasSelected}
              loading={initLoading}
              onClick={this.init}
            >
              确定
            </Button>
          </Space>
        </div>
        <div>
          <Tooltip title="输入主体代码、名称关键字">
            <Search
              allowClear
              placeholder="输入主体代码、名称关键字"
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

  renderAvatar = ({ keyValue, checkedList }) => {
    return <Radio checked={!!checkedList[keyValue]} />;
  };

  render() {
    const { currentMaster, showModal, closeModal } = this.props;
    const { selectedKeys } = this.state;
    const extModalProps = {
      destroyOnClose: true,
      maskClosable: false,
      onCancel: closeModal,
      wrapClassName: cls(styles['init-modal-box']),
      visible: showModal,
      centered: true,
      width: 480,
      bodyStyle: { padding: 0, height: 560, overflow: 'hidden' },
      footer: null,
      title: '请选择要初始化的源预算主体科目',
    };
    const listCardProps = {
      className: 'anyone-user-box',
      bordered: false,
      selectedKeys,
      itemField: {
        avatar: this.renderAvatar,
        title: item => `${item.name}(${item.code})`,
        description: item => (
          <>
            <Descriptions column={1} bordered={false}>
              <Descriptions.Item label="公司">{`${get(item, 'corporationName')}(${get(
                item,
                'corporationCode',
              )})`}</Descriptions.Item>
              <Descriptions.Item label="组织">{`${get(item, 'orgName')}(${get(
                item,
                'orgCode',
              )})`}</Descriptions.Item>
            </Descriptions>
            <Descriptions column={2} bordered={false}>
              <Descriptions.Item label="币种">{`${get(item, 'currencyName')}(${get(
                item,
                'currencyCode',
              )})`}</Descriptions.Item>
              <Descriptions.Item label="执行策略">
                <Tag color="blue">{`${get(item, 'strategyName')}`}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </>
        ),
      },
      showArrow: false,
      showSearch: false,
      remotePaging: true,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subject/findByPage`,
      },
      cascadeParams: {
        filters: [{ fieldName: 'id', operator: 'NE', value: get(currentMaster, 'id', null) }],
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

export default CopySubject;
