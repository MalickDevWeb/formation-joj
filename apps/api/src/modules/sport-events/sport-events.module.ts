import { Module } from '@nestjs/common';
import { SportEventRepository } from './application/sport-event.repository';
import { AdvanceSportEvent } from './application/use-cases/advance-sport-event';
import { CreateSportEvent } from './application/use-cases/create-sport-event';
import { SportEventsController } from './http/sport-events.controller';
import { DrizzleSportEventRepository } from './infra/drizzle-sport-event.repository';

@Module({
  controllers: [SportEventsController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: SportEventRepository, useClass: DrizzleSportEventRepository },
    CreateSportEvent,
    AdvanceSportEvent,
  ],
})
export class SportEventsModule {}
