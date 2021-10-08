import React, { useCallback, useMemo, useImperativeHandle } from 'react';
import { trim } from 'lodash';
import { Card, Input, Avatar } from 'antd';
import { ListCard, ExtIcon } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { Search } = Input;
const { SERVER_PATH } = constants;
let listRef;
let searchValue;
const Project = props => {
  const { subjectId, onSelectChange = () => {}, projectRef } = props;

  useImperativeHandle(projectRef, () => ({
    clearData: () => {
      onSelectChange([]);
      listRef.manualUpdateItemChecked([]);
    },
  }));

  const handlerSelectChange = useCallback(
    keys => {
      onSelectChange(keys);
    },
    [onSelectChange],
  );

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

  const handlerSearchChange = useCallback(v => {
    searchValue = trim(v);
    listRef.props.cascadeParams.searchValue = trim(v);
  }, []);

  const handlerPressEnter = () => {
    listRef.remoteDataRefresh();
  };

  const handlerSearch = useCallback(v => {
    searchValue = trim(v);
    listRef.props.cascadeParams.searchValue = trim(v);
    listRef.remoteDataRefresh();
  }, []);

  const renderCustomTool = useCallback(
    () => (
      <>
        <Search
          allowClear
          placeholder="输入项目代码、名称关键字"
          onChange={e => handlerSearchChange(e.target.value)}
          onSearch={handlerSearch}
          onPressEnter={handlerPressEnter}
          style={{ width: '100%' }}
        />
      </>
    ),
    [handlerSearch, handlerSearchChange],
  );

  const renderAvatar = useCallback(({ keyValue, checkedList }) => {
    if (checkedList[keyValue]) {
      return (
        <Avatar
          shape="square"
          style={{ backgroundColor: 'transparent' }}
          size={24}
          icon={<ExtIcon type="check-square" antd className="check-item checked" />}
        />
      );
    }
    return (
      <Avatar
        shape="square"
        style={{ backgroundColor: 'transparent' }}
        size={24}
        icon={<ExtIcon type="check-square" antd className="check-item" />}
      />
    );
  }, []);

  const renderList = useMemo(() => {
    const listProps = {
      title: '项目',
      showSearch: false,
      showArrow: false,
      checkbox: false,
      remotePaging: false,
      allowCancelSelect: true,
      rowKey: 'code',
      onListCardRef: ref => (listRef = ref),
      customTool: renderCustomTool,
      itemField: {
        avatar: renderAvatar,
        title: renderItemTitle,
        description: item => item.code,
      },
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/dimensionComponent/getProjects`,
      },
      cascadeParams: {
        subjectId,
        searchValue,
      },
      onSelectChange: handlerSelectChange,
    };
    return <ListCard {...listProps} />;
  }, [handlerSelectChange, renderAvatar, renderCustomTool, renderItemTitle, subjectId]);

  return (
    <Card
      bordered={false}
      size="small"
      className={styles['dimension-item']}
      bodyStyle={{ height: '100%' }}
    >
      {renderList}
    </Card>
  );
};

export default Project;
