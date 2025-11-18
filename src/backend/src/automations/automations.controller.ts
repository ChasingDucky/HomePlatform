import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('automations')
@Controller('automations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  @ApiOperation({ summary: '获取自动化列表' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query('homeId') homeId: string) {
    return this.automationsService.findAll(homeId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取自动化详情' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '自动化不存在' })
  async findOne(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.automationsService.findOne(id, homeId);
  }

  @Post()
  @ApiOperation({ summary: '创建自动化' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Query('homeId') homeId: string, @Req() req, @Body() dto: CreateAutomationDto) {
    return this.automationsService.create(homeId, req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新自动化' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '自动化不存在' })
  async update(
    @Param('id') id: string,
    @Query('homeId') homeId: string,
    @Body() dto: UpdateAutomationDto
  ) {
    return this.automationsService.update(id, homeId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除自动化' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '自动化不存在' })
  async delete(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.automationsService.delete(id, homeId);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: '启用/禁用自动化' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '更新成功' })
  async toggle(
    @Param('id') id: string,
    @Query('homeId') homeId: string,
    @Body() body: { enabled: boolean }
  ) {
    return this.automationsService.toggle(id, homeId, body.enabled);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: '获取自动化执行历史' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getExecutions(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.automationsService.getExecutions(id, page, limit);
  }
}
