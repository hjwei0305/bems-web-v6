import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get, isEqual } from 'lodash';
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

@connect(({ adjustOrder, loading }) => ({ adjustOrder, loading }))
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
    this.getRequestHead();
  }

  componentDidUpdate(preProps) {
    const { requestId } = this.props;
    if (!isEqual(preProps.requestId, requestId)) {
      this.getRequestHead();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    this.needRefreshList = false;
    dispatch({
      type: 'adjustOrder/updateState',
      payload: {
        headData: null,
        showDimensionSelection: false,
        dimensionsData: [],
        showProgressResult: false,
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
        type: 'adjustOrder/getHead',
        payload: {
          id: requestId,
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

  effective = () => {
    const {
      dispatch,
      adjustOrder: { headData },
    } = this.props;
    const orderId = get(headData, 'id');
    dispatch({
      type: 'adjustOrder/effective',
      payload: {
        orderId,
      },
      callback: res => {
        if (res.success) {
          this.needRefreshList = true;
          this.closeOrder();
        }
      },
    });
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
        type: 'adjustOrder/save',
        payload: {
          ...data,
        },
        callback: res => {
          if (flowCallBack && flowCallBack instanceof Function) {
            flowCallBack(res);
          }
          if (res.success) {
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
            type: 'adjustOrder/save',
            payload: {
              ...data,
              beforeStartFlow: true,
            },
            callback: res => {
              const { success, message: msg, data: returnData } = res;
              if (res.success) {
                this.needRefreshList = true;
                dispatch({
                  type: 'adjustOrder/updateState',
                  payload: {
                    headData: res.data,
                  },
                });
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
        type: 'adjustOrder/checkDimensionForSelect',
        payload: {
          headData: data,
        },
      });
    }
  };

  clearItem = callBack => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adjustOrder/clearOrderItems',
      successCallback: callBack,
    });
  };

  closeDimensionSelection = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adjustOrder/updateState',
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
        type: 'adjustOrder/addOrderDetails',
        payload: {
          ...headData,
          ...data,
        },
        successCallback: resultData => {
          if (successCallBack && successCallBack instanceof Function) {
            successCallBack(resultData);
          }
        },
      });
    }
  };

  removeOrderItems = (data, successCallBack) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adjustOrder/removeOrderItems',
      payload: data,
      successCallback: () => {
        if (successCallBack && successCallBack instanceof Function) {
          successCallBack();
        }
      },
    });
  };

  handlerItemCompleted = callBack => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adjustOrder/updateState',
      payload: {
        showProgressResult: false,
      },
    });
    if (callBack && callBack instanceof Function) {
      callBack();
    }
  };

  handlerSaveItemMoney = (rowItem, amount, callBack) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adjustOrder/saveItemMoney',
      payload: {
        rowItem: { ...rowItem, amount },
      },
      callback: res => {
        if (callBack && callBack instanceof Function) {
          callBack(res);
        }
      },
    });
  };

  render() {
    const { action, title, loading, adjustOrder } = this.props;
    const {
      headData,
      dimensionsData,
      showDimensionSelection,
      showProgressResult,
      subDimensionFields,
    } = adjustOrder;
    const bannerProps = {
      headData,
      title,
      actionProps: {
        action,
        tempDisabled: showDimensionSelection || showProgressResult,
        saveOrder: this.saveOrder,
        saving: loading.effects['adjustOrder/save'],
        closeOrder: this.closeOrder,
        loadingGlobal: loading.global,
        beforeStartFlow: this.beforeStartFlow,
        handlerStartComlete: this.handlerStartComlete,
        effective: this.effective,
        effecting: loading.effects['adjustOrder/effective'],
      },
    };
    const requestHeadProps = {
      tempDisabled: showDimensionSelection || showProgressResult,
      onHeadRef: this.handlerHeadRef,
      action,
      headData,
    };
    const requestItemProps = {
      action,
      headData,
      checkDimensionForSelect: this.checkDimensionForSelect,
      dimensionselectChecking: loading.effects['adjustOrder/checkDimensionForSelect'],
      clearItem: this.clearItem,
      clearing: loading.effects['adjustOrder/clearOrderItems'],
      dimensionsData,
      subDimensionFields,
      globalDisabled: loading.global,
      showDimensionSelection,
      showProgressResult,
      onItemCompleted: this.handlerItemCompleted,
      closeDimensionSelection: this.closeDimensionSelection,
      save: this.handlerSaveItem,
      saving: loading.effects['adjustOrder/addOrderDetails'],
      onSaveItemMoney: this.handlerSaveItemMoney,
      itemMoneySaving: loading.effects['adjustOrder/saveItemMoney'],
      removeOrderItems: this.removeOrderItems,
      removing: loading.effects['adjustOrder/removeOrderItems'],
    };
    const headLoading = loading.effects['adjustOrder/getHead'];
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
