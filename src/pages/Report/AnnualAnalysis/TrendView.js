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
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line',
            smooth: true,
          },
        ],
      },
    };
    return extChartProps;
  }, []);

  return (
    <Drawer
      height={460}
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
