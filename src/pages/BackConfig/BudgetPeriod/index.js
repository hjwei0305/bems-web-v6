import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Input, Empty, Layout, Descriptions } from 'antd';
import { ListCard, Space } from 'suid';
import empty from '@/assets/item_empty.svg';
import { Classification } from '@/components';
import { constants } from '@/utils';
import PeriodList from './PeriodList';
import BatchButton from './BatchButton';
import styles from './index.less';

const { Search } = Input;
const { Sider, Content } = Layout;
const { SERVER_PATH } = constants;

@connect(({ budgetPeriod, loading }) => ({ budgetPeriod, loading }))
class BudgetPeriod extends Component {
  static listCardRef = null;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPeriod/updateState',
      payload: {
        showModal: false,
        currentMaster: null,
        rowData: null,
      },
    });
  }

  handlerSelect = (keys, items) => {
    const { dispatch } = this.props;
    const currentMaster = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'budgetPeriod/updateState',
      payload: {
        currentMaster,
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

  handlerBatchCreateNormalPeriod = (data, callback = () => {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetPeriod/batchCreateNormalPeriod',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success) {
          callback();
        }
      },
    });
  };

  renderCustomTool = () => {
    const { loading } = this.props;
    return (
      <>
        <Search
          allowClear
          placeholder="输入预算主体名称关键字"
          onChange={e => this.handlerSearchChange(e.target.value)}
          onSearch={this.handlerSearch}
          onPressEnter={this.handlerPressEnter}
          style={{ width: 220 }}
        />
        <BatchButton
          createNormalPeriod={this.handlerBatchCreateNormalPeriod}
          loading={loading.effects['budgetPeriod/batchCreateNormalPeriod']}
        />
      </>
    );
  };

  render() {
    const { budgetPeriod } = this.props;
    const { currentMaster } = budgetPeriod;
    const masterProps = {
      className: 'left-content',
      title: '预算主体列表',
      showSearch: false,
      onSelectChange: this.handlerSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      searchProperties: ['name'],
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subject/findByPage`,
      },
      remotePaging: true,
      itemField: {
        title: item => (
          <Space>
            {item.name}
            <Classification enumName={item.classification} />
          </Space>
        ),
        description: item => (
          <Descriptions column={1} bordered={false}>
            <Descriptions.Item label="公司">{`${get(item, 'corporationName')}(${get(
              item,
              'corporationCode',
            )})`}</Descriptions.Item>
          </Descriptions>
        ),
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Sider width={380} className="auto-height" theme="light">
            <ListCard {...masterProps} />
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
            {currentMaster ? (
              <PeriodList />
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="可选择预算主体来维护预算期间" />
              </div>
            )}
          </Content>
        </Layout>
      </div>
    );
  }
}
export default BudgetPeriod;
