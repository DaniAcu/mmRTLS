import { Entity, model, property, belongsTo } from '@loopback/repository';
import { NavDev } from '.';

@model()
export class Position extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  positionId?: number;

  @property({
    type: 'number',
    generated: false,
    required: true,
  })
  x: number;

  @property({
    type: 'number',
    generated: false,
    required: true,
  })
  y: number;

  @property({
    type: 'date',
    required: true,
  })
  time: string;

  @belongsTo(() => NavDev)
  navId: number;

  constructor(data?: Partial<Position>) {
    super(data);
  }
}

export interface PositionRelations {
  // describe navigational properties here
}

export type PositionWithRelations = Position & PositionRelations;
