import { Injectable } from '@nestjs/common';
import type { SportEvent } from '../../domain/sport-event';
import { sportEventNotFound } from '../../domain/sport-events.errors';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class GetSportEvent {
  constructor(private readonly sportEvents: SportEventRepository) {}

  async execute(id: string): Promise<SportEvent> {
    const sportEvent = await this.sportEvents.findById(id);
    if (!sportEvent) throw sportEventNotFound(id);
    return sportEvent;
  }
}
