import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input, Switch } from 'antd';
import { ExtModal, MoneyInput } from 'suid';
import styles from './index.less';

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

  validateCode = (rule, value, callback) => {
    const reg = /^(?!_)(?!.*?_$)[A-Z_]+$/;
    if (value && !reg.test(value)) {
      callback('代码不规范!');
    }
    callback();
  };

  render() {
    const { form, rowData, closeFormModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    const title = rowData ? '修改预算事件' : '新建预算事件';
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
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem
            label="事件代码"
            extra="代码规范：仅大写字母或下划线组合,且不能以下划线开头和结尾,示例：AAA_BBB"
          >
            {getFieldDecorator('code', {
              initialValue: get(rowData, 'code'),
              rules: [
                {
                  required: true,
                  message: '事件代码不能为空',
                },
                {
                  validator: this.validateCode,
                },
              ],
            })(<Input autoComplete="off" disabled={!!rowData} />)}
          </FormItem>
          <FormItem label="事件名称">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '事件名称不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="业务来源">
            {getFieldDecorator('bizFrom', {
              initialValue: get(rowData, 'bizFrom'),
              rules: [
                {
                  required: true,
                  message: '业务来源不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="标签名" extra="规则：多个用英文逗号分隔">
            {getFieldDecorator('label', {
              initialValue: get(rowData, 'label'),
              rules: [
                {
                  required: false,
                  message: '标签名不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="序号">
            {getFieldDecorator('rank', {
              initialValue: get(rowData, 'rank'),
              rules: [
                {
                  required: true,
                  message: '序号不能为空',
                },
              ],
            })(<MoneyInput textAlign="left" precision={0} min={0} style={{ width: '100%' }} />)}
          </FormItem>
          <FormItem label="停用">
            {getFieldDecorator('frozen', {
              valuePropName: 'checked',
              initialValue: get(rowData, 'frozen') || false,
            })(<Switch size="small" />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
