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

  static propTypes = {
    onDetailItemRef: PropTypes.func,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
    onSaveItemMoney: PropTypes.func,
    saving: PropTypes.bool,
    tempDisabled: PropTypes.bool,
    itemEditData: PropTypes.object,
  };

  componentDidMount() {
    const { onDetailItemRef } = this.props;
    if (onDetailItemRef) {
      onDetailItemRef(this);
    }
  }

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
  };

  handlerSaveMoney = (rowKey, amount) => {
    const { onSaveItemMoney } = this.props;
    if (onSaveItemMoney && onSaveItemMoney instanceof Function) {
      onSaveItemMoney(rowKey, amount);
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

  getDisplaySubDimensionFields = item => {
    const fields = [];
    subDimensionFields.forEach(f => {
      if (get(item, f.dimension) !== 'none') {
        fields.push(f);
      }
    });
    return fields;
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
    const { saving, itemEditData } = this.props;
    const rowKey = get(item, 'id');
    const amount = itemEditData[rowKey] || get(item, 'amount');

    return (
      <>
        {this.renderSubField(item)}
        <div className="money-box">
          <div className="field-item">
            <span className="label">预算池余额</span>
            <span>
              <Money value={get(item, 'poolAmount')} />
            </span>
          </div>
          <BudgetMoney
            className="inject-money"
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
      checkbox: true,
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
