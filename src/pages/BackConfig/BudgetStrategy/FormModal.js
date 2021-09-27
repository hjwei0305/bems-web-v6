import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, ComboList } from 'suid';
import { constants } from '@/utils';
import styles from './index.less';

const { STRATEGY_TYPE } = constants;
const STRATEGY_TYPE_DATA = Object.keys(STRATEGY_TYPE).map(key => STRATEGY_TYPE[key]);
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

  getCategoryName = () => {
    const { rowData } = this.props;
    const category = get(rowData, 'category') || '';
    if (category) {
      return get(STRATEGY_TYPE[category], 'title');
    }
    return '';
  };

  render() {
    const { form, rowData, closeFormModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('category', { initialValue: get(rowData, 'category') });
    const title = rowData ? '修改预算策略' : '新建预算策略';
    const categoryNameProps = {
      form,
      name: 'categoryName',
      dataSource: STRATEGY_TYPE_DATA,
      field: ['category'],
      showSearch: false,
      pagination: false,
      reader: {
        name: 'title',
        field: ['key'],
        description: 'key',
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
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="策略名称">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '策略名称不能为空',
                },
                {
                  max: 50,
                  message: '最大长度为50个字符',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="策略类别">
            {getFieldDecorator('categoryName', {
              initialValue: this.getCategoryName(),
              rules: [
                {
                  required: true,
                  message: '策略类别不能为空',
                },
              ],
            })(<ComboList {...categoryNameProps} />)}
          </FormItem>
          <FormItem label="策略类路径">
            {getFieldDecorator('classPath', {
              initialValue: get(rowData, 'classPath'),
              rules: [
                {
                  required: true,
                  message: '策略类路径不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
