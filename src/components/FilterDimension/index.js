import React, { Suspense, useCallback, useMemo, useState, useRef } from 'react';
import { Dropdown, Tabs, Empty, Button } from 'antd';
import { ListLoader, ExtIcon, Space } from 'suid';
import { constants } from '@/utils';
import empty from '@/assets/item_empty.svg';
import styles from './index.less';

const { TabPane } = Tabs;
const Period = React.lazy(() => import('./components/Period'));
const Subject = React.lazy(() => import('./components/Subject'));
const Project = React.lazy(() => import('./components/Project'));
const Organization = React.lazy(() => import('./components/Organization'));
const { BUDGET_DIMENSION_UI_COMPONENT } = constants;

const FilterDimension = props => {
  const { dimensions, subjectId, year, periodType, submitDimension = () => {} } = props;
  const [show, setShow] = useState(false);
  const [periodData, setPeriodData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [organizationData, setOrganizationData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  const periodRef = useRef();
  const projectRef = useRef();
  const subjectRef = useRef();
  const orgRef = useRef();

  const onVisibleChange = useCallback(v => {
    setShow(v);
  }, []);

  const periodSelectChange = useCallback(keys => {
    setPeriodData(keys);
  }, []);

  const projectSelectChange = useCallback(keys => {
    setProjectData(keys);
  }, []);

  const organizationSelectChange = useCallback(keys => {
    setOrganizationData(keys);
  }, []);

  const subjectSelectChange = useCallback(keys => {
    setSubjectData(keys);
  }, []);

  const clearData = useCallback(() => {
    if (periodRef && periodRef.current) {
      periodRef.current.clearData();
    }
    if (projectRef && projectRef.current) {
      projectRef.current.clearData();
    }
    if (subjectRef && subjectRef.current) {
      subjectRef.current.clearData();
    }
    if (orgRef && orgRef.current) {
      orgRef.current.clearData();
    }
  }, []);

  const handlerSubmit = useCallback(() => {
    submitDimension({
      period: periodData,
      project: projectData,
      item: subjectData,
      org: organizationData,
    });
    setShow(false);
  }, [organizationData, periodData, projectData, subjectData, submitDimension]);

  const renderLabel = useMemo(() => {
    let dm = 0;
    dm += periodData.length;
    dm += projectData.length;
    dm += subjectData.length;
    dm += organizationData.length;
    if (dm === 0) {
      return '未选择';
    }
    return `已选择(${dm})`;
  }, [organizationData.length, periodData.length, projectData.length, subjectData.length]);

  const renderDimension = useMemo(() => {
    if (subjectId) {
      return (
        <div className="dimension-box" style={{ height: window.document.body.clientHeight - 320 }}>
          <div className="dimension-body">
            <Tabs tabPosition="left">
              {dimensions.map(it => {
                switch (it.uiComponent) {
                  case BUDGET_DIMENSION_UI_COMPONENT.PERIOD.code:
                    return (
                      <TabPane key={it.code} tab={`${it.name}(${periodData.length})`}>
                        <Suspense fallback={<ListLoader />}>
                          <Period
                            periodRef={periodRef}
                            onSelectChange={periodSelectChange}
                            subjectId={subjectId}
                            year={year}
                            periodType={periodType}
                          />
                        </Suspense>
                      </TabPane>
                    );
                  case BUDGET_DIMENSION_UI_COMPONENT.PROJECTLIST.code:
                    return (
                      <TabPane key={it.code} tab={`${it.name}(${projectData.length})`}>
                        <Suspense fallback={<ListLoader />}>
                          <Project
                            projectRef={projectRef}
                            onSelectChange={projectSelectChange}
                            subjectId={subjectId}
                          />
                        </Suspense>
                      </TabPane>
                    );
                  case BUDGET_DIMENSION_UI_COMPONENT.ORGANIZATION.code:
                    return (
                      <TabPane key={it.code} tab={`${it.name}(${organizationData.length})`}>
                        <Suspense fallback={<ListLoader />}>
                          <Organization
                            orgRef={orgRef}
                            onSelectChange={organizationSelectChange}
                            subjectId={subjectId}
                          />
                        </Suspense>
                      </TabPane>
                    );
                  case BUDGET_DIMENSION_UI_COMPONENT.SUBJECT.code:
                    return (
                      <TabPane key={it.code} tab={`${it.name}(${subjectData.length})`}>
                        <Suspense fallback={<ListLoader />}>
                          <Subject
                            subjectRef={subjectRef}
                            onSelectChange={subjectSelectChange}
                            subjectId={subjectId}
                          />
                        </Suspense>
                      </TabPane>
                    );
                  default:
                    return null;
                }
              })}
            </Tabs>
          </div>
          <div className="footer-box">
            <Space>
              <Button onClick={clearData}>重置</Button>
              <Button type="primary" onClick={handlerSubmit}>
                查询
              </Button>
            </Space>
          </div>
        </div>
      );
    }
    return (
      <div className="dimension-box">
        <div className="blank-empty">
          <Empty image={empty} description="请选择预算主体" />
        </div>
      </div>
    );
  }, [
    subjectId,
    dimensions,
    clearData,
    handlerSubmit,
    periodData.length,
    periodSelectChange,
    year,
    periodType,
    projectData.length,
    projectSelectChange,
    organizationData.length,
    organizationSelectChange,
    subjectData.length,
    subjectSelectChange,
  ]);

  return (
    <Dropdown
      trigger={['click']}
      overlay={renderDimension}
      className="action-drop-down"
      placement="bottomLeft"
      visible={show}
      overlayClassName={styles['budget-dimension-box']}
      onVisibleChange={onVisibleChange}
    >
      <span className={styles['dimension-trigger']}>
        <span className="view-label">维度</span>
        <span className="view-content">{renderLabel}</span>
        <ExtIcon type="down" antd />
      </span>
    </Dropdown>
  );
};

export default FilterDimension;
