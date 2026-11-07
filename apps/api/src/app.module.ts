import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { SportEventsModule } from './modules/sport-events/sport-events.module';

@Module({
  imports: [CoreModule, SportEventsModule],
})
export class AppModule {}
