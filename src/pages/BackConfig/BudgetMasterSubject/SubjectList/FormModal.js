import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, ComboList } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { SERVER_PATH, STRATEGY_TYPE } = constants;
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

  render() {
    const { form, rowData, closeModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('strategyId', { initialValue: get(rowData, 'strategyId') });
    const strategyProps = {
      form,
      name: 'strategyName',
      allowClear: true,
      store: {
        url: `${SERVER_PATH}/bems-v6/strategy/findByCategory`,
        params: {
          category: STRATEGY_TYPE.EXECUTION.key,
        },
      },
      showSearch: false,
      pagination: false,
      field: ['strategyId'],
      reader: {
        name: 'name',
        field: ['id'],
      },
    };
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeModal}
        visible={showModal}
        maskClosable={false}
        centered
        width={420}
        wrapClassName={styles['form-modal-box']}
        bodyStyle={{ padding: 0 }}
        confirmLoading={saving}
        title="修改预算科目"
        cancelButtonProps={{ disabled: saving }}
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="科目代码">
            {getFieldDecorator('code', {
              initialValue: get(rowData, 'code'),
              rules: [
                {
                  required: true,
                  message: '科目代码不能为空',
                },
              ],
            })(<Input autoComplete="off" disabled />)}
          </FormItem>
          <FormItem label="科目名称">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '维度名称不能为空',
                },
              ],
            })(<Input autoComplete="off" disabled />)}
          </FormItem>
          <FormItem label="维度策略">
            {getFieldDecorator('strategyName', {
              initialValue: get(rowData, 'strategyName'),
              rules: [
                {
                  required: false,
                  message: '维度策略不能为空',
                },
              ],
            })(<ComboList {...strategyProps} />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
