import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Button, Popconfirm, Tag, Badge } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, Space } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ budgetDimension, loading }) => ({ budgetDimension, loading }))
class BudgetDimension extends Component {
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
      type: 'budgetDimension/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetDimension/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetDimension/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'budgetDimension/updateState',
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
          type: 'budgetDimension/del',
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
      type: 'budgetDimension/updateState',
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

  render() {
    const { budgetDimension, loading } = this.props;
    const { showModal, rowData } = budgetDimension;
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
            {record.required === true ? (
              <ExtIcon className="disabled" type="edit" antd />
            ) : (
              <ExtIcon className="edit" onClick={() => this.edit(record)} type="edit" antd />
            )}
            {this.renderDelBtn(record)}
          </span>
        ),
      },
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
        render: (t, r) => {
          if (r.required) {
            return (
              <Space>
                {t}
                <Tag style={{ marginRight: 0 }}>
                  <Badge color="blue" />
                  必需
                </Tag>
              </Space>
            );
          }
          return t;
        },
      },
      {
        title: '维度策略',
        dataIndex: 'strategyName',
        width: 180,
        render: t => t || '-',
      },
      {
        title: 'UI组件',
        dataIndex: 'uiComponent',
        width: 160,
      },
      {
        title: '序号',
        dataIndex: 'rank',
        width: 80,
        required: true,
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['budgetDimension/save'],
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
      searchWidth: 260,
      lineNumber: false,
      allowCustomColumns: false,
      searchPlaceHolder: '输入维度代码、维度名称关键字',
      searchProperties: ['name', 'code'],
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/bems-v6/dimension/findAll`,
      },
      sort: { field: { rank: 'asc' } },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...tableProps} />
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default BudgetDimension;
