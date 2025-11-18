# 贡献指南

感谢您对 HomePlatform 项目的兴趣！我们欢迎所有形式的贡献。

## 📋 贡献方式

### 1. 报告 Bug

如果您发现了 Bug，请：

1. 检查 [Issues](https://github.com/YourOrg/HomePlatform/issues) 确认问题未被报告
2. 创建新 Issue，包含：
   - Bug 描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息 (OS, 版本等)
   - 截图/日志 (如有)

### 2. 提出新功能

如果您有新功能建议，请：

1. 创建 Feature Request Issue
2. 描述功能用途和价值
3. 提供使用场景
4. 等待社区讨论

### 3. 提交代码

#### 开发流程

1. **Fork 仓库**

   ```bash
   git clone https://github.com/YourUsername/HomePlatform.git
   cd HomePlatform
   ```

2. **创建分支**

   ```bash
   git checkout -b feature/amazing-feature
   # 或
   git checkout -b fix/bug-description
   ```

3. **安装依赖**

   ```bash
   npm install
   ```

4. **启动开发环境**

   ```bash
   # 启动 Docker 服务
   npm run docker:up

   # 运行数据库迁移
   npm run migrate

   # 启动开发服务器
   npm run dev
   ```

5. **编写代码**

   - 遵循代码规范
   - 编写测试用例
   - 更新文档

6. **提交代码**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   **Commit Message 规范**:
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```

   **Type 类型**:
   - `feat`: 新功能
   - `fix`: Bug 修复
   - `docs`: 文档更新
   - `style`: 代码格式调整
   - `refactor`: 代码重构
   - `test`: 测试相关
   - `chore`: 构建/工具链更新

   **示例**:
   ```
   feat(device): add support for Philips Hue lights

   - Add Philips Hue device discovery
   - Implement color control
   - Add unit tests

   Closes #123
   ```

7. **推送分支**

   ```bash
   git push origin feature/amazing-feature
   ```

8. **创建 Pull Request**

   - 访问 GitHub 仓库
   - 点击 "New Pull Request"
   - 填写 PR 描述
   - 等待 Review

---

## 💻 代码规范

### TypeScript/JavaScript

- 使用 TypeScript
- 使用 Prettier 格式化代码
- 使用 ESLint 检查代码质量

```bash
# 格式化代码
npm run format

# 检查代码
npm run lint
```

### 命名规范

```typescript
// 文件名: kebab-case
device-manager.service.ts

// 类名: PascalCase
class DeviceManager {}

// 函数名/变量名: camelCase
const deviceCount = 10;
function getDeviceById(id: string) {}

// 常量: UPPER_SNAKE_CASE
const MAX_DEVICES = 200;

// 接口: PascalCase + I 前缀 (可选)
interface IDevice {}
// 或
interface Device {}

// 类型: PascalCase
type DeviceType = 'light' | 'switch' | 'sensor';
```

---

## 🧪 测试规范

### 单元测试

```bash
# 运行测试
npm run test

# 运行特定测试
npm run test -- device.service.spec.ts

# 查看覆盖率
npm run test:cov
```

### 测试示例

```typescript
import { Test } from '@nestjs/testing';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service: DeviceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DeviceService],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return device by id', async () => {
    const device = await service.findById('device123');
    expect(device).toBeDefined();
    expect(device.id).toBe('device123');
  });
});
```

---

## 📝 文档规范

### 代码注释

```typescript
/**
 * 控制设备
 *
 * @param deviceId - 设备 ID
 * @param capability - 控制能力 (如: 'power', 'brightness')
 * @param value - 控制值
 * @returns 设备最新状态
 *
 * @example
 * ```typescript
 * const state = await deviceService.control('device123', 'brightness', 80);
 * console.log(state.brightness); // 80
 * ```
 */
async control(
  deviceId: string,
  capability: string,
  value: any
): Promise<DeviceState> {
  // Implementation
}
```

### API 文档

使用 Swagger/OpenAPI 规范：

```typescript
@ApiOperation({ summary: '控制设备' })
@ApiParam({ name: 'id', description: '设备 ID' })
@ApiBody({ type: ControlDeviceDto })
@ApiResponse({ status: 200, description: '控制成功' })
@ApiResponse({ status: 404, description: '设备不存在' })
@Post(':id/control')
async control(@Param('id') id: string, @Body() dto: ControlDeviceDto) {
  return this.deviceService.control(id, dto.capability, dto.value);
}
```

---

## 🔍 Code Review 标准

### PR Review Checklist

- [ ] 代码符合项目规范
- [ ] 有相应的测试用例
- [ ] 测试全部通过
- [ ] 文档已更新
- [ ] Commit Message 规范
- [ ] 无明显性能问题
- [ ] 无安全漏洞
- [ ] 无不必要的依赖

### Review 意见示例

**Good** ✅:
```
这个实现很好！建议考虑边界情况处理。
```

**Better** 💡:
```
建议使用 Promise.all() 并行处理设备控制，可以提升性能。
```

**Must Change** ⚠️:
```
这里存在 SQL 注入风险，必须使用参数化查询。
```

---

## 🌍 国际化

如果贡献涉及文本内容：

```typescript
// 使用 i18n
t('device.control.success', { deviceName: 'Light' });

// 不要硬编码
console.log('Device controlled successfully');
```

---

## 📧 联系方式

如有问题，可通过以下方式联系：

- GitHub Issues: [https://github.com/YourOrg/HomePlatform/issues](https://github.com/YourOrg/HomePlatform/issues)
- Email: [contributing@homeplatform.io](mailto:contributing@homeplatform.io)
- Discord: [https://discord.gg/homeplatform](https://discord.gg/homeplatform)

---

## 📜 行为准则

### 我们的承诺

为建设开放友好的环境，我们贡献者和维护者承诺：不论年龄、体型、残疾、族群、性别认同与表现、经验水平、国籍、外貌、种族、宗教或性取向，项目和社区的参与都不应遭受骚扰。

### 我们的准则

有助于创造积极环境的行为包括：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员友善

不可接受的行为包括：

- 使用性化的语言或图像
- 挑衅、侮辱或贬损的评论，人身及政治攻击
- 公开或私下骚扰
- 未经明确授权发布他人的资料
- 其他不道德或不专业的行为

---

## 🎉 致谢

感谢所有贡献者！

<a href="https://github.com/YourOrg/HomePlatform/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YourOrg/HomePlatform" />
</a>

---

再次感谢您的贡献！🙏
