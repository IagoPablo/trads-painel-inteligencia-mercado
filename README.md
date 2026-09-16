# Painel de Inteligência de Mercado

Aplicação fullstack sendo desenvolvida para o desafio técnico da Trads Corretora.

## Objetivo

Construir um painel de inteligência de mercado utilizando dados públicos do IBGE para auxiliar na análise de regiões e perfis demográficos e econômicos relevantes para a atuação da Trads Corretora.

## Stack

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL

### Frontend

- React
- TypeScript

### Infraestrutura

- Docker
- Docker Compose

## Arquitetura

```text
IBGE → Ingestão → PostgreSQL → Backend → Frontend