import React, { useState, useMemo, useRef, useCallback } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Money, MoneyInput, Space, ExtIcon } from 'suid';
import styles from './index.less';

const BudgetMoney = ({
  title,
  amount,
  onSave,
  allowEdit = true,
  rowItem,
  style,
  className,
  loading,
}) => {
  let money = amount;

  const inputRef = useRef();

  const [rowKey, setRowKey] = useState('');

  const [edit, setEdit] = useState(false);

  const handlerEdit = useCallback(() => {
    if (allowEdit) {
      setRowKey(get(rowItem, 'id'));
      setEdit(true);
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
    if (onSave && onSave instanceof Function) {
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

  return (
    <div className={cls(styles['money-box'], className)} style={style}>
      <span className="field-item">
        <span className="label">{title}</span>
        {edit ? (
          <Space size={0} onClick={e => e.stopPropagation()}>
            <MoneyInput
              ref={inputRef}
              textAlign="left"
              value={money}
              onBlur={handlerBlurAutoSave}
              onPressEnter={handlerBlurAutoSave}
            />
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
