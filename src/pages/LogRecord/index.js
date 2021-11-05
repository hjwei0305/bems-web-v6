import React, { useCallback, useMemo, useState } from 'react';
import cls from 'classnames';
import { connect, useSelector, useDispatch } from 'dva';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { get, isEmpty, isNumber } from 'lodash';
import { Input, Tag, Button, Menu, Badge } from 'antd';
import { ExtIcon, ExtTable, Money, Space, ListCard } from 'suid';
import { MasterView } from '@/components';
import { constants } from '@/utils';
import FilterDate from './FilterDate';
import styles from './index.less';

const { SERVER_PATH, POOL_OPERATION, SEARCH_DATE_TIME_PERIOD } = constants;
const POOL_OPERATION_DATA = Object.keys(POOL_OPERATION).map(key => POOL_OPERATION[key]);
let tableRef;
let searchInput;
let tmpFilterData;
let listCardRef;

const { Search } = Input;

const filterFields = {
  eventCode: { fieldName: 'eventCode', operation: 'EQ' },
  operation: { fieldName: 'operation', operation: 'EQ' },
  poolCode: { fieldName: 'poolCode', operation: 'RLK' },
  amount: { fieldName: 'amount', operation: 'EQ' },
  bizCode: { fieldName: 'bizCode', operation: 'LK' },
  bizRemark: { fieldName: 'bizRemark', operation: 'LK' },
};

