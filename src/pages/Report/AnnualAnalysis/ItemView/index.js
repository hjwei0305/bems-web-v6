import React, { useCallback, useMemo, useRef, useState } from 'react';
import cls from 'classnames';
import { Dropdown, Button } from 'antd';
import { ExtIcon, Space } from 'suid';
import Subject from './Subject';
import styles from './index.less';

const ItemView = ({ style, onChange, subjectId }) => {
  const [dropShow, setDropShow] = useState(false);
  const [selectKeys, setSelectKeys] = useState([]);
  const [title, setTitle] = useState('未选择');
  const subjectRef = useRef();

  const onVisibleChange = v => {
    setDropShow(v);
  };

  const clearSelect = useCallback(() => {
    subjectRef.current.clearData();
    setSelectKeys([]);
  }, []);

  const handlerSelectChange = useCallback(keys => {
    setSelectKeys(keys);
  }, []);

  const handlerSelect = useCallback(() => {
    const tmpTitle = selectKeys.length > 0 ? `已选择(${selectKeys.length})` : '未选择';
    setTitle(tmpTitle);
    setDropShow(false);
    onChange(selectKeys);
  }, [onChange, selectKeys]);

  const renderContent = useMemo(() => {
    return (
      <div
        style={{
          padding: 8,
          height: 520,
          width: 620,
          backgroundColor: '#ffffff',
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
          <div />
          <Space>
            <Button onClick={clearSelect}>重置</Button>
            <Button type="primary" onClick={handlerSelect}>
              查询
            </Button>
          </Space>
        </div>
        <div className="list-body" style={{ height: 462 }}>
          <Subject
            subjectRef={subjectRef}
            subjectId={subjectId}
            onSelectChange={handlerSelectChange}
          />
        </div>
      </div>
    );
  }, [clearSelect, handlerSelect, handlerSelectChange, subjectId]);

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
          <em>科目</em>
        </span>
        <span className="view-content">{title}</span>
        <ExtIcon type="down" antd />
      </span>
    </Dropdown>
  );
};

export default ItemView;
