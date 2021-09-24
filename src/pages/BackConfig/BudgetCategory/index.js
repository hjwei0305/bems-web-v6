import React, { Component } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Empty, Layout } from 'antd';
import { ListCard } from 'suid';
import empty from '@/assets/item_empty.svg';
import PeriodTypeList from './PeriodTypeList';
import styles from './index.less';

const { Sider, Content } = Layout;

@connect(({ budgetCategory, loading }) => ({ budgetCategory, loading }))
class BudgetCategory extends Component {
  handlerSelect = (keys, items) => {
    const { dispatch } = this.props;
    const currentCategory = keys.length === 1 ? items[0] : null;
    dispatch({
      type: 'budgetCategory/updateState',
      payload: {
        currentCategory,
      },
    });
  };

  render() {
    const { budgetCategory } = this.props;
    const { currentCategory, categoryData } = budgetCategory;
    const masterProps = {
      className: 'left-content',
      title: '预算分类',
      showSearch: false,
      rowKey: 'key',
      dataSource: categoryData,
      selectedKeys: [currentCategory.key],
      onSelectChange: this.handlerSelect,
      customTool: () => null,
      itemField: {
        title: item => item.title,
        description: item => item.key,
      },
    };
    return (
      <div className={cls(styles['container-box'])}>
        <Layout className="auto-height">
          <Sider width={380} className="auto-height" theme="light">
            <ListCard {...masterProps} />
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
            {currentCategory ? (
              <PeriodTypeList />
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="选择预算分类配置期间类型" />
              </div>
            )}
          </Content>
        </Layout>
      </div>
    );
  }
}
export default BudgetCategory;
