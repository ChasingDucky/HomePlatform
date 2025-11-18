import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(homeId: string, filters?: { room?: string; type?: string; online?: boolean }) {
    const where: any = { homeId };

    if (filters?.room) {
      where.room = filters.room;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.online !== undefined) {
      where.online = filters.online;
    }

    const devices = await this.prisma.device.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return devices;
  }

  async findOne(id: string, homeId?: string) {
    const where: any = { id };
    if (homeId) {
      where.homeId = homeId;
    }

    const device = await this.prisma.device.findFirst({ where });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async create(homeId: string, dto: CreateDeviceDto) {
    // 检查设备是否已存在
    const existingDevice = await this.prisma.device.findUnique({
      where: { deviceId: dto.deviceId },
    });

    if (existingDevice) {
      throw new BadRequestException('Device already exists');
    }

    const device = await this.prisma.device.create({
      data: {
        homeId,
        deviceId: dto.deviceId,
        name: dto.name,
        type: dto.type,
        protocol: dto.protocol,
        manufacturer: dto.manufacturer,
        model: dto.model,
        room: dto.room,
        capabilities: dto.capabilities || [],
        state: dto.state || {},
        metadata: dto.metadata || {},
        online: true,
        lastSeen: new Date(),
      },
    });

    return device;
  }

  async update(id: string, homeId: string, dto: UpdateDeviceDto) {
    const device = await this.findOne(id, homeId);

    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        name: dto.name,
        room: dto.room,
        metadata: dto.metadata,
      },
    });

    return updated;
  }

  async delete(id: string, homeId: string) {
    const device = await this.findOne(id, homeId);

    await this.prisma.device.delete({
      where: { id: device.id },
    });

    return { message: 'Device deleted successfully' };
  }

  async control(id: string, homeId: string, dto: ControlDeviceDto) {
    const device = await this.findOne(id, homeId);

    if (!device.online) {
      throw new BadRequestException('Device is offline');
    }

    // 检查设备是否支持该能力
    const capabilities = device.capabilities as string[];
    if (!capabilities.includes(dto.capability)) {
      throw new BadRequestException(`Device does not support capability: ${dto.capability}`);
    }

    // TODO: 实际控制设备的逻辑
    // 这里应该调用设备协议层进行实际控制
    console.log(`Controlling device ${device.id}: ${dto.capability} = ${dto.value}`);

    // 更新设备状态
    const currentState = (device.state as Record<string, any>) || {};
    const newState = {
      ...currentState,
      [dto.capability]: dto.value,
    };

    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        state: newState,
        lastSeen: new Date(),
      },
    });

    return {
      deviceId: updated.id,
      state: updated.state,
      timestamp: updated.lastSeen,
    };
  }

  async getState(id: string, homeId: string) {
    const device = await this.findOne(id, homeId);

    return {
      deviceId: device.id,
      state: device.state,
      online: device.online,
      lastSeen: device.lastSeen,
    };
  }

  async updateDeviceState(deviceId: string, state: Record<string, any>) {
    const device = await this.prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        state,
        online: true,
        lastSeen: new Date(),
      },
    });

    return updated;
  }

  async discover(homeId: string, protocols?: string[]) {
    // TODO: 实现设备发现逻辑
    // 这里应该扫描局域网中的设备
    console.log(`Discovering devices for home ${homeId} with protocols:`, protocols);

    // 模拟发现的设备
    const discoveredDevices = [
      {
        deviceId: 'temp-' + Date.now(),
        name: 'Smart Light',
        type: 'light',
        protocol: 'matter',
        manufacturer: 'Example',
        model: 'Light-001',
        capabilities: ['power', 'brightness', 'color'],
      },
    ];

    return { devices: discoveredDevices };
  }
}
