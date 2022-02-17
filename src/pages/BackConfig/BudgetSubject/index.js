import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Layout, Empty } from 'antd';
import { PageLoader } from 'suid';
import empty from '@/assets/item_empty.svg';
import { FilterView } from '@/components';
import { constants } from '@/utils';
import styles from './index.less';

const { Sider, Content } = Layout;
const { TYPE_CLASS } = constants;
const SubjectList = React.lazy(() => import('./SubjectList'));
const CorperationList = React.lazy(() => import('./CorperationList'));

@connect(({ budgetSubject, loading }) => ({ budgetSubject, loading }))
class BudgetSubject extends Component {
  static subjectListRef;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/updateState',
      payload: {
        rowData: null,
        showModal: false,
        currentCorperation: null,
        selectedSubject: null,
        selectTypeClass: TYPE_CLASS.GENERAL,
      },
    });
  }

  handlerBudgetSubjectChange = selectTypeClass => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/updateState',
      payload: {
        selectTypeClass,
        rowData: null,
        showModal: false,
        currentCorperation: null,
        selectedSubject: null,
        showImport: false,
      },
    });
  };

  renderFilterView = () => {
    const {
      budgetSubject: { selectTypeClass, typeClassData },
    } = this.props;
    return (
      <FilterView
        title="科目视图"
        currentViewType={selectTypeClass}
        viewTypeData={typeClassData}
        onAction={this.handlerBudgetSubjectChange}
        reader={{
          title: 'title',
          value: 'key',
        }}
      />
    );
  };

  handlerCorperationChange = currentCorperation => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetSubject/updateState',
      payload: {
        currentCorperation,
        selectedBudgetType: null,
      },
    });
  };

  renderBody = () => {
    const {
      budgetSubject: { selectTypeClass, currentCorperation },
    } = this.props;
    if (selectTypeClass.key === TYPE_CLASS.GENERAL.key) {
      return (
        <Suspense fallback={<PageLoader />}>
          <SubjectList onRef={ref => (this.subjectListRef = ref)} />
        </Suspense>
      );
    }
    if (selectTypeClass.key === TYPE_CLASS.PRIVATE.key) {
      return (
        <Layout className="auto-height">
          <Sider width={380} className="auto-height" theme="light">
            <Suspense fallback={<PageLoader />}>
              <CorperationList
                currentCorperation={currentCorperation}
                selectChange={this.handlerCorperationChange}
              />
            </Suspense>
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 1 }}>
            {currentCorperation ? (
              <Suspense fallback={<PageLoader />}>
                <SubjectList onRef={ref => (this.subjectListRef = ref)} />
              </Suspense>
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="选择公司来配置预算科目" />
              </div>
            )}
          </Content>
        </Layout>
      );
    }
  };

  render() {
    return (
      <div className={styles['container-box']}>
        <div className="box-header">{this.renderFilterView()}</div>
        <div className="box-body">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BudgetSubject;
