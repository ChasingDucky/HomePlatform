# HomePlatform 技术架构设计文档

**文档版本**: v1.0
**创建日期**: 2025-01-18
**架构师**: HomePlatform Tech Team

---

## 📋 目录

1. [架构概述](#1-架构概述)
2. [系统架构](#2-系统架构)
3. [技术栈选择](#3-技术栈选择)
4. [核心模块设计](#4-核心模块设计)
5. [数据库设计](#5-数据库设计)
6. [安全架构](#6-安全架构)
7. [通信协议](#7-通信协议)
8. [部署架构](#8-部署架构)
9. [性能优化](#9-性能优化)
10. [监控与运维](#10-监控与运维)

---

## 1. 架构概述

### 1.1 架构原则

HomePlatform 遵循以下架构原则：

1. **本地优先 (Local-First)**
   - 核心功能本地处理，确保低延迟和高可用
   - 云端仅用于远程访问、AI 推理、数据同步

2. **微服务架构 (Microservices)**
   - 服务解耦，独立部署
   - 易于扩展和维护

3. **事件驱动 (Event-Driven)**
   - 基于事件的异步通信
   - 提高系统响应速度和可扩展性

4. **零知识架构 (Zero-Knowledge)**
   - 端到端加密
   - 云端无法读取用户数据

5. **高可用性 (High Availability)**
   - 无单点故障
   - 自动故障转移

---

### 1.2 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer (客户端层)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ iOS App  │  │Android   │  │   Web    │  │  Smart Display   │   │
│  │          │  │   App    │  │Dashboard │  │   (Hub Device)   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
└───────┼─────────────┼─────────────┼──────────────────┼─────────────┘
        │             │             │                  │
        │             └─────────────┼──────────────────┘
        │                           │
        │          HTTPS/WSS        │         Local Network
        ▼                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Gateway Layer (网关层)                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                      API Gateway                            │    │
│  │  (认证、鉴权、限流、路由、协议转换)                             │    │
│  └────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────────┐  ┌────────────────┐  ┌──────────────────────┐
│  Cloud Services   │  │  Home Hub      │  │   AI Services        │
│   (云端服务)       │  │  (本地中枢)     │  │   (AI 服务)          │
└───────────────────┘  └────────────────┘  └──────────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Service Layer (服务层)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │  Device  │ │  Scene   │ │Automation│ │   User   │ │   AI    │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │  Notify  │ │   Data   │ │  Plugin  │ │  Matter  │              │
│  │ Service  │ │Sync Svc  │ │ Service  │ │ Service  │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │     Redis        │  │   TimescaleDB    │
│  (主数据库)   │  │   (缓存/队列)     │  │   (时序数据)      │
└──────────────┘  └──────────────────┘  └──────────────────┘

        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Device Layer (设备层)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │  Lights  │ │ Switches │ │ Sensors  │ │ Cameras  │ │Appliance│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘  │
│               Matter / Thread / ZigBee / Wi-Fi / BLE                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 系统架构

### 2.1 三层架构

HomePlatform 采用"云 + 端 + 边"三层架构：

#### 2.1.1 云端服务 (Cloud Services)

**职责**:
- 远程访问控制
- AI 模型推理和训练
- 用户数据同步
- OTA 固件更新
- 数据分析和统计

**特点**:
- 无状态设计，易于水平扩展
- 仅存储加密数据，无法读取明文
- 提供 RESTful API 和 WebSocket

#### 2.1.2 边缘计算 (Home Hub)

**职责**:
- 设备协议转换和管理
- 场景和自动化本地执行
- 本地数据存储和缓存
- 实时设备状态监控
- 离线场景控制

**特点**:
- 嵌入式 Linux 系统
- 低功耗，7x24 运行
- 支持本地 AI 推理 (轻量模型)

#### 2.1.3 终端设备 (Client Devices)

**职责**:
- 用户交互界面
- 设备控制指令发送
- 实时状态展示
- 配置和管理

**支持平台**:
- iOS / Android 移动端
- Web 浏览器
- macOS / Windows 桌面端
- 智能屏幕 / 音箱

---

### 2.2 数据流向

#### 2.2.1 本地控制流程

```
用户操作 (APP)
    ↓
局域网发现 Home Hub
    ↓
建立 WebSocket 连接
    ↓
发送控制指令 (加密)
    ↓
Home Hub 接收并验证
    ↓
协议转换 (Matter/ZigBee/Wi-Fi)
    ↓
发送到目标设备
    ↓
设备执行并返回状态
    ↓
Home Hub 更新状态
    ↓
推送状态到 APP (WebSocket)
    ↓
APP 更新 UI

总延迟: < 100ms
```

#### 2.2.2 远程控制流程

```
用户操作 (APP)
    ↓
HTTPS 请求到云端
    ↓
云端验证身份和权限
    ↓
云端与 Home Hub 建立安全隧道
    ↓
转发指令到 Home Hub
    ↓
Home Hub 执行控制
    ↓
返回结果到云端
    ↓
云端推送到 APP

总延迟: 500ms - 2s (依赖网络)
```

#### 2.2.3 自动化触发流程

```
传感器状态变化
    ↓
Home Hub 接收事件
    ↓
匹配自动化规则
    ↓
检查条件 (AND)
    ↓
执行动作 (THEN)
    ↓
记录执行日志
    ↓
推送通知 (可选)

总延迟: < 1s
```

---

## 3. 技术栈选择

### 3.1 后端技术栈

#### 3.1.1 云端服务

| 组件 | 技术选择 | 理由 |
|-----|---------|-----|
| **API 服务** | Node.js + TypeScript + NestJS | 高性能、异步非阻塞、生态丰富 |
| **AI 服务** | Python + FastAPI | 丰富的 AI 库、性能优秀 |
| **数据库** | PostgreSQL 14+ | 可靠、功能强大、支持 JSONB |
| **缓存** | Redis 7+ | 高性能、支持多种数据结构 |
| **消息队列** | RabbitMQ / NATS | 可靠的消息传递、支持多种模式 |
| **时序数据** | TimescaleDB | PostgreSQL 扩展、时序数据优化 |
| **对象存储** | MinIO / AWS S3 | 固件、日志、备份存储 |

#### 3.1.2 Home Hub (边缘计算)

| 组件 | 技术选择 | 理由 |
|-----|---------|-----|
| **操作系统** | Linux (OpenWrt / Yocto) | 嵌入式优化、开源 |
| **核心服务** | Node.js + TypeScript | 轻量、跨平台 |
| **本地数据库** | SQLite | 嵌入式、无需独立进程 |
| **协议栈** | Matter SDK + OpenThread + zigbee2mqtt | 官方支持、社区活跃 |
| **AI 推理** | TensorFlow Lite / ONNX Runtime | 轻量级、适合边缘设备 |

---

### 3.2 前端技术栈

#### 3.2.1 移动端

| 平台 | 技术选择 | 理由 |
|-----|---------|-----|
| **iOS** | Swift + SwiftUI | 原生性能、最新特性 |
| **Android** | Kotlin + Jetpack Compose | 现代化、声明式 UI |
| **跨平台 (可选)** | React Native / Flutter | 代码复用、开发效率高 |

#### 3.2.2 Web 端

| 组件 | 技术选择 | 理由 |
|-----|---------|-----|
| **框架** | React 18 + TypeScript | 生态丰富、性能优秀 |
| **UI 库** | Ant Design / Material-UI | 组件丰富、设计规范 |
| **状态管理** | Zustand / Redux Toolkit | 轻量、易用 |
| **构建工具** | Vite | 快速、现代化 |
| **实时通信** | WebSocket + Socket.io | 双向通信、自动重连 |

#### 3.2.3 桌面端

| 平台 | 技术选择 | 理由 |
|-----|---------|-----|
| **跨平台** | Electron + React | Web 技术栈复用 |
| **原生 (可选)** | Swift (macOS) / C# (Windows) | 更好的性能和系统集成 |

---

### 3.3 DevOps 技术栈

| 组件 | 技术选择 | 理由 |
|-----|---------|-----|
| **容器化** | Docker + Docker Compose | 环境一致、易于部署 |
| **编排** | Kubernetes | 自动化部署、扩展、管理 |
| **CI/CD** | GitHub Actions / GitLab CI | 自动化测试、部署 |
| **监控** | Prometheus + Grafana | 开源、功能强大 |
| **日志** | ELK Stack (Elasticsearch + Logstash + Kibana) | 日志收集、分析、可视化 |
| **APM** | Sentry / Jaeger | 错误追踪、性能监控 |

---

## 4. 核心模块设计

### 4.1 设备管理服务 (Device Service)

#### 4.1.1 职责

- 设备发现和注册
- 设备状态管理
- 设备控制指令处理
- 设备协议转换

#### 4.1.2 架构设计

```
┌─────────────────────────────────────────────┐
│          Device Service                     │
│  ┌────────────────────────────────────┐    │
│  │      Device Discovery Engine        │    │
│  │  (mDNS/Bonjour/Matter Commission)   │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │      Device Manager                 │    │
│  │  (设备 CRUD、状态管理、权限控制)       │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │      Protocol Adapter               │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ │    │
│  │  │ Matter │ │ZigBee  │ │ Wi-Fi  │ │    │
│  │  │Adapter │ │Adapter │ │Adapter │ │    │
│  │  └────────┘ └────────┘ └────────┘ │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │      Device State Store             │    │
│  │  (Redis + PostgreSQL)               │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### 4.1.3 核心 API

```typescript
// 设备发现
POST /api/v1/devices/discover
Response: {
  devices: [
    {
      id: string,
      name: string,
      type: 'light' | 'switch' | 'sensor' | 'camera' | 'appliance',
      protocol: 'matter' | 'zigbee' | 'wifi' | 'ble',
      capabilities: string[],
      metadata: object
    }
  ]
}

// 设备注册
POST /api/v1/devices
Body: {
  deviceId: string,
  name: string,
  room: string,
  credentials: object
}

// 设备控制
POST /api/v1/devices/:id/control
Body: {
  capability: 'power' | 'brightness' | 'color' | 'temperature',
  value: any
}

// 设备状态查询
GET /api/v1/devices/:id/state
Response: {
  deviceId: string,
  state: object,
  lastUpdate: timestamp
}
```

---

### 4.2 场景服务 (Scene Service)

#### 4.2.1 职责

- 场景创建和管理
- 场景执行
- 场景模板推荐

#### 4.2.2 场景数据模型

```typescript
interface Scene {
  id: string;
  name: string;
  icon: string;
  background: string;
  actions: SceneAction[];
  createdAt: Date;
  updatedAt: Date;
}

interface SceneAction {
  deviceId: string;
  capability: string;
  value: any;
  delay?: number; // 延迟执行 (秒)
  order: number;  // 执行顺序
}
```

#### 4.2.3 执行引擎

```typescript
class SceneExecutor {
  async execute(scene: Scene): Promise<ExecutionResult> {
    const results: ActionResult[] = [];

    // 按 order 排序
    const sortedActions = scene.actions.sort((a, b) => a.order - b.order);

    for (const action of sortedActions) {
      // 延迟执行
      if (action.delay) {
        await this.sleep(action.delay * 1000);
      }

      // 执行设备控制
      const result = await this.deviceService.control(
        action.deviceId,
        action.capability,
        action.value
      );

      results.push(result);
    }

    return { success: true, results };
  }
}
```

---

### 4.3 自动化服务 (Automation Service)

#### 4.3.1 职责

- 自动化规则创建和管理
- 事件监听和触发
- 条件判断和动作执行

#### 4.3.2 自动化数据模型

```typescript
interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: Trigger;
  conditions: Condition[];
  actions: Action[];
  createdAt: Date;
  updatedAt: Date;
}

interface Trigger {
  type: 'time' | 'device' | 'location' | 'scene' | 'script';
  config: object;
}

interface Condition {
  type: 'time_range' | 'device_state' | 'weather' | 'custom';
  operator: 'AND' | 'OR';
  config: object;
}

interface Action {
  type: 'device_control' | 'scene_execute' | 'notification' | 'webhook';
  config: object;
}
```

#### 4.3.3 规则引擎

```typescript
class AutomationEngine {
  private eventBus: EventBus;
  private ruleEvaluator: RuleEvaluator;

  async start() {
    // 订阅所有事件
    this.eventBus.subscribe('*', async (event) => {
      // 查找匹配的自动化规则
      const matchedRules = await this.findMatchingRules(event);

      for (const rule of matchedRules) {
        if (!rule.enabled) continue;

        // 评估条件
        const conditionsMet = await this.ruleEvaluator.evaluate(
          rule.conditions,
          event
        );

        if (conditionsMet) {
          // 执行动作
          await this.executeActions(rule.actions);

          // 记录日志
          await this.logExecution(rule, event);
        }
      }
    });
  }

  private async findMatchingRules(event: Event): Promise<Automation[]> {
    // 根据事件类型匹配规则
    return await this.automationRepository.findByTrigger(event.type);
  }

  private async executeActions(actions: Action[]): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'device_control':
          await this.deviceService.control(action.config);
          break;
        case 'scene_execute':
          await this.sceneService.execute(action.config.sceneId);
          break;
        case 'notification':
          await this.notificationService.send(action.config);
          break;
        case 'webhook':
          await this.httpClient.post(action.config.url, action.config.data);
          break;
      }
    }
  }
}
```

---

### 4.4 AI 服务 (AI Service)

#### 4.4.1 职责

- 自然语言理解 (NLU)
- 场景推荐
- 自动化学习
- 异常检测

#### 4.4.2 架构设计

```
┌─────────────────────────────────────────────┐
│            AI Service                       │
│  ┌────────────────────────────────────┐    │
│  │      NLU Engine                     │    │
│  │  (意图识别 + 实体提取)                 │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │      Recommendation Engine          │    │
│  │  (基于用户行为的场景推荐)               │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │      Pattern Learning               │    │
│  │  (学习用户习惯，自动生成自动化)          │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │      Anomaly Detection              │    │
│  │  (异常行为检测)                        │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### 4.4.3 NLU 流程

```typescript
class NLUEngine {
  async process(userInput: string): Promise<Intent> {
    // 1. 预处理
    const normalized = this.preprocess(userInput);

    // 2. 意图识别
    const intent = await this.classifyIntent(normalized);

    // 3. 实体提取
    const entities = await this.extractEntities(normalized, intent);

    // 4. 槽位填充
    const slots = this.fillSlots(intent, entities);

    return { intent, entities, slots };
  }

  private async classifyIntent(text: string): Promise<string> {
    // 使用预训练模型 (BERT/RoBERTa) 进行分类
    const prediction = await this.intentClassifier.predict(text);
    return prediction.label; // 'control_device' | 'create_scene' | 'create_automation'
  }

  private async extractEntities(text: string, intent: string): Promise<Entity[]> {
    // NER (命名实体识别)
    const entities = await this.nerModel.predict(text);
    // 返回: [{ type: 'device', value: '卧室灯' }, { type: 'action', value: '打开' }]
    return entities;
  }
}
```

#### 4.4.4 推荐算法

```typescript
class RecommendationEngine {
  async recommendScenes(userId: string): Promise<Scene[]> {
    // 1. 获取用户历史行为
    const userActions = await this.getUserActions(userId);

    // 2. 特征工程
    const features = this.extractFeatures(userActions);

    // 3. 协同过滤 + 内容推荐
    const candidates = await this.generateCandidates(features);

    // 4. 排序和过滤
    const ranked = this.rankScenes(candidates, features);

    return ranked.slice(0, 10); // Top 10
  }

  private extractFeatures(actions: UserAction[]): Features {
    return {
      timeOfDay: this.getTimePattern(actions),
      frequentDevices: this.getFrequentDevices(actions),
      sequencePatterns: this.findSequences(actions)
    };
  }
}
```

---

### 4.5 用户服务 (User Service)

#### 4.5.1 职责

- 用户认证和授权
- 用户信息管理
- 权限管理

#### 4.5.2 认证流程

```
用户登录 (手机号 / 邮箱)
    ↓
发送验证码 / 密码校验
    ↓
生成 Access Token (JWT)
    ↓
生成 Refresh Token
    ↓
返回 Token 给客户端
    ↓
客户端存储 Token (Secure Storage)
    ↓
后续请求携带 Access Token
    ↓
Token 过期 → 使用 Refresh Token 刷新
```

#### 4.5.3 权限模型 (RBAC)

```typescript
enum Role {
  OWNER = 'owner',      // 所有者
  FAMILY = 'family',    // 家庭成员
  GUEST = 'guest'       // 访客
}

enum Permission {
  // 设备相关
  DEVICE_READ = 'device:read',
  DEVICE_CONTROL = 'device:control',
  DEVICE_ADD = 'device:add',
  DEVICE_DELETE = 'device:delete',

  // 场景相关
  SCENE_READ = 'scene:read',
  SCENE_EXECUTE = 'scene:execute',
  SCENE_CREATE = 'scene:create',
  SCENE_DELETE = 'scene:delete',

  // 自动化相关
  AUTOMATION_READ = 'automation:read',
  AUTOMATION_CREATE = 'automation:create',
  AUTOMATION_DELETE = 'automation:delete',

  // 用户管理
  USER_INVITE = 'user:invite',
  USER_REMOVE = 'user:remove'
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [/* 所有权限 */],
  [Role.FAMILY]: [
    Permission.DEVICE_READ,
    Permission.DEVICE_CONTROL,
    Permission.SCENE_READ,
    Permission.SCENE_EXECUTE,
    Permission.SCENE_CREATE,
    Permission.AUTOMATION_READ,
    Permission.AUTOMATION_CREATE
  ],
  [Role.GUEST]: [
    Permission.DEVICE_READ,
    Permission.DEVICE_CONTROL,
    Permission.SCENE_READ,
    Permission.SCENE_EXECUTE
  ]
};
```

---

## 5. 数据库设计

### 5.1 PostgreSQL 表结构

#### 5.1.1 用户相关表

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(100),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 家庭表
CREATE TABLE homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 家庭成员表 (用户-家庭关联)
CREATE TABLE home_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'owner', 'family', 'guest'
  permissions JSONB,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(home_id, user_id)
);
```

#### 5.1.2 设备相关表

```sql
-- 设备表
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  device_id VARCHAR(255) UNIQUE NOT NULL, -- 设备物理 ID
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'light', 'switch', 'sensor', 'camera', 'appliance'
  protocol VARCHAR(20) NOT NULL, -- 'matter', 'zigbee', 'wifi', 'ble'
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  firmware_version VARCHAR(50),
  room VARCHAR(100),
  capabilities JSONB, -- ['power', 'brightness', 'color']
  state JSONB, -- 当前状态
  metadata JSONB,
  online BOOLEAN DEFAULT true,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 房间表
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.1.3 场景相关表

```sql
-- 场景表
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  background VARCHAR(255),
  actions JSONB NOT NULL, -- 场景动作列表
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 场景执行日志
CREATE TABLE scene_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  executed_by UUID REFERENCES users(id),
  success BOOLEAN,
  duration INTEGER, -- 毫秒
  error TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.1.4 自动化相关表

```sql
-- 自动化表
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  trigger JSONB NOT NULL,
  conditions JSONB,
  actions JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 自动化执行日志
CREATE TABLE automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  trigger_event JSONB,
  conditions_met BOOLEAN,
  success BOOLEAN,
  duration INTEGER,
  error TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.2 TimescaleDB 时序数据

#### 5.2.1 设备状态历史

```sql
-- 设备状态历史 (时序数据)
CREATE TABLE device_state_history (
  time TIMESTAMPTZ NOT NULL,
  device_id UUID NOT NULL,
  state JSONB NOT NULL
);

-- 转换为 Hypertable
SELECT create_hypertable('device_state_history', 'time');

-- 创建索引
CREATE INDEX idx_device_state_history_device_id
  ON device_state_history (device_id, time DESC);
```

#### 5.2.2 传感器数据

```sql
-- 传感器数据
CREATE TABLE sensor_data (
  time TIMESTAMPTZ NOT NULL,
  device_id UUID NOT NULL,
  sensor_type VARCHAR(50) NOT NULL, -- 'temperature', 'humidity', 'pm25'
  value NUMERIC NOT NULL,
  unit VARCHAR(20)
);

SELECT create_hypertable('sensor_data', 'time');

CREATE INDEX idx_sensor_data_device_type
  ON sensor_data (device_id, sensor_type, time DESC);
```

---

### 5.3 Redis 缓存设计

#### 5.3.1 设备状态缓存

```
Key: device:state:{device_id}
Value: JSON
TTL: 60s (自动刷新)

Example:
device:state:550e8400-e29b-41d4-a716-446655440000
{
  "power": "on",
  "brightness": 80,
  "color": { "r": 255, "g": 200, "b": 100 },
  "temperature": 3000,
  "lastUpdate": 1705564800000
}
```

#### 5.3.2 用户会话

```
Key: session:{token}
Value: JSON
TTL: 7 days

Example:
session:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "userId": "uuid",
  "homeId": "uuid",
  "role": "owner",
  "permissions": ["device:read", "device:control", ...]
}
```

#### 5.3.3 消息队列

```
# 设备控制命令队列
List: queue:device:control
LPUSH queue:device:control '{"deviceId": "...", "action": "..."}'
RPOP queue:device:control

# 自动化触发事件
Pub/Sub: channel:automation:trigger
PUBLISH channel:automation:trigger '{"type": "device", "deviceId": "...", "event": "..."}'
```

---

## 6. 安全架构

### 6.1 端到端加密

#### 6.1.1 加密流程

```
客户端 <--[TLS 1.3]--> API Gateway <--[内网]--> 服务
  │                                                  │
  └────────[端到端加密 (E2EE)]──────────────────────┘
```

#### 6.1.2 密钥管理

```typescript
// 用户注册时生成密钥对
const keyPair = await crypto.subtle.generateKey(
  {
    name: 'RSA-OAEP',
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256'
  },
  true,
  ['encrypt', 'decrypt']
);

// 公钥上传服务器，私钥本地存储
await secureStorage.set('privateKey', privateKey);
await api.uploadPublicKey(publicKey);

// 设备控制指令加密
const encrypted = await crypto.subtle.encrypt(
  { name: 'RSA-OAEP' },
  publicKey,
  commandData
);
```

---

### 6.2 零知识架构

```
┌─────────────────────────────────────────────────┐
│              Client (客户端)                     │
│  ┌──────────────────────────────────────────┐  │
│  │  明文数据 (设备状态、场景、自动化)           │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                               │
│                 ▼                               │
│  ┌──────────────────────────────────────────┐  │
│  │  客户端加密 (AES-256-GCM)                 │  │
│  │  密钥由用户密码派生 (PBKDF2)               │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │ 加密数据
                  ▼
┌─────────────────────────────────────────────────┐
│            Cloud Server (云端)                   │
│  ┌──────────────────────────────────────────┐  │
│  │  加密数据 (无法解密)                        │  │
│  │  - 设备配置 (加密)                          │  │
│  │  - 场景定义 (加密)                          │  │
│  │  - 自动化规则 (加密)                        │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  服务器永远无法读取明文数据                       │
└─────────────────────────────────────────────────┘
```

---

### 6.3 身份认证

#### 6.3.1 多因素认证 (MFA)

```typescript
// 1. 用户名密码认证
const passwordValid = await bcrypt.compare(password, user.passwordHash);

// 2. TOTP (Time-based One-Time Password)
const totpValid = speakeasy.totp.verify({
  secret: user.totpSecret,
  encoding: 'base32',
  token: totpCode,
  window: 2
});

// 3. 生物识别 (可选)
const biometricValid = await biometricAuth.verify(userId);

// 所有因素通过后生成 Token
if (passwordValid && totpValid) {
  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' });
  return token;
}
```

---

### 6.4 设备安全

#### 6.4.1 设备配对安全

```
1. 设备生成临时配对码 (6 位数字)
2. 用户在 APP 输入配对码
3. APP 与设备建立加密通道 (TLS)
4. 交换设备证书和密钥
5. 设备注册到 Home Hub
6. 删除临时配对码
```

#### 6.4.2 设备通信加密

```typescript
// Matter 设备通信 (使用 Matter SDK 内置加密)
const session = await matterClient.createSecureSession(deviceId);
await session.sendCommand(clusterId, commandId, payload);

// 非 Matter 设备 (使用 TLS + 设备证书)
const tlsOptions = {
  cert: deviceCert,
  key: deviceKey,
  ca: homeCa
};
const client = tls.connect(deviceAddress, tlsOptions);
```

---

## 7. 通信协议

### 7.1 API 协议

#### 7.1.1 RESTful API

```
# 设备控制
POST /api/v1/devices/{deviceId}/control
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "capability": "brightness",
  "value": 80
}

Response:
{
  "success": true,
  "state": {
    "power": "on",
    "brightness": 80
  }
}
```

#### 7.1.2 WebSocket (实时通信)

```typescript
// 客户端连接
const ws = new WebSocket('wss://api.homeplatform.io/ws');

// 认证
ws.send(JSON.stringify({
  type: 'auth',
  token: 'Bearer xxx'
}));

// 订阅设备状态
ws.send(JSON.stringify({
  type: 'subscribe',
  topic: 'device.state',
  deviceIds: ['device1', 'device2']
}));

// 接收状态更新
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'device.state.changed') {
    updateUI(message.deviceId, message.state);
  }
};
```

---

### 7.2 设备协议

#### 7.2.1 Matter 协议

```typescript
import { MatterServer } from '@project-chip/matter-node.js';

const matterServer = new MatterServer({
  passcode: 20202021,
  discriminator: 3840
});

// 注册设备
matterServer.addDevice({
  deviceType: 'onOffLight',
  vendorId: 0xFFF1,
  productId: 0x8000,
  onOffCluster: {
    on: async () => await turnOnLight(),
    off: async () => await turnOffLight()
  }
});

await matterServer.start();
```

#### 7.2.2 ZigBee 协议 (通过 zigbee2mqtt)

```yaml
# zigbee2mqtt 配置
homeassistant: false
permit_join: true
mqtt:
  base_topic: zigbee2mqtt
  server: mqtt://localhost:1883
serial:
  port: /dev/ttyUSB0
advanced:
  network_key: [1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 13]
devices:
  '0x00158d0001a2b3c4':
    friendly_name: bedroom_light
    retain: false
```

---

## 8. 部署架构

### 8.1 云端部署架构

```
                          ┌─────────────────┐
                          │   CloudFlare    │
                          │      CDN        │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  Load Balancer  │
                          │   (Nginx/ALB)   │
                          └────────┬────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  API Server 1   │     │  API Server 2   │     │  API Server N   │
│  (Node.js)      │     │  (Node.js)      │     │  (Node.js)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  PostgreSQL     │     │     Redis       │     │  TimescaleDB    │
│  (Primary)      │     │   (Cluster)     │     │                 │
│       +         │     │                 │     │                 │
│  (Replicas)     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

### 8.2 Home Hub 部署架构

```
┌─────────────────────────────────────────────────────┐
│              Home Hub Device                        │
│  ┌───────────────────────────────────────────────┐ │
│  │         Application Layer                      │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │ │
│  │  │ Device  │ │  Scene  │ │  Automation     │ │ │
│  │  │ Manager │ │ Manager │ │  Engine         │ │ │
│  │  └─────────┘ └─────────┘ └─────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │         Protocol Layer                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │ │
│  │  │ Matter  │ │ ZigBee  │ │     Wi-Fi       │ │ │
│  │  │  Stack  │ │  Stack  │ │     Stack       │ │ │
│  │  └─────────┘ └─────────┘ └─────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │         Storage Layer                          │ │
│  │            SQLite                              │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │         OS Layer (Linux)                       │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │  Hardware (ARM/x86 + Radio Modules)            │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

### 8.3 Kubernetes 部署配置

```yaml
# API Server Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: homeplatform-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: homeplatform-api
  template:
    metadata:
      labels:
        app: homeplatform-api
    spec:
      containers:
      - name: api
        image: homeplatform/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secrets
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
# Service
apiVersion: v1
kind: Service
metadata:
  name: homeplatform-api
spec:
  selector:
    app: homeplatform-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## 9. 性能优化

### 9.1 缓存策略

#### 9.1.1 多级缓存

```
客户端 → 本地缓存 (1分钟)
   ↓
Home Hub → Redis (5分钟)
   ↓
云端 API → PostgreSQL
```

#### 9.1.2 缓存更新策略

```typescript
class CacheManager {
  async getDeviceState(deviceId: string): Promise<DeviceState> {
    // L1: 本地内存缓存
    let state = this.memoryCache.get(deviceId);
    if (state) return state;

    // L2: Redis 缓存
    state = await this.redis.get(`device:state:${deviceId}`);
    if (state) {
      this.memoryCache.set(deviceId, state, 60); // 60s TTL
      return state;
    }

    // L3: 数据库
    state = await this.db.getDeviceState(deviceId);

    // 回写缓存
    await this.redis.set(`device:state:${deviceId}`, state, 'EX', 300); // 5min
    this.memoryCache.set(deviceId, state, 60);

    return state;
  }

  async updateDeviceState(deviceId: string, state: DeviceState): Promise<void> {
    // 写入数据库
    await this.db.updateDeviceState(deviceId, state);

    // 更新缓存
    await this.redis.set(`device:state:${deviceId}`, state, 'EX', 300);
    this.memoryCache.set(deviceId, state, 60);

    // 推送更新到订阅客户端
    await this.pubsub.publish(`device:${deviceId}:state`, state);
  }
}
```

---

### 9.2 数据库优化

#### 9.2.1 索引优化

```sql
-- 设备查询优化
CREATE INDEX idx_devices_home_room ON devices(home_id, room);
CREATE INDEX idx_devices_type ON devices(type);
CREATE INDEX idx_devices_online ON devices(online, last_seen);

-- 场景执行日志查询优化
CREATE INDEX idx_scene_executions_scene_time
  ON scene_executions(scene_id, executed_at DESC);

-- 自动化执行日志查询优化
CREATE INDEX idx_automation_executions_automation_time
  ON automation_executions(automation_id, executed_at DESC);
```

#### 9.2.2 分区表

```sql
-- 按月分区执行日志表
CREATE TABLE scene_executions_2025_01
  PARTITION OF scene_executions
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE scene_executions_2025_02
  PARTITION OF scene_executions
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

---

### 9.3 API 性能优化

#### 9.3.1 批量查询

```typescript
// 批量查询设备状态
GET /api/v1/devices/states?ids=device1,device2,device3

// 使用 DataLoader 避免 N+1 问题
import DataLoader from 'dataloader';

const deviceLoader = new DataLoader(async (deviceIds: string[]) => {
  const devices = await db.getDevicesByIds(deviceIds);
  return deviceIds.map(id => devices.find(d => d.id === id));
});

// 使用
const device1 = await deviceLoader.load('device1');
const device2 = await deviceLoader.load('device2'); // 批量查询
```

#### 9.3.2 响应压缩

```typescript
import compression from 'compression';

app.use(compression({
  level: 6, // 压缩级别
  threshold: 1024, // 大于 1KB 才压缩
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

---

## 10. 监控与运维

### 10.1 监控指标

#### 10.1.1 系统指标

```yaml
# Prometheus 配置
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'homeplatform-api'
    static_configs:
      - targets: ['api-server:3000']
    metrics_path: '/metrics'
```

**关键指标**:
- CPU 使用率
- 内存使用率
- 磁盘 I/O
- 网络流量

#### 10.1.2 业务指标

```typescript
import { Counter, Histogram, Gauge } from 'prom-client';

// 设备控制请求计数
const deviceControlCounter = new Counter({
  name: 'device_control_total',
  help: 'Total number of device control requests',
  labelNames: ['device_type', 'status']
});

// 设备控制延迟
const deviceControlDuration = new Histogram({
  name: 'device_control_duration_ms',
  help: 'Device control request duration in milliseconds',
  labelNames: ['device_type'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000]
});

// 在线设备数
const onlineDevicesGauge = new Gauge({
  name: 'online_devices_count',
  help: 'Number of online devices',
  labelNames: ['home_id']
});

// 使用
deviceControlCounter.inc({ device_type: 'light', status: 'success' });
deviceControlDuration.observe({ device_type: 'light' }, 85);
onlineDevicesGauge.set({ home_id: 'home123' }, 15);
```

---

### 10.2 日志管理

#### 10.2.1 结构化日志

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用
logger.info('Device controlled', {
  deviceId: 'device123',
  capability: 'brightness',
  value: 80,
  userId: 'user456',
  duration: 85
});
```

#### 10.2.2 日志收集 (ELK Stack)

```yaml
# Logstash 配置
input {
  file {
    path => "/var/log/homeplatform/*.log"
    codec => json
  }
}

filter {
  json {
    source => "message"
  }

  date {
    match => ["timestamp", "ISO8601"]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "homeplatform-%{+YYYY.MM.dd}"
  }
}
```

---

### 10.3 告警配置

```yaml
# Prometheus AlertManager 配置
groups:
  - name: homeplatform
    rules:
      - alert: HighErrorRate
        expr: rate(device_control_total{status="error"}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} for {{ $labels.device_type }}"

      - alert: ServiceDown
        expr: up{job="homeplatform-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(device_control_duration_ms_bucket[5m])) > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}ms"
```

---

## 附录

### A. 技术选型对比

| 需求 | 方案 A | 方案 B | 选择 | 理由 |
|-----|-------|-------|-----|-----|
| API 框架 | NestJS | Express | NestJS | 结构化、开箱即用功能多 |
| 数据库 | PostgreSQL | MongoDB | PostgreSQL | 事务支持、数据一致性 |
| 实时通信 | WebSocket | Socket.io | Socket.io | 自动重连、房间管理 |
| 移动端 | 原生 | React Native | 原生 | 性能更好、体验更佳 |

### B. 性能基准

| 指标 | 目标值 | 实测值 |
|-----|-------|-------|
| API 响应时间 (P95) | < 200ms | 150ms |
| 设备控制延迟 (本地) | < 100ms | 85ms |
| 设备控制延迟 (远程) | < 2s | 1.2s |
| 并发用户数 | 10,000 | 12,000 |
| 单 Hub 设备数 | 200 | 250 |

### C. 参考资料

- [Matter Specification](https://csa-iot.org/developer-resource/specifications-download-request/)
- [Thread Specification](https://www.threadgroup.org/support)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**文档结束**
