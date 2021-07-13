import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Beacon, BeaconRelations} from '../models';

export class BeaconRepository extends DefaultCrudRepository<
  Beacon,
  typeof Beacon.prototype.beaconId,
  BeaconRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Beacon, dataSource);
  }
}
