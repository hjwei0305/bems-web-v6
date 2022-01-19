import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { ExtTable } from 'suid';
import { StrategyType } from '@/components';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ budgetStrategy, loading }) => ({ budgetStrategy, loading }))
class BudgetStrategy extends Component {
  static tablRef;

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  render() {
    const columns = [
      {
        title: '策略名称',
        dataIndex: 'name',
        width: 180,
        required: true,
      },
      {
        title: '策略类别',
        dataIndex: 'category',
        width: 100,
        required: true,
        render: t => <StrategyType state={t} />,
      },
      {
        title: '策略描述',
        dataIndex: 'remark',
        width: 360,
        render: t => t || '-',
      },
      {
        title: '策略类路径',
        dataIndex: 'classPath',
        width: 520,
        render: t => t || '-',
      },
    ];
    const tableProps = {
      toolBar: null,
      columns,
      searchWidth: 260,
      lineNumber: false,
      allowCustomColumns: false,
      searchPlaceHolder: '策略名称、策略类路径',
      searchProperties: ['name', 'classPath'],
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/bems-v6/strategy/findAll`,
      },
      sort: {
        field: { category: 'asc', name: null, classPath: null },
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...tableProps} />
      </div>
    );
  }
}

export default BudgetStrategy;
