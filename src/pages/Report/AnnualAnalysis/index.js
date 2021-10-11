import React, { Component } from 'react';
import { get } from 'lodash';
import { connect } from 'dva';
import { Decimal } from 'decimal.js';
import cls from 'classnames';
import { Divider, Progress } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, Money } from 'suid';
import { BudgetYearPicker, MasterView } from '@/components';
import { constants } from '@/utils';
import TrendView from './TrendView';
import styles from './index.less';

const { SERVER_PATH } = constants;

@connect(({ annualAnalysis, loading }) => ({ annualAnalysis, loading }))
class AnnualAnalysis extends Component {
  static tablRef;

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
        filterData,
        currentMaster,
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

  render() {
    const {
      annualAnalysis: { showTrend, rowData, year, currentMaster },
    } = this.props;
    const subjectId = get(currentMaster, 'id');
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
        width: 180,
        required: true,
        align: 'center',
        render: (t, r) => {
          let percent = 0;
          if (r.injectAmount > 0) {
            const rate = new Decimal(r.usedAmount).div(new Decimal(r.injectAmount));
            percent = new Decimal(rate).mul(new Decimal(100)).toNumber();
          }
          let status = 'active';
          if (percent >= 80) {
            status = 'exception';
          }
          return (
            <Progress
              style={{ width: 160 }}
              status={status}
              percent={percent}
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
      },
    };
    if (subjectId && year) {
      Object.assign(tableProps, {
        cascadeParams: {
          subjectId,
          year,
        },
      });
    }
    const trendViewProps = {
      onClose: this.handlerCloseTrendView,
      showTrend,
      rowData,
      year: '2021',
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
