# Matriz

Aplicação de gestão de projetos e tarefas desenvolvida na ficha 03 de AI-Powered Software Engineering, a partir dos Specification Pack e Architecture Pack das fichas 01 e 02.

**Ficha 05 — candidato `0.4.0-rc.1`, 12-11-2026:** migração autorizada para Spring Boot 4; T6 (rebuild fresco e verificação integrada final) **concluído localmente**. Passaram 19 testes Maven, 13 frontend e 5 E2E; Semgrep: 0 findings; Trivy: 0 HIGH/CRITICAL. Persistência após recriação e readiness com paragem/retoma real da DB própria passaram. Candidato não publicado; prova positiva/negativa GitHub Actions, uploads/retenção reais e revisão final humana/independente **pendentes** — não se declaram todos os critérios da ficha concluídos. Consultar [CHANGELOG.md](CHANGELOG.md), [RELEASE_NOTES.md](RELEASE_NOTES.md) e [evidências/limitações](docs/verification.md#ficha-05--candidato-040-rc1).

## Problema e objetivos

O ponto de partida do cliente é: “Precisamos de uma aplicação onde as nossas equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho.”

A Matriz centraliza o trabalho de cada projeto, os responsáveis e os comentários e apresenta o progresso através dos estados das tarefas. Esta entrega implementa uma demonstração académica com dados fictícios, não um serviço preparado para produção.

## MVP proposto

O autor aprovou o âmbito alargado da ficha 03 para implementação. Isso não equivale a validação pelo cliente:

- Acesso autenticado com contas previamente disponibilizadas.
- Criação, consulta, pesquisa, edição e eliminação de projetos, com gestor e membros por projeto.
- Adição e remoção de membros de um projeto.
- Criação, consulta, edição e eliminação de tarefas, com filtros por estado e prioridade.
- Vários responsáveis elegíveis por tarefa, sem atribuições duplicadas.
- Comentários com autor autenticado e data atribuídos pelo servidor.
- Estados “Por fazer”, “Em curso” e “Concluída”.
- Contagens por estado e percentagem de tarefas concluídas por projeto.

Notificações, sprints, anexos, integrações, registo público, recuperação de palavra-passe e relatórios avançados ficam fora do MVP.

A interface mantém o tema escuro/azul inspirado no [Black Dashboard React](https://github.com/creativetimofficial/black-dashboard-react), com estrutura de espaço de trabalho ao estilo Jira: barra superior, navegação lateral, breadcrumbs, vistas e tabelas compactas. Em telemóvel, a navegação abre num diálogo modal. O painel usa as contagens reais do projeto selecionado, não métricas fictícias nem somas de uma página de projetos. Implementação original na stack existente, sem importar o template ou acrescentar dependências.

## Documentação

| Ficheiro | Conteúdo |
|---|---|
| [docs/requirements.md](docs/requirements.md) | Visão, utilizadores, requisitos, prioridades, âmbito e exercício de Prompt Engineering. |
| [docs/user-stories.md](docs/user-stories.md) | Onze User Stories atuais, critérios, exceções e histórico da ficha 01. |
| [docs/constraints.md](docs/constraints.md) | Factos, pressupostos, perguntas, segurança, decisões pendentes, revisão crítica e desafio complementar. |
| [AGENTS.md](AGENTS.md) | Instruções persistentes para agentes que trabalhem neste projeto. |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Orientação curta do Copilot e ligação às regras do projeto. |
| [.github/agents/](.github/agents/) | Agentes especializados para planeamento, coordenação, implementação e revisão. |
| [.github/skills/](.github/skills/) | Skills reutilizáveis de contexto e validação da Matriz. |
| [docs/architecture.md](docs/architecture.md) | Comparação de arquiteturas, monólito modular escolhido, componentes, fluxos e revisão crítica. |
| [docs/adr/README.md](docs/adr/README.md) | Índice dos Architecture Decision Records (ADRs) e decisões técnicas aceites. |
| [docs/database.md](docs/database.md) | Entidades, cardinalidades, integridade e diagrama ER em Mermaid. |
| [openapi.yaml](openapi.yaml) | Contrato OpenAPI 3.1 da implementação da ficha 03. |
| [docs/ui/wireframe.png](docs/ui/wireframe.png) | Referência histórica da ficha 02, com [fonte SVG](docs/ui/wireframe.svg); não representa as extensões da ficha 03. |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Decisões aprovadas, diferenças face à ficha 02 e incrementos. |
| [docs/verification.md](docs/verification.md) | Cenários, resultados reais, testes, revisão e limitações. |
| [CHANGELOG.md](CHANGELOG.md) | Baseline do candidato da ficha 05, sem inventar datas de releases anteriores. |
| [RELEASE_NOTES.md](RELEASE_NOTES.md) | Compatibilidade, migração, operação local, resultados T6 locais e critérios remotos/revisão final pendentes. |
| [docs/test-plan.md](docs/test-plan.md) | Cenários unitários, de integração, E2E e autorização da ficha 04. |
| [docs/quality-security-review.md](docs/quality-security-review.md) | Code Review, Security Review, evidência, resultados e limitações da ficha 04. |
| [render.yaml](render.yaml) | Blueprint Render da demonstração temporária, com endereço registado [matriz-demo-h27u.onrender.com](https://matriz-demo-h27u.onrender.com); disponibilidade não revalidada nesta tarefa. |

Leitura recomendada: requisitos, restrições e User Stories. Os agentes devem começar pelo `AGENTS.md`.

## Utilizar o fluxo de agentes

Para alterações não triviais, comece pelo agente **Planeador Matriz** no seletor de agentes do Copilot. Descreva o resultado pretendido e peça uma proposta com âmbito, critérios de aceitação, ficheiros afetados, dependências e validações. Responda às perguntas de clarificação e reveja o plano antes de o aprovar. O planeador não deve alterar ficheiros nesta fase.

Depois da aprovação:

1. Para trabalho com várias tarefas, entregue o plano aprovado ao **Orquestrador Matriz**. Ele coordena as tarefas e só paraleliza até três quando não há conflitos de ficheiros, dependências ou validação; caso contrário, segue sequencialmente.
2. Para uma tarefa isolada, ou quando o orquestrador a encaminhar, escolha o agente adequado: **Engenheiro Backend Matriz** para Java/Spring e persistência; **Engenheiro Frontend Matriz** para React/TypeScript e interface; **Engenheiro de Documentação e Configuração Matriz** para documentação, CI e configuração.
3. Dê a cada tarefa um âmbito e critérios aprovados. Confirme os ficheiros novos/removidos e qualquer mudança fora do plano antes de permitir que avance.
4. Peça ao **Revisor Matriz** uma revisão independente depois da implementação. O revisor não altera ficheiros; verifica critérios e evidências e assinala o que não conseguiu validar.
5. Inspecione as alterações e os resultados. A pessoa responsável decide os próximos passos e executa commit, push ou publicação apenas com a aprovação necessária.

As skills `contexto-matriz` e `validacao-matriz` complementam o fluxo: a primeira orienta a leitura das regras atuais e fontes de verdade; a segunda ajuda a selecionar verificações existentes e a relatar resultados reais. Todos os agentes devem respeitar `AGENTS.md`: usar dados fictícios, preservar `.env` e volumes, não inventar resultados e pedir autorização para operações sensíveis. Para uma tarefa pequena, o planeador pode propor um único passo, sem necessidade de criar um plano extenso.

## Executar localmente

Pré-requisitos: Docker com Compose. Para desenvolvimento fora dos contentores: Java 21, Maven 3.9+, Node 22.12+ e npm. O monólito modular usa Spring Boot **4.0.9**, Spring Framework **7.0.10**, Spring Security **7.0.8**, Jackson **3.1.7**, Flyway **11.14.1**, React/TypeScript e PostgreSQL **17**. O Dockerfile usa Node **22** e Java **21**. `backend/` contém API e persistência; `frontend/` contém interface e testes. Versões efetivas e compatibilidade Jackson em [RELEASE_NOTES.md](RELEASE_NOTES.md).

Em PowerShell, na raiz do repositório:

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item .env.example .env
}
docker compose -p matriz-ficha3 --env-file .env config --quiet
```

O comando `config --quiet` valida a configuração sem iniciar serviços nem mostrar os valores das variáveis. Se terminar sem erros, iniciar:

```powershell
docker compose -p matriz-ficha3 --env-file .env up --build -d
```

**Erro `required variable POSTGRES_PASSWORD is missing a value`:** o Compose não recebeu uma palavra-passe não vazia para PostgreSQL. `.env.example` é apenas um modelo, não é carregado automaticamente. Criar `.env` com o bloco acima; se já existir, não o substituir: editar apenas as variáveis em falta. Confirmar que o ficheiro se chama `.env` (não `.env.txt`) e que os comandos são executados na raiz do repositório.

Para a demonstração local, `.env.example` fornece valores fictícios para PostgreSQL. `POSTGRES_PASSWORD` é usado pelo Compose tanto para a base de dados como para `DATABASE_PASSWORD` da aplicação; definir apenas `DATABASE_PASSWORD` em `.env` não resolve o erro de configuração do PostgreSQL. Manter `.env` fora do controlo de versões e não partilhar o seu conteúdo.

Se já existir um volume inicializado, usar a palavra-passe com que a base de dados foi criada: alterar `POSTGRES_PASSWORD` no ficheiro não altera a palavra-passe guardada no PostgreSQL. Não apagar o volume para resolver este problema.

Abrir `http://localhost:8080`. PostgreSQL fica exposto apenas em `127.0.0.1:55432` e a aplicação apenas localmente. O Dockerfile compila React e inclui os ficheiros estáticos no JAR.

Flyway aplica as migrations V1, V2 e V3 automaticamente. O volume Docker conserva a base de dados. O seed fictício é ativado por `DEMO_ENABLED=true`; cria Ana, Bruno e Carla, mas não redefine palavras-passe nem dados em arranques seguintes. Não usar `docker compose down -v` para reiniciar: isso elimina o volume.

As contas fictícias usam os emails `ana@example.invalid`, `bruno@example.invalid` e `carla@example.invalid`, todas com palavra-passe **`Matriz-Demo-2026!`**. Ana gere Alfa, Bruno participa em Alfa e Carla só tem o seu projeto Beta. Estas credenciais são públicas e exclusivas da demonstração; os visitantes do Render podem alterar os dados demo. Não usar dados pessoais ou credenciais reais.

Para desenvolvimento, iniciar só a base de dados e executar em dois terminais:

```powershell
docker compose -p matriz-ficha3 --env-file .env up -d db
$env:DATABASE_PASSWORD='matriz-local-example'
$env:DEMO_ENABLED='true'
mvn -f backend\pom.xml spring-boot:run
```

```powershell
Set-Location frontend
npm ci
npm run dev
```

Abrir `http://localhost:5173`. Vite encaminha `/api` para `127.0.0.1:8080`; toda a configuração do prefixo API está em `frontend/src/api.ts`. `.env` é lido pelo Compose, não automaticamente pelo Maven: ajustar as variáveis do terminal se forem alterados os valores do exemplo.

### Observabilidade local — opt-in

Desligada por omissão: o resolver de acesso não disponibiliza endpoints operacionais sem o perfil `observability`, mesmo que a exposição seja alargada. O perfil usa **a mesma porta da aplicação** (8080 por omissão), sem serviço de monitorização externo nem porta de gestão separada. Não ativar no Render ou em hosts públicos.

| Rota GET com o perfil ativo | Acesso e conteúdo |
|---|---|
| `/actuator/health` | Anónimo, mínimo: `status` e nomes dos grupos `liveness`/`readiness`; sem detalhes/componentes e sem criar sessão. |
| `/actuator/health/liveness` | Anónimo, só `status`; inclui `livenessState`, não a base de dados. |
| `/actuator/health/readiness` | Anónimo, só `status`; inclui `readinessState` e o indicador JDBC `db`. UP → 200; DOWN → 503. |
| `/actuator/metrics` | Sessão autenticada pelo login local existente; lista apenas nomes `jvm.*` e `http.server.requests`. |
| `/actuator/metrics/jvm.*`, `/actuator/metrics/http.server.requests` | Sessão autenticada; medidas do nome permitido, quando registado. |

Não existem aliases `/livez` ou `/readyz`. Discovery `/actuator`, componentes individuais de health e endpoints sensíveis (`env`, `configprops`, `heapdump`, `loggers`, `threaddump`, `mappings`, etc.) não ficam disponíveis. Escritas operacionais são recusadas; sessão/CSRF de negócio mantêm-se. As rotas operacionais **não pertencem a `/api`** nem ao contrato OpenAPI de negócio. Métricas não são logs de conteúdo: não recolher nem registar corpos de pedidos/respostas, credenciais, tokens ou cookies.

O Compose base verifica apenas a resposta HTTP de `/`; **não comprova readiness da base de dados**. O override [compose.observability.yaml](compose.observability.yaml) ativa o perfil e troca o healthcheck da aplicação por `/actuator/health/readiness`. Ambos conservam publicações em loopback; `SERVER_ADDRESS=0.0.0.0` dentro do contentor não publica o host em todas as interfaces.

Exemplo de procedimento isolado proposto em T5, não executado nessa fase: projeto `matriz-ficha05-check`, portas propostas 18085/55435. Esse projeto foi reportado como já criado/parado, com volume preservado. T6 usou outro projeto, `matriz-ficha05-final`, nas mesmas portas, verificadas livres antes do ensaio; app/db próprios ficaram parados no fim e o volume/fixture foram preservados. Para qualquer futura execução do exemplo, confirmar portas e estado e obter autorização, sem parar instâncias alheias. Manter o `.env` existente; não o copiar por cima nem imprimir a configuração expandida.

```powershell
$env:APP_HOST_PORT='18085'
$env:POSTGRES_HOST_PORT='55435'
docker compose -p matriz-ficha05-check --env-file .env -f compose.yaml -f compose.observability.yaml config --quiet
# Só após autorização de arranque/verificação:
docker compose -p matriz-ficha05-check --env-file .env -f compose.yaml -f compose.observability.yaml up --build -d --wait
# Parar sem remover contentores ou volumes:
docker compose -p matriz-ficha05-check --env-file .env -f compose.yaml -f compose.observability.yaml stop
# Retomar a configuração/imagem existentes, sem rebuild:
docker compose -p matriz-ficha05-check --env-file .env -f compose.yaml -f compose.observability.yaml start
Remove-Item Env:APP_HOST_PORT
Remove-Item Env:POSTGRES_HOST_PORT
```

Para regressar ao perfil base é necessário recriar `app` com apenas `compose.yaml` numa execução autorizada; `start` não remove o perfil de um contentor já criado. Nunca usar `down -v` nem eliminar o volume para mudar de perfil ou versão. Os comandos acima são instruções, não prova de persistência/arranque do candidato.

## Autenticação, permissões e testes

Login local por email e palavra-passe; hashes scrypt e sessão Matriz no servidor, cookie `JSESSIONID` HttpOnly/SameSite Strict e timeout inativo de 30 minutos. Credenciais inválidas e contas inativas recebem resposta genérica; cinco falhas por email/endereço em 15 minutos bloqueiam novas tentativas durante 15 minutos. `POST /api/auth/login` exige CSRF; `GET /api/auth/csrf` fornece o token para `X-CSRF-TOKEN`, também exigido nas restantes escritas. O identificador de sessão é renovado no login e invalidado no logout. Não há registo público ou recuperação de palavra-passe; o frontend não guarda credenciais em localStorage. Reiniciar o backend termina sessões, mas não apaga dados.

Só o gestor edita/elimina projetos e gere membros/atribuições. Todos os participantes ativos gerem tarefas e comentam. A API aplica as mesmas restrições a acessos diretos; recursos alheios e inexistentes devolvem 404 indistinguível. A eliminação exige confirmação na interface e remove dependentes numa transação. As edições usam versão otimista; conflitos não sobrepõem dados silenciosamente.

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
Set-Location frontend
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes Java usam PostgreSQL isolado via Testcontainers (Docker necessário) e verificam o login local real através do controller; `api.version` assegura compatibilidade do cliente Docker de testes com Docker Desktop 29. Os testes E2E requerem API, Vite e seed local já iniciados; criam/eliminam os seus próprios projetos, não os projetos existentes. Incluem auditoria axe-core em combinações de vista/viewport para critérios WCAG 2.0, 2.1 e 2.2 A/AA, incluindo contraste.

Para executar os mesmos E2E contra a aplicação completa do Compose, em vez de Vite:

```powershell
Set-Location frontend
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
```

### CI — GitHub Actions

O workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) está definido para pushes, pull requests para `main` e execução manual, com `contents: read`. Semgrep, testes backend (PostgreSQL/Testcontainers) e testes/build frontend são jobs paralelos. O job E2E depende dos três: valida Compose sem imprimir configuração, constrói uma única imagem integrada e aplica os gates npm/JAR **antes de iniciar a stack e executar os E2E**, incluindo axe-core. O build frontend básico já ocorre no seu job; a dependência dos três jobs aplica-se ao build integrado. Semgrep falha com findings (`--error`), sem conta/token.

Trivy **0.76.2**, fixado por digest `sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb`, analisa vulnerabilidades de **bibliotecas**, não pacotes do SO: manifests npm com dev dependencies e bibliotecas do JAR realmente entregue. O gate confere todos os pares nome/versão do lock e caminhos `BOOT-INF/lib/*.jar`. HIGH/CRITICAL bloqueiam **mesmo sem correção disponível**; não há ignores, `ignore-unfixed`, VEX ou exceções. Erros do scanner/download de DB e cobertura incompleta também bloqueiam. Ambos os scans são tentados mesmo se o primeiro falhar.

O scanner corre localmente no runner, sem upload de código, mounts de `.env`/credenciais ou encaminhamento do ambiente do host. Downloads das bases públicas de vulnerabilidades/Java continuam necessários; telemetry e consultas remotas de dependências estão desativadas. Relatórios JSON/TXT de dependências são configurados para upload mesmo em falha e retenção de sete dias; relatórios Playwright, quando presentes, também por sete dias. Diagnósticos Compose em falha são reduzidos/sanitizados; não recolher corpos HTTP ou cookies. A mesma imagem passa depois a `up --no-build --wait`, com health HTTP base e sem perfil de observabilidade.

Isto descreve a definição conferida, **não uma execução GitHub Actions deste candidato**. T6 passou os gates e fixtures locais, mas prova positiva/negativa remota, upload em falha e retenção reais continuam **não verificados**. O workflow usa exclusivamente dados fictícios de `.env.example`, sem publicação/deploy. Porém, o Render pode reagir a checks bem-sucedidos conforme o Blueprint; **não fazer push ou acionar checks remotos sem autorização específica**.

Para executar localmente, com Docker Desktop ativo e na raiz do repositório:

```powershell
docker run --rm --mount "type=bind,source=$($PWD.Path),target=/src,readonly" --workdir /src --entrypoint semgrep semgrep/semgrep scan --config .semgrep.yml --error
```

O scan aplica os rulesets públicos `p/java` e `p/typescript` e a regra local `.semgrep.yml`, que rejeita CORS Java com origem wildcard. Semgrep precisa de acesso à internet para obter os rulesets na primeira execução. A análise não altera ficheiros do projeto.

### Render — demonstração temporária

`render.yaml` configura um serviço Docker e PostgreSQL 17 gratuitos em Frankfurt. O endereço registado da demonstração é [https://matriz-demo-h27u.onrender.com](https://matriz-demo-h27u.onrender.com); **não foi verificado ao vivo em T5 (12-11-2026)** e não se afirma que execute este candidato. O serviço respeita a porta `PORT` fornecida pelo Render; o Compose local continua a usar `8080`, `DATABASE_URL` e as mesmas portas/valores locais. No Render, o Blueprint ativa o seed de contas fictícias, define `COOKIE_SECURE=true` e mantém SameSite Strict; não ativa `observability`. O workflow GitHub Actions não publica a aplicação, mas o Blueprint contém `autoDeployTrigger: checksPass`: passar checks pode desencadear deploy pelo Render. Nenhuma alteração Render, push ou execução remota foi efetuada nesta tarefa.

Não é necessária configuração de IdP externo. As contas de demonstração e a palavra-passe acima ficam acessíveis a qualquer visitante; os respetivos dados são partilhados e podem ser alterados. Este perfil é exclusivamente para demonstração temporária, não produção.

Este perfil é exclusivamente para demonstração temporária, não produção: o serviço gratuito pode suspender-se após 15 minutos sem tráfego e a base de dados gratuita atual, com duração de 30 dias, expira em **2 de dezembro de 2026**. Após expirar, há 14 dias para atualizar a base antes da eliminação dos dados; não há backups para a base gratuita e só pode existir uma base gratuita ativa por workspace. Esta expiração da infraestrutura não define a policy de retenção da aplicação. Verificar as [limitações atuais do Render Free](https://render.com/docs/free) antes de depender da demonstração ou alterar o plano.

Parar serviços sem apagar o volume: `docker compose -p matriz-ficha3 stop`. Depois, `docker compose -p matriz-ficha3 start` volta a iniciá-los com os dados existentes.

## Estado da entrega

Em 12-11-2026, T5 alinhou documentação, OpenAPI e manifests frontend com `0.4.0-rc.1`; o POM já tinha essa versão. T6 concluiu localmente um build fresco após esse alinhamento e validou a mesma imagem nos scans, 5 E2E, recriação app/db com persistência e observabilidade com paragem/retoma real da DB própria. Passaram 19 testes Maven e 13 frontend, além do build frontend; Semgrep teve 0 findings e Trivy 0 HIGH/CRITICAL, com cobertura 216/216 pares npm incluindo dev e 63/63 JARs internos. São resultados T6 registados, não novas execuções desta correção documental nem reutilização das medições pré-T5. Evidência e limites em [verification.md](docs/verification.md#ficha-05--candidato-040-rc1). Prova positiva/negativa GitHub Actions, uploads/retenção reais, revisão final humana/independente e arquivo/entrega portável continuam pendentes. HEAD de referência `46694e5`, candidato na worktree sem commit final; sem release/tag/publicação, validação de cliente ou certificação de produção. Não se declara a ficha integralmente concluída.

A entrega original da ficha 03 foi versionada pelo autor em `e73250d`; a revisão visual e de acessibilidade está em `f780a29` (`feat: enhance UI components with improved accessibility and visual organization`), observado em `main` e `origin/main` em 29-10-2026. A atualização documental posterior é trabalho da worktree, sem commit ou push efetuados pelo agente.

As conclusões da comparação de prompts realizada pelo autor no Gemini Pro estão em [docs/requirements.md](docs/requirements.md), sem transcrições das conversas. Os procedimentos para reproduzir a entrega numa cópia limpa, percorrer os fluxos por teclado e verificar o contrato e os diagramas estão em [docs/verification.md](docs/verification.md).

Produção está diferida. O registo da demonstração temporária no Render mantém a expiração da base gratuita em **2 de dezembro de 2026**, sem revalidação ao vivo nesta tarefa; isto não representa prontidão para produção. Um ano de retenção é apenas pressuposto provisório, sem policy aprovada, âmbito ou evento inicial definidos; não existe purga automática. A expiração da base de demonstração é independente dessa policy. p95 é uma métrica a observar, mas não há carga de referência nem alvo aprovados. Antes de qualquer decisão futura de produção será necessário validar política de identidade, HTTPS/segredos, retenção, backups, volumes/escala e acessibilidade. A janela curta de suporte OSS Boot 4.0 indicada para dezembro de 2026 exige nova decisão/reconfirmação antes de operação prolongada. As verificações não são certificação de segurança, conformidade ou desempenho.
