# HomePlatform API 设计文档

**文档版本**: v1.0
**API 版本**: v1
**创建日期**: 2025-01-18

---

## 📋 目录

1. [API 概述](#1-api-概述)
2. [认证与授权](#2-认证与授权)
3. [用户相关 API](#3-用户相关-api)
4. [设备相关 API](#4-设备相关-api)
5. [场景相关 API](#5-场景相关-api)
6. [自动化相关 API](#6-自动化相关-api)
7. [AI 相关 API](#7-ai-相关-api)
8. [WebSocket API](#8-websocket-api)
9. [错误码定义](#9-错误码定义)
10. [SDK 文档](#10-sdk-文档)

---

## 1. API 概述

### 1.1 Base URL

```
生产环境: https://api.homeplatform.io
测试环境: https://api-test.homeplatform.io
本地环境: http://localhost:3000
```

### 1.2 通用请求头

```http
Content-Type: application/json
Authorization: Bearer {access_token}
X-Client-Version: 1.0.0
X-Platform: ios | android | web | desktop
```

### 1.3 通用响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    // 返回数据
  },
  "timestamp": 1705564800000
}
```

#### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "Device not found",
    "details": {}
  },
  "timestamp": 1705564800000
}
```

### 1.4 分页格式

```http
GET /api/v1/devices?page=1&limit=20&sort=createdAt&order=desc
```

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 2. 认证与授权

### 2.1 用户注册

**接口**: `POST /api/v1/auth/register`

**请求**:
```json
{
  "phone": "+8613800138000",
  "password": "Abc123456",
  "code": "123456",
  "name": "张三"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

---

### 2.2 用户登录

**接口**: `POST /api/v1/auth/login`

**请求**:
```json
{
  "phone": "+8613800138000",
  "password": "Abc123456"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "张三",
      "phone": "+8613800138000",
      "avatar": "https://cdn.homeplatform.io/avatars/xxx.jpg"
    }
  }
}
```

---

### 2.3 刷新 Token

**接口**: `POST /api/v1/auth/refresh`

**请求**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

---

### 2.4 发送验证码

**接口**: `POST /api/v1/auth/send-code`

**请求**:
```json
{
  "phone": "+8613800138000",
  "type": "register" | "login" | "reset_password"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "expiresIn": 300
  }
}
```

---

## 3. 用户相关 API

### 3.1 获取用户信息

**接口**: `GET /api/v1/users/me`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "张三",
    "phone": "+8613800138000",
    "email": "zhangsan@example.com",
    "avatar": "https://cdn.homeplatform.io/avatars/xxx.jpg",
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

### 3.2 更新用户信息

**接口**: `PATCH /api/v1/users/me`

**请求**:
```json
{
  "name": "张三",
  "avatar": "https://cdn.homeplatform.io/avatars/new.jpg"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "张三",
    "avatar": "https://cdn.homeplatform.io/avatars/new.jpg"
  }
}
```

---

### 3.3 获取家庭列表

**接口**: `GET /api/v1/homes`

**响应**:
```json
{
  "success": true,
  "data": {
    "homes": [
      {
        "id": "home123",
        "name": "我的家",
        "address": "北京市朝阳区",
        "role": "owner",
        "memberCount": 3,
        "deviceCount": 15,
        "createdAt": "2025-01-18T10:00:00Z"
      }
    ]
  }
}
```

---

### 3.4 创建家庭

**接口**: `POST /api/v1/homes`

**请求**:
```json
{
  "name": "我的家",
  "address": "北京市朝阳区",
  "timezone": "Asia/Shanghai"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "home123",
    "name": "我的家",
    "address": "北京市朝阳区",
    "timezone": "Asia/Shanghai",
    "role": "owner",
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

### 3.5 邀请家庭成员

**接口**: `POST /api/v1/homes/:homeId/members/invite`

**请求**:
```json
{
  "phone": "+8613900139000",
  "role": "family" | "guest"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "inviteCode": "ABC123",
    "expiresIn": 86400
  }
}
```

---

## 4. 设备相关 API

### 4.1 发现设备

**接口**: `POST /api/v1/devices/discover`

**请求**:
```json
{
  "homeId": "home123",
  "protocols": ["matter", "wifi", "ble"]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "deviceId": "device123",
        "name": "智能灯泡",
        "type": "light",
        "protocol": "matter",
        "manufacturer": "Philips",
        "model": "Hue White",
        "capabilities": ["power", "brightness", "color"]
      }
    ]
  }
}
```

---

### 4.2 添加设备

**接口**: `POST /api/v1/devices`

**请求**:
```json
{
  "homeId": "home123",
  "deviceId": "device123",
  "name": "卧室灯",
  "room": "bedroom",
  "credentials": {
    "pairingCode": "123456"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deviceId": "device123",
    "name": "卧室灯",
    "type": "light",
    "room": "bedroom",
    "online": true,
    "state": {
      "power": "on",
      "brightness": 100
    },
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

### 4.3 获取设备列表

**接口**: `GET /api/v1/homes/:homeId/devices`

**查询参数**:
- `room` (可选): 房间筛选
- `type` (可选): 设备类型筛选
- `online` (可选): 在线状态筛选

**响应**:
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "deviceId": "device123",
        "name": "卧室灯",
        "type": "light",
        "protocol": "matter",
        "manufacturer": "Philips",
        "room": "bedroom",
        "online": true,
        "state": {
          "power": "on",
          "brightness": 80,
          "color": { "r": 255, "g": 200, "b": 100 }
        },
        "lastSeen": "2025-01-18T10:30:00Z"
      }
    ]
  }
}
```

---

### 4.4 获取设备详情

**接口**: `GET /api/v1/devices/:deviceId`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deviceId": "device123",
    "name": "卧室灯",
    "type": "light",
    "protocol": "matter",
    "manufacturer": "Philips",
    "model": "Hue White",
    "firmwareVersion": "1.2.3",
    "room": "bedroom",
    "capabilities": ["power", "brightness", "color"],
    "online": true,
    "state": {
      "power": "on",
      "brightness": 80,
      "color": { "r": 255, "g": 200, "b": 100 },
      "temperature": 3000
    },
    "lastSeen": "2025-01-18T10:30:00Z",
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

### 4.5 控制设备

**接口**: `POST /api/v1/devices/:deviceId/control`

**请求**:
```json
{
  "capability": "brightness",
  "value": 80
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "power": "on",
      "brightness": 80
    },
    "timestamp": 1705564800000
  }
}
```

---

### 4.6 批量控制设备

**接口**: `POST /api/v1/devices/batch-control`

**请求**:
```json
{
  "commands": [
    {
      "deviceId": "device1",
      "capability": "power",
      "value": "on"
    },
    {
      "deviceId": "device2",
      "capability": "brightness",
      "value": 80
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "deviceId": "device1",
        "success": true,
        "state": { "power": "on" }
      },
      {
        "deviceId": "device2",
        "success": true,
        "state": { "brightness": 80 }
      }
    ]
  }
}
```

---

### 4.7 删除设备

**接口**: `DELETE /api/v1/devices/:deviceId`

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "Device deleted successfully"
  }
}
```

---

### 4.8 获取设备历史状态

**接口**: `GET /api/v1/devices/:deviceId/history`

**查询参数**:
- `startTime`: 开始时间 (ISO 8601)
- `endTime`: 结束时间 (ISO 8601)
- `interval`: 时间间隔 (1m, 5m, 1h, 1d)

**响应**:
```json
{
  "success": true,
  "data": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "history": [
      {
        "timestamp": "2025-01-18T10:00:00Z",
        "state": {
          "power": "on",
          "brightness": 80
        }
      },
      {
        "timestamp": "2025-01-18T11:00:00Z",
        "state": {
          "power": "on",
          "brightness": 60
        }
      }
    ]
  }
}
```

---

## 5. 场景相关 API

### 5.1 获取场景列表

**接口**: `GET /api/v1/homes/:homeId/scenes`

**响应**:
```json
{
  "success": true,
  "data": {
    "scenes": [
      {
        "id": "scene123",
        "name": "回家模式",
        "icon": "home",
        "background": "#FF6B6B",
        "actionCount": 3,
        "createdAt": "2025-01-18T10:00:00Z"
      }
    ]
  }
}
```

---

### 5.2 创建场景

**接口**: `POST /api/v1/homes/:homeId/scenes`

**请求**:
```json
{
  "name": "回家模式",
  "icon": "home",
  "background": "#FF6B6B",
  "actions": [
    {
      "deviceId": "device1",
      "capability": "power",
      "value": "on",
      "order": 1
    },
    {
      "deviceId": "device2",
      "capability": "brightness",
      "value": 80,
      "delay": 2,
      "order": 2
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "scene123",
    "name": "回家模式",
    "icon": "home",
    "background": "#FF6B6B",
    "actions": [...],
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

### 5.3 执行场景

**接口**: `POST /api/v1/scenes/:sceneId/execute`

**响应**:
```json
{
  "success": true,
  "data": {
    "sceneId": "scene123",
    "executionId": "exec123",
    "results": [
      {
        "deviceId": "device1",
        "success": true,
        "duration": 85
      },
      {
        "deviceId": "device2",
        "success": true,
        "duration": 92
      }
    ],
    "totalDuration": 2177
  }
}
```

---

### 5.4 更新场景

**接口**: `PATCH /api/v1/scenes/:sceneId`

**请求**:
```json
{
  "name": "回家模式 V2",
  "actions": [...]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "scene123",
    "name": "回家模式 V2",
    "updatedAt": "2025-01-18T12:00:00Z"
  }
}
```

---

### 5.5 删除场景

**接口**: `DELETE /api/v1/scenes/:sceneId`

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "Scene deleted successfully"
  }
}
```

---

### 5.6 获取场景执行历史

**接口**: `GET /api/v1/scenes/:sceneId/executions`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "exec123",
        "sceneId": "scene123",
        "executedBy": "user123",
        "success": true,
        "duration": 2177,
        "executedAt": "2025-01-18T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 6. 自动化相关 API

### 6.1 获取自动化列表

**接口**: `GET /api/v1/homes/:homeId/automations`

**响应**:
```json
{
  "success": true,
  "data": {
    "automations": [
      {
        "id": "auto123",
        "name": "晨起自动化",
        "enabled": true,
        "trigger": {
          "type": "time",
          "config": { "time": "07:00", "days": [1,2,3,4,5] }
        },
        "conditionCount": 2,
        "actionCount": 3,
        "createdAt": "2025-01-18T10:00:00Z"
      }
    ]
  }
}
```

---

### 6.2 创建自动化

**接口**: `POST /api/v1/homes/:homeId/automations`

**请求**:
```json
{
  "name": "晨起自动化",
  "enabled": true,
  "trigger": {
    "type": "time",
    "config": {
      "time": "07:00",
      "days": [1, 2, 3, 4, 5]
    }
  },
  "conditions": [
    {
      "type": "device_state",
      "operator": "AND",
      "config": {
        "deviceId": "device1",
        "capability": "presence",
        "operator": "==",
        "value": "home"
      }
    }
  ],
  "actions": [
    {
      "type": "device_control",
      "config": {
        "deviceId": "device2",
        "capability": "power",
        "value": "on"
      }
    },
    {
      "type": "scene_execute",
      "config": {
        "sceneId": "scene123"
      }
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "auto123",
    "name": "晨起自动化",
    "enabled": true,
    "createdAt": "2025-01-18T10:00:00Z"
  }
}
```

---

### 6.3 更新自动化

**接口**: `PATCH /api/v1/automations/:automationId`

**请求**:
```json
{
  "enabled": false
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "auto123",
    "enabled": false,
    "updatedAt": "2025-01-18T12:00:00Z"
  }
}
```

---

### 6.4 删除自动化

**接口**: `DELETE /api/v1/automations/:automationId`

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "Automation deleted successfully"
  }
}
```

---

### 6.5 获取自动化执行历史

**接口**: `GET /api/v1/automations/:automationId/executions`

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "exec456",
        "automationId": "auto123",
        "triggerEvent": {
          "type": "time",
          "timestamp": "2025-01-18T07:00:00Z"
        },
        "conditionsMet": true,
        "success": true,
        "duration": 1234,
        "executedAt": "2025-01-18T07:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 7. AI 相关 API

### 7.1 自然语言控制

**接口**: `POST /api/v1/ai/nl-control`

**请求**:
```json
{
  "homeId": "home123",
  "input": "把卧室的灯调成温暖一点"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "intent": "control_device",
    "entities": [
      { "type": "room", "value": "bedroom" },
      { "type": "device", "value": "light" },
      { "type": "action", "value": "adjust_temperature" },
      { "type": "degree", "value": "warmer" }
    ],
    "actions": [
      {
        "deviceId": "device123",
        "capability": "temperature",
        "value": 2700
      }
    ],
    "confirmation": "已将卧室灯色温调整为 2700K (暖白光)"
  }
}
```

---

### 7.2 场景推荐

**接口**: `GET /api/v1/ai/recommend-scenes`

**查询参数**:
- `homeId`: 家庭 ID
- `limit`: 推荐数量

**响应**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "name": "晚间阅读",
        "reason": "基于您的历史习惯推荐",
        "confidence": 0.85,
        "scene": {
          "name": "晚间阅读",
          "icon": "book",
          "actions": [...]
        }
      }
    ]
  }
}
```

---

### 7.3 自动化推荐

**接口**: `GET /api/v1/ai/recommend-automations`

**响应**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "name": "睡眠模式自动化",
        "reason": "检测到您经常在 23:00 关灯",
        "confidence": 0.92,
        "automation": {
          "name": "睡眠模式",
          "trigger": {
            "type": "time",
            "config": { "time": "23:00" }
          },
          "actions": [...]
        }
      }
    ]
  }
}
```

