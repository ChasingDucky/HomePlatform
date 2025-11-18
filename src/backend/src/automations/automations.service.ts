import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Injectable()
export class AutomationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(homeId: string) {
    const automations = await this.prisma.automation.findMany({
      where: { homeId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        enabled: true,
        trigger: true,
        conditions: true,
        actions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return automations.map(automation => ({
      ...automation,
      conditionCount: (automation.conditions as any[])?.length || 0,
      actionCount: (automation.actions as any[]).length,
    }));
  }

  async findOne(id: string, homeId?: string) {
    const where: any = { id };
    if (homeId) {
      where.homeId = homeId;
    }

    const automation = await this.prisma.automation.findFirst({ where });

    if (!automation) {
      throw new NotFoundException('Automation not found');
    }

    return automation;
  }

  async create(homeId: string, userId: string, dto: CreateAutomationDto) {
    const automation = await this.prisma.automation.create({
      data: {
        homeId,
        createdBy: userId,
        name: dto.name,
        enabled: dto.enabled ?? true,
        trigger: dto.trigger,
        conditions: dto.conditions || [],
        actions: dto.actions,
      },
    });

    return automation;
  }

  async update(id: string, homeId: string, dto: UpdateAutomationDto) {
    const automation = await this.findOne(id, homeId);

    const updated = await this.prisma.automation.update({
      where: { id: automation.id },
      data: {
        name: dto.name,
        enabled: dto.enabled,
        trigger: dto.trigger,
        conditions: dto.conditions,
        actions: dto.actions,
      },
    });

    return updated;
  }

  async delete(id: string, homeId: string) {
    const automation = await this.findOne(id, homeId);

    await this.prisma.automation.delete({
      where: { id: automation.id },
    });

    return { message: 'Automation deleted successfully' };
  }

  async toggle(id: string, homeId: string, enabled: boolean) {
    const automation = await this.findOne(id, homeId);

    const updated = await this.prisma.automation.update({
      where: { id: automation.id },
      data: { enabled },
    });

    return updated;
  }

  async getExecutions(automationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      this.prisma.automationExecution.findMany({
        where: { automationId },
        orderBy: { executedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.automationExecution.count({
        where: { automationId },
      }),
    ]);

    return {
      items: executions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByTriggerType(homeId: string, triggerType: string) {
    const automations = await this.prisma.automation.findMany({
      where: {
        homeId,
        enabled: true,
      },
    });

    return automations.filter(automation => {
      const trigger = automation.trigger as any;
      return trigger.type === triggerType;
    });
  }
}
