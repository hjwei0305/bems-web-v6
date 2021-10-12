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
    y.push(`${i}月`);
  }
  return y;
};
const TrendView = props => {
  const { onClose, showTrend, year, years, rowData } = props;
  const [loading, setLoading] = useState(false);
  const [trendYear, setTrendYear] = useState([]);

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
          right: '10%',
          feature: {
            saveAsImage: {
              name: `${subjectName}-${titles}-${imgName}`,
              title: '下载图表',
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
  }, [rowData, seriesData]);

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
