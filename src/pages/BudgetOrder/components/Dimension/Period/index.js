import React, { useCallback, useMemo, useRef, Suspense, useState, useEffect } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Popconfirm } from 'antd';
import { ExtTable, Space, PageLoader, utils, ExtIcon } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const FormModal = React.lazy(() => import('./FormModal'));
const { SERVER_PATH, PERIOD_TYPE, ORDER_CATEGORY } = constants;
const { request } = utils;
const localData = {};
let localSelectedKeys = {};

const Period = ({ subjectId, periodType, onSelectChange, actionType }) => {
  const tablRef = useRef();
  const [showForm, setShowForm] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    return () => {
      localSelectedKeys = {};
    };
  }, []);

  const reloadData = useCallback(() => {
    if (tablRef && tablRef.current) {
      tablRef.current.remoteDataRefresh();
    }
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

  const add = useCallback(() => {
    setRowData(null);
    setShowForm(true);
  }, []);

  const edit = useCallback(row => {
    setRowData(row);
    setShowForm(true);
  }, []);

  const saveSubmit = useCallback(
    data => {
      setSaving(true);
      request({
        method: 'POST',
        url: `${SERVER_PATH}/bems-v6/period/saveCustomizePeriod`,
        data: {
          ...data,
          subjectId,
        },
      })
        .then(res => {
          if (res.success) {
            setShowForm(false);
            const id = get(res.data, 'id');
            localSelectedKeys[id] = id;
            triggerSelectChange();
            reloadData();
          }
        })
        .finally(() => {
          setSaving(false);
        });
    },
    [reloadData, subjectId, triggerSelectChange],
  );

  const del = useCallback(
    row => {
      setRowData(row);
      setDeleting(true);
      request({
        url: `${SERVER_PATH}/bems-v6/period/delete/${row.id}`,
        method: 'DELETE',
      })
        .then(res => {
          if (res.success) {
            delete localSelectedKeys[row.id];
            triggerSelectChange();
            reloadData();
          }
        })
        .finally(() => {
          setRowData(null);
          setDeleting(false);
        });
    },
    [reloadData, triggerSelectChange],
  );

  const closeFormModal = useCallback(() => {
    setShowForm(false);
  }, []);

  const renderDelBtn = useCallback(
    row => {
      if (deleting && rowData && rowData.id === row.id) {
        return <ExtIcon className="del-saving" type="loading" antd />;
      }
      return (
        <Popconfirm
          placement="topLeft"
          title={formatMessage({
            id: 'global.delete.confirm',
            defaultMessage: '确定要删除吗？提示：删除后不可恢复',
          })}
          onConfirm={() => del(row)}
        >
          <ExtIcon className="del" type="delete" antd />
        </Popconfirm>
      );
    },
    [del, deleting, rowData],
  );

  const renderCustomize = useMemo(() => {
    if (periodType === PERIOD_TYPE.CUSTOMIZE.key && actionType === ORDER_CATEGORY.INJECTION.key) {
      return (
        <Button type="primary" ghost onClick={() => add()}>
          自定义期间
        </Button>
      );
    }
    return null;
  }, [actionType, add, periodType]);

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
    if (periodType === PERIOD_TYPE.CUSTOMIZE.key && actionType === ORDER_CATEGORY.INJECTION.key) {
      columns.splice(0, 0, {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (_text, record) => (
          <span className={cls('action-box')} onClick={e => e.stopPropagation()}>
            <ExtIcon className="edit" onClick={() => edit(record)} type="edit" antd />
            {renderDelBtn(record)}
          </span>
        ),
      });
    }
    const toolBarProps = {
      left: (
        <Space>
          {renderCustomize}
          <Button onClick={reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </Space>
      ),
    };
    const selectedRowKeys = localSelectedKeys ? Object.keys(localSelectedKeys).map(key => key) : [];
    return {
      toolBar: toolBarProps,
      columns,
      checkbox: true,
      onSelectRow: handerSelectChange,
      onTableRef: ref => (tablRef.current = ref),
      searchPlaceHolder: '输入期间名称关键字',
      searchProperties: ['name'],
      searchWidth: 260,
      selectedRowKeys,
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
  }, [
    actionType,
    renderCustomize,
    reloadData,
    handerSelectChange,
    subjectId,
    periodType,
    renderDelBtn,
    edit,
    triggerSelect,
  ]);

  const getFormModalProps = useMemo(() => {
    const formProps = {
      rowData,
      showModal: showForm,
      savePeriod: saveSubmit,
      closeFormModal,
      saving,
    };
    return formProps;
  }, [closeFormModal, rowData, saveSubmit, saving, showForm]);

  return (
    <div className={styles['container-box']}>
      <ExtTable {...tableProps} />
      <Suspense fallback={<PageLoader />}>
        <FormModal {...getFormModalProps} />
      </Suspense>
    </div>
  );
};

export default Period;
