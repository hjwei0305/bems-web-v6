import React, { useMemo, useCallback, useState } from 'react';
import { get } from 'lodash';
import { Decimal } from 'decimal.js';
import { Descriptions, Alert, Timeline, Empty, Checkbox } from 'antd';
import { Money, ExtIcon } from 'suid';
import BudgetMoney from '../../../../../components/BudgetMoney';
import styles from './index.less';

const splitAmount = {};

const SplitItem = ({
  selectedKeys,
  selectChange = () => {},
  onlyView = false,
  originPoolCode,
  originPoolAmount,
  subDimensionFields,
  items = [],
  itemMoneySaving = false,
  onSaveItemMoney = () => {},
}) => {
  const [maxAmount, setMaxAmount] = useState(0);

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
      selectChange(keys);
    },
    [selectChange, selectedKeys],
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
                style={{ position: 'absolute', left: 4, top: 24 }}
              />
            ) : null}
            <div className="pool-box">
              <span className="title">池号</span>
              <span className="no">{poolCode}</span>
            </div>
            <div className="master-title">{`${item.periodName} ${item.itemName}`}</div>
          </>
        );
      }
      return (
        <>
          {!onlyView ? (
            <Checkbox
              checked={checked}
              onChange={e => handlerSelectChange(e, item)}
              style={{ position: 'absolute', left: 4, top: 24 }}
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
      const errMsg = get(itemSplit, 'errMsg') || '';
      const poolAmount = get(item, 'poolAmount');
      return (
        <>
          {renderSubField(item)}
          <div className="money-box">
            <div className="field-item">
              <span className="label">预算余额</span>
              <span>
                <Money value={poolAmount} />
              </span>
            </div>
            <BudgetMoney
              className="inject-money"
              amount={amount}
              title="分解金额"
              rowItem={item}
              maxAmount={maxAmount}
              minAmount={-poolAmount}
              onFocus={it => setCurrentItemMaxAmount(it)}
              extra={`允许输入的最小值金额：${-poolAmount}，最大金额：${maxAmount}`}
              loading={itemMoneySaving}
              allowEdit={!onlyView}
              onSave={handlerSaveMoney}
            />
            {errMsg ? <Alert type="error" message={errMsg} banner closable /> : null}
          </div>
        </>
      );
    },
    [
      handlerSaveMoney,
      itemMoneySaving,
      onlyView,
      getSplitItem,
      renderSubField,
      setCurrentItemMaxAmount,
      maxAmount,
    ],
  );

  const renderContent = useMemo(() => {
    if (items.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂时没有预算分解的目标" />;
    }
    return items.map(item => {
      return (
        <Timeline.Item
          color="gray"
          dot={<ExtIcon type="swap-right" antd style={{ fontSize: 24 }} />}
        >
          <div className="main-box">{renderMasterTitle(item)}</div>
          <div className="desc-box">{renderDescription(item)}</div>
        </Timeline.Item>
      );
    });
  }, [items, renderDescription, renderMasterTitle]);

  return <Timeline className={styles['split-item-box']}>{renderContent}</Timeline>;
};

export default SplitItem;
