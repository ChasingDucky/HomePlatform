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
import { ScenesService } from './scenes.service';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('scenes')
@Controller('scenes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get()
  @ApiOperation({ summary: '获取场景列表' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query('homeId') homeId: string) {
    return this.scenesService.findAll(homeId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取场景详情' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '场景不存在' })
  async findOne(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.scenesService.findOne(id, homeId);
  }

  @Post()
  @ApiOperation({ summary: '创建场景' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Query('homeId') homeId: string, @Req() req, @Body() dto: CreateSceneDto) {
    return this.scenesService.create(homeId, req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新场景' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '场景不存在' })
  async update(
    @Param('id') id: string,
    @Query('homeId') homeId: string,
    @Body() dto: UpdateSceneDto
  ) {
    return this.scenesService.update(id, homeId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除场景' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '场景不存在' })
  async delete(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.scenesService.delete(id, homeId);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: '执行场景' })
  @ApiQuery({ name: 'homeId', required: true })
  @ApiResponse({ status: 200, description: '执行成功' })
  @ApiResponse({ status: 404, description: '场景不存在' })
  async execute(@Param('id') id: string, @Query('homeId') homeId: string) {
    return this.scenesService.execute(id, homeId);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: '获取场景执行历史' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getExecutions(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.scenesService.getExecutions(id, page, limit);
  }
}
