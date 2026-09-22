import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'TRADS Market Intelligence API',
      status: 'ok',
    };
  }
}