import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { SyncApiKeyGuard } from './sync-api-key.guard';

describe('SyncApiKeyGuard', () => {
  const originalApiKey = process.env.SYNC_API_KEY;

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.SYNC_API_KEY;
    } else {
      process.env.SYNC_API_KEY = originalApiKey;
    }
  });

  function createExecutionContext(headers: Record<string, string> = {}) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('deve permitir acesso com a chave correta', () => {
    process.env.SYNC_API_KEY = 'test-key';

    const guard = new SyncApiKeyGuard();

    expect(
      guard.canActivate(createExecutionContext({ 'x-api-key': 'test-key' })),
    ).toBe(true);
  });

  it('deve rejeitar acesso sem chave', () => {
    process.env.SYNC_API_KEY = 'test-key';

    const guard = new SyncApiKeyGuard();

    expect(() =>
      guard.canActivate(createExecutionContext()),
    ).toThrow(
      new UnauthorizedException('Chave de sincronização inválida.'),
    );
  });

  it('deve rejeitar acesso com chave incorreta', () => {
    process.env.SYNC_API_KEY = 'test-key';

    const guard = new SyncApiKeyGuard();

    expect(() =>
      guard.canActivate(
        createExecutionContext({ 'x-api-key': 'wrong-key' }),
      ),
    ).toThrow(
      new UnauthorizedException('Chave de sincronização inválida.'),
    );
  });

  it('deve rejeitar quando a chave não está configurada', () => {
    delete process.env.SYNC_API_KEY;

    const guard = new SyncApiKeyGuard();

    expect(() =>
      guard.canActivate(
        createExecutionContext({ 'x-api-key': 'test-key' }),
      ),
    ).toThrow(
      new UnauthorizedException(
        'Chave de sincronização não configurada.',
      ),
    );
  });
});