import React, { PureComponent } from 'react';
import cls from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Button, Icon, Menu, PageHeader, message } from 'antd';
import { ExtIcon, ScopeDatePicker } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SEARCH_DATE_TIME_PERIOD } = constants;
const { Item } = Menu;

const SEARCH_DATE_PERIOD_DATA = Object.keys(SEARCH_DATE_TIME_PERIOD).map(
  key => SEARCH_DATE_TIME_PERIOD[key],
);

class FilterDateView extends PureComponent {
  static dateRef = null;

  static propTypes = {
    currentTimeViewType: PropTypes.object.isRequired,
    onAction: PropTypes.func,
    onFilterDateRef: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const { currentTimeViewType } = props;
    this.state = {
      startTime: null,
      endTime: null,
      customizeDatePeriod: get(currentTimeViewType, 'name') === SEARCH_DATE_TIME_PERIOD.PERIOD.name,
    };
  }

  componentDidMount() {
    const { onFilterDateRef } = this.props;
    if (onFilterDateRef) {
      onFilterDateRef(this);
    }
  }

  getTimeByTimeViewType = currentTimeViewType => {
    const newVal = {};
    const { startTime, endTime } = this.state;
    switch (currentTimeViewType.name) {
      case SEARCH_DATE_TIME_PERIOD.THIS_5M.name:
        newVal.endTime = moment().format('YYYY-MM-DD HH:mm:ss');
        newVal.startTime = moment(newVal.endTime)
          .subtract(5, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
        break;
      case SEARCH_DATE_TIME_PERIOD.THIS_30M.name:
        newVal.endTime = moment().format('YYYY-MM-DD HH:mm:ss');
        newVal.startTime = moment(newVal.endTime)
          .subtract(30, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
        break;
      case SEARCH_DATE_TIME_PERIOD.THIS_60M.name:
        newVal.endTime = moment().format('YYYY-MM-DD HH:mm:ss');
        newVal.startTime = moment(newVal.endTime)
          .subtract(1, 'hour')
          .format('YYYY-MM-DD HH:mm:ss');
        break;
      case SEARCH_DATE_TIME_PERIOD.TODAY.name:
        newVal.startTime = moment().format('YYYY-MM-DD 00:00:00');
        newVal.endTime = moment().format('YYYY-MM-DD 23:59:59');
        break;
      case SEARCH_DATE_TIME_PERIOD.PERIOD.name:
        newVal.startTime = startTime;
        newVal.endTime = endTime;
        break;
      default:
    }
    return newVal;
  };

  dataHandle = (currentTimeViewType, period = {}) => {
    const { onAction } = this.props;
    const newVal = { ...currentTimeViewType, ...period };
    const { startTime, endTime } = this.getTimeByTimeViewType(currentTimeViewType);
    Object.assign(newVal, { startTime, endTime });
    if (onAction) {
      onAction(currentTimeViewType, newVal);
    }
  };

  handlerSubmit = () => {
    const { startDate, endDate } = this.dateRef.state;
    const startTime = startDate ? moment(startDate).format('YYYY-MM-DD HH:mm:00') : null;
    const endTime = endDate ? moment(endDate).format('YYYY-MM-DD HH:mm:59') : null;
    if (!startDate || !endDate) {
      this.setState({
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
    const currentTimeViewType = SEARCH_DATE_PERIOD_DATA.filter(
      i => i.name === SEARCH_DATE_TIME_PERIOD.PERIOD.name,
    )[0];
    this.setState(
      {
        startTime,
        endTime,
      },
      () => {
        this.dataHandle(currentTimeViewType, {
          startTime,
          endTime,
        });
      },
    );
  };

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    const currentTimeViewType = SEARCH_DATE_TIME_PERIOD[e.key];
    const isPeriod = currentTimeViewType.name === SEARCH_DATE_TIME_PERIOD.PERIOD.name;
    this.setState({
      customizeDatePeriod: isPeriod,
    });
    if (!isPeriod) this.dataHandle(currentTimeViewType);
  };

  onBack = () => {
    this.setState({
      customizeDatePeriod: false,
    });
  };

  getContent = () => {
    const { currentTimeViewType } = this.props;
    const { customizeDatePeriod, startTime, endTime } = this.state;
    if (customizeDatePeriod) {
      const scopeDatePickerProps = {
        format: 'YYYY-MM-DD HH:mm',
        showTime: { format: 'HH:mm' },
        value: [startTime, endTime],
        allowClear: true,
      };
      return (
        <PageHeader
          className={cls(styles['pop-search-box'])}
          backIcon={<Icon type="left" />}
          onBack={this.onBack}
          title="指定时间段"
        >
          <ScopeDatePicker ref={ref => (this.dateRef = ref)} {...scopeDatePickerProps} />
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
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e)}
        selectedKeys={[currentTimeViewType.name]}
      >
        {SEARCH_DATE_PERIOD_DATA.map(m => {
          return (
            <Item key={m.name}>
              {m.name === currentTimeViewType.name ? (
                <ExtIcon type="check" className="selected" antd />
              ) : null}
              <span className="view-popover-box-trigger">{m.remark}</span>
            </Item>
          );
        })}
      </Menu>
    );
  };

  render() {
    return <>{this.getContent()}</>;
  }
}

export default FilterDateView;
