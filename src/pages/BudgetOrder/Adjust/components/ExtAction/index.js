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
const { ADJUST_REQUEST_BTN_KEY, REQUEST_VIEW_STATUS } = constants;
const { Item } = Menu;

const menuData = () => [
  {
    title: '查看',
    key: ADJUST_REQUEST_BTN_KEY.VIEW,
    disabled: false,
    ignore: 'true',
  },
  {
    title: formatMessage({ id: 'global.flowHistory', defaultMessage: '流程历史' }),
    key: ADJUST_REQUEST_BTN_KEY.FLOW_HISTORY,
    disabled: true,
    ignore: 'true',
  },
  {
    title: formatMessage({ id: 'global.edit', defaultMessage: '编辑' }),
    key: ADJUST_REQUEST_BTN_KEY.EDIT,
    disabled: true,
    ignore: 'true',
  },
  {
    title: formatMessage({ id: 'global.delete', defaultMessage: '删除' }),
    key: ADJUST_REQUEST_BTN_KEY.DELETE,
    disabled: true,
    ignore: 'true',
  },
  {
    title: '直接生效',
    key: ADJUST_REQUEST_BTN_KEY.EFFECT,
    disabled: true,
    ignore: 'true',
  },
  {
    title: '启动流程',
    key: ADJUST_REQUEST_BTN_KEY.START_FLOW,
    disabled: true,
    ignore: 'true',
  },
];

class ExtAction extends PureComponent {
  static flowLoaded;

  static propTypes = {
    recordItem: PropTypes.object.isRequired,
    onAction: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      menuShow: false,
      manuallyEffective: false,
      selectedKeys: '',
      menusData: [],
    };
  }

  componentDidMount() {
    this.initActionMenus();
  }

  componentDidUpdate(prevProps) {
    const { recordItem } = this.props;
    if (!isEqual(prevProps.recordItem, recordItem)) {
      this.initActionMenus();
    }
  }

  initActionMenus = () => {
    const { recordItem } = this.props;
    const manuallyEffective = get(recordItem, 'manuallyEffective') || false;
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
          if (
            m.key === ADJUST_REQUEST_BTN_KEY.EDIT ||
            m.key === ADJUST_REQUEST_BTN_KEY.DELETE ||
            m.key === ADJUST_REQUEST_BTN_KEY.EFFECT ||
            m.key === ADJUST_REQUEST_BTN_KEY.START_FLOW
          ) {
            Object.assign(m, { disabled: false });
          }
        });
        break;
      case REQUEST_VIEW_STATUS.APPROVING.key:
      case REQUEST_VIEW_STATUS.COMPLETED.key:
        menus.forEach(m => {
          if (m.key === ADJUST_REQUEST_BTN_KEY.FLOW_HISTORY) {
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
      manuallyEffective,
    });
  };

  startFlowCallBack = res => {
    const { onAction, recordItem } = this.props;
    if (res && res.success && onAction) {
      onAction(ADJUST_REQUEST_BTN_KEY.START_FLOW, recordItem);
    }
  };

  beforeStartFlow = () => {
    return new Promise(resolve => {
      this.setState({
        selectedKeys: '',
        menuShow: false,
      });
      this.flowLoaded = message.loading(
        formatMessage({
          id: 'global.startFlow.loading',
          defaultMessage: '正在启动流程...',
        }),
        0,
      );
      resolve({ success: true });
    });
  };

  onActionOperation = e => {
    const { manuallyEffective } = this.state;
    const { onAction, recordItem } = this.props;
    e.domEvent.stopPropagation();
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });

    if (e.key !== ADJUST_REQUEST_BTN_KEY.START_FLOW) {
      if (manuallyEffective && e.key === ADJUST_REQUEST_BTN_KEY.FLOW_HISTORY) {
        message.destroy();
        message.warning('直接生效的预算无流程历史!');
      } else if (onAction) {
        onAction(e.key, recordItem);
      }
    }
  };

  getMenu = (menus, recordItem) => {
    const { manuallyEffective } = this.state;
    const menuId = getUUID();
    console.log(menus);
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, recordItem)}
      >
        {menus.map(m => {
          if (m.key === ADJUST_REQUEST_BTN_KEY.START_FLOW) {
            return (
              <Item key={m.key} disabled={m.disabled}>
                <StartFlow
                  key={recordItem.id}
                  businessKey={recordItem.id}
                  businessModelCode="ADJUSTMENT"
                  startComplete={this.startFlowCallBack}
                  beforeStart={this.beforeStartFlow}
                >
                  {loading => {
                    if (!loading && this.flowLoaded) {
                      this.flowLoaded();
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
          if (m.key === ADJUST_REQUEST_BTN_KEY.FLOW_HISTORY) {
            if (manuallyEffective) {
              return (
                <Item key={m.key} disabled={m.disabled}>
                  <span className="menu-title">{m.title}</span>
                </Item>
              );
            }
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
