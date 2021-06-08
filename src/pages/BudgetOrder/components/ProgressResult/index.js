import React, { useState, useEffect, useMemo, useCallback } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { PubSub } from 'pubsub-js';
import QueueAnim from 'rc-queue-anim';
import { Progress, Badge, Result } from 'antd';
import { Space, ListLoader, message } from 'suid';
import { constants, wsocket } from '@/utils';
import styles from './index.less';

const { closeWebSocket, createWebSocket } = wsocket;
const { WSBaseUrl } = constants;
const validJson = wsData => {
  let valid = true;
  if (wsData) {
    try {
      const str = wsData.replace(/[\r\n\s]/g, '');
      JSON.parse(str);
    } catch (e) {
      valid = false;
    }
  }
  return valid;
};

let messageSocket;

const ProgressResult = ({ orderId, show, handlerCompleted }) => {
  const [zIndex, setZindex] = useState(-1);
  const [progressData, setProgressData] = useState();

  const closeSocket = useCallback(() => {
    closeWebSocket();
    PubSub.unsubscribe(messageSocket);
  }, []);

  const connectWebSocket = useCallback(() => {
    const url = `${WSBaseUrl}/api-gateway/bems-v6/websocket/order/${orderId}`;
    createWebSocket(url);
    messageSocket = PubSub.subscribe('message', (topic, msgObj) => {
      // message 为接收到的消息  这里进行业务处理
      if (topic === 'message') {
        const wsData = get(msgObj, 'wsData') || '';
        if (validJson(wsData)) {
          const str = wsData.replace(/[\r\n\s]/g, '');
          const { success, message: msg, data } = JSON.parse(str);
          if (success) {
            setProgressData(data);
            const finished = get(data, 'finish') || false;
            // 处理完成后断开socket连接，并展示明细信息
            if (finished === true && handlerCompleted && handlerCompleted instanceof Function) {
              handlerCompleted();
              closeSocket();
            }
          } else {
            closeSocket();
            message.destroy();
            message.error(msg);
          }
        } else {
          closeSocket();
          message.destroy();
          message.error('返回的数据格式不正确');
        }
      }
    });
  }, [closeSocket, orderId, handlerCompleted]);

  useEffect(() => {
    if (show === true) {
      setZindex(9);
      connectWebSocket();
    }
    return closeSocket;
  }, [show, connectWebSocket, closeSocket]);

  const handlerEnd = ({ type }) => {
    if (type === 'leave') {
      setZindex(-1);
    }
  };

  const renderProgress = useMemo(() => {
    const finished = get(progressData, 'finish') || false;
    const total = get(progressData, 'total') || 0;
    const success = get(progressData, 'successes') || 0;
    const error = get(progressData, 'failures') || 0;
    let percent = 0;
    if (total > 0) {
      const perNum = Math.round(((success + error) / total) * 10000) / 100;
      percent = parseInt(perNum.toString(), 10);
    }
    if (finished === true) {
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
