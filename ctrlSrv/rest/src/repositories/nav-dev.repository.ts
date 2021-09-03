import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NavDev, NavDevRelations, Position} from '../models';
import {PositionRepository} from './position.repository';

export class NavDevRepository extends DefaultCrudRepository<
  NavDev,
  typeof NavDev.prototype.navId,
  NavDevRelations
> {
  public readonly positions: HasManyRepositoryFactory<
    Position,
    typeof NavDev.prototype.navId
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('PositionRepository')
    protected positionRepositoryGetter: Getter<PositionRepository>,
  ) {
    super(NavDev, dataSource);
    this.positions = this.createHasManyRepositoryFactoryFor(
      'positions',
      positionRepositoryGetter,
    );
    this.registerInclusionResolver(
      'positions',
      this.positions.inclusionResolver,
    );
  }
}
