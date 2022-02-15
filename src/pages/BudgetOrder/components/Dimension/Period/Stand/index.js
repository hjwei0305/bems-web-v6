import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { ExtTable } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const localData = {};
let localSelectedKeys = {};

const Period = ({ subjectId, periodType, onSelectChange }) => {
  const tablRef = useRef();

  useEffect(() => {
    return () => {
      localSelectedKeys = {};
    };
  }, []);

  const triggerSelect = useCallback(() => {
    if (tablRef && tablRef.current) {
      const keys = Object.keys(localSelectedKeys);
      tablRef.current.manualSelectedRows(keys);
    }
  }, []);

  const triggerSelectChange = useCallback(() => {
    if (onSelectChange && onSelectChange instanceof Function) {
      const data = Object.keys(localSelectedKeys)
        .map(key => {
          const it = localData[key];
          if (it) {
            return {
              text: it.name,
              value: it.id,
            };
          }
          return null;
        })
        .filter(it => it !== null);
      onSelectChange(data);
    }
  }, [onSelectChange]);

  const handerSelectChange = useCallback(
    keys => {
      Object.keys(localSelectedKeys).forEach(key => {
        if (keys.indexOf(key) === -1) {
          delete localSelectedKeys[key];
        }
      });
      keys.forEach(k => {
        localSelectedKeys[k] = k;
      });
      triggerSelectChange();
    },
    [triggerSelectChange],
  );

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
    const selectedRowKeys = localSelectedKeys ? Object.keys(localSelectedKeys).map(key => key) : [];
    const tbProps = {
      columns,
      onSelectRow: handerSelectChange,
      onTableRef: ref => (tablRef.current = ref),
      selectedRowKeys,
      checkbox: true,
      searchPlaceHolder: '输入期间名称关键字',
      searchProperties: ['name'],
      searchWidth: 260,
      store: {
        url: `${SERVER_PATH}/bems-v6/dimensionComponent/getBudgetPeriods`,
        loaded: res => {
          (res.data || []).forEach(it => {
            localData[it.id] = it;
          });
          triggerSelect();
        },
      },
      lineNumber: false,
      allowCustomColumns: false,
      cascadeParams: {
        subjectId,
        type: periodType,
      },
    };
    return tbProps;
  }, [handerSelectChange, subjectId, periodType, triggerSelect]);

  return (
    <div className={styles['container-box']}>
      <ExtTable {...tableProps} />
    </div>
  );
};

export default Period;
