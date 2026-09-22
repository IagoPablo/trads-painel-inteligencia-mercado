import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SyncApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const configuredApiKey = process.env.SYNC_API_KEY;
    const providedApiKey = request.headers['x-api-key'];

    if (!configuredApiKey) {
      throw new UnauthorizedException(
        'Chave de sincronização não configurada.',
      );
    }

    if (
      typeof providedApiKey !== 'string' ||
      providedApiKey !== configuredApiKey
    ) {
      throw new UnauthorizedException(
        'Chave de sincronização inválida.',
      );
    }

    return true;
  }
}