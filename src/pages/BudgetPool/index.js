import React, { Component } from 'react';
import { connect } from 'dva';
import { get, isEmpty, isNumber, isEqual } from 'lodash';
import cls from 'classnames';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Input, Descriptions, Tag, Button } from 'antd';
import { ListCard, ExtIcon, Money, Space } from 'suid';
import { constants } from '@/utils';
import Filter from './components/Filter';
import ExtAction from './components/ExtAction';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;
const filterFields = {
  subjectId: { fieldName: 'subjectId', operation: 'EQ' },
  applyOrgId: { fieldName: 'applyOrgId', operation: 'EQ' },
};

@connect(({ budgetPool, loading }) => ({ budgetPool, loading }))
class BudgetPool extends Component {
  static listCardRef;

  static total;

  constructor() {
    super();
    this.total = 0;
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPool/updateState',
      payload: {
        showFilter: false,
        filterData: {},
      },
    });
  }

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
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

  handlerAction = (key, record) => {
    console.log(record);
    switch (key) {
      default:
    }
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
          </span>
        </Space>
      </>
    );
  };

  renderSubField = item => {
    const subFields = this.getDisplaySubDimensionFields(item);
    if (subFields.length > 0) {
      return (
        <Descriptions key={`sub${item.id}`} column={1} bordered={false}>
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
    return (
      <>
        {this.renderSubField(item)}
        <div className="money-box">
          <div className="field-item">
            <span className="label">预算余额</span>
            <span>
              <Money
                prefix={currency}
                className={balance < 0 ? 'red' : ''}
                value={get(item, 'balance')}
              />
            </span>
          </div>
        </div>
        <div className="field-item">
          <span className="label">有效期</span>
          <span>{`${startDate} ~ ${endDate}`}</span>
        </div>
        <div className="field-item">
          {item.roll ? <Tag color="magenta">可结转</Tag> : null}
          {item.use ? <Tag color="cyan">业务可用</Tag> : null}
        </div>
      </>
    );
  };

  renderMasterTitle = item => {
    const poolCode = get(item, 'code');
    const actived = get(item, 'actived');
    return (
      <>
        <div className="pool-box">
          <span className="title">池号</span>
          <span className="no">{poolCode}</span>
          {actived === false ? (
            <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已停用</span>
          ) : null}
        </div>
        <div className="master-title">{`${item.periodName} ${item.itemName}`}</div>
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
    const id = get(item, 'id');
    return <ExtAction key={id} onAction={this.handlerAction} recordItem={item} />;
  };

  render() {
    const { budgetPool } = this.props;
    const { showFilter, filterData } = budgetPool;
    const filterProps = {
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
      remotePaging: true,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/pool/findByPage`,
        loaded: () => {
          this.forceUpdate();
        },
      },
      cascadeParams: {
        ...filters,
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
        avatar: ({ item }) => this.renderAction(item),
        title: this.renderMasterTitle,
        description: this.renderDescription,
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ListCard {...listProps} />
        <Filter {...filterProps} />
        <span className="page-summary">{`共 ${this.total} 项`}</span>
      </div>
    );
  }
}

export default BudgetPool;
