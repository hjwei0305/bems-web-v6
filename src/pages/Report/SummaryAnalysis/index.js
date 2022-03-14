import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Divider, Layout } from 'antd';
import { ExtIcon, ExtEcharts, ListLoader } from 'suid';
import { MasterView, FilterView } from '@/components';
import { constants } from '@/utils';
import YearList from './YearList';
import styles from './index.less';

const { PERIOD_TYPE } = constants;
const { Header, Content } = Layout;
@connect(({ summaryAnalysis, loading }) => ({ summaryAnalysis, loading }))
class SummaryAnalysis extends Component {
  reloadData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'summaryAnalysis/getOverviewData',
    });
  };

  handlerMasterSelect = currentMaster => {
    const { dispatch } = this.props;
    dispatch({
      type: 'summaryAnalysis/updateState',
      payload: {
        currentMaster,
      },
    });
    dispatch({
      type: 'summaryAnalysis/getSubjectDependenceData',
      payload: {
        subjectId: currentMaster.id,
      },
    });
    this.reloadData();
  };

  handlerPeriodTypeChange = selectPeriodType => {
    const { dispatch } = this.props;
    dispatch({
      type: 'summaryAnalysis/updateState',
      payload: {
        selectPeriodType,
      },
    });
    this.reloadData();
  };

  handlerCompareYearSelectChange = selectCompareYear => {
    const { dispatch } = this.props;
    dispatch({
      type: 'summaryAnalysis/updateState',
      payload: {
        selectCompareYear,
      },
    });
    this.reloadData();
  };

  getChartProps = () => {
    const {
      summaryAnalysis: { selectPeriodType, reportData },
    } = this.props;
    let option = {};
    const chartProps = { option };
    if (PERIOD_TYPE.ANNUAL.key === selectPeriodType.key && reportData.length === 1) {
      const data = [];
      const [ds] = reportData;
      data.push({ value: ds.balance[0], name: '余额' });
      data.push({ value: ds.used[0], name: '已使用' });
      option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {},
        series: [
          {
            type: 'pie',
            radius: '50%',
            label: {
              show: true,
              fontSize: 14,
            },
            labelLine: {
              smooth: true,
              lineStyle: { width: 2 },
            },
            data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
      chartProps.option = option;
    } else {
      let barWidth = 80;
      let xAxisData = [];
      let seriesData = [];
      if (selectPeriodType.key === PERIOD_TYPE.SEMIANNUAL.key) {
        xAxisData = ['上半年', '下半年'];
      }
      if (selectPeriodType.key === PERIOD_TYPE.QUARTER.key) {
        xAxisData = ['第一季度', '第二季度', '第三季度', '第四季度'];
      }
      if (selectPeriodType.key === PERIOD_TYPE.MONTHLY.key) {
        barWidth = null;
        xAxisData = [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ];
      }
      reportData.forEach(it => {
        const { year, balance, used } = it;
        const serieBalance = {
          name: `${year}年-余额`,
          type: 'bar',
          stack: `${year}`,
          barWidth,
          label: {
            show: true,
            position: 'top',
            formatter: params => {
              const { value } = params;
              if (value !== 0) {
                return value;
              }
              return '';
            },
          },
          emphasis: {
            focus: 'series',
          },
          data: balance,
        };
        const serieUsed = {
          name: `${year}年-已使用`,
          type: 'bar',
          stack: `${year}`,
          barWidth,
          label: {
            show: true,
            position: 'top',
            color: 'auto',
            formatter: params => {
              const { value } = params;
              if (value !== 0) {
                return value;
              }
              return '';
            },
          },
          emphasis: {
            focus: 'series',
          },
          data: used,
        };
        seriesData = seriesData.concat([serieBalance, serieUsed]);
      });
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: xAxisData,
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} 元',
            },
          },
        ],
        series: seriesData,
      };
      chartProps.option = option;
    }
    return chartProps;
  };

  render() {
    const { summaryAnalysis, loading } = this.props;
    const { selectPeriodType, periodTypeData, selectCompareYear, compareYears } = summaryAnalysis;
    return (
      <Layout className={cls(styles['container-box'])}>
        <Header className="tool-box">
          <MasterView onChange={this.handlerMasterSelect} />
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
          <YearList
            onChange={this.handlerCompareYearSelectChange}
            year={selectCompareYear}
            years={compareYears}
          />
          <Divider type="vertical" />
          <ExtIcon
            className="btn-icon"
            tooltip={{ title: '刷新' }}
            type="sync"
            antd
            onClick={this.reloadData}
          />
        </Header>
        <Content className="chart-body">
          {loading.global ? <ListLoader /> : <ExtEcharts {...this.getChartProps()} />}
        </Content>
      </Layout>
    );
  }
}

export default SummaryAnalysis;
