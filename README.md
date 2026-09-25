# Painel de Inteligência de Mercado
[![CI](https://github.com/IagoPablo/trads-painel-inteligencia-mercado/actions/workflows/ci.yml/badge.svg)](https://github.com/IagoPablo/trads-painel-inteligencia-mercado/actions/workflows/ci.yml)

Painel de Inteligência de Mercado fullstack para análise de dados demográficos do IBGE e cobertura de planos da ANS, desenvolvido com NestJS, React, PostgreSQL e Docker.

**Demonstração:** [trads-market.up.railway.app](https://trads-market.up.railway.app/)

**API:** [trads-market-api.up.railway.app](https://trads-market-api.up.railway.app/)

**Swagger:** [trads-market-api.up.railway.app/api](https://trads-market-api.up.railway.app/api)

---

## 1. Visão geral

O projeto foi desenvolvido como solução para o desafio técnico de **Programador Júnior I da Trads Corretora**, com o objetivo de apoiar a análise de mercados e públicos para comercialização de planos de saúde e odonto.

A aplicação integra dados públicos do **IBGE** e da **Agência Nacional de Saúde Suplementar (ANS)**, persiste as informações em banco próprio e disponibiliza uma API REST consumida por um dashboard web.

---

## 2. Como executar

### Docker Compose

O projeto pode ser executado sem instalar Node.js, PostgreSQL ou as demais dependências da aplicação na máquina.

```bash
git clone https://github.com/IagoPablo/trads-painel-inteligencia-mercado.git

cd trads-painel-inteligencia-mercado

docker compose up --build
```

Após a inicialização:

* Dashboard: `localhost:5173`
* API: `localhost:3000`
* Swagger: `localhost:3000/api`

Na primeira execução, o sistema realiza a ingestão dos dados públicos do IBGE e da ANS e pode levar alguns minutos para concluir.

Nas execuções seguintes, a sincronização inicial é ignorada quando os dados já estão disponíveis.

---

## 3. Núcleo e extras da entrega

### Núcleo — requisitos da entrega

* Análise documentada do legado.
* Integração real com a API pública do IBGE.
* Persistência dos dados consumidos em PostgreSQL.
* Consultas, filtros e ordenação por estado, município, faixa etária, população e renda.
* Dashboard com visualizações e filtros.
* Aplicação e banco executáveis via Docker Compose.
* README com instruções de execução e decisões técnicas.
* Repositório público com histórico de commits.

### Extras implementados

* **Integração com dados da ANS**, cruzando cobertura de planos com dados demográficos.
* **Testes automatizados** — 33 testes.
* **CI com GitHub Actions**.
* **Atualização agendada** dos dados do IBGE.
* **Tratamento de erros** em fluxos de sincronização.
* **Paginação** nas consultas de dados de mercado.
* **Proteção por API Key** nos endpoints responsáveis pela sincronização de dados.
* **Swagger** para documentação da API.
* **Uso de IA documentado** no desenvolvimento.

---

## 4. Análise do legado

A solução anterior era composta por um backend em PHP, um frontend em HTML/jQuery, um arquivo CSV com dados exportados e uma documentação informal.

Ao analisar o material, encontrei inconsistências entre o código, os dados fornecidos e a documentação.

### Integração com o IBGE

O código utilizava URLs com `/api/v9/` e os comentários afirmavam que essa seria a versão mais atual da API.

Essa informação estava errada, na minha consulta à documentação da API do IBGE constatei que a API de localidades atualmente utiliza `/api/v1/`, enquanto a API de agregados utiliza `/api/v3/`. Portanto, as versões utilizadas pelo código legado não correspondiam às versões atualmente documentadas pelo IBGE.

Também havia uma inconsistência entre o indicador consultado e o nome utilizado no código. A função `pega_pib()` consultava o PIB por meio do agregado 5938, variável 37, mas o resultado era armazenado em uma variável chamada `renda_per_capita`.

### Credenciais e configuração

O arquivo `config.php` mantinha as credenciais do banco diretamente no código, incluindo usuário e senha. O próprio arquivo continha um comentário indicando a intenção de remover a senha antes de publicar o projeto.

### Persistência

Apesar de a documentação afirmar que os dados eram salvos no banco, a função `salvar_no_banco()` presente em `coleta_ibge.php` apenas escrevia os resultados no arquivo `coleta_debug.txt`. A função não realizava uma operação de inserção no banco de dados.

### Qualidade dos dados

O CSV fornecido apresentava diferentes inconsistências, como registros duplicados, código de município fictício, população negativa, quantidade inconsistente de campos e valores de população em formatos diferentes.

Além disso, a documentação apresentava uma ordem de colunas diferente daquela existente no próprio arquivo.

### Codificação

O frontend declarava ISO-8859-1 por meio de `<meta charset="ISO-8859-1">`. Por isso, o material também apresentava problemas de interpretação de caracteres, como JoÃ£o Pessoa em vez de João Pessoa, indicando uma inconsistência de codificação dos dados.

### Arquitetura

O frontend realizava chamadas diretamente à API do IBGE. Dessa forma, a interface mantinha uma dependência direta do serviço externo.

O código também continha regras de negócio e suposições misturadas aos comentários e à implementação, dificultando a separação entre comportamento esperado e detalhes técnicos.

### Manutenção

Encontrei problemas simples de consistência, como a chamada `montatabela()` enquanto a função definida era `montaTabela()`. Também havia comentários informais e orientações como “não mexer”, “funcionou uma vez” e “tenho medo”, que não constituem uma documentação técnica confiável.

Por fim, a análise do legado serviu como base para que eu pudesse identificar os requisitos do problema, as inconsistências existentes e os pontos que precisavam ser considerados na construção da solução proposta no desafio.

---

## 5. Funcionalidades e dados

### IBGE

A aplicação utiliza dados públicos do IBGE referentes ao **Censo 2022**, incluindo:

* população por município;
* renda domiciliar per capita;
* distribuição da população por faixas etárias;
* estados e municípios.

Os dados são ingeridos pelo backend e persistidos no PostgreSQL.

As consultas realizadas pelo dashboard são feitas sobre a base própria, sem consultar o IBGE a cada requisição do usuário.

### ANS

A aplicação também integra dados públicos da **Agência Nacional de Saúde Suplementar (ANS)** referentes a 2026.

São utilizados dados de beneficiários de:

* planos de assistência médica;
* planos exclusivamente odontológicos;
* distribuição por faixa etária e sexo;
* municípios.

Esses dados são cruzados com as informações demográficas do IBGE para enriquecer a análise de mercado.

### Dashboard

O dashboard apresenta:

* ranking de municípios por população ou renda;
* distribuição da população por faixa etária;
* distribuição de beneficiários da ANS por faixa etária;
* indicadores de população, renda e beneficiários;
* análise integrada do mercado municipal;
* participação do município no total de beneficiários do respectivo estado.

### Filtros e consultas

A API de dados de mercado permite consultar os indicadores persistidos no banco de dados com:

* filtro por estado;
* filtro por município;
* filtro por faixa etária;
* ordenação por população ou renda;
* paginação dos resultados.

No dashboard, esses dados são utilizados principalmente para atualizar o ranking por população ou renda, selecionar o município analisado e apresentar as distribuições por faixa etária.

---

## 6. Arquitetura e decisões técnicas

### Fluxo de dados

```text
IBGE API (Censo 2022) ──┐
                         ├──► Ingestão / Sincronização ──► PostgreSQL (Prisma) ──► NestJS REST API ──► React (Vite/Recharts)
ANS Dataset (2026)    ──┘
```

### Backend — NestJS

O backend foi desenvolvido com **NestJS** e **TypeScript** por oferecer uma estrutura modular adequada à separação das responsabilidades da aplicação.

Os módulos foram organizados nos principais domínios do sistema:

* ingestão e sincronização;
* localidades;
* dados de mercado;
* análise de mercado;
* integração com a ANS.

Essa organização mantém as regras de negócio no backend e facilita a manutenção dos diferentes componentes da aplicação.

### Banco de dados — PostgreSQL + Prisma

O **PostgreSQL** foi escolhido para persistir os dados das fontes externas e realizar consultas estruturadas por município, indicadores, períodos e dimensões.

O **Prisma ORM** foi utilizado para facilitar a modelagem, migrations e acesso tipado aos dados.

A persistência em banco próprio reduz a dependência dos serviços externos durante o uso do sistema. Como trade-off, a aplicação precisa manter um processo de ingestão e atualização dos dados, tratado pela sincronização inicial e pela atualização agendada do IBGE.

### Frontend — React + Vite

O dashboard foi desenvolvido com **React e TypeScript** por permitir organizar a interface em componentes reutilizáveis e facilitar a interação com os dados.

O **Vite** foi utilizado para desenvolvimento e build, enquanto o **Recharts** foi adotado para as visualizações integradas ao React.

O frontend consome a API própria da aplicação.

### Docker

O projeto é composto por três serviços principais:

```text
Frontend ──► Backend ──► PostgreSQL
```

O **Docker Compose** foi utilizado para padronizar o ambiente e facilitar a execução da aplicação, incluindo serviços, dependências, migrations e inicialização.

---

## 7. Qualidade e operação

### Sincronização inicial

Ao iniciar o backend, o sistema verifica se os dados necessários já estão disponíveis.

Quando a base está vazia ou incompleta, a sincronização é executada automaticamente.

Quando os dados já estão disponíveis, a sincronização inicial é ignorada.

A sincronização inicial contempla os dados necessários do IBGE e da ANS.

### Atualização agendada

O backend utiliza `@nestjs/schedule` para executar uma atualização periódica dos dados do IBGE.

A tarefa é configurada para execução mensal e utiliza `waitForCompletion` para evitar execuções simultâneas do mesmo processo.

A atualização utiliza o período de referência configurado na aplicação. Atualmente, o período do IBGE utilizado é 2022.

### Testes automatizados

O projeto possui **33 testes automatizados**, cobrindo serviços de mercado, análise, sincronização, integração com ANS e proteção dos endpoints de sincronização.

### CI

O GitHub Actions executa automaticamente:

* instalação das dependências;
* geração do cliente Prisma;
* testes do backend;
* build do backend;
* build do frontend.

### Tratamento de erros

Os fluxos de sincronização possuem tratamento específico para falhas de fontes externas.

Por exemplo, uma falha durante a sincronização da ANS no processo inicial é registrada sem impedir que o sistema continue utilizando os dados do IBGE.

### Segurança

Os endpoints responsáveis pela sincronização de dados são protegidos por **API Key**.

As credenciais e configurações sensíveis são mantidas em variáveis de ambiente, enquanto o `.env` permanece fora do repositório.

### Swagger

A API possui documentação interativa por meio do Swagger, permitindo consultar os endpoints disponíveis, seus parâmetros e respostas.

---

## 8. Estrutura, limitações e uso de IA

### Estrutura do projeto

```text
trads-painel-inteligencia-mercado/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── ans/
│       ├── data-sync/
│       ├── ibge/
│       ├── locations/
│       ├── market-analysis/
│       └── market-data/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── .env.example
├── docker-compose.yml
└── README.md
```

### Limitações conhecidas

* Os indicadores demográficos do IBGE utilizados na análise são referentes a 2022.
* Os dados da ANS utilizados atualmente possuem referência de 2026.
* A atualização agendada do IBGE utiliza o período de referência configurado na aplicação; ela não realiza descoberta automática de novos períodos publicados pela fonte.

### Próximos passos

Com mais tempo, poderiam ser considerados:

* descoberta automática de novos períodos disponíveis nas fontes;
* expansão dos indicadores econômicos utilizados na análise;
* novos cruzamentos entre dados demográficos e dados de mercado;
* melhorias de observabilidade e monitoramento das sincronizações;
* expansão da análise dos dados da ANS;
* expansão da cobertura de testes para os fluxos de integração e sincronização.

### Uso de IA

A IA foi utilizada como ferramenta de apoio durante o desenvolvimento, principalmente em pesquisas técnicas, comparação de alternativas e revisão de implementação.

#### Exemplos de uso

* IBGE e SIDRA: foram utilizadas perguntas para comparar tabelas, variáveis e formas de consulta que atendiam aos indicadores necessários. As sugestões foram testadas diretamente nas APIs e ajustadas conforme os resultados encontrados.
  
* Implementação e bibliotecas: a IA foi utilizada para pesquisar alternativas de implementação e bibliotecas que poderiam ser utilizadas no projeto. As opções foram avaliadas considerando a estrutura e os requisitos da aplicação antes de serem adotadas.
  
* Revisão de código: trechos de código e decisões técnicas foram submetidos à revisão para identificar possíveis problemas ou alternativas. As sugestões foram analisadas, testadas e, quando necessário, modificadas ou descartadas.

As informações provenientes de fontes externas foram validadas com base na documentação e nos dados oficiais utilizados pelo projeto.
