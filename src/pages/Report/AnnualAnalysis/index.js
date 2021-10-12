import React, { Component } from 'react';
import { get } from 'lodash';
import { connect } from 'dva';
import { Decimal } from 'decimal.js';
import cls from 'classnames';
import { Divider, Progress } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, Money, message } from 'suid';
import { BudgetYearPicker, MasterView } from '@/components';
import { constants, exportXls } from '@/utils';
import TrendView from './TrendView';
import ItemView from './ItemView';
import styles from './index.less';

const { SERVER_PATH } = constants;

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
    const { dispatch } = this.props;
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        currentMaster,
      },
    });
    dispatch({
      type: 'annualAnalysis/getSubjectYears',
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
    const { dispatch } = this.props;
    dispatch({
      type: 'annualAnalysis/updateState',
      payload: {
        itemCodes: keys,
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

  exportData = () => {
    const {
      annualAnalysis: { currentMaster, year },
    } = this.props;
    if (currentMaster) {
      const cols = ['费用科目代码', '费用科目名称', '预算总额', '已使用', '使用比例'];
      exportXls(
        `${get(currentMaster, 'name')}-${year}年-预算费用科目执行明细`,
        cols,
        this.localData,
      );
    } else {
      message.destroy();
      message.warning('请选择预算主体');
    }
  };

  render() {
    const {
      annualAnalysis: { showTrend, rowData, year, years, currentMaster, itemCodes },
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
          this.localData = [];
          (res.data || []).forEach(r => {
            let percent = 0;
            if (r.injectAmount > 0) {
              const rate = new Decimal(r.usedAmount).div(new Decimal(r.injectAmount));
              percent = new Decimal(rate).mul(new Decimal(100)).toFixed(2);
            }
            this.localData.push({
              item: r.item,
              itemName: r.itemName,
              injectAmount: r.injectAmount,
              usedAmount: r.usedAmount,
              rate: `${percent}%`,
            });
          });
        },
      },
    };
    if (subjectId && year) {
      Object.assign(tableProps, {
        cascadeParams: {
          subjectId,
          year,
          itemCodes,
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
