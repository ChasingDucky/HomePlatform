import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, IsArray } from 'class-validator';

export class TriggerDto {
  @ApiProperty({ example: 'time', enum: ['time', 'device', 'location', 'scene'] })
  @IsString()
  type: string;

  @ApiProperty({
    example: { time: '07:00', days: [1, 2, 3, 4, 5] },
    description: 'Trigger configuration',
  })
  @IsObject()
  config: any;
}

export class ConditionDto {
  @ApiProperty({ example: 'time_range' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'AND', enum: ['AND', 'OR'] })
  @IsString()
  operator: 'AND' | 'OR';

  @ApiProperty({ example: { startHour: 7, endHour: 22 } })
  @IsObject()
  config: any;
}

export class ActionDto {
  @ApiProperty({
    example: 'device_control',
    enum: ['device_control', 'scene_execute', 'notification', 'webhook', 'delay'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: { deviceId: 'device123', capability: 'power', value: 'on' },
  })
  @IsObject()
  config: any;
}

export class CreateAutomationDto {
  @ApiProperty({ example: '晨起自动化' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ type: TriggerDto })
  @IsObject()
  trigger: TriggerDto;

  @ApiProperty({ type: [ConditionDto], required: false })
  @IsOptional()
  @IsArray()
  conditions?: ConditionDto[];

  @ApiProperty({ type: [ActionDto] })
  @IsArray()
  actions: ActionDto[];
}
