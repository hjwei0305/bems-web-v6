import React, { PureComponent } from 'react';
import { get, isEqual } from 'lodash';
import { Form, Input, Empty, Switch, Alert, List, message } from 'antd';
import { ExtModal, ComboList, utils, ListLoader, ExtIcon, Space, ScrollBar } from 'suid';
import { constants } from '@/utils';
import OrgAssign from './OrgAssign';
import styles from './index.less';

const { request } = utils;
const { SERVER_PATH, STRATEGY_TYPE, MASTER_CLASSIFICATION } = constants;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

@Form.create({
  onValuesChange: (props, _changedValues, allValues) => {
    const { onRowDataChange } = props;
    onRowDataChange(allValues);
  },
})
class FormModal extends PureComponent {
  static scrollBarRef;

  static loaded;

  static orgRef;

  static selectOrgList;

  constructor(props) {
    super(props);
    this.selectOrgList = [];
    this.loaded = false;
    this.state = {
      loading: false,
      showTriggerBack: false,
      showOrgAssign: false,
      classification: MASTER_CLASSIFICATION.DEPARTMENT,
    };
  }

  componentDidMount() {
    const { rowData } = this.props;
    if (rowData && rowData.id) {
      this.getData();
    }
  }

  componentDidUpdate(preProps) {
    const { rowData, showModal } = this.props;
    if (rowData && rowData.id && showModal) {
      if (this.loaded === false && !isEqual(rowData, preProps.rowData)) {
        this.getData();
      }
    }
  }

  handlerTriggerBack = () => {
    this.setState({
      showTriggerBack: false,
      showOrgAssign: false,
    });
  };

  renderTitle = () => {
    const { rowData } = this.props;
    const { showOrgAssign } = this.state;
    let title = rowData && rowData.id ? '修改预算主体' : '新建预算主体';
    if (showOrgAssign) {
      title = '选择部门';
    }
    return title;
  };

