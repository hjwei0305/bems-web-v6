import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import cls from 'classnames';
import { Layout, Empty } from 'antd';
import { PageLoader } from 'suid';
import empty from '@/assets/item_empty.svg';
import { FilterView } from '@/components';
import { constants } from '@/utils';
import UnAssignDimension from './UnAssignDimension';
import styles from './index.less';

const { Sider, Content } = Layout;
const { BUDGET_TYPE_CLASS } = constants;
const BudgetTypeList = React.lazy(() => import('./BudgetTypeList'));
const BudgetMasterList = React.lazy(() => import('./components/BudgetMasterList'));

@connect(({ budgetType, loading }) => ({ budgetType, loading }))
class BudgetType extends Component {
  static budgetListRef;

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        rowData: null,
        showModal: false,
        currentMaster: null,
        selectedBudgetType: null,
        showAssign: false,
      },
    });
  }

  handlerBudgetTypeClassChange = selectBudgetTypeClass => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        selectBudgetTypeClass,
        rowData: null,
        showModal: false,
        currentMaster: null,
        selectedBudgetType: null,
        showAssign: false,
      },
    });
  };

  renderFilterView = () => {
    const {
      budgetType: { selectBudgetTypeClass, budgetTypeClassData },
    } = this.props;
    return (
      <FilterView
        title="预算类型视图"
        currentViewType={selectBudgetTypeClass}
        viewTypeData={budgetTypeClassData}
        onAction={this.handlerBudgetTypeClassChange}
        reader={{
          title: 'title',
          value: 'key',
        }}
      />
    );
  };

  handlerBudgetMasterChange = currentMaster => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        currentMaster,
      },
    });
  };

  closeAssign = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        showAssign: false,
      },
    });
  };

  assign = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/assign',
      payload: {
        ...data,
      },
      callback: res => {
        if (res.success && this.budgetListRef) {
          this.budgetListRef.reloadAssignedList();
        }
      },
    });
  };

  renderBody = () => {
    const {
      budgetType: { selectBudgetTypeClass, currentMaster },
    } = this.props;
    if (selectBudgetTypeClass.key === BUDGET_TYPE_CLASS.GENERAL.key) {
      return (
        <Suspense fallback={<PageLoader />}>
          <BudgetTypeList onRef={ref => (this.budgetListRef = ref)} />
        </Suspense>
      );
    }
    if (selectBudgetTypeClass.key === BUDGET_TYPE_CLASS.PRIVATE.key) {
      return (
        <Layout className="auto-height">
          <Sider width={380} className="auto-height" theme="light">
            <Suspense fallback={<PageLoader />}>
              <BudgetMasterList
                currentBudgetMaster={currentMaster}
                selectChange={this.handlerBudgetMasterChange}
              />
            </Suspense>
          </Sider>
          <Content className={cls('main-content', 'auto-height')} style={{ paddingLeft: 4 }}>
            {currentMaster ? (
              <Suspense fallback={<PageLoader />}>
                <BudgetTypeList onRef={ref => (this.budgetListRef = ref)} />
              </Suspense>
            ) : (
              <div className="blank-empty">
                <Empty image={empty} description="选择预算主体来配置预算类型" />
              </div>
            )}
          </Content>
        </Layout>
      );
    }
  };

  render() {
    const { loading, budgetType } = this.props;
    const { selectedBudgetType, showAssign } = budgetType;
    const unAssignProps = {
      selectedBudgetType,
      showAssign,
      closeAssign: this.closeAssign,
      assign: this.assign,
      assignLoading: loading.effects['budgetType/assign'],
    };
    return (
      <div className={styles['container-box']}>
        <div className="box-header">{this.renderFilterView()}</div>
        <div className="box-body">{this.renderBody()}</div>
        {selectedBudgetType ? <UnAssignDimension {...unAssignProps} /> : null}
      </div>
    );
  }
}

export default BudgetType;
