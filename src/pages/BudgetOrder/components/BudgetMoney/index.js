import React, { useState, useMemo } from 'react';
import { Money, MoneyInput, ExtIcon, Space } from 'suid';
import styles from './index.less';

const BudgetMoney = ({ title, amount, onSave, saving }) => {
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
    <div className={styles['money-box']} onClick={e => e.stopPropagation()}>
      <span className="field-item">
        <span className="label">{title}</span>
        {edit ? (
          <Space size={0}>
            <MoneyInput textAlign="left" value={money} onBlur={handlerBlur} />
            {renderSaveBtn()}
            <ExtIcon className="btn cancel" onClick={handlerCancel} type="close" antd />
          </Space>
        ) : (
          <Space>
            <Money value={money} className={getClassName} />
            <ExtIcon
              style={{ marginLeft: 8 }}
              className="btn"
              onClick={handlerEdit}
              type="edit"
              antd
            />
          </Space>
        )}
      </span>
    </div>
  );
};

export default BudgetMoney;
