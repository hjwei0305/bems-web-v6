import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { isEqual } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon } from 'suid';
import { constants } from '@/utils';
import styles from './ExtAction.less';

const { getUUID } = utils;
const { BUDGET_SUBJECT_USER_ACTION } = constants;
const { Item } = Menu;

const menuData = () => [
  {
    title: '编辑',
    key: BUDGET_SUBJECT_USER_ACTION.EDIT,
    disabled: false,
  },
  {
    title: '删除',
    key: BUDGET_SUBJECT_USER_ACTION.DELETE,
    disabled: false,
  },
  {
    title: '停用',
    key: BUDGET_SUBJECT_USER_ACTION.FROZEN,
    disabled: false,
  },
  {
    title: '启用',
    key: BUDGET_SUBJECT_USER_ACTION.UNFROZEN,
    disabled: false,
  },
];

class ExtAction extends PureComponent {
  static propTypes = {
    recordItem: PropTypes.object,
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
    const menus = menuData();
    menus.forEach(m => {
      if (m.disabled === false) {
        if (recordItem.frozen === true && m.key === BUDGET_SUBJECT_USER_ACTION.FROZEN) {
          Object.assign(m, { disabled: true });
        }
        if (recordItem.frozen === false && m.key === BUDGET_SUBJECT_USER_ACTION.UNFROZEN) {
          Object.assign(m, { disabled: true });
        }
      }
    });

    this.setState({
      menusData: menus.filter(m => !m.disabled),
    });
  };

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
    const { onAction, recordItem } = this.props;
    if (onAction) {
      onAction(e.key, recordItem);
    }
  };

  getMenu = (menus, recordItem) => {
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, recordItem)}
      >
        {menus.map(m => {
          return (
            <Item key={m.key}>
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

  render() {
    const { recordItem } = this.props;
    const { menuShow, menusData } = this.state;
    return (
      <>
        {menusData.length > 0 ? (
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
        ) : null}
      </>
    );
  }
}

export default ExtAction;
