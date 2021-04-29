import React from 'react';
import { Tag, Badge } from 'antd';
import { constants } from '@/utils';

const { REQUEST_VIEW_STATUS } = constants;

const RequestViewState = enumName => {
  const status = REQUEST_VIEW_STATUS[enumName];
  if (status) {
    if (enumName === REQUEST_VIEW_STATUS.INPROCESS.key) {
      return (
        <Tag color={status.color}>
          <>
            <Badge status="processing" />
            {status.title}
          </>
        </Tag>
      );
    }
    return <Tag color={status.color}>{status.title}</Tag>;
  }
};

export default RequestViewState;
