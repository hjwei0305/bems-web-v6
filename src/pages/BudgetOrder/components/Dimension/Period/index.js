import React, { useCallback, useMemo, useRef } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button } from 'antd';
import { ExtTable } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;

const Period = ({ subjectId, periodType, onSelectChange }) => {
  const tablRef = useRef();

  const reloadData = useCallback(() => {
    if (tablRef && tablRef.current) {
      tablRef.current.remoteDataRefresh();
    }
  }, []);

  const handerSelectChange = useCallback((_keys, items) => {
    if (onSelectChange && onSelectChange instanceof Function) {
      const data = items.map(it => {
        return {
          text: it.name,
          value: it.id,
        };
      });
      onSelectChange(data);
    }
  }, []);

  const tableProps = useMemo(() => {
    const columns = [
      {
        title: '期间名称',
        dataIndex: 'name',
        width: 320,
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        width: 120,
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        width: 120,
      },
    ];
    const toolBarProps = {
      left: (
        <>
          <Button onClick={reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
    };
    return {
      toolBar: toolBarProps,
      columns,
      checkbox: true,
      onSelectRow: handerSelectChange,
      onTableRef: ref => (tablRef.current = ref),
      searchPlaceHolder: '输入期间名称关键字',
      searchProperties: ['name'],
      searchWidth: 260,
      store: {
        url: `${SERVER_PATH}/bems-v6/dimensionComponent/getBudgetPeriods`,
      },
      lineNumber: false,
      allowCustomColumns: false,
      cascadeParams: {
        subjectId,
        type: periodType,
      },
    };
  }, [subjectId, periodType]);

  return (
    <div className={styles['container-box']}>
      <ExtTable {...tableProps} />
    </div>
  );
};

export default Period;
