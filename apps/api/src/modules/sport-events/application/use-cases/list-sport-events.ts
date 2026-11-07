import { Injectable } from '@nestjs/common';
import type { ListSportEventsQuery } from '@joj/shared';
import type { SportEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class ListSportEvents {
  constructor(private readonly sportEvents: SportEventRepository) {}

  async execute(filter: ListSportEventsQuery): Promise<SportEvent[]> {
    return this.sportEvents.list(filter);
  }
}
