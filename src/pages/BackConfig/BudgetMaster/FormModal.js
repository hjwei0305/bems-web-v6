import React, { PureComponent } from 'react';
import { get, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  Empty,
  Switch,
  Alert,
  List,
  message,
  Layout,
  Card,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { ExtModal, ComboList, utils, ListLoader, ScrollBar, ExtIcon } from 'suid';
import { constants } from '@/utils';
import OrgAssign from './OrgAssign';
import styles from './index.less';

const { Sider, Content, Header } = Layout;
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

@Form.create()
class FormModal extends PureComponent {
  static scrollBarRef;

  static loaded;

  static orgRef;

  static propTypes = {
    save: PropTypes.func,
    rowData: PropTypes.object,
    showModal: PropTypes.bool,
    currentClassification: PropTypes.object,
    closeFormModal: PropTypes.func,
    saving: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.loaded = false;
    this.state = {
      loading: false,
      orgList: [],
      isDepartment: false,
    };
  }

  componentDidMount() {
    const { rowData, currentClassification } = this.props;
    if (rowData && currentClassification.key) {
      this.getData();
    }
  }

  componentDidUpdate(preProps) {
    const { rowData } = this.props;
    if (!isEqual(preProps.rowData, rowData)) {
      const isDepartment = get(rowData, 'isDepartment') || false;
      this.setState({ isDepartment });
      this.getData();
    }
  }

  getData = () => {
    const { rowData } = this.props;
    const id = get(rowData, 'id');
    if (id) {
      this.setState({ loading: true });
      request({
        url: `${SERVER_PATH}/bems-v6/subject/findOne`,
        params: { id },
      })
        .then(res => {
          this.loaded = true;
          if (res.success) {
            const masterData = res.data;
            const orgList = get(masterData, 'orgList') || [];
            this.setState({ orgList }, () => {
              if (this.scrollBarRef) {
                this.scrollBarRef.updateScroll();
              }
            });
          }
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  };

  initState = () => {
    this.loaded = false;
    this.setState({
      loading: false,
      orgList: [],
    });
  };

  handlerFormSubmit = () => {
    const { orgList, isDepartment } = this.state;
    const { form, save, rowData, currentClassification } = this.props;
    if (
      isDepartment &&
      currentClassification.key === MASTER_CLASSIFICATION.DEPARTMENT.key &&
      orgList.length === 0
    ) {
      message.destroy();
      message.error('请选择主体部门');
      return false;
    }
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {
        ...rowData,
        ...formData,
        orgList,
        classification: currentClassification.key,
        isDepartment,
      };
      save(params, () => {
        this.initState();
      });
    });
  };

  handlerOrgSelectChange = orgList => {
    this.setState({ orgList });
  };

  handlerDelOrgItem = orgItem => {
    const { orgList: originOrgList } = this.state;
    const orgList = [...originOrgList].filter(it => it.id !== orgItem.id);
    this.setState({ orgList });
  };

  renderOrgList = () => {
    const { rowData } = this.props;
    const { orgList } = this.state;
    const id = get(rowData, 'id');
    return (
      <>
        <List
          bordered={false}
          dataSource={orgList}
          renderItem={it => (
            <List.Item>
              <List.Item.Meta title={it.name} description={it.namePath} />
              {!id ? (
                <Popconfirm title="确定要删除吗？" onConfirm={() => this.handlerDelOrgItem(it)}>
                  <ExtIcon className="btn-del" type="delete" antd />
                </Popconfirm>
              ) : null}
            </List.Item>
          )}
        />
      </>
    );
  };

  handlerCloseModal = () => {
    const { closeFormModal } = this.props;
    if (closeFormModal && closeFormModal instanceof Function) {
      closeFormModal();
      this.initState();
    }
  };

  renderBtnTrigger = () => {
    const { orgList } = this.state;
    const { rowData, form } = this.props;
    const edit = !!rowData;
    if (edit) {
      return null;
    }
    const corporationCode =
      form.getFieldValue('corporationCode') || get(rowData, 'corporationCode');
    return (
      <OrgAssign
        corpCode={corporationCode}
        orgList={orgList}
        onOrgRef={ref => (this.orgRef = ref)}
        onSelectChange={this.handlerOrgSelectChange}
      />
    );
  };

  handlerEnableOrgChange = isDepartment => {
    this.setState({ isDepartment });
  };

  getTipText = () => {
    const { currentClassification } = this.props;
    const tipArr = ['公司', '币种'];
    if (currentClassification.key === MASTER_CLASSIFICATION.DEPARTMENT.key) {
      tipArr.push('部门');
    }
    return `${tipArr.join('、')}一旦创建将不能修改!`;
  };

  renderContent = () => {
    const { loading, orgList, isDepartment } = this.state;
    const { form, rowData, currentClassification } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('currencyCode', { initialValue: get(rowData, 'currencyCode') });
    getFieldDecorator('strategyId', { initialValue: get(rowData, 'strategyId') });
    getFieldDecorator('corporationCode', { initialValue: get(rowData, 'corporationCode') });
    const isClassificationDepartment =
      currentClassification.key === MASTER_CLASSIFICATION.DEPARTMENT.key;
    const edit = !!rowData;
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
        this.setState({ orgList: [] });
      },
      reader: {
        name: 'name',
        field: ['code'],
        description: 'code',
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
      <Layout className="auto-height">
        <Header>
          {' '}
          <Alert message={this.getTipText()} banner />
        </Header>
        <Layout className="auto-height">
          <Content
            className="auto-height"
            style={{ paddingRight: isClassificationDepartment ? 4 : 0 }}
          >
            <Form
              {...formItemLayout}
              layout="horizontal"
              style={{ padding: 24, height: '100%', backgroundColor: '#fff' }}
            >
              <FormItem label="公司">
                {getFieldDecorator('corporationName', {
                  initialValue: get(rowData, 'corporationName'),
                  rules: [
                    {
                      required: true,
                      message: '公司不能为空',
                    },
                  ],
                })(<ComboList {...corporationProps} />)}
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
              <Row>
                <Col span={12}>
                  <FormItem label="停用" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
                    {getFieldDecorator('frozen', {
                      valuePropName: 'checked',
                      initialValue: get(rowData, 'frozen') || false,
                    })(<Switch size="small" />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  {isClassificationDepartment ? (
                    <FormItem label="是部门主体" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
                      {getFieldDecorator('isDepartment', {
                        valuePropName: 'checked',
                        initialValue: get(rowData, 'isDepartment') || false,
                      })(
                        <Switch
                          disabled={edit}
                          size="small"
                          onChange={this.handlerEnableOrgChange}
                        />,
                      )}
                    </FormItem>
                  ) : null}
                </Col>
              </Row>
            </Form>
          </Content>
          {isClassificationDepartment && isDepartment ? (
            <Sider width={380} className="auto-height" theme="light">
              <Card
                bordered={false}
                title={`部门(${orgList.length})`}
                extra={this.renderBtnTrigger()}
              >
                <ScrollBar ref={ref => (this.scrollBarRef = ref)}>{this.renderOrgList()}</ScrollBar>
              </Card>
            </Sider>
          ) : null}
        </Layout>
      </Layout>
    );
  };

  render() {
    const { isDepartment } = this.state;
    const { saving, showModal, rowData, currentClassification } = this.props;
    const isClassificationDepartment =
      currentClassification.key === MASTER_CLASSIFICATION.DEPARTMENT.key;
    const title = rowData ? '修改预算主体' : '新建预算主体';
    return (
      <ExtModal
        destroyOnClose
        onCancel={this.handlerCloseModal}
        visible={showModal}
        maskClosable={false}
        centered
        width={isClassificationDepartment && isDepartment ? 800 : 420}
        wrapClassName={styles['form-modal-box']}
        confirmLoading={saving}
        title={title}
        subTitle={currentClassification.title}
        cancelButtonProps={{ disabled: saving }}
        onOk={this.handlerFormSubmit}
      >
        {this.renderContent()}
      </ExtModal>
    );
  }
}

export default FormModal;
