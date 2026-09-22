import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Status da API',
    description: 'Retorna informações básicas sobre o estado da API.',
  })
  @ApiOkResponse({
    description: 'API disponível e funcionando corretamente.',
  })
  getStatus() {
    return this.appService.getStatus();
  }
}
