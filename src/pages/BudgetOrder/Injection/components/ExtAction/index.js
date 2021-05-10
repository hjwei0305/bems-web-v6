import React, { PureComponent } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { Dropdown, Menu, message } from 'antd';
import { utils, ExtIcon, WorkFlow } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { getUUID, authAction } = utils;
const { StartFlow, FlowHistoryButton } = WorkFlow;
const { INJECTION_REQUEST_BTN_KEY, REQUEST_VIEW_STATUS } = constants;
const { Item } = Menu;

const menuData = () => [
  {
    title: '查看',
    key: INJECTION_REQUEST_BTN_KEY.VIEW,
    disabled: true,
  },
  {
    title: formatMessage({ id: 'global.flowHistory', defaultMessage: '流程历史' }),
    key: INJECTION_REQUEST_BTN_KEY.FLOW_HISTORY,
    disabled: true,
    ignore: 'true',
  },
  {
    title: formatMessage({ id: 'global.edit', defaultMessage: '编辑' }),
    key: INJECTION_REQUEST_BTN_KEY.EDIT,
    disabled: true,
  },
  {
    title: formatMessage({ id: 'global.delete', defaultMessage: '删除' }),
    key: INJECTION_REQUEST_BTN_KEY.DELETE,
    disabled: true,
  },
  {
    title: formatMessage({ id: 'global.startFlow', defaultMessage: '提交审批' }),
    key: INJECTION_REQUEST_BTN_KEY.START_FLOW,
    disabled: true,
    ignore: 'true',
  },
];

class ExtAction extends PureComponent {
  static propTypes = {
    recordItem: PropTypes.object.isRequired,
    onAction: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      menuShow: false,
      selectedKeys: '',
      menusData: [],
    };
  }

  componentDidMount() {
    this.initActionMenus();
  }

  componentDidUpdate(prevProps) {
    const { currentViewType, recordItem } = this.props;
    if (!isEqual(prevProps.currentViewType, currentViewType)) {
      this.initActionMenus();
    }
    if (!isEqual((prevProps.recordItem || {}).status, (recordItem || {}).status)) {
      this.initActionMenus();
    }
  }

  initActionMenus = () => {
    const { recordItem } = this.props;
    const status = get(recordItem, 'status');
    const menus = menuData().filter(action => {
      if (authAction(action)) {
        return action;
      }
      return false;
    });
    switch (status) {
      case REQUEST_VIEW_STATUS.DRAFT.key:
        menus.forEach(m => {
          if (m.key !== INJECTION_REQUEST_BTN_KEY.FLOW_HISTORY) {
            Object.assign(m, { disabled: false });
          }
        });
        break;
      case REQUEST_VIEW_STATUS.PROCESSING.key:
        menus.forEach(m => {
          if (
            m.key === INJECTION_REQUEST_BTN_KEY.FLOW_HISTORY ||
            m.key === INJECTION_REQUEST_BTN_KEY.VIEW
          ) {
            Object.assign(m, { disabled: false });
          }
        });
        break;
      case REQUEST_VIEW_STATUS.COMPLETED.key:
        menus.forEach(m => {
          if (
            m.key === INJECTION_REQUEST_BTN_KEY.FLOW_HISTORY ||
            m.key === INJECTION_REQUEST_BTN_KEY.VIEW
          ) {
            Object.assign(m, { disabled: false });
          }
        });
        break;
      default:
        break;
    }
    const mData = menus.filter(m => !m.disabled);
    this.setState({
      menusData: mData,
    });
  };

  startFlowCallBack = res => {
    const { onAction, recordItem } = this.props;
    if (res !== true) {
      if (res.statusCode === 200 && res.success) {
        if (onAction) {
          onAction(INJECTION_REQUEST_BTN_KEY.START_FLOW, recordItem);
        }
      }
    }
  };

  beforeStartFlow = () => {
    return new Promise(resolve => {
      this.setState({
        selectedKeys: '',
        menuShow: false,
      });
      this.globalLoad = message.loading(
        formatMessage({
          id: 'global.startFlow.loading',
          defaultMessage: '正在提交审批...',
        }),
        0,
      );
      resolve({ success: true });
    });
  };

  onActionOperation = e => {
    const { onAction, recordItem } = this.props;
    e.domEvent.stopPropagation();
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
    if (onAction) {
      onAction(e.key, recordItem);
    }
  };

  action = (e, key, record) => {
    const { onAction } = this.props;
    e.stopPropagation();
    if (onAction) {
      onAction(key, record);
    }
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
  };

  getMenu = (menus, record) => {
    const { recordItem } = this.props;
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, record)}
      >
        {menus.map(m => {
          if (m.key === INJECTION_REQUEST_BTN_KEY.START_FLOW) {
            return (
              <Item key={m.key} disabled={m.disabled}>
                <StartFlow
                  key={recordItem.id}
                  businessKey={recordItem.id}
                  businessModelCode="com.changhong.beis.entity.PaymentRequestHead"
                  startComplete={this.startFlowCallBack}
                  beforeStart={this.beforeStartFlow}
                >
                  {loading => {
                    if (!loading && this.globalLoad) {
                      this.globalLoad();
                    }
                    return (
                      <div style={{ height: '100%' }}>
                        <span className="menu-title">{m.title}</span>
                      </div>
                    );
                  }}
                </StartFlow>
              </Item>
            );
          }
          if (m.key === INJECTION_REQUEST_BTN_KEY.FLOW_HISTORY) {
            return (
              <Item key={m.key} disabled={m.disabled}>
                <FlowHistoryButton key={m.key} businessId={recordItem.id}>
                  <div style={{ height: '100%' }}>
                    <span className="menu-title">{m.title}</span>
                  </div>
                </FlowHistoryButton>
              </Item>
            );
          }
          return (
            <Item key={m.key} disabled={m.disabled}>
              <span className="menu-title">{m.title}</span>
            </Item>
          );
        })}
      </Menu>
    );
  };

  onVisibleChange = v => {
    const { selectedKeys } = this.state;
    this.setState({
      menuShow: v,
      selectedKeys: !v ? '' : selectedKeys,
    });
  };

  getRenderContent = () => {
    const { recordItem } = this.props;
    const { menuShow, menusData } = this.state;
    return (
      <>
        <Dropdown
          trigger={['click']}
          overlay={this.getMenu(menusData, recordItem)}
          className="action-drop-down"
          placement="bottomLeft"
          visible={menuShow}
          onVisibleChange={this.onVisibleChange}
        >
          <ExtIcon className={cls('action-recordItem')} type="more" antd />
        </Dropdown>
      </>
    );
  };

  render() {
    const { menusData } = this.state;
    return <>{menusData.length > 0 ? this.getRenderContent() : null}</>;
  }
}

export default ExtAction;
