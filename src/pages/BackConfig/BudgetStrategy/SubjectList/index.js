import React, { useCallback, useState, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'dva';
import { get } from 'lodash';
import { Switch, Tooltip } from 'antd';
import { ExtTable, ExtIcon } from 'suid';
import { constants } from '@/utils';
import StrategyEditor from './StrategyEditor';
import styles from './index.less';

const { SERVER_PATH, STRATEGY_TYPE } = constants;
let tablRef;

const SubjectList = props => {
  const { loading } = props;
  const { currentMaster } = useSelector(sel => sel.budgetStrategy);
  const [dealId, setDealId] = useState();
  const dispatch = useDispatch();
  const turnPrivateSaving = useMemo(() => {
    return loading.effects['budgetStrategy/turnPrivate'];
  }, [loading.effects]);

  const strategySaving = useMemo(() => {
    return loading.effects['budgetStrategy/strategySubmit'];
  }, [loading.effects]);

  const reloadData = () => {
    if (tablRef) {
      tablRef.remoteDataRefresh();
    }
  };

  const handlerStrategySave = useCallback(
    (strategy, rowItem, callback) => {
      setDealId(rowItem.code);
      dispatch({
        type: 'budgetStrategy/strategySubmit',
        payload: {
          itemCode: rowItem.code,
          strategyId: strategy.id,
          subjectId: get(currentMaster, 'id'),
        },
        callback: res => {
          if (res.success) {
            reloadData();
            callback();
          }
        },
      });
    },
    [currentMaster, dispatch],
  );

  const handlerTurnPrivateSave = useCallback(
    (checked, rowItem) => {
      setDealId(rowItem.code);
      dispatch({
        type: 'budgetStrategy/turnPrivate',
        payload: {
          itemCode: rowItem.code,
          isPrivate: !checked,
          subjectId: get(currentMaster, 'id'),
        },
        callback: res => {
          if (res.success) {
            reloadData();
          }
        },
      });
    },
    [currentMaster, dispatch],
  );

  const getExtTableProps = useCallback(() => {
    const columns = [
      {
        title: (
          <div>
            <Tooltip title="点击下方列表开关按钮进行通用与私有转换">
              <span className="tag-state">通用</span>
              <span className="tag-state personal">私有</span>
            </Tooltip>
          </div>
        ),
        dataIndex: 'id',
        width: 90,
        required: true,
        align: 'center',
        render: (chk, r) => {
          if (dealId === r.code && turnPrivateSaving)
            return (
              <div className="allow-edit">
                <ExtIcon type="loading" antd spin style={{ marginLeft: 4 }} />
              </div>
            );
          return (
            <Switch
              size="small"
              onChange={checked => handlerTurnPrivateSave(checked, r)}
              checked={!chk}
            />
          );
        },
      },
      {
        title: '科目代码',
        dataIndex: 'code',
        width: 120,
        required: true,
      },
      {
        title: '科目名称',
        dataIndex: 'name',
        width: 180,
        required: true,
      },
      {
        title: (
          <>
            执行策略
            <ExtIcon
              type="question-circle"
              style={{ marginLeft: 4 }}
              antd
              tooltip={{ title: '设置为私有后可以更改策略' }}
            />
          </>
        ),
        dataIndex: 'strategyName',
        width: 220,
        required: true,
        className: 'padding-zero',
        render: (t, r) => {
          if (r.id) {
            return (
              <StrategyEditor
                labelTitle="策略设置"
                store={{
                  url: `${SERVER_PATH}/bems-v6/strategy/findByCategory`,
                  params: { category: STRATEGY_TYPE.EXECUTION.key },
                  autoLoad: true,
                }}
                dealId={dealId}
                rowData={r}
                displayName={t}
                fieldId={r.strategyId}
                onSave={handlerStrategySave}
                saving={strategySaving}
              />
            );
          }
          return <span style={{ paddingLeft: 4 }}>继承主体执行策略</span>;
        },
      },
    ];
    const tbProps = {
      rowKey: 'code',
      lineNumber: false,
      bordered: false,
      showSearch: false,
      allowCustomColumns: false,
      onTableRef: ref => (tablRef = ref),
      columns,
    };
    if (currentMaster) {
      Object.assign(tbProps, {
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/strategyItem/findPageBySubject`,
        },
        remotePaging: true,
        cascadeParams: {
          subjectId: get(currentMaster, 'id'),
        },
      });
    }
    return tbProps;
  }, [
    currentMaster,
    dealId,
    handlerStrategySave,
    handlerTurnPrivateSave,
    strategySaving,
    turnPrivateSaving,
  ]);

  return (
    <div className={styles['list-box']}>
      <ExtTable {...getExtTableProps()} />
    </div>
  );
};

export default connect(({ budgetStrategy, loading }) => ({ budgetStrategy, loading }))(SubjectList);
