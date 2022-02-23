import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, message, Layout } from 'antd';
import { ExtModal, ComboList, ListCard } from 'suid';
import { SorterView } from '@/components';
import { constants } from '@/utils';
import styles from './index.less';

const { Content } = Layout;
const { SERVER_PATH, STRATEGY_TYPE } = constants;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

@Form.create()
class BatchFormModal extends PureComponent {
  static propTypes = {
    save: PropTypes.func,
    showModal: PropTypes.bool,
    currentClassification: PropTypes.object,
    closeFormModal: PropTypes.func,
    saving: PropTypes.bool,
    sortChange: PropTypes.func,
    corpData: PropTypes.array,
    sortData: PropTypes.array,
    currentSort: PropTypes.object,
    sortType: PropTypes.string,
    corpLoading: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      corpCodes: [],
    };
  }

  handlerFormSubmit = () => {
    const { corpCodes } = this.state;
    const { form, save, currentClassification } = this.props;
    if (corpCodes.length === 0) {
      message.destroy();
      message.error('请选择公司');
      return false;
    }
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {
        ...formData,
        corpCodes,
        classification: currentClassification.key,
      };
      save(params);
    });
  };

  handlerSelect = keys => {
    this.setState({ corpCodes: keys });
  };

  handlerCloseModal = () => {
    const { closeFormModal } = this.props;
    if (closeFormModal && closeFormModal instanceof Function) {
      closeFormModal();
    }
  };

  renderContent = () => {
    const {
      form,
      currentClassification,
      currentSort,
      sortType,
      corpData,
      sortData,
      sortChange,
      corpLoading,
    } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('strategyId', { initialValue: null });
    getFieldDecorator('currencyCode', { initialValue: null });
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
    const listCardProps = {
      bordered: false,
      showSearch: false,
      showArrow: false,
      pagination: false,
      rowKey: 'code',
      title: '公司',
      checkbox: true,
      onSelectChange: this.handlerSelect,
      searchProperties: ['name'],
      dataSource: corpData,
      loading: corpLoading,
      itemField: {
        title: item => item.name,
        extra: item => <span style={{ color: '#999' }}>{item.code}</span>,
      },
      cascadeParams: {
        classification: currentClassification.key,
      },
      extra: (
        <SorterView
          title="排序"
          style={{ minWidth: 140 }}
          rowKey="fieldName"
          currentViewType={currentSort}
          viewTypeData={sortData}
          sortType={sortType}
          onAction={sortChange}
          reader={{
            title: 'title',
            value: 'fieldName',
          }}
        />
      ),
    };
    const currencyProps = {
      form,
      name: 'currencyName',
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/findCurrencies`,
        autoLoad: true,
      },
      showSearch: false,
      pagination: false,
      afterLoaded: data => {
        const [defaultCurrency] = data;
        if (defaultCurrency) {
          form.setFieldsValue({
            currencyCode: defaultCurrency.code,
            currencyName: defaultCurrency.name,
          });
        }
      },
      field: ['currencyCode'],
      reader: {
        name: 'name',
        field: ['code'],
        description: 'code',
      },
    };
    return (
      <Layout className="auto-height">
        <Content className="auto-height">
          <div className="corp-box">
            <ListCard {...listCardProps} />
          </div>
          <Form
            {...formItemLayout}
            layout="horizontal"
            style={{ padding: '8px 24px', height: '100%', backgroundColor: '#fff' }}
          >
            <FormItem label="币种">
              {getFieldDecorator('currencyName', {
                initialValue: null,
                rules: [
                  {
                    required: true,
                    message: '币种不能为空',
                  },
                ],
              })(<ComboList {...currencyProps} />)}
            </FormItem>
            <FormItem label="执行策略">
              {getFieldDecorator('strategyName', {
                initialValue: null,
                rules: [
                  {
                    required: true,
                    message: '执行策略不能为空',
                  },
                ],
              })(<ComboList {...strategyProps} />)}
            </FormItem>
          </Form>
        </Content>
      </Layout>
    );
  };

  render() {
    const { saving, showModal, currentClassification } = this.props;
    return (
      <ExtModal
        destroyOnClose
        onCancel={this.handlerCloseModal}
        visible={showModal}
        maskClosable={false}
        centered
        width={420}
        wrapClassName={styles['batch-form-modal']}
        confirmLoading={saving}
        title="批量创建预算主体"
        subTitle={currentClassification.title}
        cancelButtonProps={{ disabled: saving }}
        onOk={this.handlerFormSubmit}
      >
        {this.renderContent()}
      </ExtModal>
    );
  }
}

export default BatchFormModal;
