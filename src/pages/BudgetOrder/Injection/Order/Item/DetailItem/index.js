import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Descriptions, Input, Tag } from 'antd';
import { ListCard, Money } from 'suid';
import { constants } from '@/utils';
import BudgetMoney from '../../../../components/BudgetMoney';
import styles from './index.less';

const { SERVER_PATH, REQUEST_ORDER_ACTION } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);
const { Search } = Input;

class DetailItem extends PureComponent {
  static listCardRef;

  static itemEditData = {};

  static propTypes = {
    onDetailItemRef: PropTypes.func,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
    onSaveItemMoney: PropTypes.func,
    saving: PropTypes.bool,
    tempDisabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.itemEditData = {};
  }

  componentDidMount() {
    const { onDetailItemRef } = this.props;
    if (onDetailItemRef) {
      onDetailItemRef(this);
    }
  }

  componentWillUnmount() {
    this.itemEditData = {};
  }

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
  };

  handlerSaveMoney = (rowKey, amount) => {
    this.itemEditData[rowKey] = amount;
    this.forceUpdate();
    console.log(this.itemEditData);
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

  renderCustomTool = () => (
    <>
      <span />
      <Search
        allowClear
        placeholder="输入下达金额、维度关键字"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: 260 }}
      />
    </>
  );

  renderMasterTitle = item => {
    const poolCode = get(item, 'poolCode');
    if (poolCode) {
      return (
        <>
          {`${item.periodName} ${item.itemName}`}
          <Tag color="blue" style={{ marginRight: 0, marginLeft: 8 }}>
            {poolCode}
          </Tag>
        </>
      );
    }
    return `${item.periodName} ${item.itemName}(${item.item})`;
  };

  renderDescription = item => {
    const { saving } = this.props;
    const rowKey = get(item, 'id');
    const amount = this.itemEditData[rowKey] || get(item, 'amount');
    return (
      <>
        <Descriptions column={3} bordered={false}>
          <Descriptions.Item label="公司">{`${get(item, 'corporationName')}(${get(
            item,
            'corporationCode',
          )})`}</Descriptions.Item>
          <Descriptions.Item label="组织">{`${get(item, 'orgName')}(${get(
            item,
            'orgCode',
          )})`}</Descriptions.Item>
        </Descriptions>
        <div className="money-box">
          <span className="field-item">
            <span className="label">预算池余额</span>
            <span>
              <Money value={get(item, 'poolAmount')} />
            </span>
          </span>
          <BudgetMoney
            amount={amount}
            title="下达金额"
            onSave={money => this.handlerSaveMoney(rowKey, money)}
            saving={saving}
          />
        </div>
      </>
    );
  };

  render() {
    const { headData, tempDisabled } = this.props;
    const orderId = get(headData, 'id');
    const listProps = {
      simplePagination: false,
      showArrow: false,
      showSearch: false,
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
    };
    if (orderId && tempDisabled === false) {
      Object.assign(listProps, {
        remotePaging: true,
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/order/getOrderItems/${orderId}`,
        },
      });
    }
    return <ListCard {...listProps} />;
  }
}

export default DetailItem;
