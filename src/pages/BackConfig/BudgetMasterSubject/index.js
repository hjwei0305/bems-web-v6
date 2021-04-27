import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { get } from 'lodash';
import { Input, Empty, Layout, Descriptions } from 'antd';
import { ListCard } from 'suid';
import empty from '@/assets/item_empty.svg';
import { constants } from '@/utils';
import SubjectList from './SubjectList';
import styles from './index.less';

const { Search } = Input;
const { Sider, Content } = Layout;
const { SERVER_PATH } = constants;

@connect(({ budgetMasterSubject, loading }) => ({ budgetMasterSubject, loading }))
class BudgetSubject extends Component {
  static listCardRef = null;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetMasterSubject/updateState',
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
      type: 'budgetMasterSubject/updateState',
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
    const { budgetMasterSubject } = this.props;
    const { currentMaster } = budgetMasterSubject;
    const masterProps = {
      className: 'left-content',
      title: '预算主体列表',
      showSearch: false,
      onSelectChange: this.handlerSelect,
      customTool: this.renderCustomTool,
      onListCardRef: ref => (this.listCardRef = ref),
      searchProperties: ['name'],
      simplePagination: false,
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/subject/findByPage`,
      },
      remotePaging: true,
      itemField: {
        title: item => item.name,
        description: item => (
          <Descriptions column={1} bordered={false}>
            <Descriptions.Item label="公司">{`${get(item, 'corporationName')}(${get(
              item,
              'corporationCode',
            )})`}</Descriptions.Item>
            <Descriptions.Item label="组织">{`${get(item, 'orgName')}(${get(
              item,
              'orgCode',
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
              <SubjectList />
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="可选择预算主体维护科目" />
              </div>
            )}
          </Content>
        </Layout>
      </div>
    );
  }
}
export default BudgetSubject;
