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
import {Beacon} from '../models';
import {BeaconRepository} from '../repositories';

export class BeaconController {
  constructor(
    @repository(BeaconRepository)
    public beaconRepository : BeaconRepository,
  ) {}

  @post('/beacons')
  @response(200, {
    description: 'Beacon model instance',
    content: {'application/json': {schema: getModelSchemaRef(Beacon)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Beacon, {
            title: 'NewBeacon',
            exclude: ['beaconId'],
          }),
        },
      },
    })
    beacon: Omit<Beacon, 'beaconId'>,
  ): Promise<Beacon> {
    return this.beaconRepository.create(beacon);
  }

  @get('/beacons/count')
  @response(200, {
    description: 'Beacon model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Beacon) where?: Where<Beacon>,
  ): Promise<Count> {
    return this.beaconRepository.count(where);
  }

  @get('/beacons')
  @response(200, {
    description: 'Array of Beacon model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Beacon, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Beacon) filter?: Filter<Beacon>,
  ): Promise<Beacon[]> {
    return this.beaconRepository.find(filter);
  }

  @patch('/beacons')
  @response(200, {
    description: 'Beacon PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Beacon, {partial: true}),
        },
      },
    })
    beacon: Beacon,
    @param.where(Beacon) where?: Where<Beacon>,
  ): Promise<Count> {
    return this.beaconRepository.updateAll(beacon, where);
  }

  @get('/beacons/{id}')
  @response(200, {
    description: 'Beacon model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Beacon, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Beacon, {exclude: 'where'}) filter?: FilterExcludingWhere<Beacon>
  ): Promise<Beacon> {
    return this.beaconRepository.findById(id, filter);
  }

  @patch('/beacons/{id}')
  @response(204, {
    description: 'Beacon PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Beacon, {partial: true}),
        },
      },
    })
    beacon: Beacon,
  ): Promise<void> {
    await this.beaconRepository.updateById(id, beacon);
  }

  @put('/beacons/{id}')
  @response(204, {
    description: 'Beacon PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() beacon: Beacon,
  ): Promise<void> {
    await this.beaconRepository.replaceById(id, beacon);
  }

  @del('/beacons/{id}')
  @response(204, {
    description: 'Beacon DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.beaconRepository.deleteById(id);
  }
}
