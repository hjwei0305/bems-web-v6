import React, { useCallback, useMemo, useState, useImperativeHandle } from 'react';
import { differenceWith, unionWith } from 'lodash';
import { Card, Row, Col, Button, Input } from 'antd';
import { ListCard, Space } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { Search } = Input;
const { SERVER_PATH } = constants;
let assignedListRef;
let unassignedListRef;
const Subject = props => {
  const { subjectId, onSelectChange = () => {}, subjectRef } = props;
  const [assignedItems, setAssignedItems] = useState([]);
  const [waitAssignedSelect, setWaitAssignedSelect] = useState([]);
  const [waitUnassignedSelect, setWaitUnassignedSelect] = useState([]);

  useImperativeHandle(subjectRef, () => ({
    clearData: () => {
      onSelectChange([]);
      setAssignedItems([]);
      assignedListRef.manualUpdateItemChecked([]);
      unassignedListRef.manualUpdateItemChecked([]);
    },
  }));

  const handlerRemove = useCallback(() => {
    const data = differenceWith(assignedItems, waitUnassignedSelect, (c, n) => c.code === n.code);
    setAssignedItems(data);
    setWaitUnassignedSelect([]);
    assignedListRef.manualUpdateItemChecked([]);
    unassignedListRef.manualUpdateItemChecked([]);
    onSelectChange(data.map(it => it.code));
  }, [assignedItems, onSelectChange, waitUnassignedSelect]);

  const handlerAssign = useCallback(() => {
    const data = unionWith(assignedItems, waitAssignedSelect, (c, n) => c.code === n.code);
    setAssignedItems(data);
    setWaitAssignedSelect([]);
    assignedListRef.manualUpdateItemChecked([]);
    unassignedListRef.manualUpdateItemChecked([]);
    onSelectChange(data.map(it => it.code));
  }, [assignedItems, onSelectChange, waitAssignedSelect]);

  const handlerAssignedSelectChange = useCallback((_, items) => {
    setWaitAssignedSelect(items);
  }, []);

  const handlerUnassignedSelectChange = useCallback((_, items) => {
    setWaitUnassignedSelect(items);
  }, []);

  const renderItemTitle = useCallback(item => {
    if (item.frozen) {
      return (
        <>
          <span style={{ color: 'rgba(0,0,0,0.35)' }}>{item.name}</span>
          <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已停用</span>
        </>
      );
    }
    return item.name;
  }, []);

  const renderAssignedList = useMemo(() => {
    const listProps = {
      title: '查询科目',
      pagination: false,
      showSearch: false,
      showArrow: false,
      checkbox: true,
      rowKey: 'code',
      dataSource: assignedItems,
      onListCardRef: ref => (assignedListRef = ref),
      itemField: {
        title: renderItemTitle,
        description: item => item.code,
      },
      onSelectChange: handlerUnassignedSelectChange,
    };
    return <ListCard {...listProps} />;
  }, [assignedItems, handlerUnassignedSelectChange, renderItemTitle]);

  const handlerSearchChange = useCallback(v => {
    unassignedListRef.handlerSearchChange(v);
  }, []);

  const handlerPressEnter = useCallback(() => {
    unassignedListRef.handlerPressEnter();
  }, []);

  const handlerSearch = useCallback(v => {
    unassignedListRef.handlerSearch(v);
  }, []);

  const renderCustomTool = useCallback(
    () => (
      <>
        <Search
          allowClear
          placeholder="输入科目名称关键字"
          onChange={e => handlerSearchChange(e.target.value)}
          onSearch={handlerSearch}
          onPressEnter={handlerPressEnter}
          style={{ width: '100%' }}
        />
      </>
    ),
    [handlerPressEnter, handlerSearch, handlerSearchChange],
  );

  const renderUnassignedList = useMemo(() => {
    const listProps = {
      title: '可选科目',
      showSearch: false,
      showArrow: false,
      checkbox: true,
      remotePaging: true,
      rowKey: 'code',
      onListCardRef: ref => (unassignedListRef = ref),
      customTool: renderCustomTool,
      itemField: {
        title: renderItemTitle,
        description: item => item.code,
      },
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/item/findBySubject`,
      },
      cascadeParams: {
        subjectId,
        filters: [
          { fieldName: 'code', operator: 'NOTIN', value: assignedItems.map(it => it.code) },
        ],
      },
      onSelectChange: handlerAssignedSelectChange,
    };
    return <ListCard {...listProps} />;
  }, [assignedItems, handlerAssignedSelectChange, renderCustomTool, renderItemTitle, subjectId]);

  return (
    <Card
      bordered={false}
      size="small"
      className={styles['dimension-item']}
      bodyStyle={{ height: '100%' }}
    >
      <Row className="auto-height">
        <Col span={11} className="item-box auto-height">
          {renderUnassignedList}
        </Col>
        <Col span={2} className="item-box btn-box auto-height">
          <Space direction="vertical" size={32}>
            <Button
              icon="right"
              size="small"
              onClick={handlerAssign}
              disabled={waitAssignedSelect.length === 0}
            />
            <Button
              icon="left"
              size="small"
              onClick={handlerRemove}
              disabled={waitUnassignedSelect.length === 0}
            />
          </Space>
        </Col>
        <Col span={11} className="item-box auto-height">
          {renderAssignedList}
        </Col>
      </Row>
    </Card>
  );
};

export default Subject;
