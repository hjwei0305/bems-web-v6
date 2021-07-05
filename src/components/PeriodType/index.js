import { memo } from 'react';
import { constants } from '@/utils';

const { PERIOD_TYPE } = constants;

const PeriodType = ({ periodTypeKey }) => {
  const st = PERIOD_TYPE[periodTypeKey] || {};
  if (st.key) {
    return st.title;
  }
  return '-';
};

export default memo(PeriodType);
