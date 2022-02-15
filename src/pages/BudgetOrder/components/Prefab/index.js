import React, { useCallback, useMemo, useState } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Popconfirm, Tag, Badge, Alert } from 'antd';
import { ExtModal, ListCard, Space } from 'suid';
import styles from './index.less';

const Prefab = ({
  showPrefab,
  handlerClosePrefab,
  prefabData,
  onAdd = () => {},
  onTrash = () => {},
  trashing = false,
  onRecovery = () => {},
}) => {
  const [dealItem, setDealItem] = useState(null);

  const handlerTrash = useCallback(
    item => {
      setDealItem(item);
      onTrash(item, () => {
        setDealItem(null);
      });
    },
    [onTrash],
  );

  const renderItemAction = useCallback(
    item => {
      const processing = get(item, 'processing') || false;
      const dealItemId = get(dealItem, 'id');
      return (
        <Space>
          {processing ? null : (
            <Popconfirm
              disabled={trashing}
              title="确定要删除吗？提示:删除后不能恢复"
              onConfirm={() => handlerTrash(item)}
            >
              <Button size="small" loading={trashing && dealItemId === item.id} type="danger">
                删除
              </Button>
            </Popconfirm>
          )}
          <Button type="primary" ghost size="small" onClick={() => onRecovery(item)}>
            恢复
          </Button>
        </Space>
      );
    },
    [dealItem, handlerTrash, onRecovery, trashing],
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
      customTool: () => null,
    };
    return (
      <>
        <div className="btn-box">
          <Button type="primary" icon="plus" size="large" onClick={onAdd} block ghost>
            全新创建
          </Button>
        </div>
        <div className="alert-box">
          <Alert type="warning" message="未保存的申请,是否需要处理?" banner />
        </div>
        <div className="body-box">
          <ListCard {...listProps} />
        </div>
      </>
    );
  }, [onAdd, prefabData, renderItemAction, renderTitle]);

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
      title: '新建单据',
      onCancel: handlerClosePrefab,
    };
    return modalProps;
  }, [showPrefab, handlerClosePrefab]);

  return <ExtModal {...getExtModalProps()}>{renderContent}</ExtModal>;
};

export default Prefab;
