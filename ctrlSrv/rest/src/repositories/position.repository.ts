import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Position, PositionRelations} from '../models';

export class PositionRepository extends DefaultCrudRepository<
  Position,
  typeof Position.prototype.positionId,
  PositionRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Position, dataSource);
  }
}
