import React from 'react';
import { Tag, Badge } from 'antd';
import { constants } from '@/utils';

const { REQUEST_VIEW_STATUS } = constants;

const RequestViewState = ({ enumName }) => {
  const status = REQUEST_VIEW_STATUS[enumName];
  if (status && status.key !== REQUEST_VIEW_STATUS.PREFAB.key) {
    if (enumName === REQUEST_VIEW_STATUS.APPROVING.key) {
      return (
        <Tag color={status.color}>
          <>
            <Badge status="processing" />
            {status.title}
          </>
        </Tag>
      );
    }
    if (enumName === REQUEST_VIEW_STATUS.EFFECTING.key) {
      return (
        <Tag color={status.color} className="effecting">
          <>
            <Badge status="processing" color={status.color} />
            {status.title}
          </>
        </Tag>
      );
    }
    return <Tag color={status.color}>{status.title}</Tag>;
  }
  return null;
};

export default RequestViewState;
