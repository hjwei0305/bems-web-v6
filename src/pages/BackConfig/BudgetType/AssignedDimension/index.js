import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Card, Drawer, Popconfirm } from 'antd';
import { ExtTable, BannerTitle } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, BUDGET_TYPE_CLASS } = constants;

@connect(({ budgetType, loading }) => ({ budgetType, loading }))
class AssignedDimension extends Component {
  static tableRef;

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  reloadData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  handlerSelectRow = selectedRowKeys => {
    this.setState({
      selectedRowKeys,
    });
  };

  onCancelBatchRemoveAssigned = () => {
    this.setState({
      selectedRowKeys: [],
    });
  };

  showAssign = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        showAssign: true,
      },
    });
  };

  removeAssigned = () => {
    const { budgetType, dispatch } = this.props;
    const { selectedBudgetType } = budgetType;
    const { selectedRowKeys: dimensionCodes } = this.state;
    dispatch({
      type: 'budgetType/removeAssigned',
      payload: {
        categoryId: selectedBudgetType.id,
        dimensionCodes,
      },
      callback: res => {
        if (res.success) {
          this.setState({
            selectedRowKeys: [],
          });
          this.reloadData();
        }
      },
    });
  };

  render() {
    const { selectedRowKeys } = this.state;
    const { loading, budgetType } = this.props;
    const { selectedBudgetType, selectBudgetTypeClass } = budgetType;
    const hasSelected = selectedRowKeys.length > 0;
    const columns = [
      {
        title: '维度代码',
        dataIndex: 'code',
        width: 120,
        required: true,
      },
      {
        title: '维度名称',
        dataIndex: 'name',
        width: 220,
        required: true,
      },
      {
        title: '维度策略',
        dataIndex: 'strategyName',
        width: 180,
        render: t => t || '-',
      },
    ];
    const removeLoading = loading.effects['budgetType/removeAssigned'];
    const toolBarProps = {
      left: (
        <>
          <Button
            type="primary"
            disabled={
              selectBudgetTypeClass.key === BUDGET_TYPE_CLASS.PRIVATE.key &&
              selectedBudgetType.type === BUDGET_TYPE_CLASS.GENERAL.key
            }
            onClick={this.showAssign}
          >
            分配维度
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
          <Drawer
            placement="top"
            closable={false}
            mask={false}
            height={44}
            getContainer={false}
            style={{ position: 'absolute' }}
            visible={hasSelected}
          >
            <Button onClick={this.onCancelBatchRemoveAssigned} disabled={removeLoading}>
              取消
            </Button>
            <Popconfirm title="确定要移除选择的维度吗？" onConfirm={this.removeAssigned}>
              <Button type="danger" loading={removeLoading}>
                {`移除维度( ${selectedRowKeys.length} )`}
              </Button>
            </Popconfirm>
          </Drawer>
        </>
      ),
    };
    const extTableProps = {
      bordered: false,
      toolBar: toolBarProps,
      lineNumber: false,
      columns,
      checkbox: {
        rowCheck: false,
      },
      selectedRowKeys,
      onSelectRow: this.handlerSelectRow,
      rowKey: 'code',
      onTableRef: ref => (this.tableRef = ref),
      searchPlaceHolder: '输入维度代码、名称关键字',
      searchWidth: 260,
      store: {
        url: `${SERVER_PATH}/bems-v6/category/getAssigned`,
      },
      cascadeParams: {
        categoryId: get(selectedBudgetType, 'id'),
      },
    };
    return (
      <div className={cls(styles['user-box'])}>
        <Card
          title={<BannerTitle title={get(selectedBudgetType, 'name')} subTitle="维度" />}
          bordered={false}
        >
          <ExtTable {...extTableProps} />
        </Card>
      </div>
    );
  }
}

export default AssignedDimension;
