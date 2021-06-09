import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  NavDev,
  Position,
} from '../models';
import {NavDevRepository} from '../repositories';

export class NavDevPositionController {
  constructor(
    @repository(NavDevRepository) protected navDevRepository: NavDevRepository,
  ) { }

  @get('/nav-devs/{navId}/positions', {
    responses: {
      '200': {
        description: 'Array of NavDev has many Position',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Position)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('navId') navId: number,
    @param.query.object('filter') filter?: Filter<Position>,
  ): Promise<Position[]> {
    return this.navDevRepository.positions(navId).find(filter);
  }

  @post('/nav-devs/{navId}/positions', {
    responses: {
      '200': {
        description: 'NavDev model instance',
        content: {'application/json': {schema: getModelSchemaRef(Position)}},
      },
    },
  })
  async create(
    @param.path.number('navId') navId: typeof NavDev.prototype.navId,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Position, {
            title: 'NewPositionInNavDev',
            exclude: ['positionId'],
            optional: ['navId']
          }),
        },
      },
    }) position: Omit<Position, 'positionId'>,
  ): Promise<Position> {
    return this.navDevRepository.positions(navId).create(position);
  }

  @patch('/nav-devs/{navId}/positions', {
    responses: {
      '200': {
        description: 'NavDev.Position PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('navId') navId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Position, {partial: true}),
        },
      },
    })
    position: Partial<Position>,
    @param.query.object('where', getWhereSchemaFor(Position)) where?: Where<Position>,
  ): Promise<Count> {
    return this.navDevRepository.positions(navId).patch(position, where);
  }

  @del('/nav-devs/{navId}/positions', {
    responses: {
      '200': {
        description: 'NavDev.Position DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('navId') navId: number,
    @param.query.object('where', getWhereSchemaFor(Position)) where?: Where<Position>,
  ): Promise<Count> {
    return this.navDevRepository.positions(navId).delete(where);
  }
}
