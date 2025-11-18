import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DevicesService } from '../devices/devices.service';
import { ScenesService } from '../scenes/scenes.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface TriggerEvent {
  type: string;
  deviceId?: string;
  value?: any;
  timestamp: Date;
  metadata?: any;
}

interface Condition {
  type: string;
  operator: 'AND' | 'OR';
  config: any;
}

interface Action {
  type: string;
  config: any;
}

@Injectable()
export class AutomationEngineService implements OnModuleInit {
  private readonly logger = new Logger(AutomationEngineService.name);
  private readonly eventQueue: TriggerEvent[] = [];

  constructor(
    private prisma: PrismaService,
    private devicesService: DevicesService,
    private scenesService: ScenesService
  ) {}

  onModuleInit() {
    this.logger.log('Automation Engine initialized');
    // 启动时间触发器检查
    this.checkTimeBasedAutomations();
  }

  /**
   * 触发事件到自动化引擎
   */
  async triggerEvent(event: TriggerEvent) {
    this.logger.debug(`Event triggered: ${event.type}`, event);

    try {
      // 查找匹配的自动化规则
      const matchedAutomations = await this.findMatchingAutomations(event);

      for (const automation of matchedAutomations) {
        await this.evaluateAndExecute(automation, event);
      }
    } catch (error) {
      this.logger.error(`Error processing event: ${error.message}`, error.stack);
    }
  }

  /**
   * 查找匹配的自动化规则
   */
  private async findMatchingAutomations(event: TriggerEvent) {
    const allAutomations = await this.prisma.automation.findMany({
      where: { enabled: true },
    });

    return allAutomations.filter(automation => {
      const trigger = automation.trigger as any;
      return this.isTriggerMatched(trigger, event);
    });
  }

  /**
   * 检查触发器是否匹配
   */
  private isTriggerMatched(trigger: any, event: TriggerEvent): boolean {
    if (trigger.type !== event.type) {
      return false;
    }

    switch (trigger.type) {
      case 'device':
        return (
          trigger.config.deviceId === event.deviceId &&
          (!trigger.config.capability || trigger.config.capability === event.metadata?.capability)
        );

      case 'time':
        return true; // 时间触发器由 cron 处理

      case 'location':
        // TODO: 实现地理围栏逻辑
        return false;

      default:
        return false;
    }
  }

  /**
   * 评估条件并执行动作
   */
  private async evaluateAndExecute(automation: any, event: TriggerEvent) {
    const startTime = Date.now();
    let conditionsMet = true;
    let success = true;
    let error: string | null = null;

    try {
      // 评估条件
      if (automation.conditions && automation.conditions.length > 0) {
        conditionsMet = await this.evaluateConditions(
          automation.conditions as Condition[],
          event
        );
      }

      if (!conditionsMet) {
        this.logger.debug(`Automation ${automation.id} conditions not met`);
        await this.logExecution(automation.id, event, false, false, 0, null);
        return;
      }

      // 执行动作
      await this.executeActions(automation.actions as Action[], automation.homeId);
    } catch (err) {
      success = false;
      error = err.message;
      this.logger.error(`Automation ${automation.id} execution failed: ${error}`);
    } finally {
      const duration = Date.now() - startTime;
      await this.logExecution(automation.id, event, conditionsMet, success, duration, error);
    }
  }

  /**
   * 评估条件
   */
  private async evaluateConditions(conditions: Condition[], event: TriggerEvent): Promise<boolean> {
    const results: boolean[] = [];

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, event);
      results.push(result);
    }

    // 简单实现：所有条件都是 AND
    return results.every(r => r === true);
  }

  /**
   * 评估单个条件
   */
  private async evaluateCondition(condition: Condition, event: TriggerEvent): Promise<boolean> {
    switch (condition.type) {
      case 'time_range': {
        const now = new Date();
        const currentHour = now.getHours();
        const { startHour, endHour } = condition.config;
        return currentHour >= startHour && currentHour < endHour;
      }

      case 'device_state': {
        const device = await this.devicesService.findOne(condition.config.deviceId);
        const state = device.state as any;
        const value = state[condition.config.capability];

        return this.compareValues(value, condition.config.operator, condition.config.value);
      }

      case 'weather': {
        // TODO: 实现天气条件
        return true;
      }

      default:
        this.logger.warn(`Unknown condition type: ${condition.type}`);
        return true;
    }
  }

  /**
   * 比较值
   */
  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case '==':
        return actual == expected;
      case '!=':
        return actual != expected;
      case '>':
        return actual > expected;
      case '>=':
        return actual >= expected;
      case '<':
        return actual < expected;
      case '<=':
        return actual <= expected;
      default:
        return false;
    }
  }

  /**
   * 执行动作
   */
  private async executeActions(actions: Action[], homeId: string) {
    for (const action of actions) {
      await this.executeAction(action, homeId);
    }
  }

  /**
   * 执行单个动作
   */
  private async executeAction(action: Action, homeId: string) {
    this.logger.debug(`Executing action: ${action.type}`, action.config);

    switch (action.type) {
      case 'device_control':
        await this.devicesService.control(action.config.deviceId, homeId, {
          capability: action.config.capability,
          value: action.config.value,
        });
        break;

      case 'scene_execute':
        await this.scenesService.execute(action.config.sceneId, homeId);
        break;

      case 'notification':
        // TODO: 实现通知功能
        this.logger.log(`Sending notification: ${action.config.message}`);
        break;

      case 'webhook':
        // TODO: 实现 Webhook
        this.logger.log(`Calling webhook: ${action.config.url}`);
        break;

      case 'delay':
        await this.sleep(action.config.duration * 1000);
        break;

      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * 记录执行日志
   */
  private async logExecution(
    automationId: string,
    event: TriggerEvent,
    conditionsMet: boolean,
    success: boolean,
    duration: number,
    error: string | null
  ) {
    await this.prisma.automationExecution.create({
      data: {
        automationId,
        triggerEvent: event as any,
        conditionsMet,
        success,
        duration,
        error,
      },
    });
  }

  /**
   * 定时检查时间触发器
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkTimeBasedAutomations() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    this.logger.debug(`Checking time-based automations at ${currentHour}:${currentMinute}`);

    const automations = await this.prisma.automation.findMany({
      where: { enabled: true },
    });

    for (const automation of automations) {
      const trigger = automation.trigger as any;

      if (trigger.type === 'time') {
        const { time, days } = trigger.config;
        const [hour, minute] = time.split(':').map(Number);

        // 检查时间和星期几是否匹配
        if (hour === currentHour && minute === currentMinute) {
          if (!days || days.includes(currentDay)) {
            this.logger.log(`Triggering time-based automation: ${automation.name}`);

            await this.evaluateAndExecute(automation, {
              type: 'time',
              timestamp: now,
              metadata: { trigger },
            });
          }
        }
      }
    }
  }

  /**
   * 辅助方法：延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 手动触发设备状态变化事件
   */
  async onDeviceStateChanged(deviceId: string, capability: string, value: any, homeId: string) {
    await this.triggerEvent({
      type: 'device',
      deviceId,
      value,
      timestamp: new Date(),
      metadata: { capability, homeId },
    });
  }
}
