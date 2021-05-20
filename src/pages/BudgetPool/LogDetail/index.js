import React from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Card, Input, Tooltip } from 'antd';
import { BannerTitle, ExtIcon, ExtTable, Space, Money } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;
let tableRef;

const LogDetail = ({ poolItem, handlerClose }) => {
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

  const getFilters = () => {
    const poolCode = get(poolItem, 'code');
    return [{ fieldName: 'poolCode', operator: 'EQ', value: poolCode }];
  };

  const columns = [
    {
      title: '发生额',
      dataIndex: 'amount',
      width: 140,
      align: 'right',
      className: 'amount-title',
      render: t => {
        return <Money value={t} />;
      },
    },
    {
      title: '发生时间',
      dataIndex: 'opTime',
      width: 180,
    },
    {
      title: '类型',
      dataIndex: 'operation',
      width: 100,
    },
    {
      title: '操作者',
      dataIndex: 'opUserName',
      width: 160,
      render: (t, r) => `${t}(${r.opUserAccount})`,
    },
    {
      title: '业务事件',
      dataIndex: 'bizEvent',
      width: 110,
    },
    {
      title: '业务来源',
      dataIndex: 'bizFrom',
      width: 110,
    },
    {
      title: '业务描述',
      dataIndex: 'bizRemark',
      width: 300,
    },
  ];
  const filters = getFilters();

  const handlerSearchChange = v => {
    tableRef.handlerSearchChange(v);
  };

  const handlerPressEnter = () => {
    tableRef.handlerPressEnter();
  };

  const handlerSearch = v => {
    tableRef.handlerSearch(v);
  };

  const renderCustomTool = () => {
    return (
      <Space>
        <Tooltip title="输入业务编码、业务事件、业务来源、业务描述关键字">
          <Search
            placeholder="输入业务编码、业务事件、业务来源、业务描述关键字"
            onChange={e => handlerSearchChange(e.target.value)}
            onSearch={handlerSearch}
            onPressEnter={handlerPressEnter}
            style={{ width: 280 }}
          />
        </Tooltip>
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
    allowCustomColumns: false,
    searchProperties: ['bizCode', 'bizEvent', 'bizFrom', 'bizRemark'],
    sort: {
      field: { opTime: 'desc' },
    },
    store: {
      type: 'POST',
      url: `${SERVER_PATH}/bems-v6/pool/findRecordByPage`,
    },
    cascadeParams: {
      filters,
    },
  };

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
