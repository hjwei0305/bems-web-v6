import React, { PureComponent, Suspense } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get, isEqual } from 'lodash';
import { Button, Popconfirm, Tabs } from 'antd';
import { Space, Attachment, PageLoader } from 'suid';
import { constants } from '@/utils';
import Tip from '../../../components/Tip';
import DetailItem from './DetailItem';
import styles from './index.less';

const DimensionSelection = React.lazy(() => import('../../../components/DimensionSelection'));
const ProgressResult = React.lazy(() => import('../../../components/ProgressResult'));
const BatchItem = React.lazy(() => import('../../../components/BatchItem'));
const { TabPane } = Tabs;
const { REQUEST_ORDER_ACTION, SERVER_PATH, REQUEST_VIEW_STATUS } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);

class RequestItem extends PureComponent {
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
    completeImport: PropTypes.func,
    onAttachmentRef: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const { action } = props;
    this.state = {
      activeKey: 'item',
      showBatch: false,
      allowEdit:
        action === REQUEST_ORDER_ACTION.ADD ||
        action === REQUEST_ORDER_ACTION.EDIT ||
        action === REQUEST_ORDER_ACTION.UPDATE_APPROVE_FLOW,
    };
  }

  componentDidUpdate(preProps) {
    const { headData } = this.props;
    const status = get(headData, 'status');
    if (status && !isEqual(preProps.headData, headData)) {
      let allowEdit = false;
      if (status === REQUEST_VIEW_STATUS.PREFAB.key || status === REQUEST_VIEW_STATUS.DRAFT.key) {
        allowEdit = true;
      }
      this.setState({ allowEdit });
    }
  }

  handlerTabChange = activeKey => {
    this.setState({ activeKey });
  };

  showBatchImport = () => {
    const { headCheck } = this.props;
    if (headCheck && headCheck instanceof Function) {
      const checkedPassed = headCheck();
      if (checkedPassed) {
        this.setState({ showBatch: true });
      }
    }
  };

  closeBatchImport = () => {
    this.setState({ showBatch: false });
  };

  handlerCompleteImport = orderId => {
    const { completeImport } = this.props;
    if (completeImport && completeImport instanceof Function) {
      completeImport(orderId);
      this.closeBatchImport();
    }
  };

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

  handlerSave = (data, successCallBack) => {
    const { save } = this.props;
    if (save && save instanceof Function) {
      save(data, successCallBack);
    }
  };

  handlerProcesseCompleted = () => {
    const { onItemCompleted } = this.props;
    onItemCompleted(() => {
      if (this.detailItemRef) {
        setTimeout(() => {
          this.detailItemRef.reloadData();
        }, 500);
      }
    });
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
    const { activeKey, showBatch, allowEdit } = this.state;
    const {
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
      onAttachmentRef,
    } = this.props;
    const orderId = get(headData, 'id');
    const attachmentProps = {
      serviceHost: `${SERVER_PATH}/edm-service`,
      multiple: true,
      customBatchDownloadFileName: true,
      onAttachmentRef,
      allowUpload: allowEdit,
      allowDelete: allowEdit,
      entityId: orderId,
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
    const batchItemProps = {
      headData,
      closeBatchImport: this.closeBatchImport,
      showBatch,
      completeImport: this.handlerCompleteImport,
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
          <ProgressResult
            show={showProgressResult}
            orderId={orderId}
            handlerCompleted={this.handlerProcesseCompleted}
          />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <BatchItem {...batchItemProps} />
        </Suspense>
      </div>
    );
  }
}

export default RequestItem;
