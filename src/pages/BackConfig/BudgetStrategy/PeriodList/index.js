import React, { useCallback, useState, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'dva';
import { get } from 'lodash';
import { Switch } from 'antd';
import { ExtTable, ExtIcon } from 'suid';
import { PeriodType } from '@/components';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, PERIOD_TYPE } = constants;
let tablRef;

const PeriodList = props => {
  const { loading } = props;
  const { currentMaster } = useSelector(sel => sel.budgetStrategy);
  const [dealId, setDealId] = useState();
  const dispatch = useDispatch();

  const rollSaving = useMemo(() => {
    return loading.effects['budgetStrategy/subjectPeriodRoll'];
  }, [loading.effects]);

  const useSaving = useMemo(() => {
    return loading.effects['budgetStrategy/subjectPeriodUse'];
  }, [loading.effects]);

  const reloadData = () => {
    if (tablRef) {
      tablRef.remoteDataRefresh();
    }
  };

  const handlerRollSave = useCallback(
    (checked, rowItem) => {
      setDealId(rowItem.id);
      dispatch({
        type: 'budgetStrategy/subjectPeriodRoll',
        payload: {
          id: rowItem.id,
          roll: checked,
        },
        callback: res => {
          if (res.success) {
            reloadData();
          }
        },
      });
    },
    [dispatch],
  );

  const handlerUseSave = useCallback(
    (checked, rowItem) => {
      setDealId(rowItem.id);
      dispatch({
        type: 'budgetStrategy/subjectPeriodUse',
        payload: {
          id: rowItem.id,
          use: checked,
        },
        callback: res => {
          if (res.success) {
            reloadData();
          }
        },
      });
    },
    [dispatch],
  );

  const getExtTableProps = useCallback(() => {
    const columns = [
      {
        title: '期间类型',
        dataIndex: 'periodType',
        width: 180,
        required: true,
        render: t => <PeriodType periodTypeKey={t} />,
      },
      {
        title: '可结转',
        dataIndex: 'roll',
        width: 100,
        required: true,
        align: 'center',
        render: (chk, r) => {
          if (dealId === r.id && rollSaving)
            return (
              <div className="allow-edit">
                <ExtIcon type="loading" antd spin style={{ marginLeft: 4 }} />
              </div>
            );
          return (
            <Switch
              size="small"
              disabled={r.periodType === PERIOD_TYPE.CUSTOMIZE.key}
              onChange={checked => handlerRollSave(checked, r)}
              checked={chk}
            />
          );
        },
      },
      {
        title: '业务可用',
        dataIndex: 'use',
        width: 100,
        required: true,
        align: 'center',
        render: (chk, r) => {
          if (dealId === r.id && useSaving)
            return (
              <div className="allow-edit">
                <ExtIcon type="loading" antd spin style={{ marginLeft: 4 }} />
              </div>
            );
          return (
            <Switch
              size="small"
              disabled={r.periodType === PERIOD_TYPE.CUSTOMIZE.key}
              onChange={checked => handlerUseSave(checked, r)}
              checked={chk}
            />
          );
        },
      },
    ];
    const tbProps = {
      lineNumber: false,
      bordered: false,
      pagination: false,
      showSearch: false,
      allowCustomColumns: false,
      onTableRef: ref => (tablRef = ref),
      columns,
    };
    if (currentMaster) {
      Object.assign(tbProps, {
        store: {
          url: `${SERVER_PATH}/bems-v6/subjectPeriod/getSubjectPeriods`,
        },
        cascadeParams: {
          subjectId: get(currentMaster, 'id'),
        },
      });
    }
    return tbProps;
  }, [currentMaster, dealId, handlerRollSave, handlerUseSave, rollSaving, useSaving]);

  return (
    <div className={styles['list-box']}>
      <ExtTable {...getExtTableProps()} />
    </div>
  );
};

export default connect(({ budgetStrategy, loading }) => ({ budgetStrategy, loading }))(PeriodList);
