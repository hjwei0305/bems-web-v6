import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Icon, Popconfirm } from 'antd';
import { WorkFlow } from 'suid';
import { constants } from '@/utils';
import Tip from '../../../components/Tip';

const { REQUEST_ORDER_ACTION } = constants;
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
    beforeStartFlow: PropTypes.func,
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
      beforeStartFlow,
      handlerStartComlete,
      tempDisabled,
      effective,
      effecting,
    } = this.props;
    const startFlowProps = {
      businessModelCode: 'ADJUSTMENT',
      startComplete: handlerStartComlete,
      beforeStart: beforeStartFlow,
      needStartConfirm: true,
    };
    const disabled = tempDisabled || saving || effecting;
    const orderCode = get(headData, 'code');
    switch (action) {
      case REQUEST_ORDER_ACTION.ADD:
        return (
          <Fragment>
            {orderCode ? (
              <>
                <Popconfirm
                  disabled={disabled}
                  icon={<Icon type="question-circle-o" />}
                  placement="bottom"
                  trigger="click"
                  title={
                    <Tip topic="确定要直接生效吗？" description="警告：生效后预算可以被业务使用!" />
                  }
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
              </>
            ) : null}
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
            <Button type="primary" disabled={disabled} loading={saving} onClick={e => saveOrder(e)}>
              保存
            </Button>
          </Fragment>
        );
      case REQUEST_ORDER_ACTION.EDIT:
        return (
          <Fragment>
            {orderCode ? (
              <>
                <Popconfirm
                  disabled={disabled}
                  icon={<Icon type="question-circle-o" />}
                  placement="bottom"
                  trigger="click"
                  title={
                    <Tip topic="确定要直接生效吗？" description="警告：生效后预算可以被业务使用!" />
                  }
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
              </>
            ) : null}
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
            <Button type="primary" disabled={disabled} loading={saving} onClick={e => saveOrder(e)}>
              保存
            </Button>
          </Fragment>
        );
      case REQUEST_ORDER_ACTION.VIEW:
        return (
          <Fragment>
            <Button onClick={closeOrder} disabled={loadingGlobal}>
              退出查看
            </Button>
          </Fragment>
        );
      default:
    }
  };

  render() {
    return <Fragment>{this.renderExtActions()}</Fragment>;
  }
}

export default ExtAction;
