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
const { BUDGET_POOL_ACTION } = constants;
const { Item } = Menu;

const menuData = () => [
  {
    title: '查看日志',
    key: BUDGET_POOL_ACTION.LOG,
    disabled: false,
    ignore: 'true',
  },
  {
    title: '启用',
    key: BUDGET_POOL_ACTION.UNFROZEN,
    disabled: true,
    ignore: 'true',
  },
  {
    title: '停用',
    key: BUDGET_POOL_ACTION.FROZEN,
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
    const actived = get(recordItem, 'actived');
    const menus = menuData().filter(action => {
      if (authAction(action)) {
        return action;
      }
      return false;
    });
    if (actived) {
      menus.forEach(m => {
        if (m.key === BUDGET_POOL_ACTION.FROZEN) {
          Object.assign(m, { disabled: false });
        }
      });
    } else {
      menus.forEach(m => {
        if (m.key === BUDGET_POOL_ACTION.UNFROZEN) {
          Object.assign(m, { disabled: false });
        }
      });
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
    if (onAction) {
      onAction(e.key, recordItem);
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
          if (m.key === BUDGET_POOL_ACTION.START_FLOW) {
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
          if (m.key === BUDGET_POOL_ACTION.FLOW_HISTORY) {
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
