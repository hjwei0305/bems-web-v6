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
    const { corporationCode } = filterData;
    this.state = {
      filterData,
      corporationCode,
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
    const { filterData, corporationCode } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('onlineBankAccountId', {
      initialValue: get(filterData, 'onlineBankAccountId', null),
    });
    getFieldDecorator('organizationId', {
      initialValue: get(filterData, 'organizationId', null),
    });
    getFieldDecorator('corporationCode', {
      initialValue: get(filterData, 'corporationCode', null),
    });
    const corporationComboListProps = {
      placeholder: formatMessage({ id: 'global.all', defaultMessage: '全部' }),
      allowClear: true,
      rowKey: 'id',
      form,
      store: {
        url: `${SERVER_PATH}/sei-basic/corporation/getUserAuthorizedEntities`,
      },
      name: 'corporationName',
      field: ['corporationCode'],
      reader: {
        name: 'name',
        field: ['code'],
        description: 'code',
      },
      afterSelect: row => {
        if (corporationCode !== row.code) {
          form.setFieldsValue({
            onlineBankAccount: null,
            onlineBankAccountId: null,
          });
          this.setState({
            corporationCode: row.code,
          });
        }
      },
      afterClear: () => {
        form.setFieldsValue({
          onlineBankAccount: null,
          onlineBankAccountId: null,
        });
        this.setState({
          corporationCode: null,
        });
      },
    };

    const organizationProps = {
      placeholder: formatMessage({ id: 'global.all', defaultMessage: '全部' }),
      allowClear: true,
      form,
      name: 'organizationName',
      field: ['organizationId'],
      store: {
        url: `${SERVER_PATH}/sei-basic/organization/findAllAuthTreeEntityData`,
      },
      reader: {
        name: 'name',
        field: ['id'],
      },
    };

    const payerBankAccountComboListProps = {
      placeholder: formatMessage({ id: 'global.all', defaultMessage: '全部' }),
      allowClear: true,
      rowKey: 'id',
      form,
      name: 'onlineBankAccount',
      field: ['onlineBankAccountId'],
      store: {
        url: `${SERVER_PATH}/product-beis/onlineBankAccount/findByCorporationCode`,
      },
      cascadeParams: {
        corporationCode,
      },
      reader: {
        name: 'bankAccount',
        description: 'accountName',
        field: ['id'],
      },
      searchProperties: ['bankAccount', 'accountName'],
    };
    return (
      <>
        <FormItem
          label={formatMessage({ id: 'paymentRequest.corporation', defaultMessage: '公司' })}
        >
          {getFieldDecorator('corporationName', {
            initialValue: get(filterData, 'corporationName', null),
          })(<ComboList {...corporationComboListProps} />)}
        </FormItem>

        <FormItem
          label={formatMessage({
            id: 'paymentRequest.organization',
            defaultMessage: '申请单位',
          })}
        >
          {getFieldDecorator('organizationName', {
            initialValue: get(filterData, 'organizationName', null),
          })(<ComboTree {...organizationProps} />)}
        </FormItem>
        <FormItem
          label={formatMessage({
            id: 'paymentRequest.bankAccount',
            defaultMessage: '付款账户',
          })}
        >
          {getFieldDecorator('onlineBankAccount', {
            initialValue: get(filterData, 'onlineBankAccount', null),
          })(<ComboList {...payerBankAccountComboListProps} />)}
        </FormItem>
      </>
    );
  }

  render() {
    const { showFilter, form, filterData } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('onlineBankAccountId', {
      initialValue: get(filterData, 'onlineBankAccountId', null),
    });
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
