import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get, isEqual } from 'lodash';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Form, Input, Row, Col, Switch, Checkbox, Radio } from 'antd';
import { BannerTitle, ComboList, Space } from 'suid';
import { constants } from '@/utils';
import styles from './Form.less';

const { ORDER_CATEGORY, PERIOD_TYPE } = constants;
const periodTypeData = Object.keys(PERIOD_TYPE)
  .map(key => PERIOD_TYPE[key])
  .filter(t => t.key !== PERIOD_TYPE.ALL.key);
const orderCategoryData = Object.keys(ORDER_CATEGORY).map(key => ORDER_CATEGORY[key]);
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};
const formItemInlineLayout = {
  labelCol: {
    span: 14,
  },
  wrapperCol: {
    span: 10,
  },
};

@Form.create()
class BudgetTypeForm extends PureComponent {
  static orderCategoryKeys = [];

  constructor(props) {
    super(props);
    const { rowData } = props;
    const orderCategoryKeys = rowData
      ? [get(rowData, 'orderCategory')]
      : orderCategoryData.map(t => t.key);
    this.orderCategoryKeys = orderCategoryKeys;
  }

  componentDidUpdate(prevProps) {
    const { rowData } = this.props;
    if (rowData && !isEqual(prevProps.rowData, rowData)) {
      this.orderCategoryKeys = [get(rowData, 'orderCategory')];
    }
  }

  handlerFormSubmit = () => {
    const { form, save, rowData, handlerPopoverHide } = this.props;
    const { validateFields, getFieldsValue } = form;
    validateFields(errors => {
      if (errors || this.orderCategoryKeys.length === 0) {
        return false;
      }
      const params = {};
      Object.assign(params, rowData || {});
      Object.assign(params, getFieldsValue());
      if (rowData) {
        Object.assign(params, { orderCategory: this.orderCategoryKeys[0] });
      } else {
        Object.assign(params, { orderCategories: this.orderCategoryKeys });
      }
      save(params, handlerPopoverHide);
    });
  };

  getPeriodTypeName = () => {
    const { rowData } = this.props;
    const periodType = PERIOD_TYPE[get(rowData, 'periodType')];
    if (periodType) {
      return periodType.title;
    }
    return '';
  };

  orderCategoryChange = keys => {
    if (keys instanceof Array) {
      this.orderCategoryKeys = keys;
    } else {
      this.orderCategoryKeys = [keys.target.value];
    }
    this.forceUpdate();
  };

  render() {
    const { form, rowData, saving } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('periodType', { initialValue: get(rowData, 'periodType') });
    const title = rowData ? '编辑' : '新建';
    const periodTypeProps = {
      form,
      name: 'periodTypeName',
      dataSource: periodTypeData,
      field: ['periodType'],
      showSearch: false,
      pagination: false,
      reader: {
        name: 'title',
        field: ['key'],
      },
    };
    return (
      <div key="form-box" className={cls(styles['form-box'])}>
        <div className="base-view-body">
          <div className="header">
            <BannerTitle title={title} subTitle="预算类型" />
          </div>
          <Form {...formItemLayout}>
            <FormItem label="预算类型名称">
              {getFieldDecorator('name', {
                initialValue: get(rowData, 'name'),
                rules: [
                  {
                    required: true,
                    message: '预算类型名称不能为空',
                  },
                ],
              })(<Input autoComplete="off" />)}
            </FormItem>
            <FormItem label="期间类型">
              {getFieldDecorator('periodTypeName', {
                initialValue: this.getPeriodTypeName(),
                rules: [
                  {
                    required: true,
                    message: '期间类型不能为空',
                  },
                ],
              })(<ComboList {...periodTypeProps} />)}
            </FormItem>
            <FormItem
              required
              label="管理类型选项"
              help={this.orderCategoryKeys.length === 0 ? '至少选择一项' : ''}
              validateStatus={this.orderCategoryKeys.length === 0 ? 'error' : 'success'}
            >
              {rowData ? (
                <Radio.Group
                  style={{ width: '100%' }}
                  value={this.orderCategoryKeys[0]}
                  onChange={this.orderCategoryChange}
                >
                  <Space>
                    {orderCategoryData.map(t => (
                      <Radio key={t.key} value={t.key}>
                        {t.title}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              ) : (
                <Checkbox.Group
                  style={{ width: '100%' }}
                  value={this.orderCategoryKeys}
                  onChange={this.orderCategoryChange}
                >
                  <Space>
                    {orderCategoryData.map(t => (
                      <Checkbox key={t.key} value={t.key}>
                        {t.title}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
            </FormItem>
            <FormItem required label="预算池选项">
              <Row>
                <Col span={10}>
                  <FormItem {...formItemInlineLayout} style={{ marginBottom: 0 }} label="可结转">
                    {getFieldDecorator('roll', {
                      initialValue: get(rowData, 'roll') || false,
                      valuePropName: 'checked',
                    })(<Switch size="small" />)}
                  </FormItem>
                </Col>
                <Col span={10}>
                  <FormItem label="业务可用" {...formItemInlineLayout} style={{ marginBottom: 0 }}>
                    {getFieldDecorator('use', {
                      initialValue: get(rowData, 'use') || false,
                      valuePropName: 'checked',
                    })(<Switch size="small" />)}
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <FormItem wrapperCol={{ span: 4 }} className="btn-submit" style={{ marginBottom: 0 }}>
              <Button type="primary" loading={saving} onClick={this.handlerFormSubmit}>
                <FormattedMessage id="global.save" defaultMessage="保存" />
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

export default BudgetTypeForm;
