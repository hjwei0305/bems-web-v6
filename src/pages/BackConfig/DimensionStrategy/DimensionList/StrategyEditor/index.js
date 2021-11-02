import React, { useCallback, useMemo, useState } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Dropdown, Input } from 'antd';
import { ListCard, ExtIcon, Space } from 'suid';
import styles from './index.less';

const { Search } = Input;
let listCardRef;

const StrategyEditor = props => {
  const {
    labelTitle,
    store,
    rowData,
    displayName,
    fieldId,
    onSave = () => {},
    dealId,
    saving,
  } = props;
  const [show, setShow] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([fieldId]);

  const handlerVisibleChange = useCallback(visible => {
    setShow(visible);
  }, []);

  const handlerSelectRow = useCallback(
    (keys, items) => {
      const [key] = keys;
      const [item] = items;
      setSelectedKeys([key]);
      onSave(item, rowData, () => {
        setShow(false);
        setSelectedKeys([]);
      });
    },
    [onSave, rowData],
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

  const renderCustomTool = useCallback(() => {
    return (
      <>
        <Search
          allowClear
          placeholder="输入名称关键字查询"
          onChange={e => handlerSearchChange(e.target.value)}
          onSearch={handlerSearch}
          onPressEnter={handlerPressEnter}
          style={{ width: '100%' }}
        />
      </>
    );
  }, [handlerPressEnter, handlerSearch, handlerSearchChange]);

  const renderTag = useCallback(
    ({ item }) => {
      return (
        <ExtIcon
          className={cls('tag', { actived: item.id === fieldId })}
          type="check-square"
          antd
        />
      );
    },
    [fieldId],
  );

  const renderListContent = useMemo(() => {
    const listProps = {
      title: labelTitle,
      showSearch: false,
      pagination: false,
      onSelectChange: handlerSelectRow,
      selectedKeys,
      rowKey: 'id',
      className: styles['float-box'],
      showArrow: false,
      itemField: {
        avatar: renderTag,
        title: item => item.name,
      },
      store,
      onListCardRef: ref => (listCardRef = ref),
      customTool: renderCustomTool,
    };
    return <ListCard {...listProps} />;
  }, [labelTitle, handlerSelectRow, selectedKeys, renderTag, store, renderCustomTool]);

  const renderTitle = useMemo(() => {
    if (saving && dealId === get(rowData, 'code')) {
      return (
        <div className="allow-edit">
          <ExtIcon type="loading" antd spin style={{ marginLeft: 4 }} />
        </div>
      );
    }
    if (displayName) {
      return (
        <div className="cell-item edit horizontal">
          <Space direction="vertical" size={0} className="text">
            {displayName}
          </Space>
          <ExtIcon type="down" antd />
        </div>
      );
    }
  }, [displayName, rowData, dealId, saving]);

  return (
    <Dropdown
      onVisibleChange={handlerVisibleChange}
      visible={show}
      overlay={renderListContent}
      trigger={['click']}
    >
      <div className={cls(styles['view-box'])}>{renderTitle}</div>
    </Dropdown>
  );
};
export default StrategyEditor;
