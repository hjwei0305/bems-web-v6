import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Col, Form, Input, Row, Card, Tag } from 'antd';
import { ComboTree, ComboList } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { REQUEST_ORDER_ACTION, SERVER_PATH, PERIOD_TYPE, ORDER_CATEGORY } = constants;
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
  'orderCategory',
  'periodType',
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
class RequestHead extends PureComponent {
  static propTypes = {
    onHeadRef: PropTypes.func,
    action: PropTypes.oneOf(ACTIONS).isRequired,
    headData: PropTypes.object,
    tempDisabled: PropTypes.bool,
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
    const { action, tempDisabled } = this.props;
    let globalDisabled = tempDisabled || false;
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

  renderDescription = item => {
    const periodType = PERIOD_TYPE[get(item, 'periodType')];
    return (
      <>
        <div style={{ marginBottom: 8 }}>{`期间类型为${get(periodType, 'title')}`}</div>
        <div>
          {item.roll ? <Tag color="magenta">可结转</Tag> : null}
          {item.use ? <Tag color="cyan">业务可用</Tag> : null}
        </div>
      </>
    );
  };

  render() {
    const { form, headData, tempDisabled } = this.props;
    const { globalDisabled } = this.state;
    const { getFieldDecorator } = form;
    const disabled = tempDisabled || globalDisabled;
    this.initBindFormFields();
    const subjectProps = {
      disabled,
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
        field: ['id', 'currencyCode', 'currencyName'],
      },
      searchProperties: ['code', 'name', 'erpCode'],
    };
    const applyOrgProps = {
      disabled,
      form,
      name: 'applyOrgName',
      field: ['applyOrgId', 'applyOrgCode'],
      store: {
        url: `${SERVER_PATH}/bems-v6/order/findOrgTree`,
      },
      reader: {
        name: 'name',
        field: ['id', 'code'],
      },
    };
    const managerOrgProps = {
      allowClear: true,
      disabled,
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
      disabled,
      form,
      name: 'categoryName',
      field: ['categoryId', 'orderCategory', 'periodType'],
      store: {
        url: `${SERVER_PATH}/bems-v6/category/getByCategory`,
      },
      cascadeParams: {
        category: ORDER_CATEGORY.INJECTION.key,
        subjectId: form.getFieldValue('subjectId'),
      },
      listProps: {
        renderItem: item => {
          return (
            <Card.Meta key={item.id} title={item.name} description={this.renderDescription(item)} />
          );
        },
      },
      reader: {
        name: 'name',
        field: ['id', 'orderCategory', 'periodType'],
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
                {getFieldDecorator('categoryName', {
                  initialValue: get(headData, 'categoryName'),
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
                })(<Input disabled={disabled} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default RequestHead;
