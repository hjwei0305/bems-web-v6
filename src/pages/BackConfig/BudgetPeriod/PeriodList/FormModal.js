import React, { PureComponent } from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import { ExtModal, ComboList, MoneyInput } from 'suid';
import { constants } from '@/utils';
import styles from './FormModal.less';

const FormItem = Form.Item;
const { SERVER_PATH } = constants;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

@Form.create()
class FormModal extends PureComponent {
  static propTypes = {
    rowData: PropTypes.object,
    currentFlowType: PropTypes.object,
    showModal: PropTypes.bool,
    save: PropTypes.func,
    closeFormModal: PropTypes.func,
    saving: PropTypes.bool,
  };

  handlerFormSubmit = () => {
    const { form, save, currentFlowType, rowData } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {
        typeId: get(currentFlowType, 'id'),
      };
      Object.assign(params, rowData);
      Object.assign(params, formData);
      save(params);
    });
  };

  closeFormModal = () => {
    const { closeFormModal } = this.props;
    if (closeFormModal) {
      closeFormModal();
    }
  };

  render() {
    const { form, saving, showModal, rowData } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('handleAccount', { initialValue: get(rowData, 'handleAccount') });
    const title = rowData ? '修改审核节点' : '新建审核节点';
    const nodeUserListProps = {
      form,
      name: 'handleUserName',
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/sei-manager/user/findByPage`,
      },
      placeholder: '请先选择审核人',
      remotePaging: true,
      field: ['handleAccount'],
      searchPlaceHolder: '姓名或账号关键字查询',
      searchProperties: ['userName', 'account'],
      reader: {
        name: 'userName',
        description: 'account',
        field: ['account'],
      },
    };
    return (
      <ExtModal
        destroyOnClose
        onCancel={this.closeFormModal}
        visible={showModal}
        centered
        width={420}
        maskClosable={false}
        wrapClassName={styles['form-box']}
        bodyStyle={{ padding: 0 }}
        confirmLoading={saving}
        onOk={this.handlerFormSubmit}
        title={title}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: '8px 24px' }}>
          <FormItem label="序号">
            {getFieldDecorator('code', {
              initialValue: get(rowData, 'code'),
              rules: [
                {
                  required: true,
                  message: '序号不能为空',
                },
              ],
            })(<MoneyInput max={9999} min={0} textAlign="left" thousand={false} precision={0} />)}
          </FormItem>
          <FormItem label="审核节点名称">
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name'),
              rules: [
                {
                  required: true,
                  message: '审核节点名称不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="审核节点描述">
            {getFieldDecorator('remark', {
              initialValue: get(rowData, 'remark'),
              rules: [
                {
                  required: true,
                  message: '审核节点描述不能为空',
                },
              ],
            })(<TextArea style={{ resize: 'none' }} rows={3} />)}
          </FormItem>
          <FormItem label="审核人">
            {getFieldDecorator('handleUserName', {
              initialValue: get(rowData, 'handleUserName'),
              rules: [
                {
                  required: true,
                  message: '审核人不能为空',
                },
              ],
            })(<ComboList {...nodeUserListProps} />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
