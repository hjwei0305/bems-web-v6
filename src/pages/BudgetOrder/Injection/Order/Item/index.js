import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Popconfirm, Card, Tabs } from 'antd';
import { Space, Attachment } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { TabPane } = Tabs;
const { REQUEST_ORDER_ACTION, SERVER_PATH } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);

class RequestItem extends PureComponent {
  static attachmentRef;

  static propTypes = {
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
    clearing: PropTypes.bool,
    globalDisabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    const { action } = props;
    this.state = {
      activeKey: 'item',
      allowEdit:
        action === REQUEST_ORDER_ACTION.ADD ||
        action === REQUEST_ORDER_ACTION.EDIT ||
        action === REQUEST_ORDER_ACTION.UPDATE_APPROVE_FLOW,
      isView:
        action === REQUEST_ORDER_ACTION.VIEW ||
        action === REQUEST_ORDER_ACTION.VIEW_APPROVE_FLOW ||
        action === REQUEST_ORDER_ACTION.LINK_VIEW,
    };
  }

  handlerTabChange = activeKey => {
    this.setState({ activeKey });
  };

  renderItemAction = () => {
    const { allowEdit, isView, activeKey } = this.state;
    if (activeKey === 'attachment') {
      return null;
    }
    const { clearing } = this.props;
    if (isView) {
      return null;
    }
    if (allowEdit) {
      return (
        <Space>
          <Button onClick={this.add} icon="plus" size="small">
            新建明细
          </Button>
          <Popconfirm title="确定要清除行项目吗?" onConfirm={this.handlerClearRequestItemCache}>
            <Button size="small" loading={clearing}>
              清除行项目
            </Button>
          </Popconfirm>
          <Button onClick={this.showBatchImport} type="primary" ghost size="small">
            批量导入
          </Button>
        </Space>
      );
    }
  };

  render() {
    const { activeKey } = this.state;
    const { headData, globalDisabled } = this.props;
    const attachmentProps = {
      serviceHost: `${SERVER_PATH}/edm-service`,
      multiple: true,
      customBatchDownloadFileName: true,
      onAttachmentRef: ref => (this.attachmentRef = ref),
      allowUpload: !globalDisabled,
      allowDelete: !globalDisabled,
      entityId: get(headData, 'id'),
    };
    return (
      <Tabs
        activeKey={activeKey}
        onChange={this.handlerTabChange}
        animated={false}
        tabBarExtraContent={this.renderItemAction()}
        className={cls(styles['item-box'])}
      >
        <TabPane tab="明细信息" key="item" forceRender>
          <Card className={cls(styles['detail-box'])} bordered={false}>
            aa
          </Card>
        </TabPane>
        <TabPane tab="附件信息" key="attachment" forceRender>
          <Attachment {...attachmentProps} />
        </TabPane>
      </Tabs>
    );
  }
}

export default RequestItem;
