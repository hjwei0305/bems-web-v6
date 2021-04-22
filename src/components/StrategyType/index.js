import React, { memo } from 'react';
import { Badge } from 'antd';
import { constants } from '@/utils';

const { STRATEGY_TYPE } = constants;

const StrategyType = ({ state }) => {
  const st = STRATEGY_TYPE[state] || {};
  if (st.key) {
    return <Badge color={st.color} text={st.title} />;
  }
  return '-';
};

export default memo(StrategyType);
