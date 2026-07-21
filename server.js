const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 托管静态网页
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('[WebSocket] 新客户端已连接');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('[收到指令]:', data);

      // 将收到的控制指令广播给所有连接的客户端（展场手机/手环等）
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.error('解析 JSON 失败:', e);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] 客户端断开连接');
  });
});

server.listen(port, () => {
  console.log(`[Server] 服务已启动，监听端口: ${port}`);
});