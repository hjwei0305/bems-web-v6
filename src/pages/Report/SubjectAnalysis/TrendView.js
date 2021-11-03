import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { get } from 'lodash';
import { Drawer } from 'antd';
import { ExtEcharts, BannerTitle, ExtIcon, utils, ListLoader } from 'suid';
import { constants } from '@/utils';
import YearList from './YearList';
import styles from './TrendView.less';

const { request } = utils;
const { SERVER_PATH } = constants;
const getMonthData = () => {
  const y = [];
  for (let i = 1; i < 13; i += 1) {
    y.push(i);
  }
  return y;
};
const TrendView = props => {
  const { onClose, showTrend, year, years, rowData } = props;
  const [loading, setLoading] = useState(false);
  const [trendYear, setTrendYear] = useState({});

  const titles = useMemo(() => {
    const ys = Object.keys(trendYear).map(y => {
      return `${y}年`;
    });
    return ys.join('、');
  }, [trendYear]);

  const getTrendData = useCallback(
    (selectYears = [year]) => {
      const subjectId = get(rowData, 'subjectId');
      const item = get(rowData, 'item');
      const url = `${SERVER_PATH}/bems-v6/report/annualUsageTrend/${subjectId}/${item}`;
      setLoading(true);
      request({
        method: 'POST',
        url,
        data: selectYears,
      })
        .then(res => {
          if (res.success) {
            setTrendYear(res.data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [rowData, year],
  );

  useEffect(() => {
    if (showTrend) {
      getTrendData();
    }
  }, [getTrendData, showTrend]);

  const handlerYearSelectChange = useCallback(
    selectedYears => {
      getTrendData(selectedYears);
    },
    [getTrendData],
  );

  const title = useMemo(() => {
    return (
      <>
        <ExtIcon className="trigger-back" type="left" antd onClick={onClose} />
        <BannerTitle title={`${get(rowData, 'itemName')}`} subTitle="使用趋势图" />
        <YearList onChange={handlerYearSelectChange} year={year} years={years} />
      </>
    );
  }, [handlerYearSelectChange, onClose, rowData, year, years]);

  const seriesData = useMemo(() => {
    return Object.keys(trendYear).map(y => {
      const series = {
        name: `${y}年`,
        type: 'bar',
        data: trendYear[y],
        lineStyle: {
          width: 1,
        },
        emphasis: {
          focus: 'series',
        },
        smooth: true,
      };
      if (Number(y) === year) {
        Object.assign(series, {
          type: 'line',
          symbolSize: 10,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 10,
            shadowOffsetY: 8,
          },
        });
      }
      return series;
    });
  }, [trendYear, year]);

  const chartProps = useMemo(() => {
    const imgName = get(rowData, 'itemName');
    const subjectName = get(rowData, 'subjectName');
    const extChartProps = {
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        toolbox: {
          right: '5%',
          feature: {
            magicType: {
              show: true,
              title: { line: '切换为折线图', bar: '切换为柱状图' },
              type: ['line', 'bar'],
            },
            restore: { show: true, title: '还原' },
            saveAsImage: {
              name: `${subjectName}-${titles}-${imgName}`,
              title: '下载图表',
            },
          },
        },
        legend: {},
        grid: {
          left: '4%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value} 月',
          },
          data: getMonthData(),
        },
        yAxis: {
          type: 'value',
          boundaryGap: false,
          axisLine: { onZero: false },
          axisLabel: {
            formatter: '{value} 元',
          },
          splitLine: {
            show: false,
          },
        },
        series: seriesData,
      },
    };
    return extChartProps;
  }, [rowData, seriesData, titles]);

  return (
    <Drawer
      height={520}
      destroyOnClose
      getContainer={false}
      placement="bottom"
      visible={showTrend}
      title={title}
      className={styles['trend-box']}
      onClose={onClose}
      style={{ position: 'absolute' }}
    >
      {loading ? <ListLoader /> : <ExtEcharts {...chartProps} />}
    </Drawer>
  );
};

export default TrendView;
