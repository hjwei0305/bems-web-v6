import React, { useState } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Dropdown, Input, Tooltip } from 'antd';
import { ExtIcon, ListCard } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const { Search } = Input;
let listCardRef;

const MasterView = ({ style, defaultTitle, onChange, readTitle = 'name' }) => {
  const [dropShow, setDropShow] = useState(false);
  const [title, setTitle] = useState(defaultTitle);

  const handlerSearchChange = v => {
    listCardRef.handlerSearchChange(v);
  };

  const handlerPressEnter = () => {
    listCardRef.handlerPressEnter();
  };

  const handlerSearch = v => {
    listCardRef.handlerSearch(v);
  };

  const renderCustomTool = () => (
    <>
      <Search
        allowClear
        placeholder="输入预算主体名称关键字"
        onChange={e => handlerSearchChange(e.target.value)}
        onSearch={handlerSearch}
        onPressEnter={handlerPressEnter}
        style={{ width: '100%' }}
      />
    </>
  );

  const onVisibleChange = v => {
    setDropShow(v);
  };

  const renderContent = () => {
    const listProps = {
      className: 'search-content',
      showArrow: false,
      showSearch: false,
      onSelectChange: (_, items) => {
        const [selItem] = items;
        const tmpTitle = get(selItem, readTitle);
        setTitle(tmpTitle);
        if (onChange && onChange instanceof Function) {
          onChange(selItem);
        }
        setDropShow(false);
      },
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/getUserAuthorizedEntities`,
      },
      customTool: renderCustomTool,
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
          height: 420,
          width: 320,
          backgroundColor: '#ffffff',
        }}
      >
        <div className="list-body" style={{ height: 404 }}>
          <ListCard {...listProps} />
        </div>
      </div>
    );
  };

  return (
    <Dropdown
      trigger={['click']}
      overlay={renderContent()}
      className="action-drop-down"
      placement="bottomLeft"
      visible={dropShow}
      overlayClassName={styles['filter-box']}
      onVisibleChange={onVisibleChange}
    >
      <span className={cls('cmp-filter-view', styles['view-box'])} style={style}>
        {title ? (
          <span className="view-content">{title}</span>
        ) : (
          <Tooltip visible={!dropShow} placement="bottomLeft" title="请先选定预算主体">
            <span className="view-content">预算主体...</span>
          </Tooltip>
        )}

        <ExtIcon type="down" antd />
      </span>
    </Dropdown>
  );
};

export default MasterView;
