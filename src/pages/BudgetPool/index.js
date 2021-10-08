import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { Decimal } from 'decimal.js';
import { get, isEmpty, isNumber, isEqual } from 'lodash';
import cls from 'classnames';
import { FormattedMessage } from 'umi-plugin-react/locale';
import {
  Input,
  Descriptions,
  Tag,
  Modal,
  Layout,
  Button,
  Avatar,
  Tooltip,
  Progress,
  Divider,
  Statistic,
  Badge,
} from 'antd';
import { ListCard, ExtIcon, Space, PageLoader } from 'suid';
import { PeriodType, FilterView, BudgetYearPicker, FilterDimension } from '@/components';
import { constants } from '@/utils';
import noUse from '@/assets/no_use.svg';
import Filter from './components/Filter';
import MasterView from './components/MasterView';
import styles from './index.less';

const LogDetail = React.lazy(() => import('./LogDetail'));
const { SERVER_PATH, PERIOD_TYPE } = constants;
const { Search } = Input;
const { Content } = Layout;
const filterFields = {
  subjectId: { fieldName: 'subjectId', operator: 'EQ', form: false },
  org: { fieldName: 'org', operator: 'IN', form: false },
  item: { fieldName: 'item', operator: 'IN', form: false },
  period: { fieldName: 'period', operator: 'IN', form: false },
  project: { fieldName: 'project', operator: 'IN', form: false },
  startDate: { fieldName: 'startDate', operator: 'LE', fieldType: 'date', form: true },
  endDate: { fieldName: 'endDate', operator: 'GE', fieldType: 'date', form: true },
};

@connect(({ budgetPool, loading }) => ({ budgetPool, loading }))
class BudgetPool extends Component {
  static listCardRef;

  static total;

  static confirmModal;

