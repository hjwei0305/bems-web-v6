import React, { useCallback, useMemo, useImperativeHandle } from 'react';
import { trim } from 'lodash';
import { Card, Input } from 'antd';
import { ListCard } from 'suid';
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
  }, []);

  const handlerPressEnter = () => {
    listRef.remoteDataRefresh();
  };

  const handlerSearch = useCallback(v => {
    searchValue = trim(v);
    setTimeout(() => {
      console.log(searchValue);
      listRef.remoteDataRefresh();
    }, 200);
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

  const renderList = useMemo(() => {
    const listProps = {
      title: '项目',
      showSearch: false,
      showArrow: false,
      checkbox: true,
      remotePaging: false,
      rowKey: 'code',
      onListCardRef: ref => (listRef = ref),
      customTool: renderCustomTool,
      itemField: {
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
  }, [handlerSelectChange, renderCustomTool, renderItemTitle, subjectId]);

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
