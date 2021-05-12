import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Descriptions, Input, Button, Popconfirm, Checkbox, Alert } from 'antd';
import { ListCard, Money, Space } from 'suid';
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
const subDimensionFields = [
  { dimension: 'org', value: ['orgName'], title: '组织机构' },
  { dimension: 'project', value: ['projectName'], title: '项目' },
  { dimension: 'udf1', value: ['udf1Name'], title: '自定义1' },
  { dimension: 'udf2', value: ['udf2Name'], title: '自定义2' },
  { dimension: 'udf3', value: ['udf3Name'], title: '自定义3' },
  { dimension: 'udf4', value: ['udf4Name'], title: '自定义4' },
  { dimension: 'udf5', value: ['udf5Name'], title: '自定义5' },
];

class DetailItem extends PureComponent {
  static listCardRef;

  static pagingData;

  static propTypes = {
    onDetailItemRef: PropTypes.func,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
    onSaveItemMoney: PropTypes.func,
    itemMoneySaving: PropTypes.bool,
    tempDisabled: PropTypes.bool,
    onRemoveItem: PropTypes.func,
    removing: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    const [itemStatus] = REQUEST_ITEM_STATUS_DATA;
    this.pagingData = {};
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
            this.pagingData[rowKey] = { ...res.data };
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
            placeholder="输入下达金额、维度关键字"
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
          {`${item.periodName} ${item.itemName}`}
          <span className="pool-box">
            <span className="title">池号</span>
            <span className="no">{poolCode}</span>
          </span>
        </>
      );
    }
    return `${item.periodName} ${item.itemName}(${item.item})`;
  };

  getDisplaySubDimensionFields = item => {
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
        <Descriptions column={3} bordered={false}>
          {subFields.map(f => {
            let v = '';
            if (f.value.length === 1) {
              v = `${get(item, f.value[0])}`;
            }
            if (f.value.length === 2) {
              v = `${get(item, f.value[0])}(${get(item, f.value[1])})`;
            }
            return <Descriptions.Item label={f.title}>{v}</Descriptions.Item>;
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
    const amount = get(this.pagingData[rowKey], 'amount') || get(item, 'amount');
    const errMsg = get(this.pagingData[rowKey], 'errMsg') || '';
    return (
      <>
        {this.renderSubField(item)}
        <div className="money-box">
          <div className="field-item">
            <span className="label">预算余额</span>
            <span>
              <Money value={get(item, 'poolAmount')} />
            </span>
          </div>
          <BudgetMoney
            className="inject-money"
            amount={amount}
            title="下达金额"
            rowItem={item}
            loading={itemMoneySaving}
            allowEdit={!globalDisabled}
            onSave={this.handlerSaveMoney}
          />
          {errMsg ? <Alert type="error" message={errMsg} banner /> : null}
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
      className: styles['detail-item-box'],
      onListCardRef: ref => (this.listCardRef = ref),
      customTool: this.renderCustomTool,
      searchProperties: [
        'itemName',
        'amount',
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
          ...filters,
        },
      });
    }
    return <ListCard {...listProps} />;
  }
}

export default DetailItem;
