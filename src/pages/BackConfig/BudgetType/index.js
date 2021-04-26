import React, { Component, Suspense } from 'react';
import { connect } from 'dva';
import { PageLoader } from 'suid';
import { FilterView } from '@/components';
import { constants } from '@/utils';
import styles from './index.less';

const { BUDGET_TYPE_CLASS } = constants;
const BudgetTypeList = React.lazy(() => import('./BudgetTypeList'));

@connect(({ budgetType, loading }) => ({ budgetType, loading }))
class BudgetType extends Component {
  handlerBudgetTypeClassChange = selectBudgetTypeClass => {
    const { dispatch } = this.props;
    dispatch({
      type: 'budgetType/updateState',
      payload: {
        selectBudgetTypeClass,
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

  renderBody = () => {
    const {
      budgetType: { selectBudgetTypeClass },
    } = this.props;
    if (selectBudgetTypeClass.key === BUDGET_TYPE_CLASS.GENERAL.key) {
      return (
        <Suspense fallback={<PageLoader />}>
          <BudgetTypeList />
        </Suspense>
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

export default BudgetType;
