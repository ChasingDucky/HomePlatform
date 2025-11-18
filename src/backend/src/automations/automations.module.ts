import { Module } from '@nestjs/common';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';
import { AutomationEngineService } from './automation-engine.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DevicesModule } from '../devices/devices.module';
import { ScenesModule } from '../scenes/scenes.module';

@Module({
  imports: [PrismaModule, DevicesModule, ScenesModule],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationEngineService],
  exports: [AutomationsService, AutomationEngineService],
})
export class AutomationsModule {}
