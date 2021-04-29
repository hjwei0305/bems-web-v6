import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Col, Form, Input, Row } from 'antd';
import { ComboTree, ComboList } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { REQUEST_ORDER_ACTION, SERVER_PATH } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);
const bindFormFields = [
  'subjectId',
  'currencyCode',
  'currencyName',
  'applyOrgId',
  'applyOrgCode',
  'managerOrgId',
  'managerOrgCode',
  'categoryId',
];
const FormItem = Form.Item;
const formItemLayout = {
  style: { margin: '0 auto' },
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

const formItemRemarkLayout = {
  style: { margin: '0 auto' },
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 21,
  },
};

@Form.create()
class RequestHead extends Component {
  static propTypes = {
    onHeadRef: PropTypes.func,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      globalDisabled: false,
    };
  }

  componentDidMount() {
    const { onHeadRef } = this.props;
    if (onHeadRef) {
      onHeadRef(this);
    }
    this.initGlobalAction();
  }

  initGlobalAction = () => {
    const { action } = this.props;
    let globalDisabled = false;
    switch (action) {
      case REQUEST_ORDER_ACTION.VIEW:
      case REQUEST_ORDER_ACTION.VIEW_APPROVE_FLOW:
      case REQUEST_ORDER_ACTION.LINK_VIEW:
        globalDisabled = true;
        break;
      default:
    }
    this.setState({ globalDisabled });
  };

  getHeaderData = () => {
    const { form, headData } = this.props;
    let isValid = false;
    let data = null;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      isValid = true;
      data = {};
      Object.assign(data, headData || {});
      Object.assign(data, formData);
    });
    return { isValid, data };
  };

  initBindFormFields = () => {
    const { form, headData } = this.props;
    const { getFieldDecorator } = form;
    bindFormFields.forEach(fieldName => {
      getFieldDecorator(fieldName, {
        initialValue: get(headData, fieldName),
      });
    });
  };

  render() {
    const { form, headData } = this.props;
    const { globalDisabled } = this.state;
    const { getFieldDecorator } = form;
    this.initBindFormFields();
    const subjectProps = {
      disabled: globalDisabled,
      placeholder: '请选择预算主体',
      form,
      name: 'subjectName',
      field: ['subjectId', 'currencyCode', 'currencyName'],
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/getUserAuthorizedEntities`,
      },
      afterSelect: item => {
        const masterId = form.getFieldValue('subjectId');
        if (item.id !== masterId) {
          form.resetFields(['categoryId', 'categoryName']);
        }
      },
      reader: {
        name: 'name',
        description: 'code',
        field: ['id', 'baseCurrencyCode', 'baseCurrencyName'],
      },
      searchProperties: ['code', 'name', 'erpCode'],
    };
    const applyOrgProps = {
      disabled: globalDisabled,
      form,
      name: 'applyOrgName',
      field: ['applyOrgId', 'applyOrgCode'],
      store: {
        url: `${SERVER_PATH}/bems-v6/order/findOrgTree`,
      },
      reader: {
        name: 'name',
        field: ['id', 'code', 'namePath'],
      },
    };
    const managerOrgProps = {
      disabled: globalDisabled,
      form,
      name: 'managerOrgName',
      field: ['managerOrgId', 'managerOrgCode'],
      store: {
        url: `${SERVER_PATH}/bems-v6/order/findOrgTree`,
      },
      reader: {
        name: 'name',
        field: ['id', 'code'],
      },
    };
    const budgetTypeProps = {
      disabled: globalDisabled,
      form,
      name: 'categoryName',
      field: ['categoryId'],
      store: {
        url: `${SERVER_PATH}/bems-v6/category/findBySubject`,
      },
      cascadeParams: {
        subjectId: form.getFieldValue('subjectId'),
      },
      reader: {
        name: 'name',
        field: ['id'],
      },
    };
    return (
      <div className={cls(styles['head-box'])}>
        <Form {...formItemLayout} layout="horizontal">
          <Row gutter={8} className="row-item">
            <Col span={12}>
              <FormItem label="预算主体">
                {getFieldDecorator('subjectName', {
                  initialValue: get(headData, 'subjectName'),
                  rules: [
                    {
                      required: true,
                      message: '预算主体不能为空！',
                    },
                  ],
                })(<ComboList {...subjectProps} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="申请单位">
                {getFieldDecorator('applyOrgName', {
                  initialValue: get(headData, 'applyOrgName'),
                  rules: [
                    {
                      required: true,
                      message: '申请单位不能为空！',
                    },
                  ],
                })(<ComboTree {...applyOrgProps} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="预算类型">
                {getFieldDecorator('budgetTypeName', {
                  initialValue: get(headData, 'budgetTypeName'),
                  rules: [
                    {
                      required: true,
                      message: '预算类型不能为空！',
                    },
                  ],
                })(<ComboList {...budgetTypeProps} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="归口部门">
                {getFieldDecorator('managerOrgName', {
                  initialValue: get(headData, 'managerOrgName'),
                })(<ComboTree {...managerOrgProps} />)}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="备注说明" {...formItemRemarkLayout}>
                {getFieldDecorator('remark', {
                  initialValue: get(headData, 'remark'),
                })(<Input disabled={globalDisabled} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default RequestHead;
