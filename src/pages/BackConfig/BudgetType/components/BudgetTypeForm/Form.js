import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get, isEqual } from 'lodash';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Form, Input, Row, Col, Switch, Checkbox } from 'antd';
import { BannerTitle, ComboList, Space } from 'suid';
import { constants } from '@/utils';
import styles from './Form.less';

const { ORDER_CATEGORY, PERIOD_TYPE, MASTER_CLASSIFICATION } = constants;
const classificationData = Object.keys(MASTER_CLASSIFICATION)
  .map(key => MASTER_CLASSIFICATION[key])
  .filter(it => it.key !== MASTER_CLASSIFICATION.ALL.key);
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
      ? get(rowData, 'orderCategories')
      : orderCategoryData.map(t => t.key);
    this.orderCategoryKeys = orderCategoryKeys;
    const periodType = get(rowData, 'periodType');
    let showRoll = true;
    if (periodType === PERIOD_TYPE.CUSTOMIZE.key) {
      showRoll = false;
    }
    this.state = {
      showRoll,
    };
  }

  componentDidUpdate(prevProps) {
    const { rowData } = this.props;
    if (rowData && !isEqual(prevProps.rowData, rowData)) {
      const periodType = get(rowData, 'periodType');
      if (periodType === PERIOD_TYPE.CUSTOMIZE.key) {
        this.setState({ showRoll: false });
      }
      this.orderCategoryKeys = get(rowData, 'orderCategories');
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
      Object.assign(params, { orderCategories: this.orderCategoryKeys });
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

  getClassificationName = () => {
    const { rowData } = this.props;
    const classification = MASTER_CLASSIFICATION[get(rowData, 'classification')];
    if (classification) {
      return classification.title;
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

  handlerPeriodTypeChange = periodType => {
    const { form } = this.props;
    if (periodType.key === PERIOD_TYPE.CUSTOMIZE.key) {
      this.setState({ showRoll: false });
    } else {
      this.setState({ showRoll: true });
    }
    const { roll } = form.getFieldsValue();
    if (roll !== undefined && roll !== null) {
      form.setFieldsValue({ roll: false });
    }
  };

  render() {
    const { showRoll } = this.state;
    const { form, rowData, saving } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('periodType', { initialValue: get(rowData, 'periodType') });
    getFieldDecorator('classification', { initialValue: get(rowData, 'classification') });
    const title = rowData ? '编辑' : '新建';
    const periodTypeProps = {
      form,
      name: 'periodTypeName',
      dataSource: periodTypeData,
      field: ['periodType'],
      showSearch: false,
      pagination: false,
      afterSelect: this.handlerPeriodTypeChange,
      reader: {
        name: 'title',
        field: ['key'],
      },
    };

    const classificationProps = {
      form,
      name: 'classificationName',
      dataSource: classificationData,
      field: ['classification'],
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
            <FormItem label="预算分类">
              {getFieldDecorator('classificationName', {
                initialValue: this.getClassificationName(),
                rules: [
                  {
                    required: true,
                    message: '预算分类不能为空',
                  },
                ],
              })(<ComboList {...classificationProps} />)}
            </FormItem>
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
            </FormItem>
            <FormItem label="预算池选项">
              <Row>
                {showRoll ? (
                  <Col span={10}>
                    <FormItem {...formItemInlineLayout} style={{ marginBottom: 0 }} label="可结转">
                      {getFieldDecorator('roll', {
                        initialValue: get(rowData, 'roll') || false,
                        valuePropName: 'checked',
                      })(<Switch size="small" />)}
                    </FormItem>
                  </Col>
                ) : null}

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
