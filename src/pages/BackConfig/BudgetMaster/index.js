import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Popconfirm, Tag, Badge } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ budgetMaster, loading }) => ({ budgetMaster, loading }))
class BudgetMaster extends Component {
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
      type: 'budgetMaster/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMaster/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMaster/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'budgetMaster/updateState',
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
          type: 'budgetMaster/del',
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
      type: 'budgetMaster/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['budgetMaster/del'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  render() {
    const { budgetMaster, loading } = this.props;
    const { showModal, rowData } = budgetMaster;
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
            <Popconfirm
              placement="topLeft"
              title={formatMessage({
                id: 'global.delete.confirm',
                defaultMessage: '确定要删除吗？提示：删除后不可恢复',
              })}
              onConfirm={() => this.del(record)}
            >
              {this.renderDelBtn(record)}
            </Popconfirm>
          </span>
        ),
      },
      {
        title: '主体代码',
        dataIndex: 'code',
        width: 100,
        required: true,
      },
      {
        title: '主体名称',
        dataIndex: 'name',
        width: 360,
        required: true,
      },
      {
        title: '执行策略',
        dataIndex: 'strategyName',
        width: 100,
        render: t => (
          <Tag>
            <Badge color="blue" />
            {t}
          </Tag>
        ),
      },
      {
        title: '币种',
        dataIndex: 'currencyName',
        width: 120,
        render: (t, r) => {
          const code = get(r, 'currencyCode');
          if (code) {
            return `${t}(${code})`;
          }
          return t;
        },
      },
      {
        title: '公司代码',
        dataIndex: 'corporationCode',
        width: 90,
      },
      {
        title: '公司名称',
        dataIndex: 'corporationName',
        width: 360,
      },
      {
        title: '组织代码',
        dataIndex: 'orgCode',
        width: 90,
      },
      {
        title: '组织名称',
        dataIndex: 'orgName',
        width: 220,
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['budgetMaster/save'],
    };
    const toolBarProps = {
      left: (
        <>
          <Button type="primary" onClick={this.add}>
            <FormattedMessage id="global.add" defaultMessage="新建" />
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    const tableProps = {
      toolBar: toolBarProps,
      columns,
      searchWidth: 260,
      lineNumber: false,
      searchPlaceHolder: '输入预算主体名称关键字',
      searchProperties: ['name'],
      remotePaging: true,
      onTableRef: ref => (this.tablRef = ref),
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subject/findByPage`,
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

export default BudgetMaster;
