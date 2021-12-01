import React from 'react';
import { Tag } from 'antd';
import { constants } from '@/utils';

const { MASTER_CLASSIFICATION } = constants;

const AgreementStatus = ({ enumName }) => {
  const status = MASTER_CLASSIFICATION[enumName];
  if (status) {
    return (
      <Tag color={status.color} style={{ borderColor: 'transparent' }}>
        {status.title}
      </Tag>
    );
  }
  return null;
};

export default AgreementStatus;
