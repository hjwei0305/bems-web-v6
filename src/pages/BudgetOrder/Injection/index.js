import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { get, isEmpty, isNumber, isEqual } from 'lodash';
import cls from 'classnames';
import moment from 'moment';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Modal } from 'antd';
import { ExtTable, ExtIcon, Money, PageLoader, Space } from 'suid';
import { FilterView, FilterDate } from '@/components';
import { constants } from '@/utils';
import ExtAction from './components/ExtAction';
import Filter from './components/Filter';
import RequestViewState from '../components/RequestViewState';
import styles from './index.less';

const CreateRequestOrder = React.lazy(() => import('./Request/CreateOrder'));
const UpdateRequestOrder = React.lazy(() => import('./Request/UpdateOrder'));
const ViewRequestOrder = React.lazy(() => import('./Request/ViewOrder'));
const {
  SERVER_PATH,
  INJECTION_REQUEST_BTN_KEY,
  REQUEST_VIEW_STATUS,
  SEARCH_DATE_PERIOD,
} = constants;
const startFormat = 'YYYY-MM-DD 00:00:00';
const endFormat = 'YYYY-MM-DD 23:59:59';

const filterFields = {
  subjectId: { fieldName: 'subjectId', operation: 'EQ' },
  applyOrgId: { fieldName: 'applyOrgId', operation: 'EQ' },
};

@connect(({ injectionRequestList, loading }) => ({ injectionRequestList, loading }))
class InjectionRequestList extends Component {
  static tableRef;

