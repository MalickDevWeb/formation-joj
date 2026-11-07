import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createSportEventSchema,
  publishRankingSchema,
  sportEventIdParamsSchema,
  type SportEventResponse,
  sportEventSchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { AdvanceSportEvent } from '../application/use-cases/advance-sport-event';
import { CreateSportEvent } from '../application/use-cases/create-sport-event';
import { PublishRanking } from '../application/use-cases/publish-ranking';
import type { SportEvent } from '../domain/sport-event';

class CreateSportEventDto extends createZodDto(createSportEventSchema) {}
class PublishRankingDto extends createZodDto(publishRankingSchema) {}
class SportEventIdParamsDto extends createZodDto(sportEventIdParamsSchema) {}
class SportEventDto extends createZodDto(sportEventSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('sport-events')
@Controller('sport-events')
export class SportEventsController {
  constructor(
    private readonly createSportEvent: CreateSportEvent,
    private readonly advanceSportEvent: AdvanceSportEvent,
    private readonly publishRanking: PublishRanking,
  ) {}

  @Post()
  @ZodSerializerDto(SportEventDto)
  async create(@Body() body: CreateSportEventDto): Promise<SportEventResponse> {
    return toResponse(await this.createSportEvent.execute(body));
  }

  // POST et non PATCH : on demande « l'étape suivante », jamais un statut choisi par le client.
  @Post(':id/advance')
  @HttpCode(200)
  @ZodSerializerDto(SportEventDto)
  async advance(@Param() { id }: SportEventIdParamsDto): Promise<SportEventResponse> {
    return toResponse(await this.advanceSportEvent.execute(id));
  }

  @Post(':id/ranking')
  @ZodSerializerDto(SportEventDto)
  async ranking(
    @Param() { id }: SportEventIdParamsDto,
    @Body() body: PublishRankingDto,
  ): Promise<SportEventResponse> {
    return toResponse(await this.publishRanking.execute(id, body));
  }
}

function toResponse(sportEvent: SportEvent): SportEventResponse {
  return {
    id: sportEvent.id,
    name: sportEvent.name,
    discipline: sportEvent.discipline,
    site: sportEvent.site,
    startsAt: sportEvent.startsAt.toISOString(),
    status: sportEvent.status,
    ranking: sportEvent.ranking,
    createdAt: sportEvent.createdAt.toISOString(),
  };
}
