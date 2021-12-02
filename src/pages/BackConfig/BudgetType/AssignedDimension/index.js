import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Card, Drawer, Popconfirm } from 'antd';
import { ExtTable, BannerTitle, Space } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, TYPE_CLASS, MASTER_CLASSIFICATION } = constants;

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

  renderName = () => {
    const { budgetType } = this.props;
    const { selectedBudgetType } = budgetType;
    return get(selectedBudgetType, 'name');
  };

  render() {
    const { selectedRowKeys } = this.state;
    const { loading, budgetType } = this.props;
    const { selectedBudgetType, selectTypeClass } = budgetType;
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
              selectTypeClass.key === TYPE_CLASS.PRIVATE.key &&
              selectedBudgetType.type === TYPE_CLASS.GENERAL.key
            }
            onClick={this.showAssign}
          >
            分配维度
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    const extTableProps = {
      bordered: false,
      toolBar: toolBarProps,
      lineNumber: false,
      columns,
      allowCustomColumns: false,
      checkbox: {
        getCheckboxProps: item => {
          if (item.required) {
            return { disabled: true };
          }
          const classification = get(selectedBudgetType, 'classification');
          if (classification === MASTER_CLASSIFICATION.DEPARTMENT.key && item.code === 'org') {
            return { disabled: true };
          }
          if (classification === MASTER_CLASSIFICATION.PROJECT.key && item.code === 'project') {
            return { disabled: true };
          }
          if (
            classification === MASTER_CLASSIFICATION.COST_CENTER.key &&
            item.code === 'costCenter'
          ) {
            return { disabled: true };
          }
          return { disabled: false };
        },
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
        <Card title={<BannerTitle title={this.renderName()} subTitle="维度" />} bordered={false}>
          <Drawer
            placement="top"
            closable={false}
            mask={false}
            height={44}
            getContainer={false}
            className={styles['float-tool']}
            style={{ position: 'absolute' }}
            visible={hasSelected}
          >
            <Space>
              <Button onClick={this.onCancelBatchRemoveAssigned} disabled={removeLoading}>
                取消
              </Button>
              <Popconfirm title="确定要移除选择的维度吗？" onConfirm={this.removeAssigned}>
                <Button type="danger" loading={removeLoading}>
                  {`移除维度(${selectedRowKeys.length})`}
                </Button>
              </Popconfirm>
            </Space>
          </Drawer>
          <ExtTable {...extTableProps} />
        </Card>
      </div>
    );
  }
}

export default AssignedDimension;
