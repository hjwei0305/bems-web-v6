import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, Button, Checkbox, Form, Alert } from 'antd';
import { Space, YearPicker } from 'suid';
import { constants } from '@/utils';

const { PERIOD_TYPE } = constants;
const FormItem = Form.Item;
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

const BatchButton = props => {
  const { createNormalPeriod = () => {}, form, loading } = props;

  const [normalKeys, setNormalKeys] = useState(normalTypeData.map(t => t.key));
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return () => {
      setNormalKeys(normalTypeData.map(t => t.key));
    };
  }, []);

  const normalTypeChange = useCallback(keys => {
    setNormalKeys(keys);
  }, []);

  const handlerSubmit = useCallback(() => {
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, formData);
      if (normalKeys.length > 0) {
        Object.assign(params, {
          periodTypes: normalKeys,
        });
        createNormalPeriod(params, () => {
          setShowForm(false);
        });
      }
    });
  }, [createNormalPeriod, form, normalKeys]);

  const handlerVisibleChange = useCallback(v => {
    setShowForm(v);
  }, []);

  const optionList = useMemo(() => {
    const { getFieldDecorator } = form;
    return (
      <div
        style={{
          padding: 24,
          width: 360,
          height: 380,
          backgroundColor: '#ffffff',
          boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Form {...formItemLayout} layout="horizontal">
          <Alert
            message="此操作将会对以下所有的预算主体生效，如果以存在相应的期间自动忽略生成。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
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
            help={normalKeys.length === 0 ? '至少选择一项' : ''}
            validateStatus={normalKeys.length === 0 ? 'error' : 'success'}
          >
            <Checkbox.Group
              style={{ width: '100%' }}
              value={normalKeys}
              onChange={normalTypeChange}
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
          <FormItem>
            <Button loading={loading} type="primary" onClick={handlerSubmit}>
              确定
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }, [form, handlerSubmit, loading, normalKeys, normalTypeChange]);

  return (
    <Dropdown
      trigger={['click']}
      overlay={optionList}
      visible={showForm}
      onVisibleChange={handlerVisibleChange}
    >
      <Button type="primary" ghost style={{ marginLeft: 8 }}>
        批量生成
      </Button>
    </Dropdown>
  );
};

export default Form.create()(BatchButton);
