import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class SceneActionDto {
  @ApiProperty({ example: 'device123' })
  @IsString()
  deviceId: string;

  @ApiProperty({ example: 'power' })
  @IsString()
  capability: string;

  @ApiProperty({ example: 'on' })
  value: any;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  delay?: number;

  @ApiProperty({ example: 1 })
  order: number;
}

export class CreateSceneDto {
  @ApiProperty({ example: '回家模式' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'home', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#FF6B6B', required: false })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiProperty({ type: [SceneActionDto] })
  @IsArray()
  actions: SceneActionDto[];
}