  constructor() {
    super();
    this.total = 0;
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

  handlerMasterSelect = currentMaster => {
    const { dispatch, budgetPool } = this.props;
    const { filterData: originFilterData } = budgetPool;
    const subjectId = get(currentMaster, 'id');
    const filterData = { ...originFilterData, subjectId };
    dispatch({
      type: 'budgetPool/getMasterDimension',
      payload: {
        subjectId,
      },
    });
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        filterData,
        currentMaster,
      },
    });
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
    const { dispatch, budgetPool } = this.props;
    const {
      filterData: { subjectId },
    } = budgetPool;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        filterData: { subjectId },
      },
    });
  };

  handlerSubmitDimension = dimension => {
    const {
      dispatch,
      budgetPool: { filterData },
    } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        filterData: {
          ...filterData,
          ...dimension,
        },
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

  itemEnableConfirm = (item, e) => {
    e.stopPropagation();
    const { dispatch } = this.props;
    const rowId = get(item, 'id');
    const poolCode = get(item, 'code');
    this.confirmModal = Modal.confirm({
      title: `解冻确认`,
      content: `确定要解冻池号为 ${poolCode} 的预算吗？`,
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
            type: 'budgetPool/poolItemEnable',
            payload: [rowId],
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

  itemDiableConfirm = (item, e) => {
    e.stopPropagation();
    const { dispatch } = this.props;
    const rowId = get(item, 'id');
    const poolCode = get(item, 'code');
    this.confirmModal = Modal.confirm({
      title: `冻结确认`,
      content: `确定要冻结池号为 ${poolCode} 的预算吗？`,
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
            type: 'budgetPool/poolItemDisable',
            payload: [rowId],
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

  trundleConfirm = (item, e) => {
    e.stopPropagation();
    const { dispatch } = this.props;
    const id = get(item, 'id');
    const poolCode = get(item, 'code');
    this.confirmModal = Modal.confirm({
      title: `滚动结转确认`,
      content: `确定要滚动结转池号为 ${poolCode} 的预算吗？`,
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
            type: 'budgetPool/trundle',
            payload: { id },
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

  handlerPeriodTypeChange = selectPeriodType => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        selectPeriodType,
      },
    });
  };

  handlerBudgetYearChange = year => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        year,
      },
    });
  };

  getFilters = () => {
    const { budgetPool } = this.props;
    const { filterData, selectPeriodType, year } = budgetPool;
    let hasFilter = false;
    const filters = [{ fieldName: 'year', operator: 'EQ', value: year }];
    if (selectPeriodType.key !== PERIOD_TYPE.ALL.key) {
      filters.push({ fieldName: 'periodType', operator: 'EQ', value: selectPeriodType.key });
    }
    Object.keys(filterData).forEach(key => {
      const filterField = get(filterFields, key);
      if (filterField) {
        const value = get(filterData, key, null);
        const form = get(filterField, 'form');
        if (!isEmpty(value) || isNumber(value)) {
          if (form) {
            hasFilter = true;
          }
          const fit = { fieldName: key, operator: get(filterField, 'operator'), value };
          const fieldType = get(filterField, 'fieldType');
          if (fieldType) {
            Object.assign(fit, { fieldType });
          }
          filters.push(fit);
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
    const { budgetPool } = this.props;
    const { selectPeriodType, periodTypeData, year, currentMaster, masterDimension } = budgetPool;
    return (
      <>
        <div>
          <MasterView onChange={this.handlerMasterSelect} />
          <Divider type="vertical" />
          <BudgetYearPicker onYearChange={this.handlerBudgetYearChange} value={year} />
          <Divider type="vertical" />
          <FilterView
            title="期间类型"
            iconType=""
            currentViewType={selectPeriodType}
            viewTypeData={periodTypeData}
            onAction={this.handlerPeriodTypeChange}
            reader={{
              title: 'title',
              value: 'key',
            }}
          />
          <Divider type="vertical" />
          <FilterDimension
            submitDimension={this.handlerSubmitDimension}
            dimensions={masterDimension}
            subjectId={get(currentMaster, 'id')}
            year={year}
            periodType={selectPeriodType}
          />
        </div>
        <Space>
          <Search
            allowClear
            placeholder="输入池号、期间、科目关键字"
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
    const actived = get(item, 'actived');
    return (
      <>
        {!actived ? (
          <embed src={noUse} style={{ position: 'absolute' }} type="image/svg+xml" />
        ) : null}
        {this.renderSubField(item)}
        <div className="money-box">
          <div className={cls('field-item', { disabled: !actived })}>
            {item.strategyName ? <Tag color="purple">{item.strategyName}</Tag> : null}
            {item.roll ? <Tag color="magenta">可结转</Tag> : null}
            {item.use ? <Tag color="cyan">业务可用</Tag> : null}
          </div>
        </div>
      </>
    );
  };

  renderActivedBtn = item => {
    const actived = get(item, 'actived');
    if (actived) {
      return (
        <Button type="danger" size="small" onClick={e => this.itemDiableConfirm(item, e)}>
          冻结
        </Button>
      );
    }
    return (
      <Button type="primary" ghost size="small" onClick={e => this.itemEnableConfirm(item, e)}>
        解冻
      </Button>
    );
  };

  renderMasterTitle = item => {
    const poolCode = get(item, 'code');
    const actived = get(item, 'actived');
    const startDate = get(item, 'startDate');
    const endDate = get(item, 'endDate');
    const roll = get(item, 'roll') || false;
    return (
      <>
        <div className={cls('pool-box', { disabled: !actived })}>
          <Space>
            <span>
              <span className="title">池号</span>
              <span className="no">{poolCode}</span>
              <Tooltip title="有效期">
                <span
                  style={{ color: '#999', fontSize: 12, marginLeft: 8 }}
                >{`(${startDate} ~ ${endDate})`}</span>
              </Tooltip>
            </span>
            {roll ? (
              <Button size="small" onClick={e => this.trundleConfirm(item, e)}>
                滚动结转
              </Button>
            ) : null}
            {this.renderActivedBtn(item)}
            <Button size="small" onClick={() => this.showLogDetail(item)}>
              日志
            </Button>
          </Space>
        </div>
        <div
          className={cls('master-title', { disabled: !actived })}
        >{`${item.periodName} ${item.itemName}(${item.item})`}</div>
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

  renderAction = item => {
    const { totalAmount, usedAmount, balance, currencyCode } = item;
    let percent = 0;
    if (totalAmount > 0) {
      const rate = new Decimal(usedAmount).div(new Decimal(totalAmount));
      percent = new Decimal(rate).mul(new Decimal(100)).toNumber();
    }
    let status = 'active';
    if (percent >= 80) {
      status = 'exception';
    }
    return (
      <Space direction="vertical" size={0}>
        <Space split={<Divider type="vertical" />}>
          <Statistic
            style={{ minWidth: 140 }}
            title={
              <span>
                <Badge status="success" />
                预算总额
              </span>
            }
            value={totalAmount}
            precision={2}
            prefix={currencyCode}
          />
          <Statistic
            style={{ minWidth: 140 }}
            title={
              <>
                <Badge status="processing" />
                已使用
              </>
            }
            value={usedAmount}
            precision={2}
          />
          <Statistic
            style={{ minWidth: 140 }}
            title={
              <>
                <Badge status="warning" />
                可用余额
              </>
            }
            value={balance}
            precision={2}
          />
        </Space>
        <Progress
          style={{ width: 460 }}
          status={status}
          percent={percent}
          strokeWidth={14}
          format={p => `${p}%`}
          size="small"
        />
      </Space>
    );
  };

  renderAvatar = ({ item }) => {
    const periodType = PERIOD_TYPE[item.periodType];
    return (
      <Tooltip title="预算期间类型" placement="bottomRight">
        <Avatar
          shape="square"
          style={{ verticalAlign: 'middle', backgroundColor: periodType.backColor || '' }}
          size={42}
        >
          <PeriodType periodTypeKey={item.periodType} />
        </Avatar>
      </Tooltip>
    );
  };

  render() {
    const { budgetPool } = this.props;
    const {
      showFilter,
      filterData,
      recordItem,
      showLog,
      currentMaster,
      masterDimension,
      year,
      selectPeriodType,
    } = budgetPool;
    const filterProps = {
      year,
      selectPeriodType,
      currentMaster,
      masterDimension,
      showFilter,
      filterData,
      onFilterSubmit: this.handlerFilterSubmit,
      onCloseFilter: this.handlerCloseFilter,
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
      searchProperties: [
        'code',
        'item',
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
        avatar: this.renderAvatar,
        title: this.renderMasterTitle,
        description: this.renderDescription,
        extra: this.renderAction,
      },
    };
    const subjectId = get(filterData, 'subjectId');
    if (subjectId) {
      Object.assign(listProps, {
        remotePaging: true,
        cascadeParams: {
          sortOrders: [
            { property: 'itemName', direction: 'ASC' },
            { property: 'startDate', direction: 'ASC' },
          ],
          filters,
        },
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/pool/findByPage`,
          loaded: () => {
            this.forceUpdate();
          },
        },
      });
    }
    const logDetailProps = {
      poolItem: recordItem,
      handlerClose: this.closeLog,
      showLog,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Content className={cls('main-content', 'auto-height')}>
            <ListCard {...listProps} />
            <Filter {...filterProps} />
            <span className="page-summary">{`共 ${this.total} 项`}</span>
          </Content>
        </Layout>
        <Suspense fallback={<PageLoader />}>
          <LogDetail {...logDetailProps} />
        </Suspense>
      </div>
    );
  }
}

export default BudgetPool;
