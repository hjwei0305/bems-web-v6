import React, { Component } from 'react';
import { get } from 'lodash';
import { connect } from 'dva';
import cls from 'classnames';
import { Divider } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon } from 'suid';
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
      annualAnalysis: { showTrend, rowData, year },
    } = this.props;
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
        dataIndex: 'item',
        width: 220,
        required: true,
      },
      {
        title: '预算总额',
        dataIndex: 'name',
        width: 280,
        required: true,
      },
      {
        title: '已使用',
        dataIndex: 'bizFrom',
        width: 180,
        required: true,
      },
      {
        title: '余额',
        dataIndex: 'label',
        width: 320,
      },
      {
        title: '比例',
        dataIndex: 'rank',
        width: 80,
        required: true,
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
      onTableRef: ref => (this.tablRef = ref),
      store: {
        url: `${SERVER_PATH}/bems-v6/event/findAll`,
      },
    };
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
