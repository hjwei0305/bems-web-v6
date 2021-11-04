import React, { Component } from 'react';
import { get, isEmpty, isNumber, omit } from 'lodash';
import { connect } from 'dva';
import { Decimal } from 'decimal.js';
import cls from 'classnames';
import { Divider, Progress } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, Money, message, Space } from 'suid';
import { BudgetYearPicker, MasterView, FilterDimension } from '@/components';
import { constants, exportXls } from '@/utils';
import TrendView from './TrendView';
import ItemView from './ItemView';
import styles from './index.less';

const { SERVER_PATH } = constants;
const filterFields = {
  subjectId: { fieldName: 'subjectId' },
  item: { fieldName: 'itemCodes' },
  org: { fieldName: 'orgIds' },
  project: { fieldName: 'projectCodes' },
  udf1: { fieldName: 'udf1s' },
};

const subDimensionsCols = {
  org: [
    {
      title: '组织机构',
      dataIndex: 'orgName',
      width: 220,
      required: true,
    },
  ],
  project: [
    {
      title: '项目代码',
      dataIndex: 'project',
      width: 180,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 320,
      required: true,
    },
  ],
};

const tip = '误差率=(|总注入-首次注入|/首次注入)*100%';

const formatMoney = rate => {
  const percent = new Decimal(rate).mul(new Decimal(100)).toFixed(2);
  if (rate < 0.1) {
    return `${percent}%`;
  }
  if (rate > 0.1 && rate <= 0.3) {
    return <span style={{ color: '#fa8c16' }}>{`${percent}%`}</span>;
  }
  if (rate > 0.3) {
    return <span style={{ color: '#f5222d' }}>{`${percent}%`}</span>;
  }
};

const getDeviationRate = (initInjectAmount, injectAmount, format = false) => {
  if (initInjectAmount > 0) {
    const amount = new Decimal(injectAmount)
      .sub(new Decimal(initInjectAmount))
      .abs()
      .toNumber();
    const rate = new Decimal(amount).div(new Decimal(initInjectAmount));
    if (format) {
      return formatMoney(rate);
    }
    const reate = new Decimal(rate).mul(new Decimal(100)).toFixed(2);
    return `${reate}%`;
  }
  return 'N/A';
};

const getDeviation = (initInjectAmount, injectAmount) => {
  const amount = new Decimal(injectAmount)
    .sub(new Decimal(initInjectAmount))
    .abs()
    .toNumber();
  return amount;
};

@connect(({ subjectAnalysis, loading }) => ({ subjectAnalysis, loading }))
class SubjectAnalysis extends Component {
  static tablRef;

