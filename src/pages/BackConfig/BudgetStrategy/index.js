import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Input, Empty, Layout, Descriptions, Tag, Tabs, Card } from 'antd';
import { ListCard, Space, BannerTitle } from 'suid';
import empty from '@/assets/item_empty.svg';
import { Classification } from '@/components';
import { constants } from '@/utils';
import DimensionList from './DimensionList';
import SubjectList from './SubjectList';
import styles from './index.less';

const { TabPane } = Tabs;
const { Search } = Input;
const { Sider, Content } = Layout;
const { SERVER_PATH } = constants;

@connect(({ budgetStrategy, loading }) => ({ budgetStrategy, loading }))
class BudgetStrategy extends Component {
  static listCardRef = null;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetStrategy/updateState',
      payload: {
        currentMaster: null,
        rowData: null,
      },
    });
  }

  handlerSelect = (keys, items) => {
    const { dispatch } = this.props;
    const currentMaster = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'budgetStrategy/updateState',
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

  renderCustomTool = () => (
    <>
      <Search
        allowClear
        placeholder="输入预算主体名称关键字"
        onChange={e => this.handlerSearchChange(e.target.value)}
        onSearch={this.handlerSearch}
        onPressEnter={this.handlerPressEnter}
        style={{ width: '100%' }}
      />
    </>
  );

  render() {
    const { budgetStrategy } = this.props;
    const { currentMaster } = budgetStrategy;
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
            <Descriptions.Item label="币种">{`${get(item, 'currencyName')}(${get(
              item,
              'currencyCode',
            )})`}</Descriptions.Item>
            <Descriptions.Item label="执行策略">
              <Tag>{`${get(item, 'strategyName')}`}</Tag>
            </Descriptions.Item>
          </Descriptions>
        ),
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Sider width={460} className="auto-height" theme="light">
            <ListCard {...masterProps} />
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
            {currentMaster ? (
              <Card
                bordered={false}
                title={<BannerTitle title={get(currentMaster, 'name')} subTitle="预算策略" />}
                className={styles['list-box']}
              >
                <Tabs type="card" animated={false}>
                  <TabPane tab="维度策略" key="dimension" forceRender>
                    <DimensionList />
                  </TabPane>
                  <TabPane tab="执行策略" key="execute">
                    <SubjectList />
                  </TabPane>
                </Tabs>
              </Card>
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="选择预算主体配置策略" />
              </div>
            )}
          </Content>
        </Layout>
      </div>
    );
  }
}
export default BudgetStrategy;
