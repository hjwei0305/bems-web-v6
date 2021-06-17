import React, { useCallback, useMemo } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Popconfirm, Card, Tag, Badge } from 'antd';
import { ExtModal, ListCard, Space } from 'suid';
import styles from './index.less';

const { Meta } = Card;
const Prefab = ({
  showPrefab,
  handlerClosePrefab,
  prefabData,
  onAdd = () => {},
  onTrash = () => {},
  onRecovery = () => {},
}) => {
  const renderCustomTool = useCallback(
    ({ total }) => {
      return (
        <>
          <div>{`共${total}项`}</div>
          <Space>
            <Button type="primary" onClick={onAdd}>
              全新创建
            </Button>
          </Space>
        </>
      );
    },
    [onAdd],
  );

  const renderItemAction = useCallback(
    item => {
      return (
        <Space>
          <Popconfirm title="确定要删除吗？提示:删除后不能恢复" onConfirm={() => onTrash(item)}>
            <Button size="small" type="danger">
              删除
            </Button>
          </Popconfirm>
          <Button type="primary" ghost size="small" onClick={() => onRecovery(item)}>
            恢复
          </Button>
        </Space>
      );
    },
    [onRecovery, onTrash],
  );

  const renderTitle = useCallback(item => {
    const processing = get(item, 'processing') || false;
    if (processing) {
      return (
        <Space>
          {item.code}
          <Tag color="blue">
            <Badge status="processing" />
            处理中
          </Tag>
        </Space>
      );
    }
    return item.code;
  }, []);

  const renderContent = useMemo(() => {
    const listProps = {
      dataSource: prefabData,
      showSearch: false,
      showArrow: false,
      pagination: false,
      itemField: {
        title: item => renderTitle(item),
        description: item => item.createdDate,
        extra: item => renderItemAction(item),
      },
      customTool: renderCustomTool,
    };
    return <ListCard {...listProps} />;
  }, [prefabData, renderCustomTool, renderItemAction, renderTitle]);

  const getExtModalProps = useCallback(() => {
    const modalProps = {
      wrapClassName: cls(styles['container-box']),
      destroyOnClose: true,
      maskClosable: false,
      keyboard: false,
      visible: showPrefab,
      centered: true,
      footer: null,
      closable: true,
      bodyStyle: { padding: 0, height: 420 },
      title: <Meta title="存在未保存的申请" description="申请单未保存，是否需要处理" />,
      onCancel: handlerClosePrefab,
    };
    return modalProps;
  }, [showPrefab, handlerClosePrefab]);

  return <ExtModal {...getExtModalProps()}>{renderContent}</ExtModal>;
};

export default Prefab;
