import React, { useMemo, useCallback, useState } from 'react';
import { get } from 'lodash';
import { Decimal } from 'decimal.js';
import { Descriptions, Alert, Timeline, Empty, Checkbox, Button, Popconfirm } from 'antd';
import { ExtIcon, Space } from 'suid';
import source_empty from '@/assets/source_empty.svg';
import BudgetMoney from '../../../../../components/BudgetMoney';
import styles from './index.less';

const splitAmount = {};

const SplitItem = ({
  onlyView = false,
  originPoolCode,
  originPoolAmount,
  subDimensionFields,
  sourceItem,
  items = [],
  itemMoneySaving = false,
  onSaveItemMoney = () => {},
  removing,
  onRemoveItem = () => {},
}) => {
  const [maxAmount, setMaxAmount] = useState(0);

  const [selectedKeys, setSelectedKeys] = useState([]);

  const setSplitItem = useCallback(
    (itemId, item) => {
      if (!splitAmount[originPoolCode]) {
        splitAmount[originPoolCode] = {};
      }
      splitAmount[originPoolCode][itemId] = item;
    },
    [originPoolCode],
  );

  const getSplitItem = useCallback(
    itemId => {
      if (splitAmount[originPoolCode] && splitAmount[originPoolCode][itemId]) {
        return splitAmount[originPoolCode][itemId];
      }
      return 0;
    },
    [originPoolCode],
  );

  const setCurrentItemMaxAmount = useCallback(
    item => {
      const currentItemId = get(item, 'id');
      let omitSum = 0;
      items
        .filter(it => it.id !== currentItemId)
        .forEach(it => {
          const itemId = get(it, 'id');
          const itemSplit = getSplitItem(itemId);
          const amount = get(itemSplit, 'amount') || get(it, 'amount');
          omitSum = new Decimal(omitSum).add(new Decimal(amount));
        });
      const max = new Decimal(originPoolAmount).sub(new Decimal(omitSum));
      setMaxAmount(max);
    },
    [originPoolAmount, items, getSplitItem],
  );

  const handlerSaveMoney = useCallback(
    (rowItem, amount, callBack) => {
      if (onSaveItemMoney && onSaveItemMoney instanceof Function) {
        const itemId = get(rowItem, 'id');
        const originAmount = get(getSplitItem(itemId), 'amount');
        if (originAmount !== amount) {
          onSaveItemMoney(rowItem, amount, res => {
            callBack();
            if (res.success) {
              const item = { ...res.data };
              setSplitItem(itemId, item);
            }
          });
        } else {
          callBack();
        }
      }
    },
    [getSplitItem, setSplitItem, onSaveItemMoney],
  );

  const getDisplaySubDimensionFields = useCallback(
    item => {
      const fields = [];
      subDimensionFields.forEach(f => {
        if (get(item, f.dimension) !== 'none') {
          fields.push(f);
        }
      });
      return fields;
    },
    [subDimensionFields],
  );

  const renderSubField = useCallback(
    item => {
      const subFields = getDisplaySubDimensionFields(item);
      if (subFields.length > 0) {
        return (
          <Descriptions key={`sub${item.id}`} column={1} bordered={false}>
            {subFields.map(f => {
              return (
                <Descriptions.Item key={`sub${item.id}${f.dimension}`} label={f.title}>
                  {get(item, f.value) || '-'}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        );
      }
      return null;
    },
    [getDisplaySubDimensionFields],
  );

  const handlerSelectChange = useCallback(
    (e, item) => {
      const itemId = get(item, 'id');
      let keys = [...selectedKeys];
      if (e.target.checked) {
        keys.push(itemId);
      } else {
        keys = keys.filter(k => k !== itemId);
      }
      setSelectedKeys(keys);
    },
    [selectedKeys],
  );

  const renderMasterTitle = useCallback(
    item => {
      const itemId = get(item, 'id');
      const checked = selectedKeys.filter(k => k === itemId).length === 1;
      const poolCode = get(item, 'poolCode');
      if (poolCode) {
        return (
          <>
            {!onlyView ? (
              <Checkbox
                checked={checked}
                onChange={e => handlerSelectChange(e, item)}
                style={{ position: 'absolute', left: 4, top: 8 }}
              />
            ) : null}
            <div className="pool-box">
              <span className="title">池号</span>
              <span className="no">{poolCode}</span>
            </div>
            <div className="master-title">{`${item.periodName} ${item.itemName}(${item.item})`}</div>
          </>
        );
      }
      return (
        <>
          {!onlyView ? (
            <Checkbox
              checked={checked}
              onChange={e => handlerSelectChange(e, item)}
              style={{ position: 'absolute', left: 4, top: 8 }}
            />
          ) : null}
          {`${item.periodName} ${item.itemName}`}
        </>
      );
    },
    [selectedKeys, handlerSelectChange, onlyView],
  );

  const renderDescription = useCallback(
    item => {
      const itemId = get(item, 'id');
      const itemSplit = getSplitItem(itemId);
      const amount = get(itemSplit, 'amount') || get(item, 'amount');
      const errMsg = get(itemSplit, 'errMsg') || get(item, 'errMsg');
      const poolAmount = get(item, 'poolAmount');
      return (
        <>
          {renderSubField(item)}
          <div className="money-box">
            <BudgetMoney
              className="inject-money"
              amount={amount}
              title="分解金额"
              rowItem={item}
              maxAmount={maxAmount}
              minAmount={-poolAmount}
              onFocus={it => setCurrentItemMaxAmount(it)}
              extra={`允许输入的最小金额：${-poolAmount}，最大金额：${maxAmount}`}
              loading={itemMoneySaving}
              allowEdit={!onlyView}
              onSave={handlerSaveMoney}
            />
            {errMsg ? (
              <Alert type="error" style={{ marginTop: 26 }} message={errMsg} banner closable />
            ) : null}
          </div>
        </>
      );
    },
    [
      getSplitItem,
      renderSubField,
      maxAmount,
      itemMoneySaving,
      onlyView,
      handlerSaveMoney,
      setCurrentItemMaxAmount,
    ],
  );

  const onCancelBatchRemove = useCallback(() => {
    setSelectedKeys([]);
  }, []);

  const handlerRemoveItem = useCallback(() => {
    if (onRemoveItem && onRemoveItem instanceof Function) {
      onRemoveItem(sourceItem, selectedKeys, () => {
        setSelectedKeys([]);
      });
    }
  }, [onRemoveItem, selectedKeys]);

  const renderContent = useMemo(() => {
    if (items.length === 0) {
      const msg = get(sourceItem, 'errMsg') || '暂时没有预算分解的目标';
      return (
        <Empty image={source_empty} description={msg}>
          <Popconfirm disabled={removing} title="确定要删除吗？" onConfirm={handlerRemoveItem}>
            <Button size="small" type="danger" loading={removing}>
              删除
            </Button>
          </Popconfirm>
        </Empty>
      );
    }
    return items.map(item => {
      return (
        <Timeline.Item
          key={item.id}
          color="gray"
          dot={<ExtIcon type="swap-right" antd style={{ fontSize: 24 }} />}
        >
          <div className="main-box">{renderMasterTitle(item)}</div>
          <div className="desc-box">{renderDescription(item)}</div>
        </Timeline.Item>
      );
    });
  }, [items, renderDescription, renderMasterTitle]);

  const handlerSelectAll = useCallback(
    e => {
      if (e.target.checked) {
        const keys = items.map(it => it.id);
        setSelectedKeys(keys);
      } else {
        setSelectedKeys([]);
      }
    },
    [items],
  );

  const renderToolBox = useMemo(() => {
    if (onlyView || items.length === 0) {
      return <div className={styles['action-tool-box']} />;
    }
    const hasSelected = selectedKeys.length > 0;
    const indeterminate = selectedKeys.length > 0 && selectedKeys.length < items.length;
    const checked = selectedKeys.length > 0 && selectedKeys.length === items.length;
    return (
      <div className={styles['action-tool-box']}>
        <Space>
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={e => handlerSelectAll(e)}
          >
            全选
          </Checkbox>
          {hasSelected ? (
            <>
              <Button size="small" onClick={onCancelBatchRemove} disabled={removing}>
                取消
              </Button>
              <Popconfirm
                disabled={removing}
                title="确定要删除吗？提示：删除后不能恢复"
                onConfirm={handlerRemoveItem}
              >
                <Button size="small" type="danger" loading={removing}>
                  {`删除(${selectedKeys.length})`}
                </Button>
              </Popconfirm>
            </>
          ) : null}
        </Space>
      </div>
    );
  }, [
    handlerRemoveItem,
    handlerSelectAll,
    items.length,
    onCancelBatchRemove,
    onlyView,
    removing,
    selectedKeys.length,
  ]);

  return (
    <>
      {renderToolBox}
      <Timeline className={styles['split-item-box']}>{renderContent}</Timeline>
    </>
  );
};

export default SplitItem;
