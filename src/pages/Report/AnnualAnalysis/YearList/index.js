import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import { Dropdown, Button } from 'antd';
import { ExtIcon, Space, ListCard } from 'suid';
import styles from './index.less';

const YearList = ({ style, onChange, year, years = [] }) => {
  const [dropShow, setDropShow] = useState(false);
  const [selectKeys, setSelectKeys] = useState([year]);
  const [title, setTitle] = useState('未选择');

  const titles = useMemo(() => {
    const ys = selectKeys.map(y => {
      return `${y}年`;
    });
    return ys.join('、');
  }, [selectKeys]);

  useEffect(() => {
    setTitle(titles);
  }, [titles]);

  const onVisibleChange = v => {
    setDropShow(v);
  };

  const handlerSelectChange = useCallback(keys => {
    setSelectKeys(keys);
  }, []);

  const handlerSelect = useCallback(() => {
    setTitle(titles);
    setDropShow(false);
    onChange(selectKeys);
  }, [onChange, selectKeys, titles]);

  const yeasData = useMemo(() => {
    return years.map(y => {
      return { id: y, name: `${y}年` };
    });
  }, [years]);

  const renderContent = useMemo(() => {
    const listCardProps = {
      dataSource: yeasData,
      showSearch: false,
      showArrow: false,
      pagination: false,
      checkbox: true,
      checkboxProps: item => {
        if (item.id === year) {
          return { disabled: true };
        }
        return { disabled: false };
      },
      selectedKeys: selectKeys,
      customTool: () => null,
      onSelectChange: handlerSelectChange,
      itemField: {
        title: item => item.name,
      },
    };
    return (
      <div
        style={{
          padding: 0,
          height: 280,
          width: 220,
          backgroundColor: '#ffffff',
        }}
      >
        <div className="list-body" style={{ height: 232 }}>
          <ListCard {...listCardProps} />
        </div>
        <div
          style={{
            display: 'flex',
            height: 48,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            borderTop: '1px solid #eee',
          }}
        >
          <div />
          <Space>
            <Button type="primary" onClick={handlerSelect}>
              查询
            </Button>
          </Space>
        </div>
      </div>
    );
  }, [handlerSelect, handlerSelectChange, selectKeys, year, yeasData]);

  return (
    <Dropdown
      trigger={['click']}
      overlay={renderContent}
      className="action-drop-down"
      placement="bottomLeft"
      visible={dropShow}
      overlayClassName={styles['filter-box']}
      onVisibleChange={onVisibleChange}
    >
      <span className={cls('cmp-filter-view', styles['view-box'])} style={style}>
        <span className="view-label">
          <ExtIcon type="filter" />
        </span>
        <span className="view-content">{title}</span>
        <ExtIcon type="down" antd />
      </span>
    </Dropdown>
  );
};

export default YearList;
