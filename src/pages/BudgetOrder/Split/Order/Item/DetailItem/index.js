import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { Input, Avatar, Tag } from 'antd';
import { ListCard, Money, Space } from 'suid';
import { FilterView } from '@/components';
import { constants } from '@/utils';
import SplitItem from './SplitItem';
import styles from './index.less';

const { SERVER_PATH, REQUEST_ORDER_ACTION, REQUEST_ITEM_STATUS, REQUEST_VIEW_STATUS } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);
const REQUEST_ITEM_STATUS_DATA = Object.keys(REQUEST_ITEM_STATUS).map(
  key => REQUEST_ITEM_STATUS[key],
);
const { Search } = Input;

class DetailItem extends PureComponent {
  static listCardRef;

  static propTypes = {
    onDetailItemRef: PropTypes.func,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
    onSaveItemMoney: PropTypes.func,
    itemMoneySaving: PropTypes.bool,
    tempDisabled: PropTypes.bool,
    onRemoveItem: PropTypes.func,
    removing: PropTypes.bool,
    subDimensionFields: PropTypes.array,
  };

  constructor(props) {
    super(props);
    const [itemStatus] = REQUEST_ITEM_STATUS_DATA;
    this.state = {
      globalDisabled: false,
      itemStatus,
      dealSourceItem: null,
    };
  }

  componentDidMount() {
    const { onDetailItemRef } = this.props;
    if (onDetailItemRef) {
      onDetailItemRef(this);
    }
    this.initGlobalAction();
  }

  componentDidUpdate(preProps) {
    const { headData } = this.props;
    const status = get(headData, 'status');
    if (status && !isEqual(preProps.headData, headData)) {
      let globalDisabled = true;
      if (status === REQUEST_VIEW_STATUS.PREFAB.key || status === REQUEST_VIEW_STATUS.DRAFT.key) {
        globalDisabled = false;
      }
      this.setState({ globalDisabled });
    }
  }

  initGlobalAction = () => {
    const { action, tempDisabled } = this.props;
    let globalDisabled = tempDisabled || false;
    switch (action) {
      case REQUEST_ORDER_ACTION.VIEW:
      case REQUEST_ORDER_ACTION.VIEW_APPROVE_FLOW:
      case REQUEST_ORDER_ACTION.LINK_VIEW:
        globalDisabled = true;
        break;
      default:
    }
    this.setState({ globalDisabled });
  };

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
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

  handlerItemStatusChange = itemStatus => {
    this.setState({ itemStatus });
  };

  renderCustomTool = ({ total }) => {
    const { itemStatus } = this.state;
    const currentViewType = { ...itemStatus, title: `${get(itemStatus, 'title')}(${total}项)` };
    return (
      <>
        <div />
        <Space>
          <FilterView
            iconType={null}
            title="明细状态"
            showColor
            currentViewType={currentViewType}
            viewTypeData={REQUEST_ITEM_STATUS_DATA}
            onAction={this.handlerItemStatusChange}
            reader={{
              title: 'title',
              value: 'key',
            }}
          />
          <Search
            allowClear
            placeholder="输入维度关键字"
            onChange={e => this.handlerSearchChange(e.target.value)}
            onSearch={this.handlerSearch}
            onPressEnter={this.handlerPressEnter}
            style={{ width: 260 }}
          />
        </Space>
      </>
    );
  };

  renderMasterTitle = item => {
    const originPoolCode = get(item, 'originPoolCode') || '无预算池';
    return (
      <>
        <div className="pool-box origin">
          <span className="title">池号</span>
          <span className="no">{originPoolCode}</span>
        </div>
      </>
    );
  };

  getFilters = () => {
    const { itemStatus } = this.state;
    const filters = [];
    if (itemStatus.key === REQUEST_ITEM_STATUS.NORMAL.key) {
      filters.push({ fieldName: 'hasErr', operator: 'EQ', value: false });
    }
    if (itemStatus.key === REQUEST_ITEM_STATUS.ERROR.key) {
      filters.push({ fieldName: 'hasErr', operator: 'EQ', value: true });
    }
    return { filters };
  };

  handlerRemoveItem = (sourceItem, keys, callback) => {
    const { onRemoveItem } = this.props;
    if (onRemoveItem && onRemoveItem instanceof Function) {
      this.setState({ dealSourceItem: sourceItem });
      onRemoveItem({ keys, sourceItem }, () => {
        this.reloadData();
        if (callback && onRemoveItem instanceof Function) {
          this.setState({ dealSourceItem: null });
          callback();
        }
      });
    }
  };

  renderDescription = item => {
    const { globalDisabled, dealSourceItem } = this.state;
    const { subDimensionFields, itemMoneySaving, onSaveItemMoney, removing, action } = this.props;
    const originPoolAmount = get(item, 'originPoolAmount');
    const originPoolCode = get(item, 'originPoolCode');
    const items = get(item, 'children') || [];
    const splitItemProps = {
      onlyView: globalDisabled,
      originPoolCode,
      originPoolAmount,
      subDimensionFields,
      sourceItem: item,
      items,
      itemMoneySaving,
      onSaveItemMoney,
      onRemoveItem: this.handlerRemoveItem,
      removing: removing && dealSourceItem && dealSourceItem.id === item.id,
    };
    return (
      <div key={item.id} className={action === REQUEST_ORDER_ACTION.ADD ? '' : 'view'}>
        {items.length > 0 ? <div className="origin-money-line" /> : null}
        <SplitItem {...splitItemProps} />
      </div>
    );
  };

  render() {
    const { headData, tempDisabled } = this.props;
    const orderId = get(headData, 'id');
    const listProps = {
      simplePagination: false,
      showArrow: false,
      showSearch: false,
      rowCheck: false,
      rowKey: 'originPoolCode',
      pagination: {
        pageSize: 10,
        pageSizeOptions: ['10', '30', '50', '100'],
      },
      className: styles['detail-item-box'],
      onListCardRef: ref => (this.listCardRef = ref),
      customTool: this.renderCustomTool,
      searchProperties: [
        'item',
        'itemName',
        'periodName',
        'projectName',
        'orgName',
        'udf1Name',
        'udf2Name',
        'udf3Name',
        'udf4Name',
        'udf5Name',
      ],
      itemField: {
        avatar: (
          <Avatar shape="square" style={{ backgroundColor: '#03a9f4' }}>
            源
          </Avatar>
        ),
        title: this.renderMasterTitle,
        description: this.renderDescription,
      },
    };
    if (orderId && tempDisabled === false) {
      const filters = this.getFilters();
      Object.assign(listProps, {
        remotePaging: true,
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/order/querySplitGroup`,
          params: {
            orderId,
          },
        },
        cascadeParams: {
          sortOrders: [
            { property: 'period', direction: 'ASC' },
            { property: 'itemName', direction: 'ASC' },
          ],
          ...filters,
        },
      });
    }
    return (
      <div className={styles['detail-item-box']}>
        <ListCard {...listProps} />
        <div className="detail-summary">
          <Tag color="green" style={{ borderColor: 'transparent', backgroundColor: 'transparent' }}>
            <Money
              prefix="本单合计金额"
              style={{ fontWeight: 700 }}
              value={get(headData, 'totalAmount') || 0}
            />
          </Tag>
        </div>
      </div>
    );
  }
}

export default DetailItem;
