import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Icon, Popconfirm } from 'antd';
import { WorkFlow, Space } from 'suid';
import { constants } from '@/utils';
import Tip from '../../../components/Tip';

const { REQUEST_VIEW_STATUS, REQUEST_ORDER_ACTION } = constants;
const { StartFlow } = WorkFlow;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);

class ExtAction extends PureComponent {
  static propTypes = {
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
    saveOrder: PropTypes.func,
    closeOrder: PropTypes.func,
    saving: PropTypes.bool,
    loadingGlobal: PropTypes.bool,
    flowStatus: PropTypes.string,
    beforeStartFlow: PropTypes.func,
    handlerStartComlete: PropTypes.func,
    tempDisabled: PropTypes.bool,
    effective: PropTypes.func,
    effecting: PropTypes.bool,
    confirm: PropTypes.func,
    confirming: PropTypes.bool,
    cancel: PropTypes.func,
    canceling: PropTypes.bool,
  };

  renderExtActions = () => {
    const {
      action,
      headData,
      saveOrder,
      closeOrder,
      loadingGlobal,
      saving,
      beforeStartFlow,
      handlerStartComlete,
      tempDisabled,
      effective,
      effecting,
      confirm,
      confirming,
      cancel,
      canceling,
    } = this.props;
    const startFlowProps = {
      businessModelCode: 'INJECTION',
      startComplete: handlerStartComlete,
      beforeStart: beforeStartFlow,
      needStartConfirm: true,
    };
    const disabled = tempDisabled || saving || effecting || confirming || canceling;
    const orderCode = get(headData, 'code');
    const status = get(headData, 'status');
    if (action === REQUEST_ORDER_ACTION.VIEW) {
      return (
        <>
          <Button onClick={closeOrder} disabled={loadingGlobal}>
            退出查看
          </Button>
        </>
      );
    }
    if (
      !orderCode ||
      status === REQUEST_VIEW_STATUS.PREFAB.key ||
      status === REQUEST_VIEW_STATUS.DRAFT.key
    ) {
      return (
        <Space>
          <Popconfirm
            disabled={disabled}
            icon={<Icon type="question-circle-o" />}
            placement="bottom"
            trigger="click"
            title={<Tip topic="确定要返回吗？" description="未保存的数据将会丢失!" />}
            onConfirm={closeOrder}
          >
            <Button disabled={disabled}>返回</Button>
          </Popconfirm>
          <Popconfirm
            disabled={disabled}
            icon={<Icon type="question-circle-o" />}
            placement="bottom"
            trigger="click"
            title={
              <Tip topic="确定要执行此操作吗？" description="确认通过后才可以直接生效或启动流程!" />
            }
            onConfirm={confirm}
          >
            <Button disabled={disabled}>确认</Button>
          </Popconfirm>
          <Button type="primary" disabled={disabled} loading={saving} onClick={e => saveOrder(e)}>
            仅保存
          </Button>
        </Space>
      );
    }

    if (status === REQUEST_VIEW_STATUS.CANCELING.key) {
      return (
        <Space>
          <Button onClick={closeOrder} disabled={loadingGlobal}>
            返回
          </Button>
          <Button type="primary" disabled={disabled} loading={saving} onClick={e => cancel(e)}>
            我要撤销确认
          </Button>
        </Space>
      );
    }

    if (status === REQUEST_VIEW_STATUS.CONFIRMED.key) {
      return (
        <Space>
          <Button onClick={closeOrder} disabled={loadingGlobal}>
            返回
          </Button>
          <Popconfirm
            disabled={disabled}
            icon={<Icon type="question-circle-o" />}
            placement="bottom"
            trigger="click"
            title={<Tip topic="确定要直接生效吗？" description="警告：生效后预算可以被业务使用!" />}
            onConfirm={effective}
          >
            <Button loading={effecting} disabled={disabled}>
              直接生效
            </Button>
          </Popconfirm>
          <StartFlow {...startFlowProps}>
            {loading => (
              <Button type="default" disabled={loading || disabled} loading={loading}>
                <FormattedMessage id="global.startFlow" defaultMessage="启动流程" />
              </Button>
            )}
          </StartFlow>
        </Space>
      );
    }

    if (status === REQUEST_VIEW_STATUS.EFFECTING.key) {
      return (
        <Space>
          <Button onClick={closeOrder} disabled={loadingGlobal}>
            返回
          </Button>
          <Button loading={effecting} onClick={effective}>
            我要生效
          </Button>
        </Space>
      );
    }
  };

  render() {
    return <>{this.renderExtActions()}</>;
  }
}

export default ExtAction;
