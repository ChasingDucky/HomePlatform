import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: 'device123' })
  @IsString()
  deviceId: string;

  @ApiProperty({ example: '卧室灯' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'light' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'matter' })
  @IsString()
  protocol: string;

  @ApiProperty({ example: 'Philips', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ example: 'Hue White', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'bedroom', required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ example: ['power', 'brightness', 'color'], required: false })
  @IsOptional()
  @IsArray()
  capabilities?: string[];

  @ApiProperty({ example: { power: 'on', brightness: 100 }, required: false })
  @IsOptional()
  @IsObject()
  state?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;
}
