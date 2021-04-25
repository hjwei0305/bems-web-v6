import React, { PureComponent } from 'react';
import { get, isEqual, omit } from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form, Input, Radio, Checkbox } from 'antd';
import { ExtModal, YearPicker, Space, ScopeDatePicker } from 'suid';
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
const format = 'YYYY-MM-DD';
const PERIOD_TYPE_GROUP = { NORMAL: 'NORMAL', CUSTOMIZE: 'CUSTOMIZE' };

@Form.create()
class FormModal extends PureComponent {
  static normalKeys = [];

  static propTypes = {
    rowData: PropTypes.object,
    showModal: PropTypes.bool,
    saveCustomizePeriod: PropTypes.func,
    createNormalPeriod: PropTypes.func,
    closeFormModal: PropTypes.func,
    saving: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.normalKeys = normalTypeData.map(t => t.key);
    const { rowData } = props;
    const type = get(rowData, 'type');
    let periodType = PERIOD_TYPE_GROUP.NORMAL;
    if (type && type === PERIOD_TYPE.CUSTOMIZE.key) {
      periodType = PERIOD_TYPE_GROUP.CUSTOMIZE;
    }
    this.state = {
      periodType,
    };
  }

  componentDidUpdate(prevProps) {
    const { rowData } = this.props;
    if (!isEqual(prevProps.rowData, rowData)) {
      const type = get(rowData, 'type');
      let periodType = PERIOD_TYPE_GROUP.NORMAL;
      if (type && type === PERIOD_TYPE.CUSTOMIZE.key) {
        periodType = PERIOD_TYPE_GROUP.CUSTOMIZE;
      }
      this.setState({ periodType });
    }
  }

  handlerFormSubmit = () => {
    const { periodType } = this.state;
    const { form, saveCustomizePeriod, createNormalPeriod, rowData } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, rowData);
      Object.assign(params, omit(formData, ['startEndDate']));
      if (periodType === PERIOD_TYPE_GROUP.CUSTOMIZE) {
        const [startDate, endDate] = get(formData, 'startEndDate');
        Object.assign(params, {
          startDate,
          endDate,
        });
        saveCustomizePeriod(params);
      } else if (this.normalKeys.length > 0) {
        Object.assign(params, {
          periodTypes: this.normalKeys,
        });
        createNormalPeriod(params);
      }
    });
  };

  handlerTypeChange = e => {
    this.setState({ periodType: e.target.value });
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
    const { periodType } = this.state;
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
        <Form {...formItemLayout} layout="horizontal" style={{ margin: '8px 24px' }}>
          <FormItem label="期间类别">
            <Radio.Group value={periodType} onChange={this.handlerTypeChange} size="small">
              <Radio.Button key="NORMAL" value="NORMAL">
                标准
              </Radio.Button>
              <Radio.Button key="CUSTOMIZE" value="CUSTOMIZE">
                自定义
              </Radio.Button>
            </Radio.Group>
          </FormItem>
          {periodType === PERIOD_TYPE_GROUP.NORMAL ? (
            this.renderNormalType()
          ) : (
            <>
              <FormItem label="期间名称" style={{ width: 360 }}>
                {getFieldDecorator('name', {
                  initialValue: get(rowData, 'name'),
                  rules: [
                    {
                      required: true,
                      message: '期间名称不能为空',
                    },
                  ],
                })(<Input autoComplete="off" />)}
              </FormItem>
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
            </>
          )}
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
