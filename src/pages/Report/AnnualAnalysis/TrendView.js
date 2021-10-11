import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { get } from 'lodash';
import { Drawer } from 'antd';
import { ExtEcharts, BannerTitle, ExtIcon, utils, ListLoader } from 'suid';
import { constants } from '@/utils';
import styles from './TrendView.less';

const { request } = utils;
const { SERVER_PATH } = constants;
const getMonthData = () => {
  const y = [];
  for (let i = 1; i < 13; i += 1) {
    y.push(`${i}月`);
  }
  return y;
};
const TrendView = props => {
  const { onClose, showTrend, year, rowData } = props;
  const [loading, setLoading] = useState(false);
  const [trendYear, setTrendYear] = useState([]);

  const getTrendData = useCallback(() => {
    const subjectId = get(rowData, 'subjectId');
    const item = get(rowData, 'item');
    const url = `${SERVER_PATH}/bems-v6/report/annualUsageTrend/${subjectId}/${item}`;
    setLoading(true);
    request({
      method: 'POST',
      url,
      data: [year],
    })
      .then(res => {
        if (res.success) {
          setTrendYear(res.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rowData, year]);

  useEffect(() => {
    if (showTrend) {
      getTrendData();
    }
  }, [getTrendData, showTrend]);

  const title = useMemo(() => {
    return (
      <>
        <ExtIcon className="trigger-back" type="left" antd onClick={onClose} />
        <BannerTitle title={`${year}年度-${get(rowData, 'itemName')}`} subTitle="使用趋势图" />
      </>
    );
  }, [onClose, rowData, year]);

  const seriesData = useMemo(() => {
    return Object.keys(trendYear).map(y => {
      return {
        name: `${y}年`,
        data: trendYear[y],
        type: 'line',
        lineStyle: {
          width: 1,
        },
        areaStyle: {
          opacity: 0.6,
        },
        emphasis: {
          focus: 'series',
        },
        smooth: true,
      };
    });
  }, [trendYear]);

  const chartProps = useMemo(() => {
    const extChartProps = {
      option: {
        // color: ['#cf720d', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {},
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: getMonthData(),
        },
        yAxis: {
          type: 'value',
          axisLabel: '元',
        },
        series: seriesData,
      },
    };
    return extChartProps;
  }, [seriesData]);

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
