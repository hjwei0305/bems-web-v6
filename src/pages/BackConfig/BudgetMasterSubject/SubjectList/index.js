import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Card, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, BannerTitle, PageLoader } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import ExtAction from './ExtAction';
import styles from './index.less';

const { SERVER_PATH, BUDGET_SUBJECT_USER_ACTION } = constants;
const AssignSubject = React.lazy(() => import('./AssignSubject'));
const CopySubject = React.lazy(() => import('./CopySubject'));

@connect(({ budgetMasterSubject, loading }) => ({ budgetMasterSubject, loading }))
class BudgetSubject extends Component {
  static tablRef;

  static confirmModal;

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  showInitSubject = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMasterSubject/checkSubjectInit',
    });
  };

  initSubject = referenceId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMasterSubject/subjectInit',
      payload: {
        referenceId,
      },
      callback: res => {
        if (res.success) {
          this.closeModal();
          this.reloadData();
        }
      },
    });
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMasterSubject/updateState',
      payload: {
        showAssign: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMasterSubject/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch, budgetMasterSubject } = this.props;
    const { currentMaster } = budgetMasterSubject;
    dispatch({
      type: 'budgetMasterSubject/save',
      payload: {
        subjectId: get(currentMaster, 'id'),
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'budgetMasterSubject/updateState',
            payload: {
              showModal: false,
            },
          });
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
            type: 'budgetMasterSubject/del',
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

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMasterSubject/updateState',
      payload: {
        showModal: false,
        showAssign: false,
        showInit: false,
        rowData: null,
      },
    });
  };

  handlerAssign = itemCodes => {
    const { dispatch, budgetMasterSubject } = this.props;
    const { currentMaster } = budgetMasterSubject;
    dispatch({
      type: 'budgetMasterSubject/assign',
      payload: {
        subjectId: get(currentMaster, 'id'),
        itemCodes,
      },
      callback: res => {
        if (res.success) {
          this.closeModal();
          this.reloadData();
        }
      },
    });
  };

  frozen = rowData => {
    const { dispatch } = this.props;
    const frozen = get(rowData, 'frozen');
    this.confirmModal = Modal.confirm({
      title: frozen ? `启用科目【${get(rowData, 'name')}】` : `停用科目【${get(rowData, 'name')}】`,
      content: frozen ? `确定要启用吗?` : `确定要停用吗?`,
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
            type: 'budgetMasterSubject/frozen',
            payload: {
              id: rowData.id,
              freezing: !frozen,
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

  handlerAction = (key, rowData) => {
    switch (key) {
      case BUDGET_SUBJECT_USER_ACTION.EDIT:
        this.edit(rowData);
        break;
      case BUDGET_SUBJECT_USER_ACTION.DELETE:
        this.delConfirm(rowData);
        break;
      case BUDGET_SUBJECT_USER_ACTION.FROZEN:
      case BUDGET_SUBJECT_USER_ACTION.UNFROZEN:
        this.frozen(rowData);
        break;
      default:
    }
  };

  render() {
    const { budgetMasterSubject, loading } = this.props;
    const { showModal, rowData, currentMaster, showInit, showAssign } = budgetMasterSubject;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 80,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (text, record) => (
          <span className={cls('action-box')}>
            <ExtAction key={record.id} onAction={this.handlerAction} recordItem={record} />
          </span>
        ),
      },
      {
        title: '科目代码',
        dataIndex: 'code',
        width: 120,
        required: true,
      },
      {
        title: '科目名称',
        dataIndex: 'name',
        width: 420,
        required: true,
        render: (t, r) => {
          if (r.frozen) {
            return (
              <>
                {t}
                <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已停用</span>
              </>
            );
          }
          return t;
        },
      },
      {
        title: '执行策略',
        dataIndex: 'strategyName',
        width: 180,
        render: t => t || '默认主体执行策略',
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeModal: this.closeModal,
      saving: loading.effects['budgetMasterSubject/save'],
    };
    const assignSubjectProps = {
      currentMaster,
      showModal: showAssign,
      assign: this.handlerAssign,
      initLoading: loading.effects['budgetMasterSubject/assign'],
      closeModal: this.closeModal,
    };
    const copySubjectProps = {
      currentMaster,
      showModal: showInit,
      init: this.initSubject,
      initLoading: loading.effects['budgetMasterSubject/subjectInit'],
      closeModal: this.closeModal,
    };
    const toolBarProps = {
      left: (
        <>
          <Button type="primary" onClick={this.add}>
            <FormattedMessage id="global.add" defaultMessage="新建" />
          </Button>
          <Button
            loading={loading.effects['budgetMasterSubject/checkSubjectInit']}
            onClick={this.showInitSubject}
          >
            初始化
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
      searchPlaceHolder: '输入科目代码、名称关键字',
      remotePaging: true,
      allowCustomColumns: false,
      onTableRef: ref => (this.tablRef = ref),
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subjectItem/getAssigned`,
      },
      cascadeParams: {
        filters: [{ fieldName: 'subjectId', operator: 'EQ', value: get(currentMaster, 'id') }],
      },
    };
    return (
      <div className={cls(styles['contanter-box'])}>
        <Card
          title={<BannerTitle title={get(currentMaster, 'name')} subTitle="预算科目" />}
          bordered={false}
        >
          <ExtTable {...tableProps} />
        </Card>
        <FormModal {...formModalProps} />
        <Suspense fallback={<PageLoader />}>
          <AssignSubject {...assignSubjectProps} />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <CopySubject {...copySubjectProps} />
        </Suspense>
      </div>
    );
  }
}

export default BudgetSubject;