  getData = () => {
    const { rowData, classificationData, onRowDataChange } = this.props;
    const id = get(rowData, 'id');
    this.setState({ loading: true });
    request({
      url: `${SERVER_PATH}/bems-v6/subject/findOne`,
      params: { id },
    })
      .then(res => {
        this.loaded = true;
        if (res.success) {
          const masterData = res.data;
          const classificationKey = get(masterData, 'classification');
          const [classification] = classificationData.filter(it => it.key === classificationKey);
          this.setState({ classification }, () => {
            this.selectOrgList = get(masterData, 'orgList') || [];
            onRowDataChange({ ...masterData, classificationName: classification.title });
            setTimeout(() => {
              if (this.scrollBarRef) {
                this.scrollBarRef.updateScroll();
              }
            }, 300);
          });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handlerFormSubmit = () => {
    const { showOrgAssign } = this.state;
    const { form, save, rowData } = this.props;
    if (showOrgAssign) {
      message.destroy();
      if (this.selectOrgList.length === 0) {
        message.error('请选择部门');
        return false;
      }
      this.setState({ showTriggerBack: false, showOrgAssign: false });
    } else {
      form.validateFields(err => {
        if (err) {
          return;
        }
        save({ ...rowData, orgList: this.selectOrgList });
      });
    }
  };

  getClassificationName = classificationKey => {
    const { classificationData } = this.props;
    const [currentClassification] = classificationData.filter(it => it.key === classificationKey);
    if (currentClassification) {
      return currentClassification.title;
    }
    return '';
  };

  handlerShowAssignOrgList = () => {
    this.setState({
      showTriggerBack: true,
      showOrgAssign: true,
    });
  };

  handlerOrgSelectChange = orgList => {
    const { onRowDataChange, rowData } = this.props;
    this.selectOrgList = [...orgList];
    onRowDataChange(rowData);
  };

  renderAssignOrgTrigger = () => {
    const { classification } = this.state;
    if (classification.key === MASTER_CLASSIFICATION.DEPARTMENT.key) {
      const orgList = this.selectOrgList;
      return (
        <>
          <div className="btn-triiger-org" onClick={this.handlerShowAssignOrgList}>
            <Space size={4}>
              <ExtIcon type="cluster" antd className="icon" />
              {`部门(${orgList.length})`}
            </Space>
            <ExtIcon type="right" antd className="arrow" />
          </div>
          <List
            bordered={false}
            dataSource={orgList}
            renderItem={it => (
              <List.Item>
                <List.Item.Meta title={it.name} description={it.namePath} />
              </List.Item>
            )}
          />
        </>
      );
    }
    this.selectOrgList = [];
    return null;
  };

  handlerCloseModal = () => {
    const { closeFormModal } = this.props;
    if (closeFormModal && closeFormModal instanceof Function) {
      closeFormModal();
      this.setState({
        showTriggerBack: false,
        showOrgAssign: false,
      });
    }
  };

  renderContent = () => {
    const { loading } = this.state;
    const { form, classificationData, rowData } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('classification', {
      initialValue: get(rowData, 'classification') || MASTER_CLASSIFICATION.DEPARTMENT.key,
    });
    getFieldDecorator('currencyCode', { initialValue: get(rowData, 'currencyCode') });
    getFieldDecorator('strategyId', { initialValue: get(rowData, 'strategyId') });
    getFieldDecorator('corporationCode', { initialValue: get(rowData, 'corporationCode') });
    const edit = !!rowData && !!rowData.id;
    const corporationProps = {
      form,
      disabled: edit,
      name: 'corporationName',
      store: {
        url: `${SERVER_PATH}/bems-v6/subject/findUserAuthorizedCorporations`,
      },
      remotePaging: false,
      field: ['corporationCode'],
      afterSelect: item => {
        form.setFieldsValue({
          currencyName: get(item, 'baseCurrencyName'),
          currencyCode: get(item, 'baseCurrencyCode'),
        });
      },
      reader: {
        name: 'name',
        field: ['code'],
        description: 'code',
      },
    };
    const classificationProps = {
      form,
      disabled: edit,
      name: 'classificationName',
      showSearch: false,
      pagination: false,
      dataSource: classificationData,
      field: ['classification'],
      afterSelect: it => {
        this.setState({ classification: it });
      },
      reader: {
        name: 'title',
        field: ['key'],
        description: 'key',
      },
    };
    const currencyProps = {
      form,
      disabled: edit,
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
    if (loading) {
      return <Empty image={<ListLoader />} description="加载中..." />;
    }
    return (
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
        <FormItem label="主体分类">
          {getFieldDecorator('classificationName', {
            initialValue: MASTER_CLASSIFICATION.DEPARTMENT.title,
            rules: [
              {
                required: true,
                message: '主体分类不能为空',
              },
            ],
          })(<ComboList {...classificationProps} />)}
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
        <FormItem label="停用">
          {getFieldDecorator('frozen', {
            valuePropName: 'checked',
            initialValue: get(rowData, 'frozen') || false,
          })(<Switch size="small" />)}
        </FormItem>
        {this.renderAssignOrgTrigger()}
      </Form>
    );
  };

  render() {
    const { saving, showModal, rowData } = this.props;
    const { showTriggerBack, showOrgAssign } = this.state;
    return (
      <ExtModal
        destroyOnClose
        onCancel={this.handlerCloseModal}
        visible={showModal}
        maskClosable={false}
        centered
        width={420}
        wrapClassName={styles['form-modal-box']}
        confirmLoading={saving}
        title={this.renderTitle()}
        cancelButtonProps={{ disabled: saving }}
        onOk={this.handlerFormSubmit}
        showTriggerBack={showTriggerBack}
        onTriggerBack={this.handlerTriggerBack}
      >
        {showOrgAssign ? (
          <OrgAssign
            corpCode={get(rowData, 'corporationCode')}
            orgList={this.selectOrgList}
            onOrgRef={ref => (this.orgRef = ref)}
            onSelectChange={this.handlerOrgSelectChange}
          />
        ) : (
          <ScrollBar ref={ref => (this.scrollBarRef = ref)}>
            <Alert message="公司名称、主体分类和币种一旦创建将不能修改！" banner />
            {this.renderContent()}
          </ScrollBar>
        )}
      </ExtModal>
    );
  }
}

export default FormModal;
