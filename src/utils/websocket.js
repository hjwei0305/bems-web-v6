import { PubSub } from 'pubsub-js';

let lockReconnect = false;
let cancelReconnect;
let heartCheckTimer = null;
let ws = null;

const heartCheck = {
  timeout: 60000, // 60秒
  timeoutObj: null,
  reset() {
    clearInterval(heartCheckTimer);
    return this;
  },
  start() {
    heartCheckTimer = setInterval(() => {
      // 这里发送一个心跳，后端收到后，返回一个心跳消息，
      // onmessage拿到返回的心跳就说明连接正常
      ws.send('HeartBeat');
    }, this.timeout);
  },
};

const createWebSocket = url => {
  const reconnect = _url => {
    if (lockReconnect) return;
    // 没连接上会一直重连，设置延迟避免请求过多
    cancelReconnect = setTimeout(() => {
      createWebSocket(_url);
      lockReconnect = false;
    }, 4000);
  };
  ws = new WebSocket(url);
  ws.onopen = () => {
    heartCheck.reset().start();
  };
  ws.onerror = () => {
    reconnect(url);
  };
  ws.onclose = e => {
    console.log(`ws 断开: ${e.code} ${e.reason} ${e.wasClean}`);
  };
  ws.onmessage = event => {
    lockReconnect = true;
    // 把获取到的消息处理成字典，方便后期使用
    const data = { wsData: event.data };
    PubSub.publish('message', data);
    // event 为服务端传输的消息，在这里可以处理
  };
};

// 关闭连接
const closeWebSocket = () => {
  if (ws) {
    ws.close();
  }
  clearTimeout(cancelReconnect);
  clearInterval(heartCheckTimer);
};

const websocket = ws;

export default {
  websocket,
  createWebSocket,
  closeWebSocket,
};
