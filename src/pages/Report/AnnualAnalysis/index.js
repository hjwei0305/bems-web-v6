import React, { Component } from 'react';
import { get, isEmpty, isNumber } from 'lodash';
import { connect } from 'dva';
import { Decimal } from 'decimal.js';
import cls from 'classnames';
import { Divider, Progress } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, Money, message } from 'suid';
import { BudgetYearPicker, MasterView, FilterDimension } from '@/components';
import { constants, exportXls } from '@/utils';
import TrendView from './TrendView';
import ItemView from './ItemView';
import styles from './index.less';

const { SERVER_PATH } = constants;
const filterFields = {
  subjectId: { fieldName: 'subjectId', operator: 'EQ' },
  org: { fieldName: 'org', operator: 'IN' },
  item: { fieldName: 'item', operator: 'IN' },
  period: { fieldName: 'period', operator: 'IN' },
  project: { fieldName: 'project', operator: 'IN' },
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

@connect(({ annualAnalysis, loading }) => ({ annualAnalysis, loading }))
class AnnualAnalysis extends Component {
  static tablRef;

  static localData;

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  handlerShowTrend = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        rowData,
        showTrend: true,
      },
    });
  };

  handlerCloseTrendView = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        rowData: false,
        showTrend: false,
      },
    });
  };

  handlerMasterSelect = currentMaster => {
    const { dispatch, annualAnalysis } = this.props;
    const { filterData: originFilterData } = annualAnalysis;
    const subjectId = get(currentMaster, 'id');
    const filterData = { ...originFilterData, subjectId };
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        currentMaster,
        filterData,
      },
    });
    dispatch({
      type: 'annualAnalysis/getSubjectDependenceData',
      payload: {
        subjectId: get(currentMaster, 'id'),
      },
    });
  };

  handlerBudgetYearChange = year => {
    const { dispatch } = this.props;
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        year,
      },
    });
  };

  handlerItemChange = keys => {
    const {
      dispatch,
      annualAnalysis: { filterData: originFilterData },
    } = this.props;
    const filterData = { ...originFilterData, item: keys };
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        filterData,
      },
    });
  };

  handlerSubmitDimension = dimension => {
    const {
      dispatch,
      annualAnalysis: { filterData: originFilterData },
    } = this.props;
    const filterData = { ...originFilterData, ...dimension };
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        filterData,
      },
    });
  };

  itemViewProps = () => {
    const {
      annualAnalysis: { currentMaster },
    } = this.props;
    const itProps = {
      onChange: this.handlerItemChange,
      subjectId: get(currentMaster, 'id'),
    };
    return itProps;
  };

  getFilters = () => {
    const { annualAnalysis } = this.props;
    const { filterData, year } = annualAnalysis;
    const filters = [{ fieldName: 'year', operator: 'EQ', value: year }];
    Object.keys(filterData).forEach(key => {
      const filterField = get(filterFields, key);
      if (filterField) {
        const value = get(filterData, key, null);
        if (!isEmpty(value) || isNumber(value)) {
          const fit = { fieldName: key, operator: get(filterField, 'operator'), value };
          const fieldType = get(filterField, 'fieldType');
          if (fieldType) {
            Object.assign(fit, { fieldType });
          }
          filters.push(fit);
        }
      }
    });
    return { filters };
  };

  getSubCols = () => {
    const subCols = { cols: [], exportSubCols: [] };
    const {
      annualAnalysis: { subDimensions, filterData },
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
      annualAnalysis: { currentMaster, year },
    } = this.props;
    if (currentMaster) {
      const { exportSubCols, cols } = this.getSubCols();
      const expCols = [
        '费用科目代码',
        '费用科目名称',
        ...exportSubCols,
        '预算总额',
        '已使用',
        '使用比例',
      ];
      const data = [];
      (this.localData || []).forEach(r => {
        let percent = 0;
        if (r.injectAmount > 0) {
          const rate = new Decimal(r.usedAmount).div(new Decimal(r.injectAmount));
          percent = new Decimal(rate).mul(new Decimal(100)).toFixed(2);
        }
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
          rate: `${percent}%`,
        };
        data.push(row);
      });
      const fileName = `${get(currentMaster, 'name')}-${year}年-预算费用科目执行明细`;
      exportXls(fileName, expCols, data);
    } else {
      message.destroy();
      message.warning('请选择预算主体');
    }
  };

  render() {
    const {
      annualAnalysis: { showTrend, rowData, year, years, currentMaster, subDimensions },
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
        title: '预算总额',
        dataIndex: 'injectAmount',
        width: 180,
        required: true,
        align: 'right',
        render: t => <Money value={t} />,
      },
      {
        title: '已使用',
        dataIndex: 'usedAmount',
        width: 180,
        required: true,
        align: 'right',
        render: t => <Money value={t} />,
      },
      {
        title: '使用比例',
        dataIndex: 'rate',
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
    ];
    const toolBarProps = {
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
        url: `${SERVER_PATH}/bems-v6/report/annualBudgetAnalysis`,
        loaded: res => {
          this.localData = res.data || [];
        },
      },
    };
    if (subjectId && year) {
      Object.assign(tableProps, {
        cascadeParams: {
          filters,
        },
      });
    }
    const trendViewProps = {
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

export default AnnualAnalysis;
