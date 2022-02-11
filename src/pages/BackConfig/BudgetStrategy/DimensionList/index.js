import React, { useCallback, useState, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'dva';
import { get } from 'lodash';
import { Switch, Tooltip } from 'antd';
import { ExtTable, ExtIcon } from 'suid';
import { constants } from '@/utils';
import StrategyEditor from './StrategyEditor';
import styles from './index.less';

const { SERVER_PATH } = constants;
let tablRef;

const DimensionList = props => {
  const { loading } = props;
  const { currentMaster } = useSelector(sel => sel.budgetStrategy);
  const [dealId, setDealId] = useState();
  const dispatch = useDispatch();
  const transformSaving = useMemo(() => {
    return loading.effects['budgetStrategy/transformSubmit'];
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
          id: rowItem.id,
          strategyId: strategy.id,
        },
        callback: res => {
          if (res.success) {
            reloadData();
            callback();
          }
        },
      });
    },
    [dispatch],
  );

  const handlerTransformSave = useCallback(
    (checked, rowItem) => {
      setDealId(rowItem.code);
      dispatch({
        type: 'budgetStrategy/transformSubmit',
        payload: {
          code: rowItem.code,
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
          if (dealId === r.code && transformSaving)
            return (
              <div className="allow-edit">
                <ExtIcon type="loading" antd spin style={{ marginLeft: 4 }} />
              </div>
            );
          return (
            <Switch
              size="small"
              onChange={checked => handlerTransformSave(checked, r)}
              checked={!chk}
            />
          );
        },
      },
      {
        title: '维度代码',
        dataIndex: 'code',
        width: 120,
        required: true,
      },
      {
        title: '维度名称',
        dataIndex: 'name',
        width: 180,
        required: true,
      },
      {
        title: (
          <>
            维度策略
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
                  url: `${SERVER_PATH}/bems-v6/strategy/findByDimensionCode`,
                  params: { dimensionCode: r.code },
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
          return <span style={{ paddingLeft: 4 }}>{t}</span>;
        },
      },
    ];
    const tbProps = {
      rowKey: 'code',
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
          url: `${SERVER_PATH}/bems-v6/subjectDimension/getDimensions`,
        },
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
    handlerTransformSave,
    strategySaving,
    transformSaving,
  ]);

  return (
    <div className={styles['list-box']}>
      <ExtTable {...getExtTableProps()} />
    </div>
  );
};

export default connect(({ budgetStrategy, loading }) => ({ budgetStrategy, loading }))(
  DimensionList,
);
