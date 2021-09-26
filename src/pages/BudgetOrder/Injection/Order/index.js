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

const { REQUEST_ORDER_ACTION, ORDER_CATEGORY } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);

const { Content } = Layout;

@connect(({ injectionOrder, loading }) => ({ injectionOrder, loading }))
class RequestOrder extends Component {
  static requestAttachmentRef;

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
      type: 'injectionOrder/updateState',
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
        type: 'injectionOrder/getHead',
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
      injectionOrder: { headData },
    } = this.props;
    const orderId = get(headData, 'id');
    dispatch({
      type: 'injectionOrder/effective',
      payload: {
        orderId,
      },
      callbackSuccess: () => {
        this.needRefreshList = true;
      },
    });
  };

  handlerConfirm = () => {
    const { dispatch } = this.props;
    const { isValid, data } = this.requestHeadRef.getHeaderData();
    if (isValid) {
      dispatch({
        type: 'injectionOrder/confirm',
        payload: {
          ...data,
        },
        callbackSuccess: () => {
          this.needRefreshList = true;
        },
      });
    }
  };

  handlerCancel = () => {
    const {
      dispatch,
      injectionOrder: { headData },
    } = this.props;
    const orderId = get(headData, 'id');
    dispatch({
      type: 'injectionOrder/cancel',
      payload: {
        orderId,
      },
      callbackSuccess: () => {
        this.needRefreshList = true;
      },
    });
  };

  handlerAttachmentRef = ref => {
    this.requestAttachmentRef = ref;
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
    const { ready, fileList, errorFileCount } = this.requestAttachmentRef.getAttachmentStatus();
    if (isValid && ready === true && errorFileCount === 0) {
      dispatch({
        type: 'injectionOrder/save',
        payload: {
          ...data,
          orderCategory: ORDER_CATEGORY.INJECTION.key,
          docIds: (fileList || []).map(f => f.id),
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
          orderCategory: ORDER_CATEGORY.INJECTION.key,
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
      type: 'injectionOrder/removeOrderItems',
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
      type: 'injectionOrder/renewHead',
    });
    if (callBack && callBack instanceof Function) {
      callBack();
    }
  };

  handlerSaveItemMoney = (rowItem, amount, callBack) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'injectionOrder/saveItemMoney',
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

  handlerHeadCheck = () => {
    let checkedPassed = false;
    if (this.requestHeadRef) {
      const { dispatch, injectionOrder } = this.props;
      const { headData } = injectionOrder;
      const { data, isValid } = this.requestHeadRef.getHeaderData();
      if (isValid) {
        const head = { ...headData };
        Object.assign(head, data);
        checkedPassed = true;
        dispatch({
          type: 'injectionOrder/updateState',
          payload: { headData: head },
        });
      }
    }
    return checkedPassed;
  };

  handlerCompleteImport = orderId => {
    const { dispatch, injectionOrder } = this.props;
    const { headData } = injectionOrder;
    const id = get(headData, 'id') || orderId;
    const head = { ...headData, id };
    dispatch({
      type: 'injectionOrder/updateState',
      payload: {
        headData: head,
        showProgressResult: true,
      },
    });
  };

  render() {
    const { action, title, loading, injectionOrder } = this.props;
    const {
      headData,
      dimensionsData,
      showDimensionSelection,
      showProgressResult,
      subDimensionFields,
    } = injectionOrder;
    const bannerProps = {
      headData,
      title,
      actionProps: {
        action,
        tempDisabled: showDimensionSelection || showProgressResult,
        saveOrder: this.saveOrder,
        saving: loading.effects['injectionOrder/save'],
        closeOrder: this.closeOrder,
        loadingGlobal: loading.global,
        handlerStartComlete: this.handlerStartComlete,
        effective: this.effective,
        effecting: loading.effects['injectionOrder/effective'],
        confirm: this.handlerConfirm,
        confirming: loading.effects['injectionOrder/confirm'],
        cancel: this.handlerCancel,
        canceling: loading.effects['injectionOrder/cancel'],
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
      headCheck: this.handlerHeadCheck,
      checkDimensionForSelect: this.checkDimensionForSelect,
      dimensionselectChecking: loading.effects['injectionOrder/checkDimensionForSelect'],
      clearItem: this.clearItem,
      clearing: loading.effects['injectionOrder/clearOrderItems'],
      dimensionsData,
      subDimensionFields,
      globalDisabled: loading.global,
      showDimensionSelection,
      showProgressResult,
      onItemCompleted: this.handlerItemCompleted,
      closeDimensionSelection: this.closeDimensionSelection,
      save: this.handlerSaveItem,
      saving: loading.effects['injectionOrder/addOrderDetails'],
      onSaveItemMoney: this.handlerSaveItemMoney,
      itemMoneySaving: loading.effects['injectionOrder/saveItemMoney'],
      removeOrderItems: this.removeOrderItems,
      removing: loading.effects['injectionOrder/removeOrderItems'],
      completeImport: this.handlerCompleteImport,
      onAttachmentRef: this.handlerAttachmentRef,
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
