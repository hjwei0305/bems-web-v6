import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import { ListCard } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { Search } = Input;
const { SERVER_PATH } = constants;

class CorperationList extends Component {
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
      title: '公司列表',
      showSearch: false,
      selectedKeys,
      onSelectChange: this.handlerSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      searchProperties: ['name'],
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/findUserAuthorizedCorporations`,
      },
      itemField: {
        title: item => item.name,
        description: item => item.code,
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ListCard {...masterProps} />
      </div>
    );
  }
}
export default CorperationList;
