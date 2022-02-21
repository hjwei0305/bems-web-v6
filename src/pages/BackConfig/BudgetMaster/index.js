import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Popconfirm, Tag, Badge, Dropdown, Menu } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, Space, PageLoader } from 'suid';
import { Classification } from '@/components';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const BatchFormModal = React.lazy(() => import('./BatchFormModal'));
const { SERVER_PATH, MASTER_CLASSIFICATION } = constants;

@connect(({ budgetMaster, loading }) => ({ budgetMaster, loading }))
class BudgetMaster extends Component {
  static tablRef;

  constructor(props) {
    super(props);
    this.state = {
      delRowId: null,
    };
  }

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  edit = rowData => {
    const {
      dispatch,
      budgetMaster: { classificationData },
    } = this.props;
    const classificationKey = get(rowData, 'classification');
    const [classification] = classificationData.filter(it => it.key === classificationKey);
    dispatch({
      type: 'budgetMaster/updateState',
      payload: {
        showModal: true,
        rowData,
        currentClassification: classification,
      },
    });
  };

  save = (data, callback = () => {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMaster/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          callback();
          this.reloadData();
        }
      },
    });
  };

  batchSave = (data, callback = () => {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMaster/batchSave',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          callback();
          this.reloadData();
        }
      },
    });
  };

  del = record => {
    const { dispatch } = this.props;
    this.setState(
      {
        delRowId: record.id,
      },
      () => {
        dispatch({
          type: 'budgetMaster/del',
          payload: {
            id: record.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                delRowId: null,
              });
              this.reloadData();
            }
          },
        });
      },
    );
  };

  closeFormModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMaster/updateState',
      payload: {
        showModal: false,
        showBatchModal: false,
        rowData: null,
        currentClassification: {},
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { delRowId } = this.state;
    if (loading.effects['budgetMaster/del'] && delRowId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  handlerClassificationAction = e => {
    const { dispatch, budgetMaster } = this.props;
    const { classificationData } = budgetMaster;
    const [classification] = classificationData.filter(it => it.key === e.key);
    dispatch({
      type: 'budgetMaster/updateState',
      payload: {
        showModal: true,
        rowData: null,
        currentClassification: classification,
      },
    });
  };

  handlerBatchClassificationAction = e => {
    const { dispatch, budgetMaster } = this.props;
    const { classificationData } = budgetMaster;
    const [classification] = classificationData.filter(it => it.key === e.key);
    dispatch({
      type: 'budgetMaster/updateState',
      payload: {
        showBatchModal: true,
        rowData: null,
        currentClassification: classification,
      },
    });
  };

  render() {
    const { budgetMaster, loading } = this.props;
    const {
      showModal,
      showBatchModal,
      rowData,
      classificationData,
      currentClassification,
    } = budgetMaster;
    const columns = [
      {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (text, record) => (
          <span className={cls('action-box')}>
            <ExtIcon className="edit" onClick={() => this.edit(record)} type="edit" antd />
            <Popconfirm
              placement="topLeft"
              title={formatMessage({
                id: 'global.delete.confirm',
                defaultMessage: '确定要删除吗？提示：删除后不可恢复',
              })}
              onConfirm={() => this.del(record)}
            >
              {this.renderDelBtn(record)}
            </Popconfirm>
          </span>
        ),
      },
      {
        title: '主体名称',
        dataIndex: 'name',
        width: 360,
        required: true,
      },
      {
        title: '主体分类',
        dataIndex: 'classification',
        width: 100,
        required: true,
        render: t => <Classification enumName={t} />,
      },
      {
        title: '执行策略',
        dataIndex: 'strategyName',
        width: 160,
        render: t => (
          <Tag>
            <Badge color="blue" />
            {t}
          </Tag>
        ),
      },
      {
        title: '币种',
        dataIndex: 'currencyName',
        width: 120,
        render: (t, r) => {
          const code = get(r, 'currencyCode');
          if (code) {
            return `${t}(${code})`;
          }
          return t;
        },
      },
      {
        title: '公司代码',
        dataIndex: 'corporationCode',
        width: 90,
      },
      {
        title: '公司名称',
        dataIndex: 'corporationName',
        width: 360,
      },
    ];
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      currentClassification,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['budgetMaster/save'],
    };
    const batchFormModalProps = {
      save: this.batchSave,
      showModal: showBatchModal,
      currentClassification,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['budgetMaster/batchSave'],
    };
    const menu = (
      <Menu onClick={this.handlerClassificationAction} className={styles['action-box']}>
        {classificationData.map(it => {
          return <Menu.Item key={it.key}>{it.title}</Menu.Item>;
        })}
      </Menu>
    );
    const batchMenu = (
      <Menu onClick={this.handlerBatchClassificationAction} className={styles['action-box']}>
        {classificationData
          .filter(it => it.key !== MASTER_CLASSIFICATION.DEPARTMENT.key)
          .map(it => {
            return <Menu.Item key={it.key}>{it.title}</Menu.Item>;
          })}
      </Menu>
    );
    const toolBarProps = {
      left: (
        <Space>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="primary">
              <FormattedMessage id="global.add" defaultMessage="新建" />
              <ExtIcon type="down" antd />
            </Button>
          </Dropdown>
          <Dropdown overlay={batchMenu} trigger={['click']}>
            <Button>
              批量创建
              <ExtIcon type="down" antd />
            </Button>
          </Dropdown>
        </Space>
      ),
    };
    const tableProps = {
      toolBar: toolBarProps,
      columns,
      searchWidth: 260,
      lineNumber: false,
      searchPlaceHolder: '输入预算主体名称关键字',
      searchProperties: ['name'],
      remotePaging: true,
      onTableRef: ref => (this.tablRef = ref),
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subject/findByPage`,
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...tableProps} />
        <FormModal {...formModalProps} />
        <Suspense fallback={<PageLoader />}>
          <BatchFormModal {...batchFormModalProps} />
        </Suspense>
      </div>
    );
  }
}

export default BudgetMaster;
