import React, { useMemo } from 'react';
import { get } from 'lodash';
import { Drawer } from 'antd';
import { ExtEcharts, BannerTitle, ExtIcon } from 'suid';
import styles from './TrendView.less';

const TrendView = props => {
  const { onClose, showTrend, year, rowData } = props;

  const title = useMemo(() => {
    return (
      <>
        <ExtIcon className="trigger-back" type="left" antd onClick={onClose} />
        <BannerTitle title={`${year}-${get(rowData, 'name')}`} subTitle="使用趋势图" />
      </>
    );
  }, [onClose, rowData, year]);

  const chartProps = useMemo(() => {
    const extChartProps = {
      option: {
        color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line',
            lineStyle: {
              width: 0,
            },
            areaStyle: {
              opacity: 0.8,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(255, 191, 0)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(224, 62, 76)', // 100% 处的颜色
                  },
                ],
                globalCoord: false, // 缺省为 false
              },
            },
            emphasis: {
              focus: 'series',
            },
            smooth: true,
          },
        ],
      },
    };
    return extChartProps;
  }, []);

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
      <ExtEcharts {...chartProps} />
    </Drawer>
  );
};

export default TrendView;
