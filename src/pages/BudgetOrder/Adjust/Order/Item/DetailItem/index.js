import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Decimal } from 'decimal.js';
import { Descriptions, Input, Button, Popconfirm, Checkbox, Alert, Tag } from 'antd';
import { ExtIcon, ListCard, Money, Space } from 'suid';
import { FilterView } from '@/components';
import { constants } from '@/utils';
import BudgetMoney from '../../../../components/BudgetMoney';
import styles from './index.less';

const { SERVER_PATH, REQUEST_ORDER_ACTION, REQUEST_ITEM_STATUS } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);
const REQUEST_ITEM_STATUS_DATA = Object.keys(REQUEST_ITEM_STATUS).map(
  key => REQUEST_ITEM_STATUS[key],
);
const { Search } = Input;

class DetailItem extends PureComponent {
  static listCardRef;

  static pagingData;

  static updownAmount;

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
    const { headData } = props;
    this.pagingData = {};
    if (headData) {
      const { updownAmount } = headData;
      this.updownAmount = {
        up: get(updownAmount, 'up') || 0,
        down: get(updownAmount, 'down') || 0,
      };
    } else {
      this.updownAmount = { up: 0, down: 0 };
    }
    this.state = {
      selectedKeys: [],
      globalDisabled: false,
      itemStatus,
    };
  }

  componentDidMount() {
    const { onDetailItemRef } = this.props;
    if (onDetailItemRef) {
      onDetailItemRef(this);
    }
    this.initGlobalAction();
  }

  componentWillUnmount() {
    this.pagingData = {};
    this.updownAmount = { up: 0, down: 0 };
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

  handlerSaveMoney = (rowItem, amount, callBack) => {
    const { onSaveItemMoney } = this.props;
    if (onSaveItemMoney && onSaveItemMoney instanceof Function) {
      const rowKey = get(rowItem, 'id');
      const originAmount = get(this.pagingData[rowKey], 'amount');
      if (originAmount !== amount) {
        onSaveItemMoney(rowItem, amount, res => {
          callBack();
          if (res.success) {
            const rowData = res.data;
            this.pagingData[rowKey] = { ...rowData };
            if (rowData.hasErr === false) {
              if (originAmount > 0) {
                this.updownAmount.up = new Decimal(this.updownAmount.up).sub(
                  new Decimal(originAmount),
                );
              }
              if (originAmount < 0) {
                this.updownAmount.down = new Decimal(this.updownAmount.down).sub(
                  new Decimal(originAmount),
                );
              }
              if (amount > 0) {
                this.updownAmount.up = new Decimal(this.updownAmount.up).add(new Decimal(amount));
              }
              if (amount < 0) {
                this.updownAmount.down = new Decimal(this.updownAmount.down).add(
                  new Decimal(amount),
                );
              }
            }
          }
        });
      } else {
        callBack();
      }
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

  onCancelBatchRemove = () => {
    this.setState({
      selectedKeys: [],
    });
  };

  handlerRemoveItem = () => {
    const { selectedKeys } = this.state;
    const { onRemoveItem } = this.props;
    if (onRemoveItem && onRemoveItem instanceof Function) {
      onRemoveItem(selectedKeys, () => {
        this.setState({ selectedKeys: [] }, this.reloadData);
      });
    }
  };

  handerSelectChange = selectedKeys => {
    this.setState({ selectedKeys });
  };

  handlerItemStatusChange = itemStatus => {
    this.setState({ itemStatus });
  };

  handlerSelectAll = e => {
    if (e.target.checked) {
      this.setState({ selectedKeys: Object.keys(this.pagingData) });
    } else {
      this.setState({ selectedKeys: [] });
    }
  };

  renderCustomTool = ({ total }) => {
    const { removing } = this.props;
    const { selectedKeys, globalDisabled, itemStatus } = this.state;
    const hasSelected = selectedKeys.length > 0;
    const currentViewType = { ...itemStatus, title: `${get(itemStatus, 'title')}(${total}项)` };
    const pagingKeys = Object.keys(this.pagingData);
    const indeterminate = selectedKeys.length > 0 && selectedKeys.length < pagingKeys.length;
    const checked = selectedKeys.length > 0 && selectedKeys.length === pagingKeys.length;
    return (
      <>
        <div>
          <Space>
            {!globalDisabled ? (
              <Checkbox
                checked={checked}
                indeterminate={indeterminate}
                onChange={this.handlerSelectAll}
              >
                全选
              </Checkbox>
            ) : null}
            {hasSelected && !globalDisabled ? (
              <>
                <Button onClick={this.onCancelBatchRemove} disabled={removing}>
                  取消
                </Button>
                <Popconfirm
                  disabled={removing}
                  title="确定要删除吗？提示：删除后不能恢复"
                  onConfirm={this.handlerRemoveItem}
                >
                  <Button type="danger" loading={removing}>
                    {`删除(${selectedKeys.length})`}
                  </Button>
                </Popconfirm>
              </>
            ) : null}
          </Space>
        </div>
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
            placeholder="输入调整金额、维度关键字"
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
    const poolCode = get(item, 'poolCode');
    if (poolCode) {
      return (
        <>
          <div className="pool-box">
            <span className="title">池号</span>
            <span className="no">{poolCode}</span>
          </div>
          <div className="master-title">{`${item.periodName} ${item.itemName}`}</div>
        </>
      );
    }
    return `${item.periodName} ${item.itemName}`;
  };

  getDisplaySubDimensionFields = item => {
    const { subDimensionFields } = this.props;
    const fields = [];
    subDimensionFields.forEach(f => {
      if (get(item, f.dimension) !== 'none') {
        fields.push(f);
      }
    });
    return fields;
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

  renderSubField = item => {
    const subFields = this.getDisplaySubDimensionFields(item);
    if (subFields.length > 0) {
      return (
        <Descriptions key={`sub${item.id}`} column={1} bordered={false}>
          {subFields.map(f => {
            return (
              <Descriptions.Item key={`sub${item.id}${f.dimension}`} label={f.title}>
                {get(item, f.value) || '-'}
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      );
    }
    return null;
  };

  renderDescription = item => {
    const { globalDisabled } = this.state;
    const { itemMoneySaving } = this.props;
    const rowKey = get(item, 'id');
    const amount =
      get(this.pagingData[rowKey], 'amount') !== undefined
        ? get(this.pagingData[rowKey], 'amount')
        : get(item, 'amount');
    const errMsg = get(this.pagingData[rowKey], 'errMsg') || '';
    const poolAmount = get(item, 'poolAmount');
    const afterAmount = new Decimal(poolAmount).add(new Decimal(amount));
    return (
      <>
        {this.renderSubField(item)}
        <div className="money-box">
          <div className="field-item">
            <span className="label">调整前余额</span>
            <span>
              <Money value={poolAmount} />
            </span>
          </div>
          <BudgetMoney
            className="inject-money"
            amount={amount}
            title="调整金额"
            rowItem={item}
            loading={itemMoneySaving}
            allowEdit={!globalDisabled}
            onSave={this.handlerSaveMoney}
          />
          <div className="field-item">
            <span className="label">调整后余额</span>
            <span>
              <Money value={afterAmount} />
            </span>
          </div>
          {errMsg ? <Alert type="error" message={errMsg} banner closable /> : null}
        </div>
      </>
    );
  };

  render() {
    const { selectedKeys, globalDisabled } = this.state;
    const { headData, tempDisabled } = this.props;
    const orderId = get(headData, 'id');
    const listProps = {
      simplePagination: false,
      showArrow: false,
      showSearch: false,
      checkbox: !globalDisabled,
      rowCheck: false,
      pagination: {
        pageSize: 50,
        pageSizeOptions: ['50', '100', '200', '500'],
      },
      checkboxProps: () => {
        return { tabIndex: -1 };
      },
      selectedKeys,
      onListCardRef: ref => (this.listCardRef = ref),
      customTool: this.renderCustomTool,
      searchProperties: [
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
        title: this.renderMasterTitle,
        description: this.renderDescription,
      },
      onSelectChange: this.handerSelectChange,
    };
    if (orderId && tempDisabled === false) {
      const filters = this.getFilters();
      Object.assign(listProps, {
        remotePaging: true,
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/order/getOrderItems/${orderId}`,
          loaded: res => {
            const data = get(res, 'data.rows') || [];
            data.forEach(d => {
              this.pagingData[d.id] = d;
            });
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
        {globalDisabled ? null : (
          <div className="detail-summary">
            <Tag color="green">
              <Money
                prefix={
                  <>
                    <ExtIcon type="arrow-up" antd />
                    调增
                  </>
                }
                style={{ color: '#52c41a' }}
                value={this.updownAmount.up}
              />
            </Tag>
            <Tag color="red">
              <Money
                prefix={
                  <>
                    <ExtIcon type="arrow-down" antd />
                    调减
                  </>
                }
                style={{ color: '#f5222d' }}
                value={this.updownAmount.down}
              />
            </Tag>
          </div>
        )}
      </div>
    );
  }
}

export default DetailItem;
