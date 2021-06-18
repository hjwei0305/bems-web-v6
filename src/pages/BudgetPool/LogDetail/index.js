import React, { useState } from 'react';
import cls from 'classnames';
import { get, isEmpty, isNumber } from 'lodash';
import { Card, Input, Tag, Button, Menu, Badge } from 'antd';
import { BannerTitle, ExtIcon, ExtTable, Space, Money } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, POOL_OPERATION } = constants;
const POOL_OPERATION_DATA = Object.keys(POOL_OPERATION).map(key => POOL_OPERATION[key]);
let tableRef;
let searchInput;

const filterFields = {
  operation: { fieldName: 'operation', operation: 'EQ' },
  eventName: { fieldName: 'eventName', operation: 'LK' },
  amount: { fieldName: 'eventName', operation: 'EQ' },
  bizCode: { fieldName: 'bizCode', operation: 'LK' },
  bizRemark: { fieldName: 'bizRemark', operation: 'LK' },
};

const LogDetail = ({ poolItem, handlerClose }) => {
  const [filter, setFilter] = useState({});

  const reloadData = () => {
    if (tableRef) {
      tableRef.remoteDataRefresh();
    }
  };

  const renderTitle = () => {
    const title = `池号 ${get(poolItem, 'code')}`;
    return (
      <>
        <ExtIcon onClick={handlerClose} type="double-right" className="trigger-back" antd />
        <BannerTitle title={title} subTitle="执行日志" />
      </>
    );
  };

  const handleColumnSearch = (selectedKeys, dataIndex, confirm) => {
    const filterData = { ...filter };
    Object.assign(filterData, { [dataIndex]: selectedKeys[0] });
    confirm();
    setFilter(filterData);
  };

  const handleColumnSearchReset = (dataIndex, clearFilter) => {
    const filterData = { ...filter };
    Object.assign(filterData, { [dataIndex]: '' });
    clearFilter();
    setFilter(filterData);
  };

  const onOperationChange = (e, dataIndex, setSelectedKeys, confirm, clearFilters) => {
    const filterData = { ...filter };
    if (e.key === POOL_OPERATION.ALL.key) {
      clearFilters();
      Object.assign(filterData, { [dataIndex]: null });
    } else {
      setSelectedKeys(e.key);
      Object.assign(filterData, { [dataIndex]: e.key });
      confirm();
    }
    setFilter(filterData);
  };

  const getColumnSearchComponent = (
    dataIndex,
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  ) => {
    if (dataIndex === 'operation') {
      const selectedKey = get(filter, 'operation') || POOL_OPERATION.ALL.key;
      return (
        <div
          style={{
            padding: 8,
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
  };

  const getColumnSearchProps = dataIndex => {
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
  };

  const getFilters = () => {
    const poolCode = get(poolItem, 'code');
    const filters = [{ fieldName: 'poolCode', operator: 'EQ', value: poolCode }];
    Object.keys(filter).forEach(key => {
      const filterField = get(filterFields, key);
      if (filterField) {
        const value = get(filter, key, null);
        if (!isEmpty(value) || isNumber(value)) {
          filters.push({ fieldName: key, operator: get(filterField, 'operation'), value });
        }
      }
    });
    return filters;
  };

  const columns = [
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
        return <Money style={{ fontWeight: 700 }} className={cls(t < 0 ? 'red' : '')} value={t} />;
      },
    },
    {
      title: '类型',
      dataIndex: 'operation',
      width: 80,
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
    {
      title: '业务编号',
      dataIndex: 'bizCode',
      width: 180,
      ...getColumnSearchProps('bizCode'),
    },
    {
      title: '业务来源',
      dataIndex: 'bizFrom',
      width: 100,
      optional: true,
    },
    {
      title: '业务描述',
      dataIndex: 'bizRemark',
      width: 300,
      optional: true,
      ...getColumnSearchProps('bizRemark'),
    },
  ];
  const filters = getFilters();

  const renderCustomTool = () => {
    return (
      <Space>
        <ExtIcon
          tooltip={{ title: '刷新' }}
          type="reload"
          className="action-item"
          antd
          onClick={reloadData}
        />
      </Space>
    );
  };

  const props = {
    columns,
    bordered: false,
    showSearch: false,
    remotePaging: true,
    lineNumber: false,
    searchWidth: 260,
    storageId: '36e28135-9faa-4094-ae62-f994d3ab4fdf',
    searchProperties: ['bizCode', 'bizEvent', 'bizFrom', 'bizRemark'],
    sort: {
      field: { opTime: 'desc' },
    },
    cascadeParams: {
      filters,
    },
  };

  const poolCode = get(poolItem, 'code');
  if (poolCode) {
    Object.assign(props, {
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/pool/findRecordByPage`,
      },
    });
  }

  return (
    <Card
      bordered={false}
      title={renderTitle()}
      className={cls(styles['log-box'])}
      extra={renderCustomTool()}
    >
      <ExtTable onTableRef={ref => (tableRef = ref)} {...props} />
    </Card>
  );
};

export default LogDetail;
