# HomePlatform Backend API

HomePlatform 后端 API 服务，基于 NestJS 开发。

## 技术栈

- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **认证**: JWT + Passport
- **API 文档**: Swagger/OpenAPI

## 快速开始

### 前置要求

- Node.js >= 18.0
- PostgreSQL >= 14
- Redis >= 7
- npm 或 yarn

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息。

### 3. 启动数据库 (使用 Docker)

在项目根目录运行：

```bash
cd ../..
npm run docker:up
```

这将启动：
- PostgreSQL (端口 5432)
- Redis (端口 6379)
- TimescaleDB (端口 5433)
- RabbitMQ (端口 5672, 管理界面 15672)
- MinIO (端口 9000, 控制台 9001)

### 4. 运行数据库迁移

```bash
npm run prisma:generate
npm run migrate
```

### 5. 启动开发服务器

```bash
npm run dev
```

服务将在 http://localhost:3000 启动。

## API 文档

启动服务后，访问：

- **Swagger UI**: http://localhost:3000/api/docs
- **API 前缀**: http://localhost:3000/api/v1

## 可用脚本

```bash
# 开发模式 (热重载)
npm run dev

# 生产构建
npm run build

# 启动生产服务
npm run start:prod

# 运行测试
npm run test

# 测试覆盖率
npm run test:cov

# 代码检查
npm run lint

# 代码格式化
npm run format

# 数据库迁移
npm run migrate

# 生成 Prisma Client
npm run prisma:generate

# Prisma Studio (数据库可视化)
npm run prisma:studio
```

## 项目结构

```
src/
├── auth/               # 认证模块
│   ├── dto/           # 数据传输对象
│   ├── guards/        # 认证守卫
│   ├── strategies/    # Passport 策略
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── devices/           # 设备管理模块
│   ├── dto/
│   ├── devices.controller.ts
│   ├── devices.service.ts
│   └── devices.module.ts
├── scenes/            # 场景管理模块
│   ├── dto/
│   ├── scenes.controller.ts
│   ├── scenes.service.ts
│   └── scenes.module.ts
├── prisma/            # 数据库模块
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.controller.ts  # 应用控制器
├── app.service.ts     # 应用服务
├── app.module.ts      # 应用根模块
└── main.ts            # 应用入口

prisma/
└── schema.prisma      # 数据库 Schema
```

## API 端点

### 认证 (Auth)

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/me` - 获取当前用户信息
- `POST /api/v1/auth/send-code` - 发送验证码

### 设备 (Devices)

- `GET /api/v1/devices` - 获取设备列表
- `GET /api/v1/devices/:id` - 获取设备详情
- `POST /api/v1/devices` - 添加设备
- `PUT /api/v1/devices/:id` - 更新设备
- `DELETE /api/v1/devices/:id` - 删除设备
- `POST /api/v1/devices/:id/control` - 控制设备
- `GET /api/v1/devices/:id/state` - 获取设备状态
- `POST /api/v1/devices/discover` - 发现设备

### 场景 (Scenes)

- `GET /api/v1/scenes` - 获取场景列表
- `GET /api/v1/scenes/:id` - 获取场景详情
- `POST /api/v1/scenes` - 创建场景
- `PUT /api/v1/scenes/:id` - 更新场景
- `DELETE /api/v1/scenes/:id` - 删除场景
- `POST /api/v1/scenes/:id/execute` - 执行场景
- `GET /api/v1/scenes/:id/executions` - 获取执行历史

## 数据库管理

### 查看数据库

```bash
npm run prisma:studio
```

访问 http://localhost:5555

### 创建迁移

```bash
npx prisma migrate dev --name migration_name
```

### 重置数据库

```bash
npx prisma migrate reset
```

## 测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

## 部署

### 构建生产版本

```bash
npm run build
```

### 运行生产服务

```bash
npm run start:prod
```

### Docker 部署

```bash
# 构建镜像
docker build -t homeplatform-api .

# 运行容器
docker run -p 3000:3000 --env-file .env homeplatform-api
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| `NODE_ENV` | 环境 | development |
| `PORT` | 端口 | 3000 |
| `DATABASE_URL` | 数据库连接 | - |
| `JWT_SECRET` | JWT 密钥 | - |
| `JWT_EXPIRES_IN` | JWT 过期时间 | 7d |
| `REDIS_HOST` | Redis 主机 | localhost |
| `REDIS_PORT` | Redis 端口 | 6379 |

## 故障排查

### 数据库连接失败

1. 检查 PostgreSQL 是否运行: `docker ps`
2. 检查 `.env` 中的 `DATABASE_URL`
3. 测试连接: `npx prisma db push`

### Prisma Client 未生成

```bash
npm run prisma:generate
```

### 端口已被占用

修改 `.env` 中的 `PORT` 变量。

## 相关链接

- [NestJS 文档](https://docs.nestjs.com/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [Swagger 文档](https://swagger.io/docs/)

## 许可证

MIT
