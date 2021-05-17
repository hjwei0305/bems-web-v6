import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { get, isEqual } from 'lodash';
import { Drawer, Form, Button } from 'antd';
import { ScrollBar, ComboList, ComboTree } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH } = constants;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

@Form.create()
class Filter extends PureComponent {
  static propTypes = {
    showFilter: PropTypes.bool,
    filterData: PropTypes.object,
    onFilterSubmit: PropTypes.func,
    onCloseFilter: PropTypes.func,
    onResetFilter: PropTypes.func,
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
      onFilterSubmit(submitData);
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

  getFields() {
    const { filterData } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('subjectId', {
      initialValue: get(filterData, 'subjectId', null),
    });
    getFieldDecorator('applyOrgId', {
      initialValue: get(filterData, 'applyOrgId', null),
    });
    const corporationComboListProps = {
      placeholder: formatMessage({ id: 'global.all', defaultMessage: '全部' }),
      allowClear: true,
      rowKey: 'id',
      form,
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/getUserAuthorizedEntities`,
      },
      name: 'subjectName',
      field: ['subjectId'],
      reader: {
        name: 'name',
        description: 'code',
        field: ['id'],
      },
    };

    const organizationProps = {
      placeholder: formatMessage({ id: 'global.all', defaultMessage: '全部' }),
      allowClear: true,
      form,
      name: 'applyOrgName',
      field: ['applyOrgId'],
      store: {
        url: `${SERVER_PATH}/bems-v6/order/findOrgTree`,
      },
      reader: {
        name: 'name',
        field: ['id'],
      },
    };
    return (
      <>
        <FormItem label="预算主体">
          {getFieldDecorator('corporationName', {
            initialValue: get(filterData, 'corporationName', null),
          })(<ComboList {...corporationComboListProps} />)}
        </FormItem>

        <FormItem label="申请单位">
          {getFieldDecorator('applyOrgName', {
            initialValue: get(filterData, 'applyOrgName', null),
          })(<ComboTree {...organizationProps} />)}
        </FormItem>
      </>
    );
  }

  render() {
    const { showFilter } = this.props;
    return (
      <Drawer
        width={350}
        getContainer={false}
        placement="right"
        visible={showFilter}
        title={formatMessage({ id: 'global.filter', defaultMessage: '过滤' })}
        className={cls(styles['filter-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute' }}
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
