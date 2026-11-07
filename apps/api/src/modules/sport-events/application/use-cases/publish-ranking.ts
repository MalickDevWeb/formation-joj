import { Injectable } from '@nestjs/common';
import type { PublishRankingInput } from '@joj/shared';
import type { SportEvent } from '../../domain/sport-event';
import { sportEventNotFound } from '../../domain/sport-events.errors';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class PublishRanking {
  constructor(private readonly sportEvents: SportEventRepository) {}

  async execute(id: string, input: PublishRankingInput): Promise<SportEvent> {
    const sportEvent = await this.sportEvents.findById(id);
    if (!sportEvent) throw sportEventNotFound(id);
    sportEvent.publishRanking(input.lines);
    // Le dépôt revérifie l'unicité : deux publications simultanées ne passent pas toutes les deux.
    await this.sportEvents.saveRanking(sportEvent);
    return sportEvent;
  }
}
