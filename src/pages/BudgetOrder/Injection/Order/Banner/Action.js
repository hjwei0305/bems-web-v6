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
      needStartConfirm: true,
    };
    const disabled = tempDisabled || saving || effecting || confirming || canceling;
    const orderCode = get(headData, 'code');
    const status = get(headData, 'status');
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
            placement="bottomRight"
            trigger="click"
            title={
              <Tip topic="预算确认" description="提示:预算确认过程中，将会对预算进行预算占用!" />
            }
            onConfirm={confirm}
          >
            <Button
              disabled={disabled}
              type={action === REQUEST_ORDER_ACTION.VIEW ? 'primary' : ''}
              loading={confirming}
            >
              预算确认
            </Button>
          </Popconfirm>
          {action === REQUEST_ORDER_ACTION.EDIT || action === REQUEST_ORDER_ACTION.ADD ? (
            <Button type="primary" disabled={disabled} loading={saving} onClick={e => saveOrder(e)}>
              保存
            </Button>
          ) : null}
        </Space>
      );
    }

    if (status === REQUEST_VIEW_STATUS.CONFIRMING.key) {
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
            placement="bottomRight"
            trigger="click"
            title={
              <Tip
                topic="撤销确认"
                description="提示:此操作会撤销之前的预算确认操作，其预占用的预算将会自动释放!"
              />
            }
            onConfirm={cancel}
          >
            <Button disabled={disabled} type="danger" loading={canceling}>
              撤销确认
            </Button>
          </Popconfirm>
          <Popconfirm
            disabled={disabled}
            icon={<Icon type="question-circle-o" />}
            placement="bottomRight"
            trigger="click"
            title={
              <Tip
                topic="预算确认"
                description="提示:当前已经是预算确认中，确定要再次执行此操作吗？"
              />
            }
            onConfirm={confirm}
          >
            <Button disabled={disabled} type="primary" loading={confirming}>
              预算确认
            </Button>
          </Popconfirm>
        </Space>
      );
    }

    if (status === REQUEST_VIEW_STATUS.CANCELING.key) {
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
            placement="bottomRight"
            trigger="click"
            title={
              <Tip topic="撤销确认" description="提示:当前正在撤销，确定要再次执行此操作吗？" />
            }
            onConfirm={cancel}
          >
            <Button type="danger" disabled={disabled} loading={canceling}>
              撤销确认
            </Button>
          </Popconfirm>
        </Space>
      );
    }

    if (status === REQUEST_VIEW_STATUS.CONFIRMED.key) {
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
            placement="bottomRight"
            trigger="click"
            title={
              <Tip
                topic="撤销确认"
                description="提示:此操作会撤销之前的预算确认操作，其预占用的预算将会自动释放!"
              />
            }
            onConfirm={cancel}
          >
            <Button disabled={disabled} loading={canceling}>
              撤销确认
            </Button>
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
              <Button type="primary" disabled={loading || disabled} loading={loading}>
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