  static localData;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'subjectAnalysis/updateState',
      payload: {
        rowData: null,
        showTrend: false,
        filterData: {},
      },
    });
  }

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  handlerShowTrend = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'subjectAnalysis/updateState',
      payload: {
        rowData,
        showTrend: true,
      },
    });
  };

  handlerCloseTrendView = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'subjectAnalysis/updateState',
      payload: {
        rowData: false,
        showTrend: false,
      },
    });
  };

  handlerMasterSelect = currentMaster => {
    const { dispatch, subjectAnalysis } = this.props;
    const { filterData: originFilterData } = subjectAnalysis;
    const subjectId = get(currentMaster, 'id');
    const filterData = { ...originFilterData, subjectId };
    dispatch({
      type: 'subjectAnalysis/updateState',
      payload: {
        currentMaster,
        filterData,
      },
    });
    dispatch({
      type: 'subjectAnalysis/getSubjectDependenceData',
      payload: {
        subjectId: get(currentMaster, 'id'),
      },
    });
  };

  handlerBudgetYearChange = year => {
    const { dispatch } = this.props;
    dispatch({
      type: 'subjectAnalysis/updateState',
      payload: {
        year,
      },
    });
  };

  handlerItemChange = keys => {
    const {
      dispatch,
      subjectAnalysis: { filterData: originFilterData },
    } = this.props;
    const filterData = { ...originFilterData, item: keys };
    dispatch({
      type: 'subjectAnalysis/updateState',
      payload: {
        filterData,
      },
    });
  };

  handlerSubmitDimension = dimension => {
    const {
      dispatch,
      subjectAnalysis: { filterData: originFilterData },
    } = this.props;
    const filterData = { ...originFilterData, ...omit(dimension, ['item', 'period']) };
    dispatch({
      type: 'subjectAnalysis/updateState',
      payload: {
        filterData,
      },
    });
  };

  itemViewProps = () => {
    const {
      subjectAnalysis: { currentMaster },
    } = this.props;
    const itProps = {
      onChange: this.handlerItemChange,
      subjectId: get(currentMaster, 'id'),
    };
    return itProps;
  };

  getFilters = () => {
    const { subjectAnalysis } = this.props;
    const { filterData, year } = subjectAnalysis;
    const filters = { year };
    Object.keys(filterData).forEach(key => {
      const filterField = get(filterFields, key);
      if (filterField) {
        const value = get(filterData, key, null);
        if (!isEmpty(value) || isNumber(value)) {
          filters[filterField.fieldName] = value;
        }
      }
    });
    return { filters };
  };

  getSubCols = () => {
    const subCols = { cols: [], exportSubCols: [] };
    const {
      subjectAnalysis: { subDimensions, filterData },
    } = this.props;
    subDimensions.forEach(d => {
      if (filterData[d.code] && filterData[d.code].length > 0) {
        const col = subDimensionsCols[d.code];
        if (col) {
          subCols.cols = subCols.cols.concat(col);
        }
      }
    });
    subCols.cols.forEach(c => {
      subCols.exportSubCols.push(c.title);
    });
    return subCols;
  };

  exportData = () => {
    const {
      subjectAnalysis: { currentMaster, year },
    } = this.props;
    if (currentMaster) {
      const { exportSubCols, cols } = this.getSubCols();
      const expCols = [
        '费用科目代码',
        '费用科目名称',
        ...exportSubCols,
        '总注入',
        '总使用',
        '使用占比(总使用/总注入)',
        '误差额',
        `误差率【${tip}】`,
      ];
      const data = [];
      (this.localData || []).forEach(r => {
        let useRate = 0;
        if (r.injectAmount > 0) {
          const rate = new Decimal(r.usedAmount).div(new Decimal(r.injectAmount));
          useRate = new Decimal(rate).mul(new Decimal(100)).toFixed(2);
        }
        const deviationRate = getDeviationRate(r.initInjectAmount, r.injectAmount);
        const expFields = {};
        cols.forEach(c => {
          expFields[c.dataIndex] = get(r, c.dataIndex) || '';
        });
        const row = {
          item: r.item,
          itemName: r.itemName,
          ...expFields,
          injectAmount: r.injectAmount,
          usedAmount: r.usedAmount,
          useRate: `${useRate}%`,
          deviation: getDeviation(r.initInjectAmount, r.injectAmount),
          deviationRate: `${deviationRate}%`,
        };
        data.push(row);
      });
      const fileName = `${get(currentMaster, 'name')}-${year}年-执行明细`;
      exportXls(fileName, expCols, data);
    } else {
      message.destroy();
      message.warning('请选择预算主体');
    }
  };

  render() {
    const {
      subjectAnalysis: { showTrend, rowData, year, years, currentMaster, subDimensions },
    } = this.props;
    const { cols } = this.getSubCols();
    const subjectId = get(currentMaster, 'id');
    const { filters } = this.getFilters();
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (t, r) => (
          <span className={cls('action-box')}>
            <ExtIcon
              className="btn-icon"
              type="line-chart"
              antd
              onClick={() => this.handlerShowTrend(r)}
            />
          </span>
        ),
      },
      {
        title: '费用科目',
        dataIndex: 'itemName',
        width: 260,
        required: true,
      },
      ...cols,
      {
        title: '总注入',
        dataIndex: 'injectAmount',
        width: 180,
        required: true,
        align: 'right',
        render: t => <Money value={t} />,
      },
      {
        title: '总使用',
        dataIndex: 'usedAmount',
        width: 180,
        required: true,
        align: 'right',
        render: t => <Money value={t} />,
      },
      {
        title: (
          <Space>
            使用占比
            <ExtIcon
              type="question-circle"
              antd
              tooltip={{ title: '使用占比=(总使用/总注入)*100%' }}
            />
          </Space>
        ),
        dataIndex: 'useRate',
        width: 220,
        required: true,
        align: 'center',
        render: (t, r) => {
          let percent = 0;
          if (r.injectAmount > 0) {
            const rate = new Decimal(r.usedAmount).div(new Decimal(r.injectAmount));
            percent = new Decimal(rate).mul(new Decimal(100)).toFixed(2);
          }
          let status = 'active';
          if (percent >= 80) {
            status = 'exception';
          }
          return (
            <Progress
              style={{ width: 160 }}
              status={status}
              percent={Number(percent)}
              strokeWidth={14}
              format={p => `${p}%`}
              size="small"
            />
          );
        },
      },
      {
        title: '误差额',
        dataIndex: 'initInjectAmount',
        width: 180,
        required: true,
        align: 'right',
        render: (t, r) => {
          return getDeviation(r.initInjectAmount, r.injectAmount);
        },
      },
      {
        title: (
          <Space>
            误差率
            <ExtIcon type="question-circle" antd tooltip={{ title: tip }} />
          </Space>
        ),
        dataIndex: 'deviationRate',
        width: 80,
        required: true,
        align: 'center',
        render: (t, r) => getDeviationRate(r.initInjectAmount, r.injectAmount, true),
      },
    ];
    const toolBarProps = {
      layout: { leftSpan: 24 },
      left: (
        <>
          <MasterView onChange={this.handlerMasterSelect} />
          <Divider type="vertical" />
          <BudgetYearPicker onYearChange={this.handlerBudgetYearChange} value={year} />
          <Divider type="vertical" />
          <ItemView {...this.itemViewProps()} />
          <Divider type="vertical" />
          {subDimensions.length > 0 ? (
            <>
              <FilterDimension
                width={520}
                labelTitle="其它维度"
                submitDimension={this.handlerSubmitDimension}
                dimensions={subDimensions}
                subjectId={get(currentMaster, 'id')}
                year={year}
              />
              <Divider type="vertical" />
            </>
          ) : null}
          <ExtIcon
            className="btn-icon"
            tooltip={{ title: '导出xlsx' }}
            type="download"
            antd
            onClick={this.exportData}
          />
          <ExtIcon
            className="btn-icon"
            tooltip={{ title: '刷新' }}
            type="sync"
            antd
            onClick={this.reloadData}
          />
        </>
      ),
    };
    const tableProps = {
      toolBar: toolBarProps,
      columns,
      lineNumber: false,
      allowCustomColumns: false,
      showSearch: false,
      rowKey: 'item',
      onTableRef: ref => (this.tablRef = ref),
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/report/executionAnalysis`,
        loaded: res => {
          this.localData = res.data || [];
        },
      },
    };
    if (subjectId && year) {
      Object.assign(tableProps, {
        cascadeParams: {
          ...filters,
        },
      });
    }
    const trendViewProps = {
      subjectId,
      onClose: this.handlerCloseTrendView,
      showTrend,
      rowData,
      year,
      years,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...tableProps} />
        <TrendView {...trendViewProps} />
      </div>
    );
  }
}

export default SubjectAnalysis;
