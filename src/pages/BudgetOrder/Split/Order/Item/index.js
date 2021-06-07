import React, { PureComponent, Suspense } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { PubSub } from 'pubsub-js';
import { Button, Popconfirm, Tabs } from 'antd';
import { Space, Attachment, PageLoader, message } from 'suid';
import { constants, wsocket } from '@/utils';
import Tip from '../../../components/Tip';
import DetailItem from './DetailItem';
import styles from './index.less';

const DimensionSelection = React.lazy(() => import('../../../components/DimensionSelection'));
const ProgressResult = React.lazy(() => import('../../../components/ProgressResult'));
const { TabPane } = Tabs;
const { REQUEST_ORDER_ACTION, SERVER_PATH, WSBaseUrl } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);
const { closeWebSocket, createWebSocket } = wsocket;

class RequestItem extends PureComponent {
  static attachmentRef;

  static detailItemRef;

  static messageSocket;

  static propTypes = {
    headData: PropTypes.object,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    checkDimensionForSelect: PropTypes.func,
    dimensionselectChecking: PropTypes.bool,
    clearItem: PropTypes.func,
    clearing: PropTypes.bool,
    save: PropTypes.func,
    saving: PropTypes.bool,
    dimensionsData: PropTypes.array,
    globalDisabled: PropTypes.bool,
    showDimensionSelection: PropTypes.bool,
    showProgressResult: PropTypes.bool,
    closeDimensionSelection: PropTypes.func,
    onItemCompleted: PropTypes.func,
    onSaveItemMoney: PropTypes.func,
    itemMoneySaving: PropTypes.bool,
    removeOrderItems: PropTypes.func,
    removing: PropTypes.bool,
    subDimensionFields: PropTypes.array,
  };

  constructor(props) {
    super(props);
    const { action } = props;
    this.state = {
      activeKey: 'item',
      progressData: null,
      allowEdit:
        action === REQUEST_ORDER_ACTION.ADD ||
        action === REQUEST_ORDER_ACTION.EDIT ||
        action === REQUEST_ORDER_ACTION.UPDATE_APPROVE_FLOW,
    };
  }

  componentWillUnmount() {
    this.closeSocket();
  }

  closeSocket = () => {
    closeWebSocket();
    PubSub.unsubscribe(this.messageSocket);
  };

  handlerTabChange = activeKey => {
    this.setState({ activeKey });
  };

  showBatchImport = () => {};

  handlerClearItem = () => {
    const { clearItem } = this.props;
    if (clearItem && clearItem instanceof Function) {
      clearItem(() => {
        if (this.detailItemRef) {
          this.detailItemRef.reloadData();
        }
      });
    }
  };

  showDimensionSelection = () => {
    const { checkDimensionForSelect } = this.props;
    if (checkDimensionForSelect && checkDimensionForSelect instanceof Function) {
      checkDimensionForSelect();
    }
  };

  handlerTriggerBack = () => {
    const { closeDimensionSelection } = this.props;
    if (closeDimensionSelection && closeDimensionSelection instanceof Function) {
      closeDimensionSelection();
    }
  };

  handlerSaveItemMoney = (rowItem, amount, callBack) => {
    const { onSaveItemMoney } = this.props;
    if (onSaveItemMoney && onSaveItemMoney instanceof Function) {
      onSaveItemMoney(rowItem, amount, callBack);
    }
  };

  validJson = wsData => {
    let valid = true;
    if (wsData) {
      try {
        const str = wsData.replace(/[\r\n\s]/g, '');
        JSON.parse(str);
      } catch (e) {
        valid = false;
      }
    }
    return valid;
  };

