import { Module } from '@nestjs/common';
import { SportEventRepository } from './application/sport-event.repository';
import { AdvanceSportEvent } from './application/use-cases/advance-sport-event';
import { CreateSportEvent } from './application/use-cases/create-sport-event';
import { GetSportEvent } from './application/use-cases/get-sport-event';
import { ListSportEvents } from './application/use-cases/list-sport-events';
import { PublishRanking } from './application/use-cases/publish-ranking';
import { SportEventsController } from './http/sport-events.controller';
import { DrizzleSportEventRepository } from './infra/drizzle-sport-event.repository';

@Module({
  controllers: [SportEventsController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: SportEventRepository, useClass: DrizzleSportEventRepository },
    CreateSportEvent,
    AdvanceSportEvent,
    PublishRanking,
    ListSportEvents,
    GetSportEvent,
  ],
})
export class SportEventsModule {}
