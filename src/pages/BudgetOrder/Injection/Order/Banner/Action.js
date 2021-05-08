import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
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
    action: PropTypes.oneOf(ACTIONS).isRequired,
    saveOrder: PropTypes.func,
    closeOrder: PropTypes.func,
    saving: PropTypes.bool,
    loadingGlobal: PropTypes.bool,
    flowStatus: PropTypes.string,
    beforeStartFlow: PropTypes.func,
    handlerStartComlete: PropTypes.func,
    tempDisabled: PropTypes.bool,
  };

  renderExtActions = () => {
    const {
      action,
      saveOrder,
      closeOrder,
      loadingGlobal,
      saving,
      beforeStartFlow,
      handlerStartComlete,
      tempDisabled,
    } = this.props;
    const startFlowProps = {
      businessModelCode: 'com.changhong.beis.entity.PaymentRequestHead',
      startComplete: handlerStartComlete,
      beforeStart: beforeStartFlow,
      needStartConfirm: true,
    };
    const disabled = tempDisabled || saving;
    switch (action) {
      case REQUEST_ORDER_ACTION.ADD:
        return (
          <Fragment>
            <StartFlow {...startFlowProps}>
              {loading => (
                <Button type="default" disabled={loading || disabled} loading={loading}>
                  <FormattedMessage id="global.startFlow" defaultMessage="提交审批" />
                </Button>
              )}
            </StartFlow>
            <Popconfirm
              icon={<Icon type="question-circle-o" />}
              placement="left"
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
            <StartFlow {...startFlowProps}>
              {loading => (
                <Button type="default" disabled={loading || disabled} loading={loading}>
                  <FormattedMessage id="global.startFlow" defaultMessage="提交审批" />
                </Button>
              )}
            </StartFlow>
            <Popconfirm
              icon={<Icon type="question-circle-o" />}
              placement="left"
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
