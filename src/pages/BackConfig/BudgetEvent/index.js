import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Button, Popconfirm } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ budgetEvent, loading }) => ({ budgetEvent, loading }))
class BudgetEvent extends Component {
  static tablRef;

  constructor(props) {
    super(props);
    this.state = {
      delRowId: null,
    };
  }

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetEvent/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetEvent/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetEvent/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'budgetEvent/updateState',
            payload: {
              showModal: false,
            },
          });
          this.reloadData();
        }
      },
    });
  };

  del = record => {
    const { dispatch } = this.props;
    this.setState(
      {
        delRowId: record.id,
      },
      () => {
        dispatch({
          type: 'budgetEvent/del',
          payload: {
            id: record.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delRowId: null,
              });
              this.reloadData();
            }
          },
        });
      },
    );
  };

  closeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetEvent/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['budgetEvent/del'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    if (row.required === true) {
      return <ExtIcon className="disabled" type="delete" antd />;
    }
    return (
      <Popconfirm
        placement="topLeft"
        title={formatMessage({
          id: 'global.delete.confirm',
          defaultMessage: '确定要删除吗？提示：删除后不可恢复',
        })}
        onConfirm={() => this.del(row)}
      >
        <ExtIcon className="del" type="delete" antd />
      </Popconfirm>
    );
  };

  renderName = (t, r) => {
    if (r.frozen) {
      return (
        <>
          <span style={{ color: 'rgba(0,0,0,0.35)' }}>{t}</span>
          <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已停用</span>
        </>
      );
    }
    return t;
  };

  renderDisabled = (t, r) => {
    if (r.frozen) {
      return <span style={{ color: 'rgba(0,0,0,0.35)' }}>{t}</span>;
    }
    return t || '-';
  };

  render() {
    const { budgetEvent, loading } = this.props;
    const { showModal, rowData } = budgetEvent;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (text, record) => (
          <span className={cls('action-box')}>
            <ExtIcon className="edit" onClick={() => this.edit(record)} type="edit" antd />
            {this.renderDelBtn(record)}
          </span>
        ),
      },
      {
        title: '事件代码',
        dataIndex: 'code',
        width: 220,
        required: true,
        render: (t, r) => this.renderDisabled(t, r),
      },
      {
        title: '事件名称',
        dataIndex: 'name',
        width: 280,
        required: true,
        render: (t, r) => this.renderName(t, r),
      },
      {
        title: '业务来源',
        dataIndex: 'bizFrom',
        width: 180,
        required: true,
        render: (t, r) => this.renderDisabled(t, r),
      },
      {
        title: '标签名',
        dataIndex: 'label',
        width: 320,
        render: (t, r) => this.renderDisabled(t, r),
      },
      {
        title: '序号',
        dataIndex: 'rank',
        width: 80,
        required: true,
        render: (t, r) => this.renderDisabled(t, r),
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['budgetEvent/save'],
    };
    const toolBarProps = {
      left: (
        <>
          <Button type="primary" onClick={this.add}>
            <FormattedMessage id="global.add" defaultMessage="新建" />
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
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default BudgetEvent;
