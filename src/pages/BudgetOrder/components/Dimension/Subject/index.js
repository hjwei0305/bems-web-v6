import React, { useCallback, useMemo, useRef } from 'react';
import { ExtTable } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;

const Subject = ({ subjectId, onSelectChange }) => {
  const tablRef = useRef();

  const reloadData = useCallback(() => {
    if (tablRef && tablRef.current) {
      tablRef.current.remoteDataRefresh();
    }
  }, []);

  const handerSelectChange = useCallback(
    (_keys, items) => {
      if (onSelectChange && onSelectChange instanceof Function) {
        const data = items.map(it => {
          return {
            text: it.name,
            value: it.code,
          };
        });
        onSelectChange(data);
      }
    },
    [onSelectChange],
  );

  const tableProps = useMemo(() => {
    const columns = [
      {
        title: '科目代码',
        dataIndex: 'code',
        width: 120,
        required: true,
      },
      {
        title: '科目名称',
        dataIndex: 'name',
        width: 420,
        required: true,
      },
    ];
    return {
      toolBar: null,
      columns,
      checkbox: true,
      onSelectRow: handerSelectChange,
      onTableRef: ref => (tablRef.current = ref),
      searchPlaceHolder: '输入科目名称关键字',
      searchProperties: ['name'],
      searchWidth: 260,
      store: {
        url: `${SERVER_PATH}/bems-v6/dimensionComponent/getBudgetItems`,
      },
      lineNumber: false,
      allowCustomColumns: false,
      cascadeParams: {
        subjectId,
      },
    };
  }, [subjectId, handerSelectChange, reloadData]);

  return (
    <div className={styles['container-box']}>
      <ExtTable {...tableProps} />
    </div>
  );
};

export default Subject;
