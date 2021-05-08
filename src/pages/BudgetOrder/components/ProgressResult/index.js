import React, { useState, useEffect, useMemo } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import QueueAnim from 'rc-queue-anim';
import { Progress, Badge, Result } from 'antd';
import { Space, ListLoader } from 'suid';
import styles from './index.less';

const ProgressResult = ({ show, progressData }) => {
  const [zIndex, setZindex] = useState(-1);

  useEffect(() => {
    if (show === true) {
      setZindex(9);
    }
  }, [show]);

  const handlerEnd = ({ type }) => {
    if (type === 'leave') {
      setZindex(-1);
    }
  };

  const renderProgress = useMemo(() => {
    const total = get(progressData, 'total') || 0;
    const success = get(progressData, 'successes') || 0;
    const error = get(progressData, 'failures') || 0;
    let percent = 0;
    if (total > 0) {
      const perNum = Math.round(((success + error) / total) * 10000) / 100;
      percent = parseInt(perNum.toString(), 10);
    }
    if (total === 0) {
      percent = 100;
    }
    return <Progress type="circle" percent={percent} />;
  }, [progressData]);

  const renderSummary = useMemo(() => {
    return (
      <Space size="large">
        <Badge color="blue" text={`总计: ${get(progressData, 'total') || 0} 条`} />
        <Badge status="success" text={`成功: ${get(progressData, 'successes') || 0} 条`} />
        <Badge status="error" text={`失败:${get(progressData, 'failures') || 0} 条`} />
      </Space>
    );
  }, [progressData]);

  return (
    <QueueAnim className={cls(styles['container-box'])} onEnd={handlerEnd} style={{ zIndex }}>
      {show
        ? [
            <div className="head-box" key="head">
              <div className="title-box">
                <span className="title">预算生成进度</span>
              </div>
            </div>,
            <div className="body-content" key="body">
              <Result
                icon={renderProgress}
                title={
                  <>
                    处理中
                    <ListLoader />
                  </>
                }
                subTitle={renderSummary}
              />
            </div>,
          ]
        : null}
    </QueueAnim>
  );
};

export default ProgressResult;
