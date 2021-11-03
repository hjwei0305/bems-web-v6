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
  onFocus = () => {},
}) => {
  const inputRef = useRef();

  const [value, setValue] = useState(amount);

  const [rowKey, setRowKey] = useState('');

  const [edit, setEdit] = useState(false);

  const [validFail, setValidFail] = useState(false);

  const handlerEdit = useCallback(() => {
    if (allowEdit) {
      setRowKey(get(rowItem, 'id'));
      setEdit(true);
      setValidFail(false);
      onFocus(rowItem);
      setTimeout(() => {
        if (inputRef) {
          inputRef.current.handlerFocus();
        }
      }, 10);
    }
  }, [allowEdit, rowItem, onFocus]);

  const parser = v => {
    const reg = new RegExp(',', 'g');
    return `${v}`.replace(reg, '') || 0;
  };

  const handlerEnterSave = useCallback(
    e => {
      const money = Number(parser(e.target.value));
      if (isNaN(money)) {
        setValidFail(true);
        return false;
      }
      setValue(money);
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
        // setEdit(false);
      }
    },
    [maxAmount, minAmount, onSave, rowItem],
  );

  const handlerBlur = useCallback(() => {
    const currentValue = inputRef.current.numberInputRef.inputNumberRef.input.value;
    const money = Number(parser(currentValue));
    if (isNaN(money)) {
      setValidFail(true);
      return false;
    }
    setValue(money);
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
      // setEdit(false);
    }
  }, [maxAmount, minAmount, onSave, rowItem]);

  const getClassName = useMemo(() => {
    if (value > 0) {
      return 'blue';
    }
    if (value < 0) {
      return 'red';
    }
  }, [value]);

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
        <Money value={value} className={getClassName} />
      </div>
    );
  }, [value, rowItem, loading, rowKey, allowEdit, getClassName, handlerEdit]);

  const getMoneyInputProps = useCallback(() => {
    return {
      ref: inputRef,
      textAlign: 'left',
      value,
      className: cls({ 'has-error': validFail }),
      onBlur: handlerBlur,
      onPressEnter: handlerEnterSave,
    };
  }, [handlerBlur, handlerEnterSave, validFail, value]);

  return (
    <div className={cls(styles['money-box'], className)} style={style}>
      <span className="field-item">
        <span className="label">{title}</span>
        {edit ? (
          <Space direction="vertical" size={0} onClick={e => e.stopPropagation()}>
            <MoneyInput {...getMoneyInputProps()} />
            {extra ? (
              <span className={cls('extra', { 'has-error': validFail })}>{extra}</span>
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
