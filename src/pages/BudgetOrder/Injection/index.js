import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { get } from 'lodash';
import cls from 'classnames';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
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
        dataIndex: 'orderNo',
        width: 110,
      },
      {
        title: '单据状态',
        dataIndex: 'requestViewStatusRemark',
        width: 100,
        render: (text, record) => {
          return <RequestViewState state={record.requestViewStatus} remark={text} />;
        },
      },
      {
        title: '预算主体',
        dataIndex: 'corporationName',
        width: 200,
      },
      {
        title: '申请单位',
        dataIndex: 'organizationName',
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
        dataIndex: 'orderNote',
        width: 150,
        render: text => text || '-',
      },
      {
        title: '创建时间',
        dataIndex: 'createdDate',
        width: 180,
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
      searchPlaceHolder: formatMessage({
        id: 'paymentRequest.searchPlaceHolder',
        defaultMessage: '单号、付款账户/说明',
      }),
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
          url: `${SERVER_PATH}/product-beis/paymentRequestHead/searchByPage`,
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
