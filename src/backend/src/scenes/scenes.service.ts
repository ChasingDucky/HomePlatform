import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DevicesService } from '../devices/devices.service';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';

interface SceneAction {
  deviceId: string;
  capability: string;
  value: any;
  delay?: number;
  order: number;
}

@Injectable()
export class ScenesService {
  constructor(
    private prisma: PrismaService,
    private devicesService: DevicesService
  ) {}

  async findAll(homeId: string) {
    const scenes = await this.prisma.scene.findMany({
      where: { homeId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        icon: true,
        background: true,
        actions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return scenes.map(scene => ({
      ...scene,
      actionCount: (scene.actions as any[]).length,
    }));
  }

  async findOne(id: string, homeId?: string) {
    const where: any = { id };
    if (homeId) {
      where.homeId = homeId;
    }

    const scene = await this.prisma.scene.findFirst({ where });

    if (!scene) {
      throw new NotFoundException('Scene not found');
    }

    return scene;
  }

  async create(homeId: string, userId: string, dto: CreateSceneDto) {
    const scene = await this.prisma.scene.create({
      data: {
        homeId,
        createdBy: userId,
        name: dto.name,
        icon: dto.icon,
        background: dto.background,
        actions: dto.actions || [],
      },
    });

    return scene;
  }

  async update(id: string, homeId: string, dto: UpdateSceneDto) {
    const scene = await this.findOne(id, homeId);

    const updated = await this.prisma.scene.update({
      where: { id: scene.id },
      data: {
        name: dto.name,
        icon: dto.icon,
        background: dto.background,
        actions: dto.actions,
      },
    });

    return updated;
  }

  async delete(id: string, homeId: string) {
    const scene = await this.findOne(id, homeId);

    await this.prisma.scene.delete({
      where: { id: scene.id },
    });

    return { message: 'Scene deleted successfully' };
  }

  async execute(id: string, homeId: string) {
    const startTime = Date.now();
    const scene = await this.findOne(id, homeId);
    const actions = scene.actions as SceneAction[];

    // 按 order 排序
    const sortedActions = actions.sort((a, b) => a.order - b.order);

    const results: any[] = [];
    let success = true;
    let error: string | null = null;

    try {
      for (const action of sortedActions) {
        // 延迟执行
        if (action.delay) {
          await this.sleep(action.delay * 1000);
        }

        // 执行设备控制
        try {
          const result = await this.devicesService.control(action.deviceId, homeId, {
            capability: action.capability,
            value: action.value,
          });

          results.push({
            deviceId: action.deviceId,
            success: true,
            result,
          });
        } catch (err) {
          results.push({
            deviceId: action.deviceId,
            success: false,
            error: err.message,
          });
          success = false;
        }
      }
    } catch (err) {
      success = false;
      error = err.message;
    }

    const duration = Date.now() - startTime;

    // 记录执行日志
    await this.prisma.sceneExecution.create({
      data: {
        sceneId: scene.id,
        success,
        duration,
        error,
      },
    });

    return {
      sceneId: scene.id,
      executionId: null, // TODO: Generate execution ID
      success,
      results,
      totalDuration: duration,
    };
  }

  async getExecutions(sceneId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      this.prisma.sceneExecution.findMany({
        where: { sceneId },
        orderBy: { executedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sceneExecution.count({
        where: { sceneId },
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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
