import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NavDev, NavDevRelations} from '../models';

export class NavDevRepository extends DefaultCrudRepository<
  NavDev,
  typeof NavDev.prototype.navId,
  NavDevRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(NavDev, dataSource);
  }
}
