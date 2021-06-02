import { Entity, model, property, hasMany } from '@loopback/repository';
import { Position } from '.';

@model()
export class NavDev extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  navId?: number;

  @property({
    type: 'string',
    required: true,
  })
  macAddress: string;

  @property({
    type: 'date',
    required: true,
  })
  onboardingDate: string;

  @property({
    type: 'date',
    required: true,
  })
  lastConnected: string;

  
  @hasMany(() => Position)
  position: Position[];
  
  constructor(data?: Partial<NavDev>) {
    super(data);
  }
}

export interface NavDevRelations {
  // describe navigational properties here
}

export type NavDevWithRelations = NavDev & NavDevRelations;
