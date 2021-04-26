import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, isEqual, findIndex } from 'lodash';
import { Dropdown, Menu, Tag } from 'antd';
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
    onAction: PropTypes.func,
    iconType: PropTypes.string,
    extra: PropTypes.node,
    extraTitle: PropTypes.string,
    reader: PropTypes.shape({
      title: PropTypes.string,
      value: PropTypes.string,
    }),
  };

  static defaultProps = {
    extra: null,
    iconType: 'eye',
    title: '视图',
    reader: {
      title: 'title',
      value: 'value',
    },
  };

  constructor(props) {
    super(props);
    const { viewTypeData, currentViewType } = props;
    this.state = {
      menuShow: false,
      selectedKey: findIndex(viewTypeData, currentViewType),
      menusData: viewTypeData,
    };
  }

  componentDidUpdate(prevProps) {
    const { viewTypeData, currentViewType } = this.props;
    if (!isEqual(prevProps.viewTypeData, viewTypeData)) {
      this.setState({
        menusData: viewTypeData,
        selectedKey: findIndex(viewTypeData, currentViewType),
      });
    }
    if (!isEqual(prevProps.currentViewType, currentViewType)) {
      this.setState({
        selectedKey: findIndex(viewTypeData, currentViewType),
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
      const { onAction } = this.props;
      if (onAction) {
        const { menusData } = this.state;
        const currentViewType = menusData[e.key];
        onAction(currentViewType);
      }
    }
  };

  getMenu = menus => {
    const { selectedKey } = this.state;
    const { reader, extra } = this.props;
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e)}
        selectedKeys={[`${selectedKey}`]}
      >
        {extra ? <Item key="extra">{extra}</Item> : null}
        {menus.map((m, index) => {
          return (
            <Item key={index.toString()}>
              {index.toString() === selectedKey.toString() ? (
                <ExtIcon type="check" className="selected" antd />
              ) : null}
              <span className="view-popover-box-trigger">{m[get(reader, 'title')]}</span>
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
    const { currentViewType, reader, title, iconType, extraTitle, style } = this.props;
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

export default FilterView;
