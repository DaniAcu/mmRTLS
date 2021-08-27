import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Position} from '../models';
import {PositionRepository} from '../repositories';

export class PositionController {
  constructor(
    @repository(PositionRepository)
    public positionRepository: PositionRepository,
  ) {}

  @post('/positions')
  @response(200, {
    description: 'Position model instance',
    content: {'application/json': {schema: getModelSchemaRef(Position)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Position, {
            title: 'NewPosition',
            exclude: ['positionId'],
          }),
        },
      },
    })
    position: Omit<Position, 'positionId'>,
  ): Promise<Position> {
    return this.positionRepository.create(position);
  }

  @get('/positions/count')
  @response(200, {
    description: 'Position model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Position) where?: Where<Position>): Promise<Count> {
    return this.positionRepository.count(where);
  }

  @get('/positions')
  @response(200, {
    description: 'Array of Position model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Position, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Position) filter?: Filter<Position>,
  ): Promise<Position[]> {
    return this.positionRepository.find(filter);
  }

  @patch('/positions')
  @response(200, {
    description: 'Position PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Position, {partial: true}),
        },
      },
    })
    position: Position,
    @param.where(Position) where?: Where<Position>,
  ): Promise<Count> {
    return this.positionRepository.updateAll(position, where);
  }

  @get('/positions/{positionId}')
  @response(200, {
    description: 'Position model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Position, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('positionId') id: number,
    @param.filter(Position, {exclude: 'where'})
    filter?: FilterExcludingWhere<Position>,
  ): Promise<Position> {
    return this.positionRepository.findById(id, filter);
  }

  @patch('/positions/{positionId}')
  @response(204, {
    description: 'Position PATCH success',
  })
  async updateById(
    @param.path.number('positionId') positionId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Position, {partial: true}),
        },
      },
    })
    position: Position,
  ): Promise<void> {
    await this.positionRepository.updateById(positionId, position);
  }

  @put('/positions/{positionId}')
  @response(204, {
    description: 'Position PUT success',
  })
  async replaceById(
    @param.path.number('positionId') positionId: number,
    @requestBody() position: Position,
  ): Promise<void> {
    await this.positionRepository.replaceById(positionId, position);
  }

  @del('/positions/{positionId}')
  @response(204, {
    description: 'Position DELETE success',
  })
  async deleteById(
    @param.path.number('positionId') positionId: number,
  ): Promise<void> {
    await this.positionRepository.deleteById(positionId);
  }
}
