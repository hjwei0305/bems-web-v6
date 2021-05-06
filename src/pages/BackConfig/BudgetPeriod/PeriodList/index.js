import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Card, Popconfirm, Tag } from 'antd';
import { ExtTable, BannerTitle, ExtIcon } from 'suid';
import { FilterView } from '@/components';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH, PERIOD_TYPE } = constants;

@connect(({ budgetPeriod, loading }) => ({ budgetPeriod, loading }))
class PeriodList extends Component {
  static tableRef;

  constructor(props) {
    super(props);
    this.state = {
      rowId: null,
    };
  }

  reloadData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPeriod/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const disabled = this.actionDisabled(rowData);
    if (disabled) {
      return false;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPeriod/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPeriod/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
        }
      },
    });
  };

  del = record => {
    const { dispatch } = this.props;
    this.setState(
      {
        rowId: record.id,
      },
      () => {
        dispatch({
          type: 'budgetPeriod/del',
          payload: {
            id: record.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                rowId: null,
              });
              this.reloadData();
            }
          },
        });
      },
    );
  };

  closeAndOpenPeriod = row => {
    const { dispatch } = this.props;
    const rowId = get(row, 'id');
    this.setState(
      {
        rowId,
      },
      () => {
        dispatch({
          type: 'budgetPeriod/closeAndOpenPeriods',
          payload: {
            id: rowId,
            status: !get(row, 'closed'),
          },
          callback: res => {
            if (res.success) {
              this.setState({
                rowId: null,
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
      type: 'budgetPeriod/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { rowId } = this.state;
    if (loading.effects['budgetPeriod/del'] && rowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return (
      <ExtIcon className={cls('del', { disabled: this.actionDisabled(row) })} type="delete" antd />
    );
  };

  renderCloseAndOpenBtn = row => {
    const { loading } = this.props;
    const { rowId } = this.state;
    if (loading.effects['budgetPeriod/closeAndOpenPeriods'] && rowId === row.id) {
      return <ExtIcon className="loading" type="loading" antd />;
    }
    if (row.closed) {
      return <ExtIcon className="open" type="check-circle" antd />;
    }
    return <ExtIcon className="close" type="close-circle" antd />;
  };

  saveCustomizePeriod = data => {
    const { dispatch, budgetPeriod } = this.props;
    const { currentMaster } = budgetPeriod;
    dispatch({
      type: 'budgetPeriod/saveCustomizePeriod',
      payload: {
        subjectId: get(currentMaster, 'id'),
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'budgetPeriod/updateState',
            payload: {
              showModal: false,
            },
          });
          this.reloadData();
        }
      },
    });
  };

  createNormalPeriod = data => {
    const { dispatch, budgetPeriod } = this.props;
    const { currentMaster } = budgetPeriod;
    dispatch({
      type: 'budgetPeriod/createNormalPeriod',
      payload: {
        subjectId: get(currentMaster, 'id'),
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'budgetPeriod/updateState',
            payload: {
              showModal: false,
            },
          });
          this.reloadData();
        }
      },
    });
  };

  handlerPeriodTypeChange = selectPeriodType => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPeriod/updateState',
      payload: {
        selectPeriodType,
      },
    });
  };

  getQueryPeriodType = () => {
    const { budgetPeriod } = this.props;
    const { selectPeriodType } = budgetPeriod;
    if (selectPeriodType && selectPeriodType.key !== PERIOD_TYPE.ALL.key) {
      return selectPeriodType.key;
    }
    return null;
  };

  renderPeriodName = (t, r) => {
    if (r.closed) {
      return (
        <>
          <span style={{ color: 'rgba(0,0,0,0.35)' }}>{t}</span>
          <Tag style={{ marginLeft: 4, color: 'rgba(0,0,0,0.35)' }}>已停用</Tag>
        </>
      );
    }
    return t;
  };

  renderDisabled = (t, r) => {
    if (r.closed) {
      return <span style={{ color: 'rgba(0,0,0,0.35)' }}>{t}</span>;
    }
    return t || '-';
  };

  actionDisabled = row => {
    if (row.type !== PERIOD_TYPE.CUSTOMIZE.key) {
      return true;
    }
    return false;
  };

  render() {
    const { budgetPeriod, loading } = this.props;
    const { currentMaster, showModal, rowData, selectPeriodType, periodTypeData } = budgetPeriod;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 140,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (_text, record) => (
          <span className={cls('action-box')} onClick={e => e.stopPropagation()}>
            <ExtIcon
              className={cls('edit', { disabled: this.actionDisabled(record) })}
              onClick={() => this.edit(record)}
              type="edit"
              antd
            />
            <Popconfirm
              placement="topLeft"
              title={formatMessage({
                id: 'global.delete.confirm',
                defaultMessage: '确定要删除吗？提示：删除后不可恢复',
              })}
              disabled={this.actionDisabled(record)}
              onConfirm={() => this.del(record)}
            >
              {this.renderDelBtn(record)}
            </Popconfirm>
            <Popconfirm
              title={record.closed ? '确定要启用期间吗？' : '确定要停用期间吗？'}
              onConfirm={() => this.closeAndOpenPeriod(record)}
            >
              {this.renderCloseAndOpenBtn(record)}
            </Popconfirm>
          </span>
        ),
      },
      {
        title: '期间名称',
        dataIndex: 'name',
        width: 320,
        render: (t, r) => this.renderPeriodName(t, r),
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        width: 120,
        render: (t, r) => this.renderDisabled(t, r),
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        width: 120,
        render: (t, r) => this.renderDisabled(t, r),
      },
    ];
    const toolBarProps = {
      left: (
        <>
          <FilterView
            title="期间类型"
            style={{ marginRight: 16, minWidth: 140 }}
            currentViewType={selectPeriodType}
            viewTypeData={periodTypeData}
            onAction={this.handlerPeriodTypeChange}
            reader={{
              title: 'title',
              value: 'key',
            }}
          />
          <Button type="primary" onClick={this.add}>
            新建期间
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    const extTableProps = {
      toolBar: toolBarProps,
      columns,
      onTableRef: ref => (this.tableRef = ref),
      searchPlaceHolder: '输入期间名称关键字',
      searchProperties: ['name'],
      searchWidth: 260,
      store: {
        url: `${SERVER_PATH}/bems-v6/period/findBySubject`,
      },
      lineNumber: false,
      allowCustomColumns: false,
      cascadeParams: {
        subjectId: get(currentMaster, 'id'),
        type: this.getQueryPeriodType(),
      },
    };
    const formModalProps = {
      showModal,
      rowData,
      closeFormModal: this.closeFormModal,
      saving:
        loading.effects['budgetPeriod/createNormalPeriod'] ||
        loading.effects['budgetPeriod/saveCustomizePeriod'],
      saveCustomizePeriod: this.saveCustomizePeriod,
      createNormalPeriod: this.createNormalPeriod,
    };
    return (
      <div className={cls(styles['contanter-box'])}>
        <Card
          title={<BannerTitle title={get(currentMaster, 'name')} subTitle="预算期间" />}
          bordered={false}
        >
          <ExtTable {...extTableProps} />
        </Card>
        <FormModal {...formModalProps} />
      </div>
    );
  }
}

export default PeriodList;
