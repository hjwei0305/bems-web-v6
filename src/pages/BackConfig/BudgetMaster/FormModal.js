import React, { PureComponent } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ExtModal, ComboList, ComboTree } from 'suid';
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
    const { form, rowData, closeFormModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('corporationCode', { initialValue: get(rowData, 'corporationCode') });
    getFieldDecorator('currencyCode', { initialValue: get(rowData, 'currencyCode') });
    getFieldDecorator('orgId', { initialValue: get(rowData, 'orgId') });
    getFieldDecorator('orgCode', { initialValue: get(rowData, 'orgCode') });
    getFieldDecorator('strategyId', { initialValue: get(rowData, 'strategyId') });
    const title = rowData ? '修改预算主体' : '新建预算主体';
    const corporationProps = {
      form,
      name: 'corporationName',
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/findUserAuthorizedCorporations`,
      },
      remotePaging: false,
      searchProperties: [],
      field: ['corporationCode'],
      afterSelect: item => {
        form.setFieldsValue({
          code: get(item, 'erpCode'),
          name: get(item, 'name'),
          currencyName: get(item, 'baseCurrencyName'),
          currencyCode: get(item, 'baseCurrencyCode'),
        });
      },
      reader: {
        name: 'name',
        field: ['erpCode'],
        description: 'erpCode',
      },
    };
    const currencyProps = {
      form,
      name: 'currencyName',
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/findCurrencies`,
      },
      showSearch: false,
      pagination: false,
      field: ['currencyCode'],
      reader: {
        name: 'name',
        field: ['code'],
        description: 'code',
      },
    };
    const orgProps = {
      form,
      name: 'orgName',
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/findOrgTree`,
      },
      field: ['orgCode', 'orgId'],
      reader: {
        name: 'name',
        field: ['code', 'id'],
      },
    };
    const strategyProps = {
      form,
      name: 'strategyName',
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
          <FormItem label="公司名称">
            {getFieldDecorator('corporationName', {
              initialValue: get(rowData, 'corporationName'),
              rules: [
                {
                  required: true,
                  message: '公司名称不能为空',
                },
              ],
            })(<ComboList {...corporationProps} />)}
          </FormItem>
          <FormItem label="主体代码">
            {getFieldDecorator('code', {
              initialValue: get(rowData, 'code'),
              rules: [
                {
                  required: true,
                  message: '主体代码不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="主体名称">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '主体名称不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="币种">
            {getFieldDecorator('currencyName', {
              initialValue: get(rowData, 'currencyName'),
              rules: [
                {
                  required: true,
                  message: '币种不能为空',
                },
              ],
            })(<ComboList {...currencyProps} />)}
          </FormItem>
          <FormItem label="组织机构">
            {getFieldDecorator('orgName', {
              initialValue: get(rowData, 'orgName'),
              rules: [
                {
                  required: true,
                  message: '组织机构不能为空',
                },
              ],
            })(<ComboTree {...orgProps} />)}
          </FormItem>
          <FormItem label="执行策略">
            {getFieldDecorator('strategyName', {
              initialValue: get(rowData, 'strategyName'),
              rules: [
                {
                  required: true,
                  message: '执行策略不能为空',
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
