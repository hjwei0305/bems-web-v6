import React, { useCallback, useEffect, useMemo, useState, useImperativeHandle } from 'react';
import { Card } from 'antd';
import { ListCard, utils, ListLoader } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, PERIOD_TYPE } = constants;
const { request } = utils;
let listRef;
const Period = props => {
  const { subjectId, year, periodType, onSelectChange = () => {}, periodRef } = props;
  const [loading, setLoading] = useState(false);
  const [periodData, sePeriodData] = useState([]);

  useImperativeHandle(periodRef, () => ({
    clearData: () => {
      onSelectChange([]);
      listRef.manualUpdateItemChecked([]);
    },
  }));

  const loadAllPeriods = useCallback(() => {
    const { key: periodTypeCode } = periodType;
    setLoading(true);
    const params = {
      subjectId,
      year,
    };
    if (periodTypeCode !== PERIOD_TYPE.ALL.key) {
      Object.assign(params, { type: periodTypeCode });
    }
    request({
      url: `${SERVER_PATH}/bems-v6/period/getBySubject`,
      params,
    })
      .then(res => {
        if (res.success) {
          sePeriodData(res.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [periodType, subjectId, year]);

  useEffect(() => {
    if (subjectId) {
      loadAllPeriods();
    }
  }, [loadAllPeriods, subjectId]);

  const handlerSelectChange = useCallback(
    keys => {
      onSelectChange(keys);
    },
    [onSelectChange],
  );

  const renderItemTitle = useCallback(item => {
    if (item.closed) {
      return (
        <>
          <span style={{ color: 'rgba(0,0,0,0.35)' }}>{item.name}</span>
          <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已停用</span>
        </>
      );
    }
    return item.name;
  }, []);

  const renderList = useMemo(() => {
    const listProps = {
      title: '期间',
      pagination: false,
      showSearch: false,
      showArrow: false,
      checkbox: true,
      dataSource: periodData,
      onListCardRef: ref => (listRef = ref),
      itemField: {
        title: renderItemTitle,
        description: item => `${item.startDate}~${item.endDate}`,
      },
      onSelectChange: handlerSelectChange,
    };
    return <ListCard {...listProps} />;
  }, [handlerSelectChange, periodData, renderItemTitle]);

  return (
    <Card
      bordered={false}
      size="small"
      className={styles['dimension-item']}
      bodyStyle={{ height: '100%' }}
    >
      {loading ? <ListLoader /> : <>{renderList}</>}
    </Card>
  );
};

export default Period;