const LogRecord = () => {
  const { currentMaster, currentTimeViewType, initOpTime } = useSelector(sel => sel.logRecord);
  const [filter, setFilter] = useState({ opTime: initOpTime });
  const dispatch = useDispatch();
  const reloadData = () => {
    if (tableRef) {
      tableRef.remoteDataRefresh();
    }
  };

  const handleColumnSearch = useCallback(
    (selectedKeys, dataIndex, confirm) => {
      const filterData = { ...filter };
      if (dataIndex === 'eventName') {
        const { code, name } = selectedKeys[0];
        Object.assign(filterData, { eventName: name, eventCode: code });
      } else {
        Object.assign(filterData, { [dataIndex]: selectedKeys[0] });
      }
      confirm();
      tmpFilterData = { ...filterData };
      setFilter(filterData);
    },
    [filter],
  );

  const handleColumnSearchReset = useCallback(
    (dataIndex, clearFilter) => {
      const filterData = { ...filter };
      if (dataIndex === 'eventName') {
        Object.assign(filterData, { eventName: '', eventCode: '' });
      } else {
        Object.assign(filterData, { [dataIndex]: '' });
      }
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

  const handlerFitlerDate = useCallback(
    (dataIndex, currentDate, confirm) => {
      const { startTime = null, endTime = null } = currentDate;
      Object.assign(filter, {
        [dataIndex]: startTime === null || endTime === null ? null : [startTime, endTime],
      });
      confirm();
    },
    [filter],
  );

  const handlerSearchChange = useCallback(v => {
    listCardRef.handlerSearchChange(v);
  }, []);

  const handlerPressEnter = useCallback(() => {
    listCardRef.handlerPressEnter();
  }, []);

  const handlerSearch = useCallback(v => {
    listCardRef.handlerSearch(v);
  }, []);

  const renderCustomTool = useCallback(
    () => (
      <>
        <Search
          allowClear
          placeholder="输入代码或名称关键字"
          onChange={e => handlerSearchChange(e.target.value)}
          onSearch={handlerSearch}
          onPressEnter={handlerPressEnter}
          style={{ width: '100%' }}
        />
      </>
    ),
    [handlerPressEnter, handlerSearch, handlerSearchChange],
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
      if (dataIndex === 'eventName') {
        const eventName = get(filter, 'eventName') || '全部';
        const eventNameProps = {
          className: 'search-content',
          searchProperties: ['code', 'name'],
          showArrow: false,
          showSearch: false,
          selectedKeys,
          onSelectChange: (keys, items) => {
            setSelectedKeys(keys);
            handleColumnSearch(items, dataIndex, confirm);
          },
          store: {
            url: `${SERVER_PATH}/bems-v6/event/findAll`,
          },
          customTool: () => renderCustomTool(),
          onListCardRef: ref => (listCardRef = ref),
          itemField: {
            title: item => item.name,
            description: item => item.code,
          },
        };
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 420,
              height: 420,
              width: 320,
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                height: 42,
                padding: '0 24px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16 }}>{eventName}</div>
              <Button
                onClick={() => handleColumnSearchReset(dataIndex, clearFilters)}
                style={{ marginLeft: 8 }}
              >
                重置
              </Button>
            </div>
            <div className="list-body" style={{ height: 362 }}>
              <ListCard {...eventNameProps} />
            </div>
          </div>
        );
      }
      if (dataIndex === 'opTime') {
        return (
          <div style={{ padding: 8, width: 260, boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}>
            <FilterDate
              currentTimeViewType={currentTimeViewType}
              onAction={(timeViewType, currentDate) => {
                dispatch({
                  type: 'logRecord/updateState',
                  payload: {
                    currentTimeViewType: timeViewType,
                  },
                });
                const { startTime = null, endTime = null } = currentDate;
                setSelectedKeys(
                  startTime === null || endTime === null ? null : [startTime, endTime],
                );
                handlerFitlerDate(dataIndex, currentDate, confirm);
              }}
            />
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
    [
      currentTimeViewType,
      dispatch,
      filter,
      handleColumnSearch,
      handleColumnSearchReset,
      handlerFitlerDate,
      onOperationChange,
      renderCustomTool,
    ],
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
      setTimeout(() => {
        reloadData();
      }, 100);
    },
    [dispatch],
  );

  const renderColumnServiceName = useMemo(() => {
    const serviceName = get(filter, 'eventName') || '全部';
    return `事件(${serviceName})`;
  }, [filter]);

  const renderColumnTimestamp = useMemo(() => {
    return `发生时间(${currentTimeViewType.remark})`;
  }, [currentTimeViewType.remark]);

  const getFilters = useMemo(() => {
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
    if (SEARCH_DATE_TIME_PERIOD.ALL.name !== currentTimeViewType.name) {
      const timestamp = get(filter, 'opTime', null) || null;
      if (timestamp && timestamp.length === 2) {
        filters.push({
          fieldName: 'opTime',
          operator: 'GE',
          fieldType: 'date',
          value: timestamp[0],
        });
        filters.push({
          fieldName: 'opTime',
          operator: 'LE',
          fieldType: 'date',
          value: timestamp[1],
        });
      }
    }
    return filters;
  }, [currentMaster, currentTimeViewType.name, filter]);

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
        title: renderColumnServiceName,
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
        title: renderColumnTimestamp,
        dataIndex: 'opTime',
        width: 180,
        ...getColumnSearchProps('opTime'),
      },
      {
        title: '操作者',
        dataIndex: 'opUserName',
        width: 160,
        render: (t, r) => `${t}(${r.opUserAccount})`,
      },
    ];
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
      searchWidth: 260,
      storageId: 'a8634c7e-b67d-4d8e-848f-b078afd96bd3',
      sort: {
        field: { opTime: null },
      },
    };
    if (currentMaster) {
      Object.assign(props, {
        remotePaging: true,
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/report/getLogRecords`,
          params: {
            filters: getFilters,
          },
        },
      });
    }
    return props;
  }, [
    currentMaster,
    getColumnSearchProps,
    getFilters,
    handlerMasterSelect,
    renderColumnServiceName,
    renderColumnTimestamp,
  ]);

  return <ExtTable onTableRef={ref => (tableRef = ref)} {...getExtTableProps()} />;
};

export default connect(({ logRecord }) => ({ logRecord }))(LogRecord);
