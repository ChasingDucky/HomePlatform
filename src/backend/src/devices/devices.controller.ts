import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('devices')
@Controller('devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: '获取设备列表' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiQuery({ name: 'room', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'online', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('homeId') homeId: string,
    @Query('room') room?: string,
    @Query('type') type?: string,
    @Query('online') online?: boolean
  ) {
    return this.devicesService.findAll(homeId, { room, type, online });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取设备详情' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '设备不存在' })
  async findOne(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.devicesService.findOne(id, homeId);
  }

  @Post()
  @ApiOperation({ summary: '添加设备' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 201, description: '添加成功' })
  @ApiResponse({ status: 400, description: '设备已存在' })
  async create(@Query('homeId') homeId: string, @Body() dto: CreateDeviceDto) {
    return this.devicesService.create(homeId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新设备信息' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '设备不存在' })
  async update(
    @Param('id') id: string,
    @Query('homeId') homeId: string,
    @Body() dto: UpdateDeviceDto
  ) {
    return this.devicesService.update(id, homeId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除设备' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '设备不存在' })
  async delete(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.devicesService.delete(id, homeId);
  }

  @Post(':id/control')
  @ApiOperation({ summary: '控制设备' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '控制成功' })
  @ApiResponse({ status: 400, description: '设备离线或不支持该能力' })
  @ApiResponse({ status: 404, description: '设备不存在' })
  async control(
    @Param('id') id: string,
    @Query('homeId') homeId: string,
    @Body() dto: ControlDeviceDto
  ) {
    return this.devicesService.control(id, homeId, dto);
  }

  @Get(':id/state')
  @ApiOperation({ summary: '获取设备状态' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '设备不存在' })
  async getState(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.devicesService.getState(id, homeId);
  }

  @Post('discover')
  @ApiOperation({ summary: '发现设备' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '发现成功' })
  async discover(@Query('homeId') homeId: string, @Body() body: { protocols?: string[] }) {
    return this.devicesService.discover(homeId, body.protocols);
  }
}
