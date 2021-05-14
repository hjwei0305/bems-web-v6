import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon, WorkFlow } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { getUUID, authAction } = utils;
const { StartFlow, FlowHistoryButton } = WorkFlow;
const { INJECTION_REQUEST_BTN_KEY } = constants;
const { Item } = Menu;

const menuData = () => [
  {
    title: '查看',
    key: INJECTION_REQUEST_BTN_KEY.VIEW,
    disabled: false,
    ignore: 'true',
  },
  {
    title: '启用',
    key: INJECTION_REQUEST_BTN_KEY.FLOW_HISTORY,
    disabled: false,
    ignore: 'true',
  },
  {
    title: '停用',
    key: INJECTION_REQUEST_BTN_KEY.EDIT,
    disabled: false,
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
    const status = get(recordItem, 'status');
    const menus = menuData().filter(action => {
      if (authAction(action)) {
        return action;
      }
      return false;
    });
    switch (status) {
      default:
        break;
    }
    const mData = menus.filter(m => !m.disabled);
    this.setState({
      menusData: mData,
    });
  };

  onActionOperation = e => {
    const { onAction, recordItem } = this.props;
    e.domEvent.stopPropagation();
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
    if (e.key !== INJECTION_REQUEST_BTN_KEY.START_FLOW) {
      if (onAction) {
        onAction(e.key, recordItem);
      }
    }
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
                  businessModelCode="INJECTION"
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
          <ExtIcon className={cls('action-item')} type="more" antd />
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
