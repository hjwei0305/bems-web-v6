import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Descriptions, Input, Tag } from 'antd';
import { ListCard } from 'suid';
import { constants } from '@/utils';

const { SERVER_PATH, REQUEST_ORDER_ACTION } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);
const { Search } = Input;

class DetailItem extends PureComponent {
  static listCardRef;

  static propTypes = {
    onDetailItemRef: PropTypes.func,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
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
        placeholder="输入预算主体名称关键字"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: 260 }}
      />
    </>
  );

  render() {
    const { headData } = this.props;
    const orderId = get(headData, 'id');
    const listProps = {
      simplePagination: false,
      showArrow: false,
      showSearch: false,
      onListCardRef: ref => (this.listCardRef = ref),
      customTool: this.renderCustomTool,
      itemField: {
        title: item => item.name,
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
    };
    if (orderId) {
      Object.assign(listProps, {
        remotePaging: true,
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/order/getOrderItems/${orderId}`,
        },
      });
    }
    return <ListCard {...listProps} />;
  }
}

export default DetailItem;
