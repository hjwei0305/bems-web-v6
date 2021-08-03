import React, { Component } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { Button, Input, Drawer } from 'antd';
import { ListCard } from 'suid';
import { constants } from '@/utils';
import styles from './UnAssignDimension.less';

const { SERVER_PATH } = constants;
const { Search } = Input;

class UnAssignDimension extends Component {
  static listCardRef;

  static propTypes = {
    selectedBudgetType: PropTypes.object.isRequired,
    showAssign: PropTypes.bool,
    closeAssign: PropTypes.func,
    assign: PropTypes.func,
    assignLoading: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
  }

  componentDidUpdate(preProps) {
    const { showAssign } = this.props;
    if (!isEqual(preProps.showAssign, showAssign) && !showAssign) {
      this.setState({ selectedRowKeys: [] });
    }
  }

  assign = () => {
    const { assign, selectedBudgetType } = this.props;
    const { selectedRowKeys: dimensionCodes } = this.state;
    if (assign) {
      const data = {
        categoryId: get(selectedBudgetType, 'id'),
        dimensionCodes,
      };
      assign(data);
    }
  };

  handlerClose = () => {
    const { closeAssign } = this.props;
    if (closeAssign) {
      closeAssign();
    }
  };

  handlerSelectRow = selectedRowKeys => {
    this.setState({
      selectedRowKeys,
    });
  };

  onCancelAssigned = () => {
    this.setState({
      selectedRowKeys: [],
    });
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

  renderCustomTool = () => {
    const { selectedRowKeys } = this.state;
    const { assignLoading } = this.props;
    return (
      <>
        <Button
          type="primary"
          onClick={this.assign}
          loading={assignLoading}
          disabled={selectedRowKeys.length === 0}
        >
          {`确定( ${selectedRowKeys.length} )`}
        </Button>
        <Search
          placeholder="输入名称关键字查询"
          onChange={e => this.handlerSearchChange(e.target.value)}
          onSearch={this.handlerSearch}
          onPressEnter={this.handlerPressEnter}
          style={{ width: 240 }}
        />
      </>
    );
  };

  render() {
    const { showAssign, selectedBudgetType } = this.props;
    const listCardProps = {
      showSearch: false,
      onSelectChange: this.handlerSelectRow,
      checkbox: true,
      rowKey: 'code',
      showArrow: false,
      itemField: {
        title: item => item.name,
        description: item => item.code,
      },
      store: {
        url: `${SERVER_PATH}/bems-v6/category/getUnassigned`,
      },
      cascadeParams: {
        categoryId: get(selectedBudgetType, 'id'),
      },
      onListCardRef: ref => (this.listCardRef = ref),
      customTool: this.renderCustomTool,
    };
    return (
      <Drawer
        width={460}
        destroyOnClose
        getContainer={false}
        placement="right"
        visible={showAssign}
        title="可以分配的维度"
        className={cls(styles['unassign-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute' }}
      >
        <ListCard {...listCardProps} />
      </Drawer>
    );
  }
}

export default UnAssignDimension;
