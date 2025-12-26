# Screenshot Service

基于 Playwright 的 HTML 截图服务，支持异步回调。

## 功能特性

- 🖼️ 将 HTML 内容渲染为 PNG 图片
- 📡 异步处理，通过回调 URL 返回结果
- 🛡️ 内置反指纹检测
- 🐳 Docker 部署支持

## 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 安装 Playwright 浏览器
npx playwright install chromium

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产模式
pnpm start
```

服务运行在 `http://localhost:7000`

### Docker 部署

```bash
# 构建并启动
chmod +x rebuild.sh
./rebuild.sh

# 或手动执行
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `7000` | 服务端口 |
| `SCREENSHOT_DIR` | `./screenshots` | 截图临时存储目录 |

## API 文档

### 截图接口

**请求**

```
POST /screenshot
Content-Type: application/json
```

**请求参数**

```json
{
  "html": "<html><body><h1>Hello World</h1></body></html>",
  "id": "task-123",
  "imageId": "img-456",
  "callbackUrl": "https://your-server.com/callback"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `html` | string | ✅ | 要截图的完整 HTML 内容 |
| `id` | string | ✅ | 任务 ID，用于回调时识别任务 |
| `imageId` | string | ✅ | 图片 ID，用于回调时识别图片 |
| `callbackUrl` | string | ✅ | 截图完成后的回调地址 |

**响应**

```json
{
  "id": "task-123",
  "status": "accepted"
}
```

接口立即返回，截图在后台异步处理。

### 回调说明

截图完成后，服务会向 `callbackUrl` 发送 POST 请求。

#### 成功时

**Headers:**
```
Content-Type: image/png
X-Id: task-123
X-Image-Id: img-456
X-Status: done
```

**Body:** PNG 图片二进制数据

#### 失败时

**Headers:**
```
Content-Type: application/json
X-Id: task-123
X-Image-Id: img-456
X-Status: failed
```

**Body:**
```json
{
  "error": "错误信息"
}
```

## 使用示例

### cURL

```bash
curl -X POST http://localhost:7000/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><head><style>body{background:#667eea;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;}</style></head><body><h1>Hello Screenshot!</h1></body></html>",
    "id": "test-001",
    "imageId": "screenshot-001",
    "callbackUrl": "https://webhook.site/your-unique-id"
  }'
```

### Node.js

```javascript
const response = await fetch('http://localhost:7000/screenshot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: '<html><body><h1>Hello</h1></body></html>',
    id: 'task-001',
    imageId: 'img-001',
    callbackUrl: 'https://your-server.com/callback'
  })
});

const result = await response.json();
console.log(result); // { id: 'task-001', status: 'accepted' }
```

### 接收回调 (Express 示例)

```javascript
import express from 'express';

const app = express();

app.post('/callback', express.raw({ type: 'image/png', limit: '50mb' }), (req, res) => {
  const status = req.headers['x-status'];
  const taskId = req.headers['x-id'];
  const imageId = req.headers['x-image-id'];

  if (status === 'done') {
    // req.body 是 PNG 图片的 Buffer
    fs.writeFileSync(`./images/${imageId}.png`, req.body);
    console.log(`Screenshot saved: ${imageId}.png`);
  } else {
    const error = JSON.parse(req.body.toString());
    console.error(`Screenshot failed: ${error.error}`);
  }

  res.sendStatus(200);
});

app.listen(3001);
```

## 截图规格

| 属性 | 值 |
|------|-----|
| 分辨率 | 1920 × 1080 |
| 格式 | PNG |
| 浏览器 | Chromium (Headless) |
| 语言 | en-US |
| 时区 | America/New_York |

## 项目结构

```
screen-shot/
├── src/
│   ├── index.ts              # 入口文件，Hono 服务器
│   └── lib/
│       ├── config.ts         # 配置
│       ├── browser.ts        # Playwright 浏览器管理
│       ├── screenshot.ts     # 截图核心逻辑
│       └── anti-fingerprint.ts # 反指纹检测
├── Dockerfile
├── docker-compose.yml
├── rebuild.sh                # Docker 重建脚本
└── package.json
```

## License

MIT
