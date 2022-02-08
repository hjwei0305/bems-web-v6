import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { Button, Card, Modal, Tag } from 'antd';
import { ExtTable, BannerTitle } from 'suid';
import { FilterView, BudgetYearPicker } from '@/components';
import { constants } from '@/utils';
import FormModal from './FormModal';
import ExtAction from './ExtAction';
import styles from './index.less';

const { SERVER_PATH, PERIOD_TYPE, BUDGET_PERIOD_USER_ACTION, MASTER_CLASSIFICATION } = constants;

@connect(({ budgetPeriod, loading }) => ({ budgetPeriod, loading }))
class PeriodList extends Component {
  static tableRef;

  static confirmModal;

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

  delConfirm = rowData => {
    const { dispatch } = this.props;
    this.confirmModal = Modal.confirm({
      title: `删除确认`,
      content: `提示：删除后不可恢复!`,
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '确定',
      onOk: () => {
        return new Promise(resolve => {
          this.confirmModal.update({
            okButtonProps: { type: 'primary', loading: true },
            cancelButtonProps: { disabled: true },
          });
          dispatch({
            type: 'budgetPeriod/del',
            payload: {
              id: rowData.id,
            },
            callback: res => {
              if (res.success) {
                resolve();
                this.reloadData();
              } else {
                this.confirmModal.update({
                  okButtonProps: { loading: false },
                  cancelButtonProps: { disabled: false },
                });
              }
            },
          });
        });
      },
      cancelText: '取消',
      onCancel: () => {
        this.confirmModal.destroy();
        this.confirmModal = null;
      },
    });
  };

  frozen = rowData => {
    const { dispatch } = this.props;
    const frozen = get(rowData, 'closed');
    this.confirmModal = Modal.confirm({
      title: frozen ? `启用【${get(rowData, 'name')}】` : `关闭【${get(rowData, 'name')}】`,
      content: frozen ? `确定要启用吗?` : `确定要关闭吗?`,
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '确定',
      onOk: () => {
        return new Promise(resolve => {
          this.confirmModal.update({
            okButtonProps: { type: 'primary', loading: true },
            cancelButtonProps: { disabled: true },
          });
          dispatch({
            type: 'budgetPeriod/closeAndOpenPeriods',
            payload: {
              id: rowData.id,
              status: !frozen,
            },
            callback: res => {
              if (res.success) {
                resolve();
                this.reloadData();
              } else {
                this.confirmModal.update({
                  okButtonProps: { loading: false },
                  cancelButtonProps: { disabled: false },
                });
              }
            },
          });
        });
      },
      cancelText: '取消',
      onCancel: () => {
        this.confirmModal.destroy();
        this.confirmModal = null;
      },
    });
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

  handlerAction = (key, rowData) => {
    switch (key) {
      case BUDGET_PERIOD_USER_ACTION.EDIT:
        this.edit(rowData);
        break;
      case BUDGET_PERIOD_USER_ACTION.DELETE:
        this.delConfirm(rowData);
        break;
      case BUDGET_PERIOD_USER_ACTION.FROZEN:
      case BUDGET_PERIOD_USER_ACTION.UNFROZEN:
        this.frozen(rowData);
        break;
      default:
    }
  };

  createNormalPeriod = (data, callback = () => {}) => {
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
          callback();
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

  handlerBudgetYearChange = year => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPeriod/updateState',
      payload: {
        year,
      },
    });
  };

  renderPeriodName = (t, r) => {
    if (r.closed) {
      return (
        <>
          <span style={{ color: 'rgba(0,0,0,0.35)' }}>{t}</span>
          {r.type === PERIOD_TYPE.CUSTOMIZE.key ? (
            <Tag color="orange" style={{ borderColor: 'transparent', marginLeft: 4 }}>
              自定义
            </Tag>
          ) : null}
          <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已关闭</span>
        </>
      );
    }
    return (
      <>
        {t}
        {r.type === PERIOD_TYPE.CUSTOMIZE.key ? (
          <Tag color="orange" style={{ borderColor: 'transparent', marginLeft: 4 }}>
            自定义
          </Tag>
        ) : null}
      </>
    );
  };

  renderDisabled = (t, r) => {
    if (r.closed) {
      return <span style={{ color: 'rgba(0,0,0,0.35)' }}>{t}</span>;
    }
    return t || '-';
  };

  render() {
    const { budgetPeriod, loading } = this.props;
    const {
      currentMaster,
      showModal,
      rowData,
      selectPeriodType,
      periodTypeData,
      year,
    } = budgetPeriod;
    const classification = get(currentMaster, 'classification');
    const isProject = classification === MASTER_CLASSIFICATION.PROJECT.key;
    let periodTypeDataList = periodTypeData;
    if (!isProject) {
      periodTypeDataList = periodTypeData.filter(it => it.key !== PERIOD_TYPE.CUSTOMIZE.key);
    }
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 80,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (_text, record) => (
          <span className={cls('action-box')} onClick={e => e.stopPropagation()}>
            <ExtAction key={record.id} onAction={this.handlerAction} recordItem={record} />
          </span>
        ),
      },
      {
        title: '期间名称',
        dataIndex: 'name',
        width: 380,
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
            viewTypeData={periodTypeDataList}
            onAction={this.handlerPeriodTypeChange}
            reader={{
              title: 'title',
              value: 'key',
            }}
          />
          <BudgetYearPicker onYearChange={this.handlerBudgetYearChange} value={year} />
          <Button type="primary" onClick={this.add}>
            新建期间
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
        url: `${SERVER_PATH}/bems-v6/period/getBySubject`,
      },
      lineNumber: false,
      allowCustomColumns: false,
      cascadeParams: {
        subjectId: get(currentMaster, 'id'),
        type: this.getQueryPeriodType(),
        year,
      },
    };
    const formModalProps = {
      showModal,
      rowData,
      classification,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['budgetPeriod/createNormalPeriod'],
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
