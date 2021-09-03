import {Entity, model, property} from '@loopback/repository';

@model()
export class Beacon extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  beaconId?: number;

  @property({
    type: 'string',
    required: true,
  })
  mac: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'number',
    dataType: 'float',
    precision: 20,
    scale: 5,
    generated: false,
    required: true,
  })
  x: number;

  @property({
    type: 'number',
    dataType: 'float',
    precision: 20,
    scale: 5,
    generated: false,
    required: true,
  })
  y: number;

  @property({
    type: 'number',
    dataType: 'float',
    precision: 20,
    scale: 5,
    generated: false,
    required: true,
  })
  tssi: number;

  @property({
    type: 'number',
    generated: false,
    required: false,
  })
  channel: number;

  constructor(data?: Partial<Beacon>) {
    super(data);
  }
}

export interface BeaconRelations {
  // describe navigational properties here
}

export type BeaconWithRelations = Beacon & BeaconRelations;