---

### 7.4 创建自然语言场景

**接口**: `POST /api/v1/ai/create-scene`

**请求**:
```json
{
  "homeId": "home123",
  "description": "帮我设置一个晚间阅读场景，台灯亮度 80%，色温暖白光，客厅灯关闭"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "scene": {
      "name": "晚间阅读",
      "icon": "book",
      "actions": [
        {
          "deviceId": "desk_lamp",
          "capability": "brightness",
          "value": 80,
          "order": 1
        },
        {
          "deviceId": "desk_lamp",
          "capability": "temperature",
          "value": 2700,
          "order": 2
        },
        {
          "deviceId": "living_room_light",
          "capability": "power",
          "value": "off",
          "order": 3
        }
      ]
    },
    "confirmation": "已为您创建'晚间阅读'场景，是否保存？"
  }
}
```

---

## 8. WebSocket API

### 8.1 连接

```
wss://api.homeplatform.io/ws
```

### 8.2 认证

连接后发送认证消息：

```json
{
  "type": "auth",
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

响应：

```json
{
  "type": "auth_success",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 8.3 订阅设备状态

**订阅**:
```json
{
  "type": "subscribe",
  "topic": "device.state",
  "deviceIds": ["device1", "device2"]
}
```

**接收状态更新**:
```json
{
  "type": "device.state.changed",
  "deviceId": "device1",
  "state": {
    "power": "on",
    "brightness": 80
  },
  "timestamp": 1705564800000
}
```

---

### 8.4 订阅场景执行

**订阅**:
```json
{
  "type": "subscribe",
  "topic": "scene.execution"
}
```

**接收执行通知**:
```json
{
  "type": "scene.executed",
  "sceneId": "scene123",
  "executionId": "exec123",
  "success": true,
  "duration": 2177,
  "timestamp": 1705564800000
}
```

---

### 8.5 订阅自动化触发

**订阅**:
```json
{
  "type": "subscribe",
  "topic": "automation.execution"
}
```

**接收触发通知**:
```json
{
  "type": "automation.triggered",
  "automationId": "auto123",
  "triggerEvent": {
    "type": "time",
    "timestamp": "2025-01-18T07:00:00Z"
  },
  "success": true,
  "timestamp": 1705564800000
}
```

---

### 8.6 取消订阅

```json
{
  "type": "unsubscribe",
  "topic": "device.state"
}
```

---

### 8.7 心跳

客户端每 30 秒发送心跳：

```json
{
  "type": "ping"
}
```

服务器响应：

```json
{
  "type": "pong"
}
```

---

## 9. 错误码定义

### 9.1 通用错误码

| 错误码 | HTTP 状态码 | 说明 |
|-------|-----------|------|
| `INVALID_REQUEST` | 400 | 请求参数错误 |
| `UNAUTHORIZED` | 401 | 未授权 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `SERVICE_UNAVAILABLE` | 503 | 服务不可用 |

### 9.2 认证相关错误码

| 错误码 | HTTP 状态码 | 说明 |
|-------|-----------|------|
| `INVALID_CREDENTIALS` | 401 | 用户名或密码错误 |
| `PHONE_ALREADY_EXISTS` | 400 | 手机号已注册 |
| `INVALID_CODE` | 400 | 验证码错误 |
| `CODE_EXPIRED` | 400 | 验证码已过期 |
| `TOKEN_EXPIRED` | 401 | Token 已过期 |
| `INVALID_TOKEN` | 401 | Token 无效 |

### 9.3 设备相关错误码

| 错误码 | HTTP 状态码 | 说明 |
|-------|-----------|------|
| `DEVICE_NOT_FOUND` | 404 | 设备不存在 |
| `DEVICE_OFFLINE` | 503 | 设备离线 |
| `DEVICE_CONTROL_FAILED` | 500 | 设备控制失败 |
| `DEVICE_PAIRING_FAILED` | 400 | 设备配对失败 |
| `DEVICE_ALREADY_PAIRED` | 400 | 设备已配对 |
| `UNSUPPORTED_CAPABILITY` | 400 | 不支持的设备能力 |

### 9.4 场景相关错误码

| 错误码 | HTTP 状态码 | 说明 |
|-------|-----------|------|
| `SCENE_NOT_FOUND` | 404 | 场景不存在 |
| `SCENE_EXECUTION_FAILED` | 500 | 场景执行失败 |
| `INVALID_SCENE_ACTION` | 400 | 无效的场景动作 |

### 9.5 自动化相关错误码

| 错误码 | HTTP 状态码 | 说明 |
|-------|-----------|------|
| `AUTOMATION_NOT_FOUND` | 404 | 自动化不存在 |
| `INVALID_TRIGGER` | 400 | 无效的触发器 |
| `INVALID_CONDITION` | 400 | 无效的条件 |
| `INVALID_ACTION` | 400 | 无效的动作 |

---

## 10. SDK 文档

### 10.1 JavaScript/TypeScript SDK

#### 10.1.1 安装

```bash
npm install @homeplatform/sdk
```

#### 10.1.2 初始化

```typescript
import { HomePlatform } from '@homeplatform/sdk';

const client = new HomePlatform({
  apiUrl: 'https://api.homeplatform.io',
  accessToken: 'your-access-token'
});
```

#### 10.1.3 设备控制

```typescript
// 获取设备列表
const devices = await client.devices.list('home123');

// 控制设备
await client.devices.control('device123', {
  capability: 'brightness',
  value: 80
});

// 监听设备状态变化
client.devices.on('state-changed', (event) => {
  console.log(`Device ${event.deviceId} state changed:`, event.state);
});
```

#### 10.1.4 场景操作

```typescript
// 获取场景列表
const scenes = await client.scenes.list('home123');

// 执行场景
await client.scenes.execute('scene123');

// 创建场景
const scene = await client.scenes.create({
  homeId: 'home123',
  name: '回家模式',
  actions: [...]
});
```

#### 10.1.5 自动化操作

```typescript
// 创建自动化
const automation = await client.automations.create({
  homeId: 'home123',
  name: '晨起自动化',
  trigger: {
    type: 'time',
    config: { time: '07:00' }
  },
  actions: [...]
});

// 启用/禁用自动化
await client.automations.update('auto123', { enabled: false });
```

#### 10.1.6 AI 功能

```typescript
// 自然语言控制
const result = await client.ai.nlControl({
  homeId: 'home123',
  input: '把卧室的灯调成温暖一点'
});

// 场景推荐
const recommendations = await client.ai.recommendScenes('home123');
```

---

### 10.2 Python SDK

#### 10.2.1 安装

```bash
pip install homeplatform-sdk
```

#### 10.2.2 初始化

```python
from homeplatform import HomePlatform

client = HomePlatform(
    api_url='https://api.homeplatform.io',
    access_token='your-access-token'
)
```

#### 10.2.3 设备控制

```python
# 获取设备列表
devices = client.devices.list('home123')

# 控制设备
client.devices.control('device123', {
    'capability': 'brightness',
    'value': 80
})

# 监听设备状态变化
@client.devices.on('state-changed')
def handle_state_change(event):
    print(f"Device {event['deviceId']} state changed: {event['state']}")
```

---

### 10.3 Swift SDK (iOS)

#### 10.3.1 安装 (CocoaPods)

```ruby
pod 'HomePlatformSDK'
```

#### 10.3.2 初始化

```swift
import HomePlatformSDK

let client = HomePlatform(
    apiURL: "https://api.homeplatform.io",
    accessToken: "your-access-token"
)
```

#### 10.3.3 设备控制

```swift
// 获取设备列表
client.devices.list(homeId: "home123") { result in
    switch result {
    case .success(let devices):
        print("Devices: \(devices)")
    case .failure(let error):
        print("Error: \(error)")
    }
}

// 控制设备
client.devices.control(
    deviceId: "device123",
    capability: "brightness",
    value: 80
) { result in
    // Handle result
}
```

---

### 10.4 Kotlin SDK (Android)

#### 10.4.1 安装 (Gradle)

```gradle
implementation 'io.homeplatform:sdk:1.0.0'
```

#### 10.4.2 初始化

```kotlin
import io.homeplatform.sdk.HomePlatform

val client = HomePlatform(
    apiUrl = "https://api.homeplatform.io",
    accessToken = "your-access-token"
)
```

#### 10.4.3 设备控制

```kotlin
// 获取设备列表
val devices = client.devices.list("home123")

// 控制设备
client.devices.control(
    deviceId = "device123",
    capability = "brightness",
    value = 80
)

// 使用协程
lifecycleScope.launch {
    val device = client.devices.get("device123")
    println("Device: $device")
}
```

---

## 附录

### A. 请求限流

| 端点类型 | 限流规则 |
|---------|---------|
| 认证相关 | 10 次/分钟 |
| 设备控制 | 100 次/分钟 |
| 场景执行 | 50 次/分钟 |
| 查询接口 | 500 次/分钟 |

### B. Webhook 回调

```json
POST https://your-webhook-url.com/callback
Content-Type: application/json
X-HomePlatform-Signature: sha256=...

{
  "event": "device.state.changed",
  "data": {
    "deviceId": "device123",
    "state": {...},
    "timestamp": 1705564800000
  }
}
```

### C. 变更日志

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| v1.0 | 2025-01-18 | 初版发布 |

---

**文档结束**
