# Matriz

Aplicação de gestão de projetos e tarefas desenvolvida na ficha 03 de AI-Powered Software Engineering, a partir dos Specification Pack e Architecture Pack das fichas 01 e 02.

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
| [docs/architecture.md](docs/architecture.md) | Comparação de arquiteturas, monólito modular escolhido, componentes, fluxos e revisão crítica. |
| [docs/database.md](docs/database.md) | Entidades, cardinalidades, integridade e diagrama ER em Mermaid. |
| [openapi.yaml](openapi.yaml) | Contrato OpenAPI 3.1 da implementação da ficha 03. |
| [docs/ui/wireframe.png](docs/ui/wireframe.png) | Referência histórica da ficha 02, com [fonte SVG](docs/ui/wireframe.svg); não representa as extensões da ficha 03. |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Decisões aprovadas, diferenças face à ficha 02 e incrementos. |
| [docs/verification.md](docs/verification.md) | Cenários, resultados reais, testes, revisão e limitações. |
| [render.yaml](render.yaml) | Blueprint Render para demonstração temporária gratuita em Frankfurt. |

Leitura recomendada: requisitos, restrições e User Stories. Os agentes devem começar pelo `AGENTS.md`.

## Executar localmente

Pré-requisitos: Docker com Compose. Para desenvolvimento fora dos contentores: Java 21, Maven 3.9+, Node 22.12+ e npm. O monólito modular usa Spring Boot 3.5, React/TypeScript e PostgreSQL 17. `backend/` contém API e persistência; `frontend/` contém interface e testes.

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

Para a demonstração local, `.env.example` fornece valores fictícios para PostgreSQL e para o administrador local do Keycloak. `POSTGRES_PASSWORD` é usado pelo Compose tanto para a base de dados como para `DATABASE_PASSWORD` da aplicação; definir apenas `DATABASE_PASSWORD` em `.env` não resolve o erro de configuração do PostgreSQL. Manter `.env` fora do controlo de versões e não partilhar o seu conteúdo.

Se já existir um volume inicializado, usar a palavra-passe com que a base de dados foi criada: alterar `POSTGRES_PASSWORD` no ficheiro não altera a palavra-passe guardada no PostgreSQL. Não apagar o volume para resolver este problema.

Abrir `http://localhost:8080`. PostgreSQL fica exposto apenas em `127.0.0.1:55432`, Keycloak em `127.0.0.1:8180` e a aplicação apenas localmente. O Dockerfile compila React e inclui os ficheiros estáticos no JAR. O Compose importa um realm local; não são usados mocks no percurso OIDC.

Flyway aplica as migrations V1 e V2 automaticamente. O volume Docker conserva a base de dados. O seed de perfis fictícios só corre com `DEMO_ENABLED=true` e não altera contas/dados existentes no arranque seguinte; novos perfis não recebem hash de palavra-passe local. V2 permite hash NULL e preserva quaisquer hashes existentes. Não usar `docker compose down -v` para reiniciar: isso elimina o volume.

Com o realm local, as contas fictícias são `ana`, `bruno` e `carla`, com palavra-passe **`Matriz-Demo-2026!`**. Ana gere Alfa, Bruno participa em Alfa e Carla só tem o seu projeto Beta. A credencial é pública e exclusiva da demonstração local; não usar dados pessoais ou credenciais reais. O claim assinado `app_user_id` associa cada utilizador Keycloak ao perfil local ativo correspondente. A aplicação não cria perfis automaticamente.

Para desenvolvimento, iniciar só a base de dados e executar em dois terminais:

```powershell
docker compose -p matriz-ficha3 --env-file .env up -d db keycloak
$env:DATABASE_PASSWORD='matriz-local-example'
$env:DEMO_ENABLED='true'
mvn -f backend\pom.xml spring-boot:run
```

```powershell
Set-Location frontend
npm ci
npm run dev
```

Abrir `http://localhost:5173` (usar `localhost` de forma consistente, pois o cookie SameSite Strict protege o estado do fluxo OIDC). Vite encaminha `/api`, `/oauth2` e `/login/oauth2` para `127.0.0.1:8080`; toda a configuração do prefixo API está em `frontend/src/api.ts`. `.env` é lido pelo Compose, não automaticamente pelo Maven: ajustar as variáveis do terminal se forem alterados os valores do exemplo. O realm local permite callback na porta de desenvolvimento 5173.

## Autenticação, permissões e testes

Login OIDC Authorization Code com Keycloak; sessão Matriz no servidor, cookie `JSESSIONID` HttpOnly e timeout inativo de 30 minutos. Localmente, `SameSite=Strict`; no Render, `SameSite=Lax` permite o callback OIDC cross-site por navegação GET, mantendo `Secure=true`. `GET /api/auth/login` inicia o redirecionamento; o servidor valida o ID token e exige um claim `app_user_id` correspondente a perfil local ativo. Não há aprovisionamento automático. `GET /api/auth/csrf` fornece token para `X-CSRF-TOKEN`; todas as escritas exigem CSRF. O identificador de sessão é renovado no login e invalidado no logout Matriz; a sessão Keycloak é independente. O frontend não guarda credenciais ou tokens em localStorage. Reiniciar o backend termina sessões, mas não apaga dados.

