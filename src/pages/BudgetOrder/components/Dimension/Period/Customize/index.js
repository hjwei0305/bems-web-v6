import React, { useCallback, useMemo, useRef, Suspense, useState, useEffect } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { formatMessage } from 'umi-plugin-react/locale';
import { Button, Popconfirm } from 'antd';
import { ExtTable, Space, PageLoader, utils, ExtIcon, message } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const FormModal = React.lazy(() => import('./FormModal'));
const { SERVER_PATH } = constants;
const { request } = utils;
let localSelectedKeys = {};

const Period = ({ subjectId, periodType, onSelectChange }) => {
  const tablRef = useRef();
  const [localData, setLocalData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    return () => {
      localSelectedKeys = {};
      setLocalData([]);
    };
  }, []);

  const triggerSelectChange = useCallback(
    tbData => {
      if (onSelectChange && onSelectChange instanceof Function) {
        const data = Object.keys(localSelectedKeys)
          .map(key => {
            const [it] = tbData.filter(item => item.id === key);
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
    },
    [onSelectChange],
  );

  const add = useCallback(() => {
    setRowData(null);
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
            const ds = [res.data];
            setLocalData(ds);
            triggerSelectChange(ds);
          } else {
            message.destroy();
            message.error(res.message);
          }
        })
        .finally(() => {
          setSaving(false);
        });
    },
    [subjectId, triggerSelectChange],
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
            const data = localData.filter(it => it.id !== row.id);
            setLocalData(data);
            triggerSelectChange(data);
          } else {
            message.destroy();
            message.error(res.message);
          }
        })
        .finally(() => {
          setRowData(null);
          setDeleting(false);
        });
    },
    [localData, triggerSelectChange],
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
    return (
      <Button type="primary" size="small" ghost onClick={() => add()}>
        新建期间
      </Button>
    );
  }, [add]);

  const tableProps = useMemo(() => {
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (_text, record) => (
          <span className={cls('action-box')} onClick={e => e.stopPropagation()}>
            {renderDelBtn(record)}
          </span>
        ),
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
      left: <Space>{renderCustomize}</Space>,
    };
    const selectedRowKeys = localSelectedKeys ? Object.keys(localSelectedKeys).map(key => key) : [];
    const tbProps = {
      toolBar: toolBarProps,
      columns,
      dataSource: localData,
      onTableRef: ref => (tablRef.current = ref),
      selectedRowKeys,
      lineNumber: false,
      showSearch: false,
      allowCustomColumns: false,
      cascadeParams: {
        subjectId,
        type: periodType,
      },
    };
    return tbProps;
  }, [renderCustomize, localData, subjectId, periodType, renderDelBtn]);

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
