import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Layout, Modal } from 'antd';
import { ListLoader, message } from 'suid';
import { constants } from '@/utils';
import Banner from './Banner';
import RequestHead from './Head';
import RequestItem from './Item';
import styles from './index.less';

const { REQUEST_ORDER_ACTION } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);

const { Content } = Layout;

@connect(({ injectionOrder, loading }) => ({ injectionOrder, loading }))
class RequestOrder extends Component {
  static requestHeadRef;

  static needRefreshList;

  static propTypes = {
    title: PropTypes.string.isRequired,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    requestId: PropTypes.string,
    onOrderRef: PropTypes.func,
    onCloseModal: PropTypes.func,
  };

  componentDidMount() {
    const { onOrderRef } = this.props;
    if (onOrderRef) {
      onOrderRef(this);
    }
    this.needRefreshList = false;
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    this.needRefreshList = false;
    dispatch({
      type: 'injectionOrder/updateState',
      payload: {
        headData: null,
        showDimensionSelection: false,
      },
    });
  }

  warning = msg => {
    Modal.warning({
      title: '获取单据失败',
      content: msg,
      okText: '知道了',
      onOk: () => {
        this.closeOrder();
      },
    });
  };

  getRequestHead = () => {
    const { requestId, dispatch } = this.props;
    if (requestId) {
      dispatch({
        type: 'injectionOrder/getHead',
        payload: {
          headId: requestId,
        },
        callback: res => {
          if (res.success === false) {
            this.warning(res.message);
          }
        },
      });
    }
  };

  handlerHeadRef = ref => {
    this.requestHeadRef = ref;
  };

  closeOrder = () => {
    const { onCloseModal } = this.props;
    if (onCloseModal) {
      onCloseModal(this.needRefreshList);
    }
  };

  /** 流程中保存单据的代理方法 */
  linkSaveOrder = callBack => {
    this.saveOrder(null, callBack);
  };

  saveOrder = (e, flowCallBack) => {
    if (e) {
      e.stopPropagation();
    }
    const { dispatch } = this.props;
    const { isValid, data } = this.requestHeadRef.getHeaderData();
    if (isValid) {
      dispatch({
        type: 'injectionOrder/save',
        payload: {
          ...data,
        },
        callback: res => {
          if (flowCallBack && flowCallBack instanceof Function) {
            flowCallBack(res);
          }
          if (res.success) {
            if (this.requestItemRef) {
              this.requestItemRef.reloadData();
            }
            this.needRefreshList = true;
          }
        },
      });
    } else {
      const msg = '数据验证未通过，请检查后再试一次';
      if (flowCallBack && flowCallBack instanceof Function) {
        flowCallBack({ success: false, message: msg });
      } else {
        message.destroy();
        message.error(msg);
      }
    }
  };

  handlerStartComlete = res => {
    if (res.success) {
      this.closeOrder();
    }
  };

  beforeStartFlow = () => {
    return new Promise(resolve => {
      if (this.requestHeadRef) {
        const { data, isValid } = this.requestHeadRef.getHeaderData();
        if (isValid) {
          const { dispatch } = this.props;
          dispatch({
            type: 'injectionOrder/save',
            payload: {
              ...data,
              beforeStartFlow: true,
            },
            callback: res => {
              const { success, message: msg, data: returnData } = res;
              if (res.success) {
                this.needRefreshList = true;
                if (this.requestItemRef) {
                  this.requestItemRef.reloadData();
                }
              }
              resolve({
                success,
                message: msg,
                data: {
                  businessKey: get(returnData, 'id', null),
                },
              });
            },
          });
        } else {
          resolve({ success: false, message: '单据验证未通过' });
        }
      } else {
        resolve({ success: false });
      }
    });
  };

  checkDimensionForSelect = () => {
    const { isValid, data } = this.requestHeadRef.getHeaderData();
    if (isValid) {
      const { dispatch } = this.props;
      dispatch({
        type: 'injectionOrder/checkDimensionForSelect',
        payload: {
          headData: data,
        },
      });
    }
  };

  clearItem = callBack => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionOrder/clearOrderItems',
      successCallback: callBack,
    });
  };

  closeDimensionSelection = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionOrder/updateState',
      payload: {
        showDimensionSelection: false,
      },
    });
  };

  handlerSaveItem = (data, successCallBack) => {
    const { isValid, data: headData } = this.requestHeadRef.getHeaderData();
    if (isValid) {
      const { dispatch } = this.props;
      dispatch({
        type: 'injectionOrder/addOrderDetails',
        payload: {
          ...headData,
          ...data,
        },
        callback: res => {
          if (res.success && successCallBack && successCallBack instanceof Function) {
            successCallBack();
          }
        },
      });
    }
  };

  render() {
    const { action, title, loading, injectionOrder } = this.props;
    const { headData, dimensionsData, showDimensionSelection } = injectionOrder;
    const bannerProps = {
      headData,
      title,
      actionProps: {
        action,
        showDimensionSelection,
        saveOrder: this.saveOrder,
        saving: loading.effects['injectionOrder/save'],
        closeOrder: this.closeOrder,
        loadingGlobal: loading.global,
        beforeStartFlow: this.beforeStartFlow,
        handlerStartComlete: this.handlerStartComlete,
      },
    };
    const requestHeadProps = {
      showDimensionSelection,
      onHeadRef: this.handlerHeadRef,
      action,
      headData,
    };
    const requestItemProps = {
      action,
      headData,
      checkDimensionForSelect: this.checkDimensionForSelect,
      dimensionselectChecking: loading.effects['injectionOrder/checkDimensionForSelect'],
      clearItem: this.clearItem,
      clearing: loading.effects['injectionOrder/clearOrderItems'],
      dimensionsData,
      globalDisabled: loading.global,
      showDimensionSelection,
      closeDimensionSelection: this.closeDimensionSelection,
      save: this.handlerSaveItem,
      saving: loading.effects['injectionOrder/addOrderDetails'],
    };
    const headLoading = loading.effects['injectionOrder/getHead'];
    return (
      <Layout className={cls(styles['order-box'], 'flow-order-box')}>
        <Content className="order-content-box">
          {headLoading ? (
            <ListLoader />
          ) : (
            <>
              <Banner {...bannerProps} />
              <RequestHead {...requestHeadProps} />
              <RequestItem {...requestItemProps} />
            </>
          )}
        </Content>
      </Layout>
    );
  }
}

export default RequestOrder;
