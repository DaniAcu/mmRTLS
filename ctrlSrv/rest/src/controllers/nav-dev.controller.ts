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
import {NavDev} from '../models';
import {NavDevRepository} from '../repositories';

export class NavDevController {
  constructor(
    @repository(NavDevRepository)
    public navDevRepository: NavDevRepository,
  ) {}

  @post('/nav-devs')
  @response(200, {
    description: 'NavDev model instance',
    content: {'application/json': {schema: getModelSchemaRef(NavDev)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NavDev, {
            title: 'NewNavDev',
            exclude: ['navId'],
          }),
        },
      },
    })
    navDev: Omit<NavDev, 'navId'>,
  ): Promise<NavDev> {
    return this.navDevRepository.create(navDev);
  }

  @get('/nav-devs/count')
  @response(200, {
    description: 'NavDev model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(NavDev) where?: Where<NavDev>): Promise<Count> {
    return this.navDevRepository.count(where);
  }

  @get('/nav-devs')
  @response(200, {
    description: 'Array of NavDev model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NavDev, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(NavDev) filter?: Filter<NavDev>): Promise<NavDev[]> {
    return this.navDevRepository.find(filter);
  }

  @patch('/nav-devs')
  @response(200, {
    description: 'NavDev PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NavDev, {partial: true}),
        },
      },
    })
    navDev: NavDev,
    @param.where(NavDev) where?: Where<NavDev>,
  ): Promise<Count> {
    return this.navDevRepository.updateAll(navDev, where);
  }

  @get('/nav-devs/{navId}')
  @response(200, {
    description: 'NavDev model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(NavDev, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('navId') navId: number,
    @param.filter(NavDev, {exclude: 'where'})
    filter?: FilterExcludingWhere<NavDev>,
  ): Promise<NavDev> {
    return this.navDevRepository.findById(navId, filter);
  }

  @patch('/nav-devs/{navId}')
  @response(204, {
    description: 'NavDev PATCH success',
  })
  async updateById(
    @param.path.number('navId') navId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NavDev, {partial: true}),
        },
      },
    })
    navDev: NavDev,
  ): Promise<void> {
    await this.navDevRepository.updateById(navId, navDev);
  }

  @put('/nav-devs/{navId}')
  @response(204, {
    description: 'NavDev PUT success',
  })
  async replaceById(
    @param.path.number('navId') navId: number,
    @requestBody() navDev: NavDev,
  ): Promise<void> {
    await this.navDevRepository.replaceById(navId, navDev);
  }

  @del('/nav-devs/{navId}')
  @response(204, {
    description: 'NavDev DELETE success',
  })
  async deleteById(@param.path.number('navId') navId: number): Promise<void> {
    await this.navDevRepository.deleteById(navId);
  }
}
