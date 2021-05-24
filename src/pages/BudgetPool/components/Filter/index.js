import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import moment from 'moment';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { get, isEqual, omit } from 'lodash';
import { Drawer, Form, Button } from 'antd';
import { ScrollBar, ComboList, ScopeDatePicker } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { PERIOD_TYPE } = constants;
const PERIOD_TYPE_DATA = Object.keys(PERIOD_TYPE)
  .map(key => PERIOD_TYPE[key])
  .filter(f => f.key !== PERIOD_TYPE.ALL.key);
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};
const format = 'YYYY-MM-DD';

@Form.create()
class Filter extends PureComponent {
  static propTypes = {
    showFilter: PropTypes.bool,
    filterData: PropTypes.object,
    onFilterSubmit: PropTypes.func,
    onCloseFilter: PropTypes.func,
    onResetFilter: PropTypes.func,
    showLog: PropTypes.bool,
  };

  static defaultProps = {
    showFilter: false,
  };

  constructor(props) {
    super(props);
    const { filterData } = props;
    this.state = {
      filterData,
    };
  }

  componentDidUpdate(preProps) {
    const { filterData } = this.props;
    if (!isEqual(preProps.filterData, filterData)) {
      this.setState({
        filterData,
      });
    }
  }

  handlerFilter = e => {
    if (e) {
      e.preventDefault();
    }
    const { filterData } = this.state;
    const { form, onFilterSubmit } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const submitData = { ...filterData, ...formData };
      const [startDate, endDate] = get(formData, 'startEndDate');
      if (startDate && endDate) {
        Object.assign(submitData, {
          startDate,
          endDate,
        });
      }
      onFilterSubmit(omit(submitData, ['startEndDate']));
    });
  };

  handlerReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      filterData: {},
    });
  };

  handlerClose = () => {
    const { onCloseFilter } = this.props;
    if (onCloseFilter) {
      onCloseFilter();
    }
  };

  getPeriodTypeName = () => {
    const { filterData } = this.state;
    const periodType = PERIOD_TYPE[get(filterData, 'periodType')];
    if (periodType) {
      return periodType.title;
    }
    return '';
  };

  getStartEndDate = () => {
    const { filterData } = this.state;
    let startDate = get(filterData, 'startDate') || '';
    let endDate = get(filterData, 'endDate') || '';
    if (startDate) {
      startDate = moment(startDate).format(format);
    }
    if (endDate) {
      endDate = moment(endDate).format(format);
    }
    return [startDate, endDate];
  };

  getFields() {
    const { filterData } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('periodType', {
      initialValue: get(filterData, 'periodType', null),
    });

    const periodTypeProps = {
      placeholder: formatMessage({ id: 'global.all', defaultMessage: '全部' }),
      allowClear: true,
      form,
      name: 'periodTypeName',
      field: ['periodType'],
      dataSource: PERIOD_TYPE_DATA,
      pagination: false,
      showSearch: false,
      reader: {
        name: 'title',
        field: ['key'],
      },
    };
    return (
      <>
        <FormItem label="期间类型">
          {getFieldDecorator('periodTypeName', {
            initialValue: this.getPeriodTypeName(),
          })(<ComboList {...periodTypeProps} />)}
        </FormItem>
        <FormItem label="有效期">
          {getFieldDecorator('startEndDate', {
            initialValue: this.getStartEndDate(),
          })(<ScopeDatePicker allowClear />)}
        </FormItem>
      </>
    );
  }

  render() {
    const { showFilter, showLog } = this.props;
    return (
      <Drawer
        width={350}
        getContainer={false}
        placement="right"
        visible={showFilter}
        destroyOnClose
        title={formatMessage({ id: 'global.filter', defaultMessage: '过滤' })}
        className={cls(styles['filter-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute', right: showLog ? 8 : 0 }}
      >
        <ScrollBar>
          <div className={cls('content')}>
            <Form {...formItemLayout} layout="vertical">
              {this.getFields()}
            </Form>
          </div>
        </ScrollBar>
        <div className="footer">
          <Button onClick={this.handlerReset}>
            <FormattedMessage id="global.reset" defaultMessage="重置" />
          </Button>
          <Button type="primary" onClick={e => this.handlerFilter(e)}>
            <FormattedMessage id="global.ok" defaultMessage="确定" />
          </Button>
        </div>
      </Drawer>
    );
  }
}

export default Filter;
