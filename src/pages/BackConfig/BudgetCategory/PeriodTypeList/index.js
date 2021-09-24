import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Card, Popconfirm } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, BannerTitle, ExtIcon } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ budgetCategory, loading }) => ({ budgetCategory, loading }))
class PeriodTypeList extends Component {
  static tablRef;

  static confirmModal;

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  handlerEnableDisable = (id, enable) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetCategory/enableDisable',
      payload: {
        id,
        enable,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
        }
      },
    });
  };

  renderAction = row => {
    const {
      loading,
      budgetCategory: { currentRowId },
    } = this.props;
    const dealing = loading.effects['budgetCategory/enableDisable'];
    if (dealing && currentRowId === row.id) {
      return <ExtIcon type="loading" antd spin />;
    }
    if (row.enable) {
      return (
        <Popconfirm
          title="确定要停用吗？"
          onConfirm={() => this.handlerEnableDisable(row.id, false)}
        >
          <ExtIcon
            tooltip={{ title: '已启用', placement: 'left' }}
            type="check-circle"
            antd
            className="enable"
          />
        </Popconfirm>
      );
    }
    return (
      <Popconfirm title="确定要启用吗？" onConfirm={() => this.handlerEnableDisable(row.id, true)}>
        <ExtIcon
          tooltip={{ title: '已停用', placement: 'left' }}
          type="check-circle"
          antd
          className="disabled"
        />
      </Popconfirm>
    );
  };

  render() {
    const { budgetCategory } = this.props;
    const { currentCategory } = budgetCategory;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 80,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (_t, r) => <span className={cls('action-box')}>{this.renderAction(r)}</span>,
      },
      {
        title: '期间类型代码',
        dataIndex: 'periodType',
        width: 180,
        required: true,
      },
      {
        title: '期间类型名称',
        dataIndex: 'periodTypeRemark',
        width: 260,
        required: true,
      },
    ];
    const toolBarProps = {
      left: (
        <>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    const tableProps = {
      toolBar: toolBarProps,
      columns,
      lineNumber: false,
      showSearch: false,
      allowCustomColumns: false,
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/bems-v6/orderConfig/findConfigs`,
      },
      cascadeParams: {
        category: currentCategory.key,
      },
    };
    return (
      <div className={cls(styles['contanter-box'])}>
        <Card
          title={<BannerTitle title={get(currentCategory, 'title')} subTitle="期间类型列表" />}
          bordered={false}
        >
          <ExtTable {...tableProps} />
        </Card>
      </div>
    );
  }
}

export default PeriodTypeList;
