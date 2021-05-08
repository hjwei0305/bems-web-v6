import React, { useState, useMemo } from 'react';
import cls from 'classnames';
import { Money, MoneyInput, ExtIcon, Space } from 'suid';
import styles from './index.less';

const BudgetMoney = ({ title, amount, onSave, saving, allowEdit = true, style, className }) => {
  let money = amount;

  const [edit, setEdit] = useState(false);

  const handlerCancel = () => {
    setEdit(false);
  };

  const handlerEdit = () => {
    setEdit(true);
  };

  const parser = value => {
    const reg = new RegExp(',', 'g');
    return `${value}`.replace(reg, '') || 0;
  };

  const handlerBlur = e => {
    money = Number(parser(e.target.value));
  };

  const handlerSave = () => {
    if (onSave && onSave instanceof Function) {
      onSave(money);
      setEdit(false);
    }
  };

  const renderSaveBtn = () => {
    if (saving) {
      return <ExtIcon style={{ marginLeft: 8 }} className="btn" type="loading" antd />;
    }
    return (
      <ExtIcon
        style={{ marginLeft: 8 }}
        className="btn save"
        onClick={handlerSave}
        type="check"
        antd
      />
    );
  };
  const getClassName = useMemo(() => {
    if (money > 0) {
      return 'blue';
    }
    if (money < 0) {
      return 'red';
    }
  }, [amount]);
  return (
    <div className={cls(styles['money-box'], className)} style={style}>
      <span className="field-item">
        <span className="label">{title}</span>
        {edit ? (
          <Space size={0} onClick={e => e.stopPropagation()}>
            <MoneyInput textAlign="left" value={money} onBlur={handlerBlur} />
            {renderSaveBtn()}
            <ExtIcon className="btn cancel" onClick={handlerCancel} type="close" antd />
          </Space>
        ) : (
          <Space size={2} onClick={e => e.stopPropagation()}>
            <Money value={money} className={getClassName} />
            {allowEdit ? <ExtIcon className="btn" onClick={handlerEdit} type="edit" antd /> : null}
          </Space>
        )}
      </span>
    </div>
  );
};

export default BudgetMoney;
