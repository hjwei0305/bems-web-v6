import React, { useCallback, useState, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'dva';
import { get } from 'lodash';
import { Switch, Card } from 'antd';
import { ExtTable, ExtIcon, BannerTitle } from 'suid';
import { constants } from '@/utils';
import StrategyEditor from './StrategyEditor';
import styles from './index.less';

const { SERVER_PATH } = constants;
let tablRef;

const DimensionList = props => {
  const { loading } = props;
  const { currentMaster } = useSelector(sel => sel.dimensionStrategy);
  const [dealId, setDealId] = useState();
  const dispatch = useDispatch();
  const transformSaving = useMemo(() => {
    return loading.effects['dimensionStrategy/transformSubmit'];
  }, [loading.effects]);

  const strategySaving = useMemo(() => {
    return loading.effects['dimensionStrategy/strategySubmit'];
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
        type: 'dimensionStrategy/strategySubmit',
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
        type: 'dimensionStrategy/transformSubmit',
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
          <ExtIcon
            type="question-circle"
            style={{ color: '#666' }}
            antd
            tooltip={{ title: '可以直接点击列表开关按钮进行通用与私有转换' }}
          />
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
              onChange={checked => handlerTransformSave(checked, r)}
              checkedChildren="通用"
              unCheckedChildren="私有"
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
        title: '维度策略',
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
    <Card
      bordered={false}
      title={<BannerTitle title={get(currentMaster, 'name')} subTitle="维度策略" />}
      className={styles['list-box']}
    >
      <ExtTable {...getExtTableProps()} />
    </Card>
  );
};

export default connect(({ dimensionStrategy, loading }) => ({ dimensionStrategy, loading }))(
  DimensionList,
);
