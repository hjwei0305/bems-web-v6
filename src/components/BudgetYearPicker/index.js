import React from 'react';
import { YearPicker } from 'suid';
import styles from './index.less';

const BudgetYearPicker = props => {
  const { onYearChange, value } = props;
  return (
    <span className={styles['budget-year-picker-box']}>
      <span className="label">预算年度</span>
      <YearPicker value={value} onChange={onYearChange} format="YYYY年" />
    </span>
  );
};

export default BudgetYearPicker;
