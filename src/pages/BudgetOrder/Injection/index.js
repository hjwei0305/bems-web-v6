import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { get } from 'lodash';
import cls from 'classnames';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button } from 'antd';
import { ExtTable, ExtIcon, Money, PageLoader, Space } from 'suid';
import { FilterView } from '@/components';
import { constants } from '@/utils';
import ExtAction from './components/ExtAction';
import Filter from './components/Filter';
import RequestViewState from '../components/RequestViewState';
import styles from './index.less';

const CreateRequestOrder = React.lazy(() => import('./Request/CreateOrder'));

const { SERVER_PATH, INJECTION_REQUEST_BTN_KEY, REQUEST_VIEW_STATUS } = constants;

@connect(({ injectionRequestList, loading }) => ({ injectionRequestList, loading }))
class InjectionRequestList extends Component {
  static tableRef;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        recordItem: null,
        showCreate: false,
        showEdit: false,
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
        dispatch({
          type: 'injectionRequestList/del',
          payload: {
            headId: record.id,
          },
          callback: res => {
            if (res.success) {
              this.reloadData();
            }
          },
        });
        break;
      case INJECTION_REQUEST_BTN_KEY.START_FLOW:
        break;
      default:
    }
  };

  addOrder = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        showCreate: true,
      },
    });
  };

  handlerFilterSubmit = filterData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionRequestList/updateState',
      payload: {
        showFilter: false,
        filterData,
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
        showEdit: false,
        showView: false,
      },
    });
    if (needRefresh === true) {
      this.reloadData();
    }
  };

  getFilters = () => {
    return {};
  };

  getExtTableProps = () => {
    const { injectionRequestList, loading } = this.props;
    const { currentViewType, viewTypeData } = injectionRequestList;
    const columns = [
      {
        title: '操作',
        key: 'operation',
        width: 60,
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
        width: 200,
      },
      {
        title: '申请单位',
        dataIndex: 'applyOrgName',
        width: 200,
      },
      {
        title: '预算金额',
        dataIndex: 'totalAmount',
        width: 180,
        align: 'right',
        render: (text, record) => <Money prefix={record.currencyCode} value={text} />,
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
    const filters = this.getFilters();
    const toolBarProps = {
      layout: { leftSpan: 10, rightSpan: 14 },
      left: (
        <Space>
          <FilterView
            style={{ minWidth: 160 }}
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
            loading={loading.effects['injectionRequestList/getDefaultHead']}
            icon="plus"
            type="primary"
          >
            新建单据
          </Button>
          <Button onClick={this.reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </Space>
      ),
      extra: (
        <>
          <span
            className={cls('filter-btn', 'icon-btn-item', { 'has-filter': filters.hasFilter })}
            onClick={this.handlerShowFilter}
          >
            <ExtIcon type="filter" style={{ fontSize: 16 }} />
            <span className="lable">
              <FormattedMessage id="global.filter" defaultMessage="过滤" />
            </span>
          </span>
        </>
      ),
    };
    const props = {
      columns,
      bordered: false,
      toolBar: toolBarProps,
      remotePaging: true,
      showSearchTooltip: true,
      storageId: '58494acc-e17e-4189-ac76-af832e816cf2',
      searchProperties: ['code', 'remark'],
      searchPlaceHolder: '单据编号、备注说明',
      sort: {
        field: { createdDate: 'desc' },
      },
    };
    let requestViewStatus = get(currentViewType, 'name');
    if (requestViewStatus === REQUEST_VIEW_STATUS.ALL.key) {
      requestViewStatus = null;
    }
    if (currentViewType) {
      Object.assign(props, {
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/order/findInjectionByPage`,
        },
        cascadeParams: {
          requestViewStatus,
          ...filters.filter,
        },
      });
    }
    return props;
  };

  render() {
    const { injectionRequestList } = this.props;
    const { showFilter, filterData, showCreate } = injectionRequestList;
    const filterProps = {
      showFilter,
      filterData,
      onFilterSubmit: this.handlerFilterSubmit,
      onCloseFilter: this.handlerCloseFilter,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable onTableRef={ref => (this.tableRef = ref)} {...this.getExtTableProps()} />
        <Filter {...filterProps} />
        <Suspense fallback={<PageLoader />}>
          <CreateRequestOrder showCreate={showCreate} onCloseModal={this.handlerCancel} />
        </Suspense>
      </div>
    );
  }
}

export default InjectionRequestList;
