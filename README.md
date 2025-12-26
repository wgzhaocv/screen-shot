# Screenshot Service

基于 Playwright 的 HTML 截图服务，支持异步回调。

## API

### POST /screenshot

将 HTML 内容渲染为 PNG 图片，异步处理后通过回调返回结果。

**请求**

```
POST /screenshot
Content-Type: application/json
```

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
  "status": "accepted",
  "pending": 0
}
```

| 字段 | 说明 |
|------|------|
| `id` | 任务 ID |
| `status` | 固定为 `accepted` |
| `pending` | 队列中待处理的任务数 |

### 回调

截图完成后，服务会向 `callbackUrl` 发送 POST 请求。

**成功时**

```
Content-Type: image/png
X-Id: task-123
X-Image-Id: img-456
X-Status: done
```

Body: PNG 图片二进制数据

**失败时**

```
Content-Type: application/json
X-Id: task-123
X-Image-Id: img-456
X-Status: failed
```

```json
{
  "error": "错误信息"
}
```

## 示例

### cURL

```bash
curl -X POST http://localhost:4000/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><body><h1>Hello</h1></body></html>",
    "id": "test-001",
    "imageId": "screenshot-001",
    "callbackUrl": "https://webhook.site/your-unique-id"
  }'
```

### Node.js

```javascript
const response = await fetch('http://localhost:4000/screenshot', {
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
// { id: 'task-001', status: 'accepted', pending: 0 }
```

## 截图规格

| 属性 | 值 |
|------|-----|
| 分辨率 | 1920 × 1080 |
| 格式 | PNG |
| 浏览器 | Chromium (Headless) |