  static confirmModal;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        recordItem: null,
        showCreate: false,
        showUpdate: false,
        showView: false,
        showFilter: false,
        filterData: {},
      },
    });
  }

  reloadData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  handlerViewTypeChange = currentViewType => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        currentViewType,
      },
    });
  };

  handlerAction = (key, record) => {
    const { dispatch } = this.props;
    switch (key) {
      case INJECTION_REQUEST_BTN_KEY.VIEW:
        dispatch({
          type: 'injectionRequestList/updateState',
          payload: {
            recordItem: record,
            showView: true,
          },
        });
        break;
      case INJECTION_REQUEST_BTN_KEY.EDIT:
        dispatch({
          type: 'injectionRequestList/updateState',
          payload: {
            recordItem: record,
            showUpdate: true,
          },
        });
        break;
      case INJECTION_REQUEST_BTN_KEY.DELETE:
        this.delConfirm(record);
        break;
      case INJECTION_REQUEST_BTN_KEY.START_FLOW:
        this.reloadData();
        break;
      default:
    }
  };

  delConfirm = record => {
    const { dispatch } = this.props;
    const orderId = get(record, 'id');
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
            type: 'injectionRequestList/del',
            payload: {
              id: orderId,
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

  resumeConfirm = record => {
    const { dispatch } = this.props;
    const orderId = get(record, 'id');
    const createdDate = get(record, 'createdDate', '-');
    this.confirmModal = Modal.confirm({
      title: `恢复确认`,
      content: `你于[${createdDate}]创建的申请单未保存，是否需要恢复!`,
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '恢复',
      onOk: () => {
        dispatch({
          type: 'injectionRequestList/updateState',
          payload: {
            recordItem: record,
            showUpdate: true,
          },
        });
      },
      cancelText: '取消',
      onCancel: () => {
        return new Promise(resolve => {
          this.confirmModal.update({
            okButtonProps: { type: 'primary', disabled: true },
            cancelButtonProps: { loading: true },
          });
          dispatch({
            type: 'injectionRequestList/trash',
            payload: {
              id: orderId,
            },
            callback: res => {
              if (res.success) {
                resolve();
                dispatch({
                  type: 'injectionRequestList/updateState',
                  payload: {
                    recordItem: null,
                    showCreate: true,
                  },
                });
              } else {
                this.confirmModal.update({
                  okButtonProps: { disabled: false },
                  cancelButtonProps: { disabled: false, loading: false },
                });
              }
            },
          });
        });
      },
    });
  };

  addOrder = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/checkInjectPrefab',
      successCallback: recordItem => {
        if (recordItem) {
          this.resumeConfirm(recordItem);
        } else {
          dispatch({
            type: 'injectionRequestList/updateState',
            payload: {
              showCreate: true,
            },
          });
        }
      },
    });
  };

  handlerFilterSubmit = filterData => {
    const { dispatch, injectionRequestList } = this.props;
    const { filterData: originFilterData } = injectionRequestList;
    if (isEqual(filterData, originFilterData)) {
      this.reloadData();
    }
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        showFilter: false,
        filterData,
      },
    });
  };

  clearFilter = e => {
    e.stopPropagation();
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        filterData: {},
      },
    });
  };

  handlerShowFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        showFilter: true,
      },
    });
  };

  handlerCloseFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        showFilter: false,
      },
    });
  };

  handlerCancel = needRefresh => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        showCreate: false,
        showUpdate: false,
        showView: false,
        recordItem: null,
      },
    });
    if (needRefresh === true) {
      this.reloadData();
    }
  };

  handlerFitlerDate = currentViewDate => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        currentViewDate,
      },
    });
  };

  getFilters = () => {
    const { injectionRequestList } = this.props;
    const { filterData, currentViewDate, currentViewType } = injectionRequestList;
    let hasFilter = false;
    const filters = [];
    Object.keys(filterData).forEach(key => {
      const filterField = get(filterFields, key);
      if (filterField) {
        const value = get(filterData, key, null);
        if (!isEmpty(value) || isNumber(value)) {
          hasFilter = true;
          filters.push({ fieldName: key, operator: get(filterField, 'operation'), value });
        }
      }
    });
    const status = get(currentViewType, 'key');
    if (status !== REQUEST_VIEW_STATUS.ALL.key) {
      filters.push({ fieldName: 'status', operator: 'EQ', value: status });
    }
    const currentDate = moment();
    const { name: searchDateType, startTime = null, endTime = null } = currentViewDate;
    switch (searchDateType) {
      case SEARCH_DATE_PERIOD.THIS_MONTH.name:
        filters.push({
          fieldName: 'createdDate',
          operator: 'GE',
          fieldType: 'date',
          value: currentDate.startOf('month').format(startFormat),
        });
        filters.push({
          fieldName: 'createdDate',
          operator: 'LE',
          fieldType: 'date',
          value: currentDate.endOf('month').format(endFormat),
        });
        break;
      case SEARCH_DATE_PERIOD.THIS_WEEK.name:
        filters.push({
          fieldName: 'createdDate',
          operator: 'GE',
          fieldType: 'date',
          value: currentDate.startOf('week').format(startFormat),
        });
        filters.push({
          fieldName: 'createdDate',
          operator: 'LE',
          fieldType: 'date',
          value: currentDate.endOf('week').format(endFormat),
        });
        break;
      case SEARCH_DATE_PERIOD.TODAY.name:
        filters.push({
          fieldName: 'createdDate',
          operator: 'GE',
          value: currentDate.format(startFormat),
        });
        filters.push({
          fieldName: 'createdDate',
          operator: 'LE',
          fieldType: 'date',
          value: currentDate.format(endFormat),
        });
        break;
      case SEARCH_DATE_PERIOD.PERIOD.name:
        filters.push({
          fieldName: 'createdDate',
          operator: 'GE',
          fieldType: 'date',
          value: moment(startTime).format(startFormat),
        });
        filters.push({
          fieldName: 'createdDate',
          operator: 'LE',
          fieldType: 'date',
          value: moment(endTime).format(endFormat),
        });
        break;
      default:
        break;
    }
    return { filters, hasFilter };
  };

  getExtTableProps = () => {
    const { injectionRequestList, loading } = this.props;
    const { currentViewType, viewTypeData, viewDateData, currentViewDate } = injectionRequestList;
    const columns = [
      {
        title: '操作',
        key: 'operation',
        width: 80,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        fixed: 'left',
        render: (id, record) => (
          <span className={cls('action-box')}>
            <ExtAction key={id} onAction={this.handlerAction} recordItem={record} />
          </span>
        ),
      },
      {
        title: '单据编号',
        dataIndex: 'code',
        width: 110,
      },
      {
        title: '单据状态',
        dataIndex: 'status',
        width: 100,
        render: t => {
          return <RequestViewState enumName={t} />;
        },
      },
      {
        title: '预算类型',
        dataIndex: 'categoryName',
        width: 110,
      },
      {
        title: '预算总金额',
        dataIndex: 'applyAmount',
        width: 140,
        align: 'right',
        render: (t, record) => {
          return <Money value={t} prefix={get(record, 'currencyCode', '')} />;
        },
      },
      {
        title: '预算主体',
        dataIndex: 'subjectName',
        width: 300,
      },
      {
        title: '申请单位',
        dataIndex: 'applyOrgName',
        width: 320,
      },
      {
        title: '备注说明',
        dataIndex: 'remark',
        width: 150,
        render: text => text || '-',
      },
      {
        title: '创建时间',
        dataIndex: 'createdDate',
        width: 180,
      },
      {
        title: '归口部门',
        dataIndex: 'managerOrgName',
        width: 220,
        optional: true,
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        width: 120,
        optional: true,
      },
    ];
    const { filters, hasFilter } = this.getFilters();
    const toolBarProps = {
      layout: { leftSpan: 6, rightSpan: 18 },
      left: (
        <Space>
          <FilterView
            title="单据视图"
            currentViewType={currentViewType}
            viewTypeData={viewTypeData}
            onAction={this.handlerViewTypeChange}
            reader={{
              title: 'title',
              value: 'key',
            }}
          />
          <Button
            key={INJECTION_REQUEST_BTN_KEY.CREATE}
            onClick={this.addOrder}
            loading={loading.effects['injectionRequestList/checkInjectPrefab']}
            type="primary"
          >
            新建单据
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </Space>
      ),
      right: (
        <FilterDate
          title="创建日期"
          currentViewType={currentViewDate}
          viewTypeData={viewDateData}
          onAction={this.handlerFitlerDate}
        />
      ),
      extra: (
        <Space>
          <span
            className={cls('filter-btn', 'icon-btn-item', { 'has-filter': hasFilter })}
            onClick={this.handlerShowFilter}
          >
            <ExtIcon type="filter" style={{ fontSize: 16 }} />
            <span className="lable">
              <FormattedMessage id="global.filter" defaultMessage="过滤" />
            </span>
            {hasFilter ? (
              <ExtIcon
                type="close"
                className="btn-clear"
                antd
                onClick={e => this.clearFilter(e)}
                tooltip={{ title: '清除过滤条件', placement: 'bottomRight' }}
                style={{ fontSize: 14 }}
              />
            ) : null}
          </span>
        </Space>
      ),
    };
    const props = {
      columns,
      bordered: false,
      toolBar: toolBarProps,
      remotePaging: true,
      showSearchTooltip: true,
      lineNumber: false,
      storageId: '58494acc-e17e-4189-ac76-af832e816cf2',
      searchProperties: ['code', 'remark'],
      searchPlaceHolder: '单据编号、备注说明',
      sort: {
        field: { createdDate: 'desc' },
      },
    };
    if (currentViewType) {
      Object.assign(props, {
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/order/findInjectionByPage`,
        },
        cascadeParams: {
          filters,
        },
      });
    }
    return props;
  };

  render() {
    const { injectionRequestList } = this.props;
    const {
      showFilter,
      filterData,
      showCreate,
      showUpdate,
      showView,
      recordItem,
    } = injectionRequestList;
    const filterProps = {
      showFilter,
      filterData,
      onFilterSubmit: this.handlerFilterSubmit,
      onCloseFilter: this.handlerCloseFilter,
      onResetFilter: this.clearFilter,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable onTableRef={ref => (this.tableRef = ref)} {...this.getExtTableProps()} />
        <Filter {...filterProps} />
        <Suspense fallback={<PageLoader />}>
          <CreateRequestOrder showCreate={showCreate} onCloseModal={this.handlerCancel} />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <UpdateRequestOrder
            requestId={get(recordItem, 'id', null)}
            showUpdate={showUpdate}
            onCloseModal={this.handlerCancel}
          />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <ViewRequestOrder
            requestId={get(recordItem, 'id', null)}
            showView={showView}
            onCloseModal={this.handlerCancel}
          />
        </Suspense>
      </div>
    );
  }
}

export default InjectionRequestList;
