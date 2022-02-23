import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { Dropdown, Menu, Tag, Badge } from 'antd';
import { utils, ExtIcon } from 'suid';
import styles from './index.less';

const { getUUID } = utils;
const { Item } = Menu;

class FilterView extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    title: PropTypes.string,
    viewTypeData: PropTypes.array,
    currentViewType: PropTypes.object,
    sortType: PropTypes.string,
    onAction: PropTypes.func,
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
    rowKey: 'key',
    title: '排序',
    sortType: 'DESC',
    reader: {
      title: 'title',
      value: 'value',
    },
  };

  constructor(props) {
    super(props);
    const { viewTypeData, currentViewType, rowKey, sortType } = props;
    const selectedKey = get(currentViewType, rowKey);
    this.state = {
      menuShow: false,
      selectedKey,
      menusData: viewTypeData,
      sortType,
    };
  }

  componentDidUpdate(prevProps) {
    const { viewTypeData, sortType } = this.props;
    if (!isEqual(prevProps.viewTypeData, viewTypeData)) {
      this.setState({
        menusData: viewTypeData,
      });
    }
    if (!isEqual(prevProps.sortType, sortType)) {
      this.setState({
        sortType,
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
        const { menusData, sortType } = this.state;
        const [currentViewType] = menusData.filter(f => get(f, rowKey) === e.key);
        onAction(currentViewType, sortType);
      }
    }
  };

  handlerSortChange = e => {
    if (e) {
      e.stopPropagation();
    }
    const { currentViewType, onAction } = this.props;
    const { sortType } = this.state;
    const sort = sortType === 'DESC' ? 'ASC' : 'DESC';
    this.setState({ sortType: sort }, () => {
      onAction(currentViewType, sort);
    });
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
    const { menuShow, menusData, sortType } = this.state;
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
              <ExtIcon
                className="btn-sort"
                tooltip={{ title: sortType === 'DESC' ? '降序' : '升序' }}
                type={sortType === 'DESC' ? 'desc' : 'asc'}
                onClick={this.handlerSortChange}
              />
            </span>
          </Dropdown>
        )}
      </>
    );
  }
}

export default FilterView;
