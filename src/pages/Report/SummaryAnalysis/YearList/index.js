import React, { useCallback, useMemo, useState } from 'react';
import cls from 'classnames';
import { Dropdown } from 'antd';
import { ExtIcon, ListCard } from 'suid';
import styles from './index.less';

const YearList = ({ style, onChange, year, years = [] }) => {
  const [dropShow, setDropShow] = useState(false);
  const [selectKey, setSelectKey] = useState([year]);
  const [title, setTitle] = useState(year ? `${year}年` : null);

  const onVisibleChange = v => {
    setDropShow(v);
  };

  const handlerSelectChange = useCallback(
    keys => {
      setSelectKey(keys);
      const [key] = keys;
      setTitle(`${key}年`);
      setDropShow(false);
      onChange(key);
    },
    [onChange],
  );

  const handlerClear = useCallback(
    e => {
      if (e) {
        e.stopPropagation();
      }
      const key = null;
      setSelectKey([]);
      setTitle(key);
      setDropShow(false);
      onChange(key);
    },
    [onChange],
  );

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
      selectedKeys: selectKey,
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
          height: 232,
          width: 120,
          backgroundColor: '#ffffff',
        }}
      >
        <div className="list-body" style={{ height: 232 }}>
          <ListCard {...listCardProps} />
        </div>
      </div>
    );
  }, [handlerSelectChange, selectKey, yeasData]);

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
        <span className="view-label">对比</span>
        <span className="view-content">
          {title || '无'}
          {title ? (
            <ExtIcon
              onClick={e => handlerClear(e)}
              className="clear-btn"
              antd
              type="close-circle"
              theme="filled"
            />
          ) : null}
        </span>
        <ExtIcon type="down" antd />
      </span>
    </Dropdown>
  );
};

export default YearList;
