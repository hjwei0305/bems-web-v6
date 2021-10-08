import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ annualAnalysis, loading }) => ({ annualAnalysis, loading }))
class AnnualAnalysis extends Component {
  static tablRef;

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  render() {
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: () => (
          <span className={cls('action-box')}>
            <ExtIcon className="edit" type="edit" antd />
          </span>
        ),
      },
      {
        title: '事件代码',
        dataIndex: 'code',
        width: 220,
        required: true,
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        width: 280,
        required: true,
      },
      {
        title: '业务来源',
        dataIndex: 'bizFrom',
        width: 180,
        required: true,
      },
      {
        title: '标签名',
        dataIndex: 'label',
        width: 320,
      },
      {
        title: '序号',
        dataIndex: 'rank',
        width: 80,
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
      searchWidth: 320,
      lineNumber: false,
      allowCustomColumns: false,
      searchPlaceHolder: '事件代码、名称、业务来源和标签名关键字',
      searchProperties: ['code', 'name', 'bizFrom', 'label'],
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/bems-v6/event/findAll`,
      },
      sort: {
        field: { rank: 'asc', code: null, name: null },
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...tableProps} />
      </div>
    );
  }
}

export default AnnualAnalysis;
