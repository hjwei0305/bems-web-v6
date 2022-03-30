import React, { PureComponent } from 'react';
import { get, isEqual } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, ComboList, MoneyInput } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, BUDGET_DIMENSION_UI_COMPONENT } = constants;
const BUDGET_DIMENSION_UI_COMPONENT_DATA = Object.keys(BUDGET_DIMENSION_UI_COMPONENT).map(
  key => BUDGET_DIMENSION_UI_COMPONENT[key],
);
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

@Form.create()
class FormModal extends PureComponent {
  componentDidUpdate(preProps) {
    const { rowData, form } = this.props;
    if (!isEqual(preProps.rowData, rowData)) {
      form.setFieldsValue({ aliasName: this.getDefalutAliasName() });
    }
  }

  handlerFormSubmit = () => {
    const { form, save, rowData } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, rowData || {});
      Object.assign(params, formData);
      save(params);
    });
  };

  getDefalutAliasName = () => {
    const { rowData, allDimensionData } = this.props;
    if (rowData) {
      const [dimensionItem] = allDimensionData.filter(it => it.key === rowData.code);
      if (dimensionItem) {
        return get(dimensionItem, 'value');
      }
    }
    return null;
  };

  render() {
    const { form, rowData, closeFormModal, saving, showModal, allDimensionData } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('strategyId', { initialValue: get(rowData, 'strategyId') });
    getFieldDecorator('code', { initialValue: get(rowData, 'code') });
    const title = rowData ? '修改预算维度' : '新建预算维度';
    const budgetDimensionProps = {
      form,
      name: 'aliasName',
      dataSource: allDimensionData,
      field: ['code'],
      pagination: false,
      showSearch: false,
      afterSelect: item => {
        const originCode = get(rowData, 'code');
        let name = get(rowData, 'name');
        if (originCode !== item.key) {
          name = item.value;
        }
        form.setFieldsValue({ name });
      },
      reader: {
        name: 'value',
        field: ['key'],
        description: 'key',
      },
    };
    const strategyProps = {
      form,
      name: 'strategyName',
      store: {
        url: `${SERVER_PATH}/bems-v6/strategy/findByDimensionCode`,
      },
      cascadeParams: {
        dimensionCode: form.getFieldValue('code'),
      },
      placeholder: '请先选择预算维度',
      showSearch: false,
      pagination: false,
      field: ['strategyId'],
      reader: {
        name: 'name',
        field: ['id'],
      },
    };
    const uiComponentProps = {
      form,
      name: 'uiComponent',
      dataSource: BUDGET_DIMENSION_UI_COMPONENT_DATA,
      pagination: false,
      reader: {
        name: 'code',
        description: 'name',
      },
    };
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeFormModal}
        visible={showModal}
        maskClosable={false}
        centered
        width={420}
        wrapClassName={styles['form-modal-box']}
        bodyStyle={{ padding: 0 }}
        confirmLoading={saving}
        title={title}
        cancelButtonProps={{ disabled: saving }}
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="预算维度">
            {getFieldDecorator('aliasName', {
              initialValue: this.getDefalutAliasName(),
              rules: [
                {
                  required: true,
                  message: '预算维度不能为空',
                },
              ],
            })(<ComboList {...budgetDimensionProps} />)}
          </FormItem>
          <FormItem label="维度名称">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '维度别名不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="维度策略">
            {getFieldDecorator('strategyName', {
              initialValue: get(rowData, 'strategyName'),
              rules: [
                {
                  required: true,
                  message: '维度策略不能为空',
                },
              ],
            })(<ComboList {...strategyProps} />)}
          </FormItem>
          <FormItem label="UI组件">
            {getFieldDecorator('uiComponent', {
              initialValue: get(rowData, 'uiComponent'),
              rules: [
                {
                  required: true,
                  message: 'UI组件不能为空',
                },
              ],
            })(<ComboList {...uiComponentProps} />)}
          </FormItem>
          <FormItem label="序号">
            {getFieldDecorator('rank', {
              initialValue: get(rowData, 'rank') || 0,
              rules: [
                {
                  required: true,
                  message: '序号不能为空',
                },
              ],
            })(<MoneyInput textAlign="left" min={0} thousand={false} precision={0} />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
