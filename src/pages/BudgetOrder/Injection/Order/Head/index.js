import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Col, Form, Input, Row, Card, Tag } from 'antd';
import { ComboTree, ComboList } from 'suid';
import { constants } from '@/utils';
import { Classification } from '@/components';
import styles from './index.less';

const { REQUEST_ORDER_ACTION, SERVER_PATH, PERIOD_TYPE, ORDER_CATEGORY } = constants;
const ACTIONS = Object.keys(REQUEST_ORDER_ACTION).map(key => REQUEST_ORDER_ACTION[key]);
const bindFormFields = [
  'subjectId',
  'currencyCode',
  'currencyName',
  'applyOrgId',
  'applyOrgCode',
  'categoryId',
  'orderCategory',
  'periodType',
];
const { Meta } = Card;
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
      Object.assign(data, formData, { orderCategory: ORDER_CATEGORY.INJECTION.key });
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
    const { form, headData, tempDisabled, action } = this.props;
    const { globalDisabled } = this.state;
    const { getFieldDecorator } = form;
    const disabled = tempDisabled || globalDisabled;
    const orderId = get(headData, 'id');
    this.initBindFormFields();
    const subjectProps = {
      disabled: disabled || !!orderId,
      placeholder: '请选择预算主体',
      form,
      name: 'subjectName',
      field: ['subjectId', 'currencyCode', 'currencyName'],
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/getUserAuthorizedEntities`,
        autoLoad: action === REQUEST_ORDER_ACTION.ADD,
      },
      afterSelect: () => {
        form.setFieldsValue({
          categoryId: '',
          categoryName: '',
          orderCategory: '',
          periodType: '',
        });
      },
      afterLoaded: data => {
        const [defaultSubject] = data;
        if (defaultSubject) {
          form.setFieldsValue({
            subjectId: defaultSubject.id,
            currencyCode: defaultSubject.currencyCode,
            currencyName: defaultSubject.currencyName,
            subjectName: defaultSubject.name,
            applyOrgId: defaultSubject.orgId,
            applyOrgCode: defaultSubject.orgCode,
            applyOrgName: defaultSubject.orgName,
          });
        }
      },
      listProps: {
        renderItem: item => {
          return (
            <div
              style={{
                display: 'flex',
                cursor: 'pointer',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <div style={{ flexDirection: 'column', width: '100%' }}>
                <Meta
                  className={styles['meta-title']}
                  title={item.name}
                  description={item.corporationName}
                />
              </div>
              <div style={{ minWidth: 60 }}>
                <Classification enumName={item.classification} />
              </div>
            </div>
          );
        },
      },
      reader: {
        name: 'name',
        field: ['id', 'currencyCode', 'currencyName'],
        description: 'corporationName',
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
        field: ['id', 'code'],
      },
    };
    const budgetTypeProps = {
      disabled: disabled || !!orderId,
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
              <FormItem label="备注说明">
                {getFieldDecorator('remark', {
                  initialValue: get(headData, 'remark'),
                })(
                  <Input
                    disabled={globalDisabled}
                    title={get(headData, 'remark')}
                    autoComplete="off"
                  />,
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default RequestHead;
