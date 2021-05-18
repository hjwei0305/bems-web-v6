import React, { useState, useMemo, useRef, useCallback } from 'react';
import cls from 'classnames';
import { get, isNaN } from 'lodash';
import { Money, MoneyInput, Space, ExtIcon } from 'suid';
import styles from './index.less';

const BudgetMoney = ({
  title,
  amount,
  maxAmount = null,
  minAmount = null,
  onSave,
  allowEdit = true,
  rowItem,
  style,
  className,
  loading,
  extra = null,
}) => {
  let money = amount;

  const inputRef = useRef();

  const [rowKey, setRowKey] = useState('');

  const [edit, setEdit] = useState(false);

  const [validFail, setValidFail] = useState(false);

  const handlerEdit = useCallback(() => {
    if (allowEdit) {
      setRowKey(get(rowItem, 'id'));
      setEdit(true);
      setValidFail(false);
      setTimeout(() => {
        if (inputRef) {
          inputRef.current.handlerFocus();
        }
      }, 10);
    }
  }, [allowEdit, rowItem]);

  const parser = value => {
    const reg = new RegExp(',', 'g');
    return `${value}`.replace(reg, '') || 0;
  };

  const handlerBlurAutoSave = e => {
    money = Number(parser(e.target.value));
    if (isNaN(money)) {
      setValidFail(true);
      return false;
    }
    if (onSave && onSave instanceof Function) {
      if (maxAmount !== null && maxAmount !== undefined && maxAmount < money) {
        setValidFail(true);
        return false;
      }
      if (minAmount !== null && minAmount !== undefined && minAmount > money) {
        setValidFail(true);
        return false;
      }
      onSave(rowItem, money, () => {
        setRowKey('');
      });
      setEdit(false);
    }
  };

  const getClassName = useMemo(() => {
    if (money > 0) {
      return 'blue';
    }
    if (money < 0) {
      return 'red';
    }
  }, [money]);

  const renderMoney = useMemo(() => {
    if (loading && rowKey === get(rowItem, 'id')) {
      return (
        <div className="allow-edit">
          <ExtIcon type="loading" antd spin style={{ marginLeft: 4 }} />
        </div>
      );
    }
    return (
      <div onClick={handlerEdit} className={allowEdit ? 'allow-edit' : 'only-read'}>
        <Money value={money} className={getClassName} />
      </div>
    );
  }, [money, rowItem, loading, rowKey, allowEdit, getClassName, handlerEdit]);

  const restProps = {};
  if (maxAmount != null && maxAmount !== undefined) {
    Object.assign(restProps, { max: Number(maxAmount) });
  }
  if (minAmount != null && minAmount !== undefined) {
    Object.assign(restProps, { min: Number(minAmount) });
  }

  return (
    <div className={cls(styles['money-box'], className)} style={style}>
      <span className="field-item">
        <span className="label">{title}</span>
        {edit ? (
          <Space direction="vertical" size={0} onClick={e => e.stopPropagation()}>
            <MoneyInput
              ref={inputRef}
              textAlign="left"
              value={money}
              className={cls({ 'has-error': validFail })}
              onBlur={handlerBlurAutoSave}
              onPressEnter={handlerBlurAutoSave}
              {...restProps}
            />
            {extra ? (
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(0,0,0,0.35)',
                  position: 'absolute',
                  minWidth: 600,
                }}
              >
                {extra}
              </span>
            ) : null}
          </Space>
        ) : (
          <Space size={2} onClick={e => e.stopPropagation()}>
            {renderMoney}
          </Space>
        )}
      </span>
    </div>
  );
};

export default BudgetMoney;
