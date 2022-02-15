import React, { PureComponent } from 'react';
import { get, omit } from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form } from 'antd';
import { ExtModal, ScopeDatePicker } from 'suid';
import styles from './FormModal.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};
const format = 'YYYY-MM-DD';

@Form.create()
class FormModal extends PureComponent {
  static normalKeys = [];

  static propTypes = {
    rowData: PropTypes.object,
    showModal: PropTypes.bool,
    savePeriod: PropTypes.func,
    closeFormModal: PropTypes.func,
    saving: PropTypes.bool,
  };

  handlerFormSubmit = () => {
    const { form, savePeriod, rowData } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, rowData);
      Object.assign(params, omit(formData, ['startEndDate']));
      const [startDate, endDate] = get(formData, 'startEndDate');
      Object.assign(params, {
        startDate,
        endDate,
      });
      savePeriod(params);
    });
  };

  closeFormModal = () => {
    const { closeFormModal } = this.props;
    if (closeFormModal) {
      closeFormModal();
    }
  };

  getStartEndDate = () => {
    const { rowData } = this.props;
    let startDate = get(rowData, 'startDate') || '';
    let endDate = get(rowData, 'endDate') || '';
    if (startDate) {
      startDate = moment(startDate).format(format);
    }
    if (endDate) {
      endDate = moment(endDate).format(format);
    }
    return [startDate, endDate];
  };

  validateStartEndDate = (rule, value, callback) => {
    if (!value || (value && value.filter(v => !!v).length !== 2)) {
      callback('起止日期不能为空');
    }
    callback();
  };

  render() {
    const { form, saving, showModal, rowData } = this.props;
    const { getFieldDecorator } = form;
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
        <Form {...formItemLayout} layout="horizontal" style={{ margin: '24px' }}>
          <FormItem label="起止日期" style={{ width: 360 }}>
            {getFieldDecorator('startEndDate', {
              initialValue: this.getStartEndDate(),
              rules: [
                {
                  required: true,
                  message: '起止日期不能为空',
                },
                {
                  validator: this.validateStartEndDate,
                },
              ],
            })(<ScopeDatePicker allowClear={false} />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
