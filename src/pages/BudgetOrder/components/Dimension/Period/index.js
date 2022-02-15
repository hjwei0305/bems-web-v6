import React, { useMemo, Suspense } from 'react';
import { PageLoader } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const Customize = React.lazy(() => import('./Customize'));
const Stand = React.lazy(() => import('./Stand'));
const { PERIOD_TYPE, ORDER_CATEGORY } = constants;

const Period = props => {
  const { periodType, actionType } = props;
  const renderPeriod = useMemo(() => {
    if (periodType === PERIOD_TYPE.CUSTOMIZE.key && actionType === ORDER_CATEGORY.INJECTION.key) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Customize {...props} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<PageLoader />}>
        <Stand {...props} />
      </Suspense>
    );
  }, [actionType, periodType, props]);

  return <div className={styles['container-box']}>{renderPeriod}</div>;
};

export default Period;