Só o gestor edita/elimina projetos e gere membros/atribuições. Todos os participantes ativos gerem tarefas e comentam. A API aplica as mesmas restrições a acessos diretos; recursos alheios e inexistentes devolvem 404 indistinguível. A eliminação exige confirmação na interface e remove dependentes numa transação. As edições usam versão otimista; conflitos não sobrepõem dados silenciosamente.

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
Set-Location frontend
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes Java usam PostgreSQL isolado via Testcontainers (Docker necessário) e principal OIDC simulado no limite de segurança; não validam a ligação real ao Keycloak. `api.version` assegura compatibilidade do cliente Docker de testes com Docker Desktop 29. Os testes E2E requerem API, Vite e Keycloak local já iniciados; usam o login OIDC real e criam/eliminam os seus próprios projetos, não os projetos existentes. Incluem auditoria axe-core em dez combinações de vista/viewport para critérios WCAG 2.0, 2.1 e 2.2 A/AA, incluindo contraste.

Para executar os mesmos E2E contra a aplicação completa do Compose, em vez de Vite:

```powershell
Set-Location frontend
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
```

### CI — GitHub Actions

O workflow `.github/workflows/ci.yml` corre em cada push, em pull requests para `main` e manualmente. Executa em jobs separados os testes backend (PostgreSQL/Testcontainers), os testes de componentes e build frontend, e os E2E contra a aplicação completa em Docker Compose com Keycloak, incluindo axe-core. Usa apenas as credenciais fictícias de `.env.example`; não publica nem faz deploy da aplicação. Em caso de falha, os relatórios Playwright são guardados por sete dias.

### Render — demonstração temporária

`render.yaml` prepara um serviço Docker e PostgreSQL 17 gratuitos em Frankfurt. O serviço respeita a porta `PORT` fornecida pelo Render; o Compose local continua a usar `8080`, `DATABASE_URL` e as mesmas portas/valores locais. No Render, Spring Boot interpreta os headers encaminhados para construir o callback HTTPS, e o Blueprint define `SameSite=Lax` apenas no Render para suportar o retorno OIDC cross-site; localmente mantém-se `Strict`. O workflow GitHub Actions não publica a aplicação; o Blueprint configura o Render para só iniciar deploys automáticos quando os checks GitHub passam. Nenhum recurso foi criado nem deploy efetuado.

Antes de criar/sincronizar o Blueprint, é necessário configurar um fornecedor OIDC acessível por HTTPS e preencher no Render as variáveis que o Blueprint deixa por sincronizar. O cliente OIDC deve permitir o callback `https://<domínio-do-serviço>/login/oauth2/code/keycloak`; `KEYCLOAK_ISSUER_URI` tem de corresponder ao issuer dos tokens e `KEYCLOAK_PUBLIC_REALM_URI` ao realm público. Pode definir `KEYCLOAK_BACKCHANNEL_REALM_URI` no Render se o endpoint servidor-servidor for diferente; sem esse valor, usa o issuer. O segredo do cliente fica apenas no Render, nunca no repositório.

A Matriz não cria contas automaticamente. O Blueprint mantém `DEMO_ENABLED=false`; o login só funciona quando existirem perfis locais ativos e o IdP emitir para cada um o claim assinado `app_user_id` correspondente. O serviço não inclui Keycloak nem aprovisiona utilizadores.

Este perfil é exclusivamente para demonstração temporária, não produção: o serviço gratuito pode suspender-se após 15 minutos sem tráfego e a base de dados gratuita expira ao fim de 30 dias. Após expirar, há 14 dias para atualizar a base antes da eliminação dos dados; não há backups para a base gratuita e só pode existir uma base gratuita ativa por workspace. Verificar as [limitações atuais do Render Free](https://render.com/docs/free) antes de criar recursos.

Parar serviços sem apagar o volume: `docker compose -p matriz-ficha3 stop`. Depois, `docker compose -p matriz-ficha3 start` volta a iniciá-los com os dados existentes.

## Estado da entrega

A entrega original da ficha 03 foi versionada pelo autor em `e73250d`; a revisão visual e de acessibilidade está em `f780a29` (`feat: enhance UI components with improved accessibility and visual organization`), observado em `main` e `origin/main` em 29-10-2026. A atualização documental posterior é trabalho da worktree, sem commit ou push efetuados pelo agente.

As conclusões da comparação de prompts realizada pelo autor no Gemini Pro estão em [docs/requirements.md](docs/requirements.md), sem transcrições das conversas. Os procedimentos para reproduzir a entrega numa cópia limpa, percorrer os fluxos por teclado e verificar o contrato e os diagramas estão em [docs/verification.md](docs/verification.md).

Produção está diferida; foi autorizada apenas a preparação de suporte para uma demonstração temporária Render, sem criar recursos ou efetuar deploy. Um ano de retenção é apenas pressuposto provisório, sem policy aprovada, âmbito ou evento inicial definidos; não existe purga automática. p95 é uma métrica a observar, mas não há carga de referência nem alvo aprovados. Antes de qualquer decisão futura de produção será necessário validar política de identidade, HTTPS/segredos, retenção, backups, volumes/escala e acessibilidade. As verificações não são certificação de segurança, conformidade ou desempenho.
