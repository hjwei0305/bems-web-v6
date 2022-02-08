import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Checkbox } from 'antd';
import { ExtModal, YearPicker, Space } from 'suid';
import { constants } from '@/utils';
import styles from './FormModal.less';

const FormItem = Form.Item;
const { PERIOD_TYPE } = constants;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};
const normalTypeData = Object.keys(PERIOD_TYPE)
  .map(key => PERIOD_TYPE[key])
  .filter(t => t.key !== PERIOD_TYPE.ALL.key && t.key !== PERIOD_TYPE.CUSTOMIZE.key);

@Form.create()
class FormModal extends PureComponent {
  static normalKeys = [];

  static propTypes = {
    rowData: PropTypes.object,
    showModal: PropTypes.bool,
    createNormalPeriod: PropTypes.func,
    closeFormModal: PropTypes.func,
    saving: PropTypes.bool,
    classification: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.normalKeys = normalTypeData.map(t => t.key);
  }

  handlerFormSubmit = () => {
    const { form, createNormalPeriod, rowData } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, rowData);
      Object.assign(params, formData);
      if (this.normalKeys.length > 0) {
        Object.assign(params, {
          periodTypes: this.normalKeys,
        });
        createNormalPeriod(params);
      }
    });
  };

  closeFormModal = () => {
    const { closeFormModal } = this.props;
    if (closeFormModal) {
      closeFormModal();
    }
  };

  normalTypeChange = normalKeys => {
    this.normalKeys = normalKeys;
    this.forceUpdate();
  };

  renderNormalType = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <>
        <FormItem label="年度">
          {getFieldDecorator('year', {
            initialValue: new Date().getFullYear(),
            rules: [
              {
                required: true,
                message: '年度不能为空',
              },
            ],
          })(<YearPicker format="YYYY年" />)}
        </FormItem>
        <FormItem
          required
          label="期间选项"
          help={this.normalKeys.length === 0 ? '至少选择一项' : ''}
          validateStatus={this.normalKeys.length === 0 ? 'error' : 'success'}
        >
          <Checkbox.Group
            style={{ width: '100%' }}
            value={this.normalKeys}
            onChange={this.normalTypeChange}
          >
            <Space>
              {normalTypeData.map(t => (
                <Checkbox key={t.key} value={t.key}>
                  {t.title}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </FormItem>
      </>
    );
  };

  render() {
    const { saving, showModal, rowData } = this.props;
    const title = rowData ? '修改期间' : '新建期间';
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
        cancelButtonProps={{ disabled: saving }}
        onOk={this.handlerFormSubmit}
        title={title}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          {this.renderNormalType()}
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
