import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { CreateSportEventInput } from '@joj/shared';
import { SportEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class CreateSportEvent {
  constructor(private readonly sportEvents: SportEventRepository) {}

  async execute(input: CreateSportEventInput): Promise<SportEvent> {
    const sportEvent = SportEvent.create({
      id: randomUUID(),
      name: input.name,
      discipline: input.discipline,
      site: input.site,
      startsAt: new Date(input.startsAt),
      now: new Date(),
    });
    await this.sportEvents.insert(sportEvent);
    return sportEvent;
  }
}
