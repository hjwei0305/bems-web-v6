import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { get, isEmpty, isNumber, isEqual } from 'lodash';
import cls from 'classnames';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Input, Descriptions, Tag, Button, Modal, Layout } from 'antd';
import { ListCard, ExtIcon, Money, Space, PageLoader } from 'suid';
import { constants } from '@/utils';
import Filter from './components/Filter';
import styles from './index.less';

const LogDetail = React.lazy(() => import('./LogDetail'));
const { SERVER_PATH } = constants;
const { Search } = Input;
const { Sider, Content } = Layout;
const filterFields = {
  subjectId: { fieldName: 'subjectId', operation: 'EQ' },
  applyOrgId: { fieldName: 'applyOrgId', operation: 'EQ' },
};

@connect(({ budgetPool, loading }) => ({ budgetPool, loading }))
class BudgetPool extends Component {
  static listCardRef;

  static total;

  static confirmModal;

  constructor() {
    super();
    this.total = 0;
    this.state = {
      rowId: null,
    };
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        recordItem: null,
        showFilter: false,
        filterData: {},
        showLog: false,
      },
    });
  }

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
  };

  closeLog = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        recordItem: null,
        showLog: false,
      },
    });
  };

  showLogDetail = recordItem => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        recordItem,
        showLog: true,
      },
    });
  };

  handlerSelectPool = (_, items) => {
    const {
      budgetPool: { showLog },
    } = this.props;
    if (showLog) {
      const [recordItem] = items;
      this.showLogDetail(recordItem);
    }
  };

  handlerFilterSubmit = filterData => {
    const { dispatch, budgetPool } = this.props;
    const { filterData: originFilterData } = budgetPool;
    if (isEqual(filterData, originFilterData)) {
      this.reloadData();
    }
    dispatch({
      type: 'budgetPool/updateState',
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
      type: 'budgetPool/updateState',
      payload: {
        filterData: {},
      },
    });
  };

  handlerShowFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        showFilter: true,
      },
    });
  };

  handlerCloseFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        showFilter: false,
      },
    });
  };

  handlerFitlerDate = currentViewDate => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        currentViewDate,
      },
    });
  };

  itemEnableConfirm = item => {
    const { dispatch } = this.props;
    const rowId = get(item, 'id');
    const poolCode = get(item, 'code');
    this.confirmModal = Modal.confirm({
      title: `启用确认`,
      content: `确定要启用池号为 ${poolCode} 的预算吗？`,
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '确定',
      onOk: () => {
        return new Promise(resolve => {
          this.confirmModal.update({
            okButtonProps: { type: 'primary', loading: true },
            cancelButtonProps: { disabled: true },
          });
          this.setState({ rowId });
          dispatch({
            type: 'budgetPool/poolItemEnable',
            payload: [rowId],
            callback: res => {
              this.setState({ rowId: null });
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

  itemDiableConfirm = item => {
    const { dispatch } = this.props;
    const rowId = get(item, 'id');
    const poolCode = get(item, 'code');
    this.confirmModal = Modal.confirm({
      title: `停用确认`,
      content: `确定要停用池号为 ${poolCode} 的预算吗？`,
      okButtonProps: { type: 'primary' },
      style: { top: '20%' },
      okText: '确定',
      onOk: () => {
        return new Promise(resolve => {
          this.confirmModal.update({
            okButtonProps: { type: 'primary', loading: true },
            cancelButtonProps: { disabled: true },
          });
          this.setState({ rowId });
          dispatch({
            type: 'budgetPool/poolItemDisable',
            payload: [rowId],
            callback: res => {
              this.setState({ rowId: null });
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

  getFilters = () => {
    const { budgetPool } = this.props;
    const { filterData } = budgetPool;
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
    return { filters, hasFilter };
  };

  handlerSearchChange = v => {
    this.listCardRef.handlerSearchChange(v);
  };

  handlerPressEnter = () => {
    this.listCardRef.handlerPressEnter();
  };

  handlerSearch = v => {
    this.listCardRef.handlerSearch(v);
  };

  renderCustomTool = (total, hasFilter) => {
    this.total = total;
    return (
      <>
        <div>
          <Button onClick={this.reloadData}>刷新</Button>
        </div>
        <Space>
          <Search
            allowClear
            placeholder="输入池号、维度关键字"
            onChange={e => this.handlerSearchChange(e.target.value)}
            onSearch={this.handlerSearch}
            onPressEnter={this.handlerPressEnter}
            style={{ width: 260 }}
          />
          <span
            className={cls('filter-btn', { 'has-filter': hasFilter })}
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
      </>
    );
  };

  renderSubField = item => {
    const actived = get(item, 'actived');
    const subFields = this.getDisplaySubDimensionFields(item);
    if (subFields.length > 0) {
      return (
        <Descriptions
          className={cls({ disabled: !actived })}
          key={`sub${item.id}`}
          column={1}
          bordered={false}
        >
          {subFields.map(f => {
            return (
              <Descriptions.Item key={`sub${item.id}${f.dimension}`} label={f.title}>
                {get(item, f.value) || '-'}
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      );
    }
    return null;
  };

  renderDescription = item => {
    const balance = get(item, 'balance');
    const currency = get(item, 'currencyCode');
    const startDate = get(item, 'startDate');
    const endDate = get(item, 'endDate');
    const actived = get(item, 'actived');
    return (
      <>
        {this.renderSubField(item)}
        <div className="money-box">
          <div className={cls('field-item', { disabled: !actived })}>
            <span className="label">预算余额</span>
            <span>
              <Money
                prefix={currency}
                className={balance < 0 ? 'red' : ''}
                value={get(item, 'balance')}
              />
              <span style={{ marginLeft: 8 }}>
                {item.roll ? <Tag color="magenta">可结转</Tag> : null}
                {item.use ? <Tag color="cyan">业务可用</Tag> : null}
              </span>
            </span>
          </div>
        </div>
        <div className={cls('field-item', { disabled: !actived })}>
          <span className="label">有效期</span>
          <span>{`${startDate} ~ ${endDate}`}</span>
        </div>
      </>
    );
  };

  renderMasterTitle = item => {
    const poolCode = get(item, 'code');
    const actived = get(item, 'actived');
    return (
      <>
        <div className={cls('pool-box', { disabled: !actived })}>
          <span className="title">池号</span>
          <span className="no">{poolCode}</span>
          {actived === false ? (
            <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已停用</span>
          ) : null}
        </div>
        <div
          className={cls('master-title', { disabled: !actived })}
        >{`${item.periodName} ${item.itemName}`}</div>
      </>
    );
  };

  getDisplaySubDimensionFields = item => {
    const {
      budgetPool: { subDimensionFields },
    } = this.props;
    const fields = [];
    subDimensionFields.forEach(f => {
      if (get(item, f.dimension) !== 'none') {
        fields.push(f);
      }
    });
    return fields;
  };

  renderActivedBtn = item => {
    const { loading } = this.props;
    const actived = get(item, 'actived');
    const { rowId } = this.state;
    const doing =
      loading.effects['budgetPool/poolItemEnable'] || loading.effects['budgetPool/poolItemDisable'];
    if (doing && rowId === item.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    if (actived) {
      return (
        <ExtIcon
          className="action-item item-disabled"
          tooltip={{ title: '停用', placement: 'bottom' }}
          type="close-circle"
          onClick={() => this.itemDiableConfirm(item)}
          antd
        />
      );
    }
    return (
      <ExtIcon
        className="action-item item-enable"
        tooltip={{ title: '启用', placement: 'bottom' }}
        type="check-circle"
        onClick={() => this.itemEnableConfirm(item)}
        antd
      />
    );
  };

  renderAction = item => {
    return (
      <Space size={16}>
        {this.renderActivedBtn(item)}
        <ExtIcon
          className="action-item"
          onClick={() => this.showLogDetail(item)}
          tooltip={{ title: '日志', placement: 'bottom' }}
          type="profile"
          antd
        />
      </Space>
    );
  };

  render() {
    const { budgetPool } = this.props;
    const { showFilter, filterData, recordItem, showLog } = budgetPool;
    const filterProps = {
      showFilter,
      filterData,
      onFilterSubmit: this.handlerFilterSubmit,
      onCloseFilter: this.handlerCloseFilter,
      showLog,
    };
    const { filters, hasFilter } = this.getFilters();
    const listProps = {
      simplePagination: false,
      showArrow: false,
      showSearch: false,
      rowCheck: false,
      pagination: {
        pageSize: 50,
        pageSizeOptions: ['50', '100', '200', '500'],
      },
      className: styles['pool-item-box'],
      onListCardRef: ref => (this.listCardRef = ref),
      customTool: ({ total }) => this.renderCustomTool(total, hasFilter),
      onSelectChange: this.handlerSelectPool,
      remotePaging: true,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/pool/findByPage`,
        loaded: () => {
          this.forceUpdate();
        },
      },
      cascadeParams: {
        sortOrders: [
          { property: 'itemName', direction: 'ASC' },
          { property: 'startDate', direction: 'ASC' },
        ],
        filters,
      },
      searchProperties: [
        'code',
        'itemName',
        'periodName',
        'projectName',
        'orgName',
        'udf1Name',
        'udf2Name',
        'udf3Name',
        'udf4Name',
        'udf5Name',
      ],
      itemField: {
        title: this.renderMasterTitle,
        description: this.renderDescription,
        extra: this.renderAction,
      },
    };
    const logDetailProps = {
      poolItem: recordItem,
      handlerClose: this.closeLog,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Content
            className={cls('main-content', 'auto-height')}
            style={{ paddingRight: showLog ? 8 : 0 }}
          >
            <ListCard {...listProps} />
            <Filter {...filterProps} />
            <span className="page-summary">{`共 ${this.total} 项`}</span>
          </Content>
          <Sider width={showLog ? 780 : 0} className="auto-height" theme="light">
            <Suspense fallback={<PageLoader />}>
              <LogDetail {...logDetailProps} />
            </Suspense>
          </Sider>
        </Layout>
      </div>
    );
  }
}

export default BudgetPool;
