import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateDeviceDto {
  @ApiProperty({ example: '卧室主灯', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'bedroom', required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
