import React, { PureComponent } from 'react';
import cls from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import { get, findIndex } from 'lodash';
import { Button, Icon, Menu, PageHeader, Popover, message } from 'antd';
import { utils, ExtIcon, ScopeDatePicker } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { getUUID } = utils;
const { SEARCH_DATE_PERIOD } = constants;
const { Item } = Menu;

const startFormat = 'YYYY-MM-DD 00:00:00';
const endFormat = 'YYYY-MM-DD 23:59:59';

class FilterDateView extends PureComponent {
  static dateRef = null;

  static propTypes = {
    title: PropTypes.string,
    onAction: PropTypes.func,
    currentViewType: PropTypes.object,
    viewTypeData: PropTypes.array,
  };

  static defaultProps = {
    title: '日期区间',
  };

  constructor(props) {
    super(props);
    const { viewTypeData, currentViewType } = props;
    this.state = {
      startTime: null,
      endTime: null,
      menuShow: false,
      selectedKey: findIndex(viewTypeData, currentViewType),
      menusData: viewTypeData,
      customizeDatePeriod: get(currentViewType, 'name') === SEARCH_DATE_PERIOD.PERIOD.name,
    };
  }

  dataHandle = (currentViewType, period = {}) => {
    const { onAction } = this.props;
    const newVal = { ...currentViewType, ...period };
    switch (currentViewType.anEnum) {
      case 'THIS_MONTH':
        newVal.startTime = moment()
          .startOf('month')
          .format(startFormat);
        newVal.endTime = moment()
          .endOf('month')
          .format(endFormat);
        break;
      case 'THIS_WEEK':
        newVal.startTime = moment()
          .weekday(0)
          .format(startFormat);
        newVal.endTime = moment()
          .weekday(6)
          .format(endFormat);
        break;
      case 'TODAY':
        newVal.startTime = moment().format(startFormat);
        newVal.endTime = moment().format(endFormat);
        break;

      default:
        break;
    }

    if (onAction) {
      onAction(newVal);
    }
  };

  handlerSubmit = () => {
    const { startDate, endDate } = this.dateRef.state;
    const startTime = startDate ? moment(startDate).format(startFormat) : null;
    const endTime = endDate ? moment(endDate).format(endFormat) : null;
    if (!startDate || !endDate) {
      this.setState({
        menuShow: false,
        startTime,
        endTime,
      });

      if (!startDate) {
        message.warning('请配置开始时间');
      } else if (!endDate) {
        message.warning('请配置结束时间');
      }
      return;
    }
    const { viewTypeData } = this.props;
    const currentViewType = viewTypeData.filter(v => v.name === SEARCH_DATE_PERIOD.PERIOD.name)[0];
    this.setState({
      selectedKey: findIndex(viewTypeData, currentViewType),
      menuShow: false,
      startTime,
      endTime,
    });
    this.dataHandle(currentViewType, {
      startTime,
      endTime,
    });
  };

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    const { menusData, selectedKey } = this.state;
    const currentViewType = menusData[e.key];
    const isPeriod = currentViewType.name === SEARCH_DATE_PERIOD.PERIOD.name;
    this.setState({
      selectedKey: isPeriod ? selectedKey : e.key,
      menuShow: isPeriod,
      customizeDatePeriod: isPeriod,
    });
    if (!isPeriod) this.dataHandle(currentViewType);
  };

  onBack = () => {
    this.setState({
      customizeDatePeriod: false,
    });
  };

  getContent = menus => {
    const { selectedKey, customizeDatePeriod, startTime, endTime } = this.state;
    const menuId = getUUID();
    if (customizeDatePeriod) {
      // 自定义区间
      return (
        <PageHeader backIcon={<Icon type="left" />} onBack={this.onBack} title="自定义">
          <ScopeDatePicker
            style={{ width: '280px' }}
            allowClear
            format="YYYY-MM-DD"
            ref={ref => (this.dateRef = ref)}
            value={[startTime, endTime]}
          />
          <div className="btn-group">
            <Button type="primary" onClick={this.handlerSubmit}>
              确定
            </Button>
          </div>
        </PageHeader>
      );
    }
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e)}
        selectedKeys={[`${selectedKey}`]}
      >
        {menus.map((m, index) => {
          return (
            <Item key={index.toString()}>
              {index.toString() === selectedKey.toString() ? (
                <ExtIcon type="check" className="selected" antd />
              ) : null}
              <span className="view-popover-box-trigger">{m.remark}</span>
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
    const { title, currentViewType } = this.props;
    const { menuShow, menusData, startTime, endTime } = this.state;
    let type = get(currentViewType, 'remark');
    if (currentViewType.name === SEARCH_DATE_PERIOD.PERIOD.name) {
      if (startTime && endTime) {
        type = `${startTime ? startTime.slice(0, 10) : ''} 到 ${
          endTime ? endTime.slice(0, 10) : ''
        }`;
      }
    }
    return (
      <>
        {!menusData || menusData.length === 0 ? (
          <span className={cls(styles['view-box'])}>
            <span className="view-label">
              <ExtIcon type="calendar" antd />
              <em>{title}</em>
            </span>
            <span className="view-content">{type}</span>
          </span>
        ) : (
          <Popover
            trigger={['click']}
            content={this.getContent(menusData)}
            placement="bottomRight"
            visible={menuShow}
            overlayClassName={cls(styles['pop-search-box'])}
            onVisibleChange={this.onVisibleChange}
          >
            <span className={cls(styles['view-box'])}>
              <span className="view-label">
                <ExtIcon type="calendar" antd />
                <em>{title}</em>
              </span>
              <span className="view-content">{type}</span>
              <ExtIcon type="down" antd />
            </span>
          </Popover>
        )}
      </>
    );
  }
}

export default FilterDateView;
