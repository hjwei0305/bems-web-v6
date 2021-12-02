import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Input, Descriptions } from 'antd';
import { ListCard, Space } from 'suid';
import { Classification } from '@/components';
import { constants } from '@/utils';
import styles from './index.less';

const { Search } = Input;
const { SERVER_PATH } = constants;

class BudgetMasterList extends Component {
  static listCardRef = null;

  static propTypes = {
    currentBudgetMaster: PropTypes.object,
    selectChange: PropTypes.func,
  };

  handlerSelect = (keys, items) => {
    const { selectChange } = this.props;
    const currentMaster = keys.length === 1 ? items[0] : null;
    if (selectChange && selectChange instanceof Function) {
      selectChange(currentMaster);
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
      <Search
        allowClear
        placeholder="输入预算主体名称关键字"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: '100%' }}
      />
    </>
  );

  render() {
    const { currentBudgetMaster } = this.props;
    const selectedKeys = currentBudgetMaster ? [get(currentBudgetMaster, 'id')] : [];
    const masterProps = {
      className: 'left-content',
      title: '预算主体列表',
      showSearch: false,
      selectedKeys,
      onSelectChange: this.handlerSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      searchProperties: ['name'],
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subject/findByPage`,
      },
      remotePaging: true,
      itemField: {
        title: item => (
          <Space>
            {item.name}
            <Classification enumName={item.classification} />
          </Space>
        ),
        description: item => (
          <Descriptions column={1} bordered={false}>
            <Descriptions.Item label="公司">{`${get(item, 'corporationName')}(${get(
              item,
              'corporationCode',
            )})`}</Descriptions.Item>
          </Descriptions>
        ),
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ListCard {...masterProps} />
      </div>
    );
  }
}
export default BudgetMasterList;
