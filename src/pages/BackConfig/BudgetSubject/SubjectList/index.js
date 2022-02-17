import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Button, Popconfirm, Card, Drawer, Radio, Divider } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ExtTable, ExtIcon, BannerTitle, Space, PageLoader } from 'suid';
import { constants } from '@/utils';
import FormModal from './FormModal';
import styles from './index.less';

const { SERVER_PATH, TYPE_CLASS, FILTER_ENABLE_DISABLE } = constants;
const BatchImport = React.lazy(() => import('./BatchImport'));

@connect(({ budgetSubject, loading }) => ({ budgetSubject, loading }))
class BudgetSubjectList extends Component {
  static tablRef;

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      dealId: null,
      rowState: FILTER_ENABLE_DISABLE.ALL.key,
    };
  }

  reloadData = () => {
    if (this.tablRef) {
      this.tablRef.remoteDataRefresh();
    }
  };

  add = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/updateState',
      payload: {
        showModal: true,
        rowData: null,
      },
    });
  };

  edit = rowData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/updateState',
      payload: {
        showModal: true,
        rowData,
      },
    });
  };

  save = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          dispatch({
            type: 'budgetSubject/updateState',
            payload: {
              showModal: false,
            },
          });
          this.reloadData();
        }
      },
    });
  };

  del = record => {
    const { dispatch } = this.props;
    this.setState(
      {
        dealId: record.id,
      },
      () => {
        dispatch({
          type: 'budgetSubject/del',
          payload: {
            id: record.id,
          },
          callback: res => {
            if (res.success) {
              this.setState({
                dealId: null,
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
      type: 'budgetSubject/updateState',
      payload: {
        showModal: false,
        rowData: null,
      },
    });
  };

  renderDelBtn = row => {
    const { loading } = this.props;
    const { dealId } = this.state;
    if (loading.effects['budgetSubject/del'] && dealId === row.id) {
      return <ExtIcon className="del-loading" type="loading" antd />;
    }
    return <ExtIcon className="del" type="delete" antd />;
  };

  handlerEnableAndDisable = tag => {
    const { dispatch, budgetSubject } = this.props;
    const { selectTypeClass, currentCorperation } = budgetSubject;
    const { selectedRowKeys: ids } = this.state;
    const data = {
      corpCode: '',
      disabled: tag,
      ids,
    };
    if (selectTypeClass.key === TYPE_CLASS.PRIVATE.key) {
      Object.assign(data, {
        corpCode: get(currentCorperation, 'code'),
      });
    }
    dispatch({
      type: `budgetSubject/${tag ? 'disable' : 'enable'}`,
      payload: data,
      callback: res => {
        if (res.success) {
          this.handlerClearSelect();
          this.reloadData();
        }
      },
    });
  };

  handlerDownloadImportTemplate = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/getImportSalaryTemplate',
    });
  };

  handlerExportData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/exportData',
    });
  };

  handlerShowImportData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/updateState',
      payload: {
        showImport: true,
      },
    });
  };

  handlerCloseImportData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/updateState',
      payload: {
        showImport: false,
      },
    });
  };

  handlerImportData = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/sendImport',
      payload: data,
      callback: res => {
        if (res.success) {
          this.reloadData();
        }
      },
    });
  };

  renderItemAction = item => {
    return (
      <span className={cls('action-box')} onClick={e => e.stopPropagation()}>
        <ExtIcon className="edit" onClick={() => this.edit(item)} type="edit" antd />
        <Popconfirm
          placement="topLeft"
          title={formatMessage({
            id: 'global.delete.confirm',
            defaultMessage: '确定要删除吗？提示：删除后不可恢复',
          })}
          onConfirm={() => this.del(item)}
        >
          {this.renderDelBtn(item)}
        </Popconfirm>
      </span>
    );
  };

  handlerSelectRow = selectedRowKeys => {
    this.setState({
      selectedRowKeys,
    });
  };

  handlerClearSelect = () => {
    this.setState({
      selectedRowKeys: [],
    });
  };

  renderEnableAndDisableAction = () => {
    const { loading } = this.props;
    const { selectedRowKeys } = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const disableDoing = loading.effects['budgetSubject/disable'];
    const enableDoing = loading.effects['budgetSubject/enable'];
    return (
      <Drawer
        placement="top"
        closable={false}
        mask={false}
        height={44}
        getContainer={false}
        style={{ position: 'absolute' }}
        visible={hasSelected}
      >
        <Space>
          <Button onClick={this.handlerClearSelect} disabled={disableDoing || enableDoing}>
            取消
          </Button>
          <Popconfirm
            disabled={disableDoing || enableDoing}
            title="确定要停用选择的项吗?"
            onConfirm={() => this.handlerEnableAndDisable(true)}
          >
            <Button type="danger" disabled={enableDoing} loading={disableDoing}>
              停用
            </Button>
          </Popconfirm>
          <Popconfirm
            disabled={disableDoing || enableDoing}
            title="确定要启用选择的项吗?"
            onConfirm={() => this.handlerEnableAndDisable(false)}
          >
            <Button type="primary" ghost disabled={disableDoing} loading={enableDoing}>
              启用
            </Button>
          </Popconfirm>
        </Space>
      </Drawer>
    );
  };

  renderItemTitle = (t, item) => {
    if (item.frozen) {
      return (
        <>
          {item.name}
          <span style={{ color: '#f5222d', fontSize: 12, marginLeft: 8 }}>已停用</span>
        </>
      );
    }
    return item.name;
  };

  handlerStateChange = e => {
    this.setState({ rowState: e.target.value });
  };

  renderQuickFilter = () => {
    const { rowState } = this.state;
    const ds = Object.keys(FILTER_ENABLE_DISABLE).map(key => FILTER_ENABLE_DISABLE[key]);
    return (
      <span className="filter-state">
        <span className="label">科目状态</span>
        <Radio.Group onChange={this.handlerStateChange} defaultValue={rowState} size="small">
          {ds.map(it => (
            <Radio.Button key={it.key} value={it.key}>
              {it.title}
            </Radio.Button>
          ))}
        </Radio.Group>
      </span>
    );
  };

  getRowStateFilter = () => {
    const { rowState } = this.state;
    const stateFilter = [];
    if (rowState === FILTER_ENABLE_DISABLE.ENABLE.key) {
      stateFilter.push({ fieldName: 'frozen', operator: 'EQ', value: false });
    }
    if (rowState === FILTER_ENABLE_DISABLE.DISABLE.key) {
      stateFilter.push({ fieldName: 'frozen', operator: 'EQ', value: true });
    }
    return stateFilter;
  };

  renderContent = () => {
    const { selectedRowKeys } = this.state;
    const { budgetSubject } = this.props;
    const { selectTypeClass, currentCorperation } = budgetSubject;
    const columns = [
      {
        title: '科目代码',
        dataIndex: 'code',
        width: 120,
        required: true,
      },
      {
        title: '科目名称',
        dataIndex: 'name',
        width: 480,
        required: true,
        render: this.renderItemTitle,
      },
    ];
    const tableProps = {
      checkbox: true,
      searchWidth: 260,
      lineNumber: false,
      allowCustomColumns: false,
      searchPlaceHolder: '输入科目代码、名称关键字',
      remotePaging: true,
      selectedRowKeys,
      onSelectRow: this.handlerSelectRow,
      onTableRef: ref => (this.tablRef = ref),
      sort: {
        field: { code: 'asc', name: null },
      },
    };
    if (selectTypeClass.key === TYPE_CLASS.GENERAL.key) {
      const action = {
        title: formatMessage({ id: 'global.operation', defaultMessage: '操作' }),
        key: 'operation',
        width: 100,
        align: 'center',
        dataIndex: 'id',
        className: 'action',
        required: true,
        render: (t, record) => this.renderItemAction(record),
      };
      columns.splice(0, 0, action);
      const toolBarProps = {
        left: (
          <Space>
            {this.renderQuickFilter()}
            <Divider type="vertical" />
            <Button type="primary" onClick={this.add}>
              <FormattedMessage id="global.add" defaultMessage="新建" />
            </Button>
            <Button onClick={this.handlerShowImportData}>数据导入</Button>
            <Button onClick={this.handlerExportData}>数据导出</Button>
          </Space>
        ),
      };
      Object.assign(tableProps, {
        toolBar: toolBarProps,
        columns,
        cascadeParams: {
          filters: this.getRowStateFilter(),
        },
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/item/findByGeneral`,
          loaded: () => {
            this.setState({ selectedRowKeys: [] });
          },
        },
      });
      return (
        <>
          {this.renderEnableAndDisableAction()}
          <ExtTable {...tableProps} />
        </>
      );
    }
    if (selectTypeClass.key === TYPE_CLASS.PRIVATE.key) {
      const toolBarProps = {
        left: this.renderQuickFilter(),
      };
      Object.assign(tableProps, {
        toolBar: toolBarProps,
        columns,
        store: {
          type: 'POST',
          url: `${SERVER_PATH}/bems-v6/item/findByCorp`,
          loaded: () => {
            this.setState({ selectedRowKeys: [] });
          },
        },
        cascadeParams: {
          corpCode: get(currentCorperation, 'code'),
          filters: this.getRowStateFilter(),
        },
      });
      return (
        <Card
          bordered={false}
          title={<BannerTitle title={`${get(currentCorperation, 'name')}`} subTitle="科目列表" />}
        >
          {this.renderEnableAndDisableAction()}
          <ExtTable {...tableProps} />
        </Card>
      );
    }
  };

  render() {
    const { budgetSubject, loading } = this.props;
    const { showModal, rowData, showImport } = budgetSubject;
    const formModalProps = {
      save: this.save,
      rowData,
      showModal,
      closeFormModal: this.closeFormModal,
      saving: loading.effects['budgetSubject/save'],
    };
    return (
      <div className={cls(styles['contanter-box'])}>
        {this.renderContent()}
        <FormModal {...formModalProps} />
        <Suspense fallback={<PageLoader />}>
          <BatchImport
            showImport={showImport}
            closeBatchImport={this.handlerCloseImportData}
            downloadImportTemplate={this.handlerDownloadImportTemplate}
            downloading={loading.effects['budgetSubject/getImportSalaryTemplate']}
            sendImportData={this.handlerImportData}
            importDoing={loading.effects['budgetSubject/sendImport']}
          />
        </Suspense>
      </div>
    );
  }
}

export default BudgetSubjectList;
