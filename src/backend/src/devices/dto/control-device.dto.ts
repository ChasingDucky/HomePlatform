import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ControlDeviceDto {
  @ApiProperty({ example: 'brightness', description: '控制能力' })
  @IsString()
  @IsNotEmpty()
  capability: string;

  @ApiProperty({ example: 80, description: '控制值' })
  @IsNotEmpty()
  value: any;
}
