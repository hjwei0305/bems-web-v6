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
    headData: PropTypes.object,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    saveOrder: PropTypes.func,
    closeOrder: PropTypes.func,
    saving: PropTypes.bool,
    loadingGlobal: PropTypes.bool,
    flowStatus: PropTypes.string,
    handlerStartComlete: PropTypes.func,
    tempDisabled: PropTypes.bool,
    effective: PropTypes.func,
    effecting: PropTypes.bool,
  };

  renderExtActions = () => {
    const {
      headData,
      action,
      saveOrder,
      closeOrder,
      loadingGlobal,
      saving,
      handlerStartComlete,
      tempDisabled,
      effective,
      effecting,
    } = this.props;
    const disabled = tempDisabled || saving || effecting;
    const orderCode = get(headData, 'code');
    const status = get(headData, 'status');
    const startFlowProps = {
      businessKey: get(headData, 'id'),
      businessModelCode: 'ADJUSTMENT',
      startComplete: handlerStartComlete,
      needStartConfirm: true,
    };
    if (
      status === REQUEST_VIEW_STATUS.COMPLETED.key ||
      (status === REQUEST_VIEW_STATUS.APPROVING.key && action === REQUEST_ORDER_ACTION.VIEW)
    ) {
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
            disabled={loadingGlobal}
            icon={<Icon type="question-circle-o" />}
            placement="bottom"
            trigger="click"
            title={
              <Tip
                topic="确定要返回吗？"
                description={action === REQUEST_ORDER_ACTION.VIEW ? '' : '未保存的数据将会丢失!'}
              />
            }
            onConfirm={closeOrder}
          >
            <Button disabled={loadingGlobal}>返回</Button>
          </Popconfirm>
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
              <Button disabled={loading || disabled} loading={loading}>
                <FormattedMessage id="global.startFlow" defaultMessage="启动流程" />
              </Button>
            )}
          </StartFlow>
          {action === REQUEST_ORDER_ACTION.EDIT || action === REQUEST_ORDER_ACTION.ADD ? (
            <Button type="primary" disabled={disabled} loading={saving} onClick={e => saveOrder(e)}>
              保存
            </Button>
          ) : null}
        </Space>
      );
    }
    if (status === REQUEST_VIEW_STATUS.EFFECTING.key) {
      return (
        <Space>
          <Popconfirm
            disabled={loadingGlobal}
            icon={<Icon type="question-circle-o" />}
            placement="bottom"
            trigger="click"
            title={<Tip topic="确定要返回吗？" />}
            onConfirm={closeOrder}
          >
            <Button disabled={loadingGlobal}>返回</Button>
          </Popconfirm>
          <Popconfirm
            disabled={disabled}
            icon={<Icon type="question-circle-o" />}
            placement="bottom"
            trigger="click"
            title={
              <Tip
                topic="确定要直接生效吗？"
                description="提示:当前生效进行中，确定要再次执行此操作吗？"
              />
            }
            onConfirm={effective}
          >
            <Button type="primary" loading={effecting} disabled={disabled}>
              直接生效
            </Button>
          </Popconfirm>
        </Space>
      );
    }
  };

  render() {
    return <>{this.renderExtActions()}</>;
  }
}

export default ExtAction;
