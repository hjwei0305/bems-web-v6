import React, { PureComponent, Suspense } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Popconfirm, Tabs } from 'antd';
import { Space, Attachment, ScrollBar, PageLoader } from 'suid';
import { constants } from '@/utils';
import Tip from '../../../components/Tip';
import DetailItem from './DetailItem';
import styles from './index.less';

const DimensionSelection = React.lazy(() => import('../../components/DimensionSelection'));
const { TabPane } = Tabs;
const { REQUEST_ORDER_ACTION, SERVER_PATH } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);

class RequestItem extends PureComponent {
  static attachmentRef;

  static detailItemRef;

  static propTypes = {
    headData: PropTypes.object,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    checkDimensionForSelect: PropTypes.func,
    dimensionselectChecking: PropTypes.bool,
    clearItem: PropTypes.func,
    clearing: PropTypes.bool,
    save: PropTypes.func,
    saving: PropTypes.func,
    dimensionsData: PropTypes.array,
    globalDisabled: PropTypes.bool,
    showDimensionSelection: PropTypes.bool,
    closeDimensionSelection: PropTypes.func,
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
    };
  }

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

  handlerSave = (data, successCallBack) => {
    const { save } = this.props;
    if (save && save instanceof Function) {
      save(data, () => {
        successCallBack();
        if (this.detailItemRef) {
          this.detailItemRef.reloadData();
        }
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
    const { activeKey } = this.state;
    const {
      globalDisabled,
      action,
      showDimensionSelection,
      headData,
      dimensionsData,
      saving,
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
      onDetailItemRef: ref => (this.detailItemRef = ref),
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
            <ScrollBar>
              <Attachment {...attachmentProps} />
            </ScrollBar>
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
      </div>
    );
  }
}

export default RequestItem;
