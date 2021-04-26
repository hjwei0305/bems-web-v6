import React, { Component } from 'react';
import { connect } from 'dva';
import { get } from 'lodash';
import cls from 'classnames';
import { formatMessage } from 'umi-plugin-react/locale';
import { Input, Empty, Popconfirm, Layout, Tag, Descriptions } from 'antd';
import { ExtIcon, ListCard } from 'suid';
import empty from '@/assets/item_empty.svg';
import { constants } from '@/utils';
import BudgetAdd from '../components/BudgetTypeForm/Add';
import BudgetEdit from '../components/BudgetTypeForm/Edit';
import styles from './index.less';

const { SERVER_PATH, BUDGET_TYPE_CLASS, ORDER_CATEGORY, PERIOD_TYPE } = constants;
const { Search } = Input;
const { Sider, Content } = Layout;

@connect(({ budgetType, loading }) => ({ budgetType, loading }))
class BudgetTypeList extends Component {
  static listCardRef = null;

  constructor(props) {
    super(props);
    this.state = {
      dealId: null,
    };
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        showAssign: false,
      },
    });
  }

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
  };

  create = (data, handlerPopoverHide) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/create',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
          if (handlerPopoverHide) handlerPopoverHide();
        }
      },
    });
  };

  save = (data, handlerPopoverHide) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/save',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          this.reloadData();
          if (handlerPopoverHide) handlerPopoverHide();
        }
      },
    });
  };

  del = (data, e) => {
    if (e) e.stopPropagation();
    const { dispatch } = this.props;
    this.setState(
      {
        dealId: data.id,
      },
      () => {
        dispatch({
          type: 'budgetType/del',
          payload: {
            id: data.id,
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

  handlerSelect = (keys, items) => {
    const { dispatch } = this.props;
    const selectBudgetType = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        selectBudgetType,
      },
    });
  };

  handlerSearchChange = v => {
    this.listCardRef.handlerSearchChange(v);
  };

  handlerPressEnter = () => {
    this.listCardRef.handlerPressEnter();
  };

  handlerSearch = v => {
    this.listCardRef.handlerSearch(v);
  };

  renderCustomTool = () => (
    <>
      <Search
        allowClear
        placeholder="输入名称关键字查询"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: '100%' }}
      />
    </>
  );

  renderItemAction = item => {
    const { loading } = this.props;
    const { dealId } = this.state;
    const saving = loading.effects['budgetType/save'];
    return (
      <>
        <div className="tool-action" onClick={e => e.stopPropagation()}>
          <BudgetEdit saving={saving} save={this.save} rowData={item} />
          <Popconfirm
            title={formatMessage({
              id: 'global.delete.confirm',
              defaultMessage: '确定要删除吗?',
            })}
            onConfirm={e => this.del(item, e)}
          >
            {loading.effects['budgetType/del'] && dealId === item.id ? (
              <ExtIcon className={cls('del', 'action-item', 'loading')} type="loading" antd />
            ) : (
              <ExtIcon className={cls('del', 'action-item')} type="delete" antd />
            )}
          </Popconfirm>
        </div>
      </>
    );
  };

  renderName = item => {
    const orderCategory = ORDER_CATEGORY[get(item, 'orderCategory')];
    if (orderCategory) {
      return `${get(item, 'name')}(${orderCategory.title})`;
    }
  };

  renderDescription = item => {
    const periodType = PERIOD_TYPE[get(item, 'periodType')];
    return (
      <>
        <div>
          <Descriptions bordered={false} size="small" column={2}>
            <Descriptions.Item label="管理策略"> {item.strategyName}</Descriptions.Item>
            <Descriptions.Item label="期间类型"> {get(periodType, 'title')}</Descriptions.Item>
          </Descriptions>
        </div>
        <div>
          {item.roll ? <Tag color="magenta">可结转</Tag> : null}
          {item.use ? <Tag color="cyan">业务可用</Tag> : null}
        </div>
      </>
    );
  };

  render() {
    const { loading, budgetType } = this.props;
    const { selectBudgetType } = budgetType;
    const saving = loading.effects['budgetType/save'];
    const selectedKeys = selectBudgetType ? [selectBudgetType.id] : [];
    const deployTemplateProps = {
      className: 'left-content',
      title: '预算类型',
      showSearch: false,
      onSelectChange: this.handlerSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      searchProperties: ['name'],
      selectedKeys,
      extra: <BudgetAdd saving={saving} save={this.create} />,
      itemField: {
        title: item => this.renderName(item),
        description: item => this.renderDescription(item),
      },
      remotePaging: true,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/category/findByPage`,
        params: {
          filters: [{ fieldName: 'type', operator: 'EQ', value: BUDGET_TYPE_CLASS.GENERAL.key }],
        },
      },
      itemTool: this.renderItemAction,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Sider width={380} className="auto-height" theme="light">
            <ListCard {...deployTemplateProps} />
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
            {selectBudgetType ? (
              'aaa'
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="可选择预算类型配置预算维度" />
              </div>
            )}
          </Content>
        </Layout>
      </div>
    );
  }
}
export default BudgetTypeList;
