import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { Dropdown, Menu, Tag, Badge } from 'antd';
import { utils, ExtIcon } from 'suid';
import styles from './index.less';

const { getUUID } = utils;
const { Item } = Menu;

class SortView extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    title: PropTypes.string,
    viewTypeData: PropTypes.array,
    currentViewType: PropTypes.object,
    onAction: PropTypes.func,
    iconType: PropTypes.string,
    extra: PropTypes.node,
    showColor: PropTypes.bool,
    extraTitle: PropTypes.string,
    rowKey: PropTypes.string,
    reader: PropTypes.shape({
      title: PropTypes.string,
      value: PropTypes.string,
    }),
  };

  static defaultProps = {
    extra: null,
    iconType: 'eye',
    rowKey: 'key',
    title: '视图',
    reader: {
      title: 'title',
      value: 'value',
    },
  };

  constructor(props) {
    super(props);
    const { viewTypeData, currentViewType, rowKey } = props;
    const selectedKey = get(currentViewType, rowKey);
    this.state = {
      menuShow: false,
      selectedKey,
      menusData: viewTypeData,
    };
  }

  componentDidUpdate(prevProps) {
    const { viewTypeData } = this.props;
    if (!isEqual(prevProps.viewTypeData, viewTypeData)) {
      this.setState({
        menusData: viewTypeData,
      });
    }
  }

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    if (e.key === 'extra') {
      this.setState({
        menuShow: false,
      });
    } else {
      this.setState({
        selectedKey: e.key,
        menuShow: false,
      });
      const { onAction, rowKey } = this.props;
      if (onAction) {
        const { menusData } = this.state;
        const [currentViewType] = menusData.filter(f => get(f, rowKey) === e.key);
        onAction(currentViewType);
      }
    }
  };

  getMenu = menus => {
    const { selectedKey } = this.state;
    const { reader, extra, showColor, rowKey } = this.props;
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e)}
        selectedKeys={[`${selectedKey}`]}
      >
        {extra ? <Item key="extra">{extra}</Item> : null}
        {menus.map(m => {
          const itemKey = get(m, rowKey);
          return (
            <Item key={itemKey}>
              {itemKey === selectedKey.toString() ? (
                <ExtIcon type="check" className="selected" antd />
              ) : null}
              {showColor ? <Badge color={m.color === '' ? '#d9d9d9' : m.color} /> : null}
              <span className="view-popover-box-trigger">{m[get(reader, 'title')]}</span>
            </Item>
          );
        })}
      </Menu>
    );
  };

  onVisibleChange = v => {
    this.setState({
      menuShow: v,
    });
  };

  render() {
    const { currentViewType, reader, title, iconType, extraTitle, style, showColor } = this.props;
    const { menuShow, menusData } = this.state;
    let currentViewTitle = `${get(currentViewType, get(reader, 'title')) || '无可用视图'}`;
    if (extraTitle) {
      currentViewTitle = (
        <>
          {currentViewTitle}
          <Tag style={{ marginLeft: 8, cursor: 'pointer' }} color="blue">
            {extraTitle}
          </Tag>
        </>
      );
    }
    if (showColor) {
      currentViewTitle = (
        <>
          <Badge color={currentViewType.color === '' ? '#d9d9d9' : currentViewType.color} />
          {currentViewTitle}
        </>
      );
    }
    return (
      <>
        {!menusData || menusData.length === 0 ? (
          <span className={cls(styles['view-box'])}>
            <span className="view-label">
              {iconType ? <ExtIcon type={iconType} antd /> : null}
              <em>{title}</em>
            </span>
            <span className="view-content">{currentViewTitle}</span>
          </span>
        ) : (
          <Dropdown
            trigger={['click']}
            overlay={this.getMenu(menusData)}
            className="action-drop-down"
            placement="bottomLeft"
            visible={menuShow}
            overlayClassName={styles['filter-box']}
            onVisibleChange={this.onVisibleChange}
          >
            <span className={cls('cmp-filter-view', styles['view-box'])} style={style}>
              <span className="view-label">
                {iconType ? <ExtIcon type={iconType} antd /> : null}
                <em>{title}</em>
              </span>
              <span className="view-content">{currentViewTitle}</span>
              <ExtIcon type="down" antd />
            </span>
          </Dropdown>
        )}
      </>
    );
  }
}

export default SortView;
