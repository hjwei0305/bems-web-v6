import React, { useCallback, useState } from 'react';
import cls from 'classnames';
import { connect, useSelector, useDispatch } from 'dva';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { get, isEmpty, isNumber } from 'lodash';
import { Input, Tag, Button, Menu, Badge } from 'antd';
import { ExtIcon, ExtTable, Money, Space } from 'suid';
import { MasterView } from '@/components';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, POOL_OPERATION } = constants;
const POOL_OPERATION_DATA = Object.keys(POOL_OPERATION).map(key => POOL_OPERATION[key]);
let tableRef;
let searchInput;
let tmpFilterData;

const filterFields = {
  eventName: { fieldName: 'eventName', operation: 'LK' },
  operation: { fieldName: 'operation', operation: 'EQ' },
  poolCode: { fieldName: 'poolCode', operation: 'RLK' },
  amount: { fieldName: 'eventName', operation: 'EQ' },
  bizCode: { fieldName: 'bizCode', operation: 'LK' },
  bizRemark: { fieldName: 'bizRemark', operation: 'LK' },
};

const LogRecord = () => {
  const [filter, setFilter] = useState({});
  const dispatch = useDispatch();
  const { currentMaster } = useSelector(sel => sel.logRecord);
  const reloadData = () => {
    if (tableRef) {
      tableRef.remoteDataRefresh();
    }
  };

  const handleColumnSearch = useCallback(
    (selectedKeys, dataIndex, confirm) => {
      const filterData = { ...filter };
      Object.assign(filterData, { [dataIndex]: selectedKeys[0] });
      confirm();
      tmpFilterData = { ...filterData };
      setFilter(filterData);
    },
    [filter],
  );

  const handleColumnSearchReset = useCallback(
    (dataIndex, clearFilter) => {
      const filterData = { ...filter };
      Object.assign(filterData, { [dataIndex]: '' });
      clearFilter();
      tmpFilterData = { ...filterData };
      setFilter(filterData);
    },
    [filter],
  );

  const onOperationChange = useCallback(
    (e, dataIndex, setSelectedKeys, confirm, clearFilters) => {
      const filterData = { ...filter };
      if (e.key === POOL_OPERATION.ALL.key) {
        clearFilters();
        Object.assign(filterData, { [dataIndex]: null });
      } else {
        setSelectedKeys(e.key);
        Object.assign(filterData, { [dataIndex]: e.key });
        confirm();
      }
      tmpFilterData = { ...filterData };
      setFilter(filterData);
    },
    [filter],
  );

  const getColumnSearchComponent = useCallback(
    (dataIndex, setSelectedKeys, selectedKeys, confirm, clearFilters) => {
      if (dataIndex === 'operation') {
        const selectedKey = get(tmpFilterData, 'operation') || POOL_OPERATION.ALL.key;
        return (
          <div
            style={{
              padding: 0,
              maxHeight: 300,
              height: 210,
              width: 160,
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Menu
              className={cls(styles['oper-box'])}
              onClick={e => onOperationChange(e, dataIndex, setSelectedKeys, confirm, clearFilters)}
              selectedKeys={[`${selectedKey}`]}
            >
              {POOL_OPERATION_DATA.map(m => {
                return (
                  <Menu.Item key={m.key}>
                    {m.key === selectedKey ? (
                      <ExtIcon type="check" className="selected" antd />
                    ) : null}
                    <span className="view-popover-box-trigger">
                      <Badge color={m.color === '' ? '#d9d9d9' : m.color} />
                      {m.title}
                    </span>
                  </Menu.Item>
                );
              })}
            </Menu>
          </div>
        );
      }
      return (
        <div style={{ padding: 8, width: 320, boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}>
          <Input
            ref={node => (searchInput = node)}
            placeholder="输入关键字查询"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleColumnSearch(selectedKeys, dataIndex, confirm)}
            style={{ width: '100%', marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => handleColumnSearch(selectedKeys, dataIndex, confirm)}
            icon="search"
            size="small"
            style={{ width: 70, marginRight: 8 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => handleColumnSearchReset(dataIndex, clearFilters)}
            size="small"
            style={{ width: 70 }}
          >
            重置
          </Button>
        </div>
      );
    },
    [handleColumnSearch, handleColumnSearchReset, onOperationChange],
  );

  const getColumnSearchProps = useCallback(
    dataIndex => {
      return {
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) =>
          getColumnSearchComponent(dataIndex, setSelectedKeys, selectedKeys, confirm, clearFilters),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              if (searchInput) {
                searchInput.select();
              }
            });
          }
        },
      };
    },
    [getColumnSearchComponent],
  );

  const handlerMasterSelect = useCallback(
    master => {
      dispatch({
        type: 'logRecord/updateState',
        payload: {
          currentMaster: master,
        },
      });
    },
    [dispatch],
  );

  const getExtTableProps = useCallback(() => {
    const columns = [
      {
        title: '类型',
        dataIndex: 'operation',
        align: 'center',
        width: 120,
        ...getColumnSearchProps('operation'),
        render: t => {
          const st = POOL_OPERATION[t];
          if (st) {
            return <Tag color={st.color}>{st.title}</Tag>;
          }
          return t;
        },
      },
      {
        title: '事件',
        dataIndex: 'eventName',
        width: 180,
        ...getColumnSearchProps('eventName'),
      },
      {
        title: '发生金额',
        dataIndex: 'amount',
        width: 140,
        align: 'right',
        className: 'amount-title',
        ...getColumnSearchProps('amount'),
        render: t => {
          return (
            <Money style={{ fontWeight: 700 }} className={cls(t < 0 ? 'red' : '')} value={t} />
          );
        },
      },
      {
        title: '预算池号',
        dataIndex: 'poolCode',
        width: 180,
        ...getColumnSearchProps('poolCode'),
      },
      {
        title: '业务编号',
        dataIndex: 'bizCode',
        width: 180,
        ...getColumnSearchProps('bizCode'),
      },
      {
        title: '业务描述',
        dataIndex: 'bizRemark',
        width: 300,
        ...getColumnSearchProps('bizRemark'),
      },
      {
        title: '业务来源',
        dataIndex: 'bizFrom',
        width: 100,
      },
      {
        title: '发生时间',
        dataIndex: 'opTime',
        width: 180,
      },
      {
        title: '操作者',
        dataIndex: 'opUserName',
        width: 160,
        render: (t, r) => `${t}(${r.opUserAccount})`,
      },
    ];
    const filters = [{ fieldName: 'subjectId', operator: 'EQ', value: get(currentMaster, 'id') }];
    Object.keys(filter).forEach(key => {
      const filterField = get(filterFields, key);
      if (filterField) {
        const value = get(filter, key, null);
        if (!isEmpty(value) || isNumber(value)) {
          filters.push({ fieldName: key, operator: get(filterField, 'operation'), value });
        }
      }
    });
    const toolBarProps = {
      left: (
        <Space>
          <MasterView onChange={handlerMasterSelect} />
          <Button onClick={reloadData}>
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </Space>
      ),
    };
    const props = {
      toolBar: toolBarProps,
      columns,
      bordered: false,
      showSearch: false,
      lineNumber: false,
      remotePaging: true,
      searchWidth: 260,
      storageId: 'a8634c7e-b67d-4d8e-848f-b078afd96bd3',
      sort: {
        field: { opTime: null },
      },
      cascadeParams: {
        filters,
      },
    };
    if (currentMaster) {
      Object.assign(props, {
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/report/getLogRecords`,
        },
      });
    }
    return props;
  }, [currentMaster, filter, getColumnSearchProps, handlerMasterSelect]);

  return <ExtTable onTableRef={ref => (tableRef = ref)} {...getExtTableProps()} />;
};

export default connect(({ logRecord }) => ({ logRecord }))(LogRecord);