  handlerSave = (data, successCallBack) => {
    const { save, onItemCompleted } = this.props;
    if (save && save instanceof Function) {
      save(data, orderId => {
        successCallBack();
        //  const id = '3EE0EFBF-AEE3-11EB-B4F6-F2E786642C8B';
        const url = `${WSBaseUrl}/api-gateway/bems-v6/websocket/order/${orderId}`;
        createWebSocket(url);
        this.messageSocket = PubSub.subscribe('message', (topic, msgObj) => {
          // message 为接收到的消息  这里进行业务处理
          if (topic === 'message') {
            const wsData = get(msgObj, 'wsData') || '';
            if (this.validJson(wsData)) {
              const str = wsData.replace(/[\r\n\s]/g, '');
              const { success, message: msg, data: progressData } = JSON.parse(str);
              if (success) {
                this.setState({ progressData }, () => {
                  const total = get(progressData, 'total') || 0;
                  // todo 处理完成后断开socket连接，并展示明细信息
                  if (total === 0 && onItemCompleted && onItemCompleted instanceof Function) {
                    onItemCompleted(() => {
                      this.closeSocket();
                      if (this.detailItemRef) {
                        setTimeout(() => {
                          this.detailItemRef.reloadData();
                        }, 500);
                      }
                    });
                  }
                });
              } else {
                this.closeSocket();
                message.destroy();
                message.error(msg);
              }
            } else {
              this.closeSocket();
              message.destroy();
              message.error('返回的数据格式不正确');
            }
          }
        });
      });
    }
  };

  renderItemAction = () => {
    const { allowEdit, activeKey } = this.state;
    if (activeKey === 'attachment') {
      return null;
    }
    const { clearing, dimensionselectChecking, headData } = this.props;
    if (allowEdit) {
      const orderId = get(headData, 'id');
      return (
        <Space>
          <Button
            loading={dimensionselectChecking}
            onClick={this.showDimensionSelection}
            type="primary"
            ghost
            size="small"
          >
            新建明细
          </Button>
          <Popconfirm
            disabled={dimensionselectChecking || !orderId}
            title={<Tip topic="确定要清除所有明细信息吗?" description="清空后数据将会丢失!" />}
            onConfirm={this.handlerClearItem}
          >
            <Button size="small" disabled={dimensionselectChecking || !orderId} loading={clearing}>
              清空明细
            </Button>
          </Popconfirm>
          <Button disabled={dimensionselectChecking} onClick={this.showBatchImport} size="small">
            批量导入
          </Button>
        </Space>
      );
    }
  };

  render() {
    const { activeKey, progressData } = this.state;
    const {
      globalDisabled,
      action,
      showDimensionSelection,
      showProgressResult,
      headData,
      dimensionsData,
      subDimensionFields,
      saving,
      itemMoneySaving,
      removeOrderItems,
      removing,
    } = this.props;
    const attachmentProps = {
      serviceHost: `${SERVER_PATH}/edm-service`,
      multiple: true,
      customBatchDownloadFileName: true,
      onAttachmentRef: ref => (this.attachmentRef = ref),
      allowUpload: !globalDisabled,
      allowDelete: !globalDisabled,
      entityId: get(headData, 'id'),
      showViewType: false,
    };
    const detailItemProps = {
      action,
      headData,
      tempDisabled: showProgressResult || showDimensionSelection,
      onDetailItemRef: ref => (this.detailItemRef = ref),
      itemMoneySaving,
      onSaveItemMoney: this.handlerSaveItemMoney,
      onRemoveItem: removeOrderItems,
      subDimensionFields,
      removing,
    };
    return (
      <div className={cls(styles['item-box'])}>
        <Tabs
          activeKey={activeKey}
          onChange={this.handlerTabChange}
          animated={false}
          tabBarExtraContent={this.renderItemAction()}
          className="tab-box"
        >
          <TabPane tab="明细信息" key="item" forceRender className="detail-box">
            <DetailItem {...detailItemProps} />
          </TabPane>
          <TabPane tab="附件信息" key="attachment" forceRender>
            <Attachment {...attachmentProps} />
          </TabPane>
        </Tabs>
        <Suspense fallback={<PageLoader />}>
          <DimensionSelection
            show={showDimensionSelection}
            headData={headData}
            dimensions={dimensionsData}
            onTriggerBack={this.handlerTriggerBack}
            save={this.handlerSave}
            saving={saving}
          />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <ProgressResult show={showProgressResult} progressData={progressData} />
        </Suspense>
      </div>
    );
  }
}

export default RequestItem;
