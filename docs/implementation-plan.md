# Ficha 03 — Plano de implementação

## Suplemento de usabilidade — 18-11-2026

Implementação aprovada pelo autor («aprovo» ao arranque pelos caminhos do plano, incluindo dois helpers de email, testes e documentação); não cliente, produção ou publicação. P1/P2 e speckit-analyze readonly anteriores sem findings, 28 tarefas, segundo handover. Os estados de aprovação, limites e totais das secções datadas seguintes são históricos, não falta atual de aprovação B5. Mesmos [spec](../specs/001-usabilidade-contas-tarefas/spec.md), [plan](../specs/001-usabilidade-contas-tarefas/plan.md) e [tasks](../specs/001-usabilidade-contas-tarefas/tasks.md), sem regeneração.

| Lote / IDs | Estado atual e proveniência |
|---|---|
| Contexto T001 | Orquestrador confirmou artefactos, aprovação e inventário, incluindo as duas criações. |
| B1 T002–T007 | Implementados sete caminhos, novo Emails.java, registo 6–200/mensagens seguras, membros email/userId XOR/presença/locks/idempotência. Gate independente PASS relatado. Maven 58 sem falhas/erros/skips relatado; cinco reports locais conferidos por leitura também nesta B5 (44+1+3+5+5). |
| B2 T008–T012 | Implementados cinco caminhos, novo email.ts, UI registo/membros. Gate independente PASS relatado; seleção 90, suite 124 em duas execuções finais/build PASS relatados. |
| B3 T013–T022 | Implementados catorze caminhos, templates por ciclo, ícones/seletores/anexos. P2/B3-01 dupla confirmação X standalone corrigida; re-review PASS relatado. Seleção 74, suite final 141/10 ficheiros/build PASS relatados; falha temporal pontual de foco B2 na primeira seleção, repetição/full passaram sem alteração B2. |
| B4 T023 | Só frontend/e2e/matriz.spec.ts preparado/revisto estaticamente: 11 cenários por AST, não discovery/execução. HIGH B4-01 corrigido para aguardar DELETE 204 e GET 200 sem anexo/id/filename/erro, uma eliminação; gate readonly da correção PASS e B5 liberado com T024 bloqueado, segundo handover. |
| B4 T024 | **BLOQUEADO/NÃO EXECUTADO**: falta alvo/versão/uso/quota livre e destinos de artefactos expressamente autorizados. Sem sondar/iniciar serviços, discovery Playwright, E2E, capturas, visual ou teclado browser deste delta. A instância 18086 anterior não foi assumida disponível/atualizada/autorizada. B4 não é PASS runtime. |
| B5 T025–T027 | Alinhamento dos treze caminhos canónicos/instruções autorizados, conferência documental própria e progresso serializado em tasks.md; **gate B5 independente readonly PASS, sem findings**, segundo evidência final do revisor transmitida pelo utilizador. Sem alterar outros artefactos da feature ou estado. |
| B6 T028 | **Executado/PASS [x]**, revisão independente final readonly concluída e sem findings, segundo a mesma evidência; não executada pelo autor B5. Sem testes/builds/probes pelo revisor nem inferência de E2E/UX runtime/cliente/produção. |

**Fecho administrativo atual: 27/28 tarefas concluídas no alcance indicado; única pendência T024 [ ] BLOQUEADO/NÃO EXECUTADO.** Gates independentes B5/B6 concluídos; dados de execução anteriores preservados, sem novas execuções nesta atualização.

O mínimo vigente é 6 pontos brutos (máximo técnico 200 oculto na UI/erros de registo); login/segurança preservados. Participantes por email completo sem diretório, mantendo userId exato; templates transitórios por ciclo e apresentação compacta sem novo contrato de tarefas/schema DB. [Rastreabilidade e resultados](verification.md#usabilidade-de-contas-tarefas-e-participantes--18-11-2026) distinguem relatos dos executores/revisores e verificações desta B5. O T4 anterior já teve 1 E2E/quatro Axe relatados em 17-11; não valida o novo delta, nem é apagado pelo bloqueio T024.

Esta B5 não executa testes/builds/serviços/instalações/hooks ou operações Git de escrita, nem propõe novo plano/backlog. Cliente/servidor devem ser entregues coordenadamente; sem autorização de arranque, commit/push/deploy. Próxima decisão humana: alvo/versão/uso/quota e saídas para T024; revisões B5/B6 concluídas conforme fecho acima.

## Registo académico — plano aprovado em 17-11-2026

Decisão do autor («segue o plano anterior»), não validação do cliente, publicação ou produção. Este incremento substitui **apenas** a exclusão anterior de registo público. As secções datadas seguintes conservam o plano, contagens e decisões das fases anteriores: “mais recente”, “atual”, “sem registo público” e 21/29 operações nessas fases não substituem este incremento; o contrato vigente passa a **30 operações**. Candidato mantém `0.4.0-rc.1`.

| Tarefa do plano de registo | Âmbito / estado comunicado | Evidência e limite |
|---|---|---|
| T1 — Backend | Implementada e revista segundo handover; findings concretos corrigidos. AuthController, IdentityService, SecurityConfig, RegistrationThrottle e testes. | Leitura T3 confirma contrato e matcher PathPattern partilhado no filtro/autorização após CSRF. Reports Surefire locais: 49 testes, zero falhas/erros/skips, incluindo regressão HTTP literal/codificada; não reexecutados em T3. |
| T2 — Frontend | Implementada e revista segundo handover; correção Unicode revista nas fontes/testes. App.tsx e App.test.tsx. | npm test 56 OK, build e diffcheck OK **relatados**; revisor conferiu fontes/testes sem rerun, não nova execução T3. Validador partilhado login/registo sem bloqueio HTML type=email, sucesso sem transportar/guardar password. |
| T3 — Documentação | Só edição de README, AGENTS, .github/copilot-instructions, skill contexto-matriz, OpenAPI e requirements/constraints/user-stories/architecture/database/implementation-plan/verification. | Atualizar contexto, RF-17/RN-20–22, US-20, contrato/arquitetura/dados, rastreabilidade e pendências. Sem criar/remover ficheiros; preservar implementação/worktree/staging/arquivos/configurações e resultados históricos. Verificações estáticas em [verification](verification.md#registo-académico--17-11-2026). |
| T4 — Revisão/validação seguinte | Pendente após T3. Nenhuma inspeção visual/E2E nova executada até este handover. | Rever coerência e executar, quando autorizado, fluxo integrado/teclado/desktop-móvel: registo → confirmação no login sem auto-login/password → login explícito → projetos vazios/criação permitida → logout; erros/CSRF/quota/Unicode e regressões. Registar execução/ambiente/resultados reais, sem reutilizar 6 E2E/scans de 13-11 como prova do registo. |

Contrato confirmado: POST `/api/auth/register` público com CSRF, JSON displayName/email/password, 201 application/json só `{"message":"Conta criada. Inicie sessão."}`, conta ativa sem confirmação email e sem autenticação. 422 errors por campo, 409 email existente inclusive concorrência (divulgação aceite), 429 Retry-After. Registo independente do login, 5 pedidos/endereço remoto observado/15 min contando sucessos e falhas após CSRF válido, memória por instância limpa no restart; não confia em forwarded cliente, proxy pode agregar visitantes (sem promessa de IP real).

Nome 1–120 pontos após trim; email trim/lowercase máximo 254 unidades UTF-16 normalizadas e regex compatível com login/Unicode; password de registo 12–200 pontos sem trim/composição, espaços permitidos, confirmação só local. Login mantém passwords antigas curtas e até 200 pontos. UUID/username internos únicos gerados, hash scrypt, sem projetos/participações/privilégios herdados; pode criar projetos após login. Schema V3 suficiente, sem migration/deps. Excluídos recuperação/email/integrações externas/produção. Não altera CI/Render nem autoriza commit/push/deploy/instalação.

Fontes: código atual T1/T2 e testes, migrations V1/V3, handover aprovado e reports locais; [RF-17](requirements.md), [US-20](user-stories.md#registo-académico--us-20), [contrato](../openapi.yaml), [evidência e verificações T3](verification.md#registo-académico--17-11-2026). Decisões de cliente/produção, identidade empresarial, capacidade/backups/retenção/p95 e publicação continuam pendentes, sem alterar decisões antigas para aparentar nova validação.

## Revisão documental T1 → T2 — 17-11-2026

Executada sequencialmente no âmbito aprovado, sem alteração funcional: T1 organizou [arquitetura/dados então V1 e V2](architecture/README.md), manteve [entradas](architecture.md) [canónicas](database.md) e transferiu wireframes históricos sem mudar bytes; T2 acrescentou [rastreabilidade fichas 01–05](coursework-review.md), navegação e suplemento de 13-11 ao changelog/release notes, sem mudar `0.4.0-rc.1`.

V1 não reconstrói uma baseline pura da ficha 02: arquiva os documentos mistos completos encontrados em 17-11, só com rebase de links. Na organização T1/T2, V2 descrevia código/schema V1–V4/UI atuais em separado. OpenAPI, ADRs, requisitos, critérios, testes, configurações e guião permanecem fora desta edição. Plano anterior e números abaixo conservam a proveniência temporal; “21 operações” no fecho de 29-10 não é o contrato atual de 29.

**Consolidação posterior — 17-11-2026:** por preferência aprovada do utilizador, o conteúdo completo antes separado como V2 passou para [arquitetura](architecture.md), [dados](database.md) e [wireframe atual](ui/wireframe.svg); a cópia documental separada foi removida. Preservados arquivo V1 byte a byte, comparação/DEC-01, histórico, contrato, ADRs e migrations SQL (incluindo V2). Não é novo incremento funcional nem alteração dos resultados anteriores.

As contagens de 13-11 abaixo são **evidência documentada**, não reexecuções/certificação de logs nesta tarefa. Matriz de pendências em [coursework-review](coursework-review.md#pendências-e-decisões-humanas): CI atual positiva/negativa/uploads/retenção reais, revisão independente/humana/cliente, capacidade/backups/policy/p95/produção. Arquivar/documentar não resolve essas pendências nem equivale a revisão de segurança das extensões.

## Incremento autorizado atual — 13-11-2026

Autor aprovou as extensões, não cliente: V4/MAT global, tipo/peso/motivo, relações BLOCKS reais, anexos PostgreSQL, comentários multipart/histórico, Markdown/templates e detalhe partilhado. Referência HEAD `640b7e847f385cd69fabf0ff5ffd62dbf7f06cc2`, candidato `0.4.0-rc.1` sem bump/tag/publicação. As fases da ficha 03 abaixo são histórico do plano anterior; a exclusão de anexos foi substituída por este incremento.

| Entrega aprovada | Componentes consultados | Estado/evidência armazenada |
|---|---|---|
| Backend V4 | ApiModels/Inputs/ApiErrors, TaskController/Service, TaskLinkService, TaskAttachmentService/controller, TaskActivityService, application.yaml, migration V4 e ApiIntegrationTest | Contrato confrontado com código; log final 41 sem falhas/erros/skips, incluindo migração populada/vazia, grafo/locks/revogação/rollback e uploads reais. |
| Frontend | App/Tasks/types/api/estilos, detalhe/painel, Markdown/templates, links/anexos/atividade, manifests/testes/E2E | react-markdown 10.1.0 aprovada; reports anteriores 35/5 substituídos como resultado final por 43/6 após revisão. |
| Correções de revisão | Tasks/TaskDetail/TaskLinks, testes, E2E e vite.config.ts | Base suja só avança por resposta local reconhecida; retry não submete, seleção/Enter sem falso sucesso; descoberta TS+TSX é extensão técnica necessária. 43 testes em duas execuções finais e 6 E2E passaram. |
| Documentação autorizada | README, AGENTS, OpenAPI e requirements/constraints/user-stories/architecture/database/implementation-plan/test-plan/verification | Apenas estes 11 ficheiros, nenhum novo no repositório; implementação dirty, guião e índice preservados. Validação estática e leitura de reports, sem testes/builds/serviços. |
| Final integrado | Imagem final fresca, scans npm/JAR/Semgrep, E2E da mesma imagem, migração/persistência e revisão independente | **Validação local concluída**: 41/43/6, imagem/contentores novos, scans atuais e actionlint 1.7.7 PASS; V3 populada→V4/MAT/defaults no Maven, recriação app/db e outage/recovery próprios com dados/bytes/volume preservados. App/db próprios parados no fim, volume retido. **Revisão independente/humana e aceitação do cliente pendentes**, não incluídas no sucesso local. |

Critérios atuais em [requirements](requirements.md), [histórias](user-stories.md), [OpenAPI](../openapi.yaml) e [test-plan](test-plan.md). Preservar restantes permissões, sessão/CSRF e CI; sem Defcon/Goal, @mentions, notificações/serviços externos. Capacidade/backups/retention por decidir, sem autosweep.

O scan anterior à última revisão P2 e Semgrep pré-extensões permanecem históricos. A execução final atual cobre 294/294 pares npm e 63/63 bibliotecas do JAR entregue, Trivy 0 HIGH/CRITICAL; Semgrep 135 regras/47 alvos/0 findings. Scans e 6 E2E usaram a mesma imagem final fresca, não o contentor reutilizado da revisão UI anterior. Sucesso GitHub anterior reportado pelo autor não valida as novas funcionalidades remotamente: prova no âmbito/branch atual, uploads/retenção reais continuam pendentes. [Proveniência e pendências](verification.md#validação-final-local-das-extensões--execução-de-13-11-2026). Esta atualização documental não repetiu execuções.

## Decisões validadas pelo autor

Em 29-10-2026 o autor aprovou o âmbito integral da ficha 03, substituindo as exclusões da ficha 02: comentários, prioridade, pesquisa/filtros, edição/eliminação de projetos/tarefas e vários responsáveis. Escolheu Java 21, Spring Boot, React e PostgreSQL, mantendo o monólito modular.

O gestor gere o projeto, os membros e as atribuições. Todos os participantes ativos criam, editam e eliminam tarefas e comentam. Responsáveis são participantes ativos do mesmo projeto. A eliminação confirmada remove os dependentes numa transação. Permanecem os limites aprovados: projeto 1–120, tarefa 1–200 e descrições até 2 000 pontos de código após normalização de nome/título.

Aprovados: sessão HttpOnly e CSRF com Spring Security. A decisão de demonstração mais recente substitui OIDC por login local de contas ativas através de email e palavra-passe, hashes scrypt, erros genéricos e limitação de tentativas; não há registo público nem recuperação de palavra-passe. O autor autorizou preparar um Blueprint Render em Frankfurt com planos gratuitos e seed fictício ativo, exclusivamente para demonstração temporária e aceitando dados descartáveis. A demonstração está atualmente publicada em [https://matriz-demo-h27u.onrender.com](https://matriz-demo-h27u.onrender.com); a base de dados gratuita atual, com duração de 30 dias, expira em 2 de dezembro de 2026. Após expirar, há 14 dias para upgrade antes da eliminação; o serviço gratuito pode dormir após 15 minutos sem tráfego. A expiração da infraestrutura não substitui uma policy de retenção da aplicação. Retenção de um ano é pressuposto provisório sem purga; p95 é métrica sem alvo/carga; produção está diferida.

## Incrementos e verificações

| Incremento | Componentes previstos | Aceitação e verificação | Estado |
|---|---|---|---|
| 1 — Base e persistência | `backend/pom.xml`, aplicação/configuração, migration Flyway, seed opt-in, `.env.example`, `compose.yaml`, Dockerfile | Arranque com PostgreSQL; migration reproduzível; seed sem apagar dados; nenhum segredo real no repositório. | Verificado localmente |
| 2 — Identidade e projetos | Módulos `identity`, `projects`, segurança e erros comuns | Login local com sessão, perfil, logout, CSRF, autorização direta; CRUD/pesquisa/paginação de projetos e membros. | Implementado e verificado localmente |
| 3 — Tarefas e colaboração | Módulo `tasks`, validação partilhada e versão otimista | CRUD, filtros, prioridade, vários responsáveis sem duplicados, comentários com autor/data do servidor; integridade e concorrência. | Verificado localmente |
| 4 — Interface | `frontend/` React/TypeScript/Vite, cliente API e estilos | Cinco vistas ligadas à API, carregamento/vazio/erro/sucesso, formulários preservados e sem duplicação, layout adaptável. | Verificado localmente |
| 5 — Entrega | Testes backend/frontend, `docs/verification.md`, documentação e OpenAPI | Pelo menos validação, autorização e criação/consulta persistida; build e percurso real; evidência e limitações sem inventar resultados. | Ficha 03 em `e73250d`; revisão visual em `f780a29`; procedimentos de reprodução documentados |

Cada incremento é analisado e verificado antes do seguinte. O plano pode ser ajustado com evidência, sem alargar o âmbito autorizado. A revisão crítica final e qualquer refatoração separada são registadas em `verification.md`. Os exemplos de bugs dos anexos são cenários de teste, não bugs observados neste projeto.

## Ficheiros e limites

Criar `backend/` com código Java, SQL e testes; `frontend/` com código React, testes e manifests; configuração Docker e exemplo de ambiente. Atualizar requisitos, histórias, restrições, arquitetura, dados, API, README e AGENTS; manter o wireframe da ficha 02 identificado como referência histórica. Não alterar `.idea` nem o índice Git.

O login local e contas fictícias servem exclusivamente a demonstração. O Blueprint Render ativa o seed; visitantes poderão alterar os dados demo, que são descartáveis. Na entrega inicial, anexos ficaram fora do âmbito e não havia dados de aplicação anterior; V4 agora inclui anexos e migra tarefas V3 persistidas. Registo público, recuperação de palavra-passe, notificações, sprints e produção continuam excluídos. V3 adiciona email e índice único case-insensitive; V2 permanece no histórico de schema.

## Fecho das verificações

Em 29-10-2026: 7 testes Java, 7 testes de componentes e 2 E2E passaram; frontend compilado e aplicação completa construída/iniciada em Docker. Projeto, tarefa, comentário e responsável sobreviveram a reinício real; sessão antiga deixou de ser válida. Dependências de desenvolvimento corrigidas com aprovação adicional; `npm audit` completo sem alertas na execução final.

O contrato documenta 21 operações; foram verificados YAML, 99 referências, parâmetros de caminho e estrutura de oito respostas reais de leitura. Não foi instalado/executado um validador integral de OpenAPI. O relatório distingue esta limitação de testes funcionais bem-sucedidos.

O autor autorizou parar os serviços locais no final, sem apagar o volume. A entrega original foi depois aplicada e versionada pelo autor em `e73250d`. Isso não autoriza o agente a fazer commit/push, alterar o índice ou integrar esse commit nesta worktree.

## Iteração visual posterior

O autor aprovou adaptar a apresentação do Black Dashboard React sem novas dependências e esclareceu a direção final: manter o tema escuro/azul, mas usar navegação e conteúdo de espaço de trabalho ao estilo Jira. Implementação original, não importação do template, da sua stack ou de funcionalidades adicionais.

Criados `frontend/src/Layout.tsx` e `Layout.test.tsx`; atualizados `App.tsx`, `Projects.tsx`, `Tasks.tsx`, `ui.tsx`, `styles.css`, testes de componentes e E2E. Inclui barra global, navegação lateral/modal móvel, breadcrumbs, vistas, tabelas compactas e resumo de um projeto com dados reais. API, autenticação, permissões e dependências mantidas.

Verificação desta iteração: 13 testes de componentes, build TypeScript/Vite e três percursos E2E executados duas vezes (6 execuções sem falhas), com aplicação empacotada em Docker. Inspeção visual desktop/móvel e correção do foco sob a barra superior; detalhe em [verification.md](verification.md). No fecho da execução, serviços parados e volume conservado. O autor versionou depois a revisão visual em `f780a29`.

## Atualização documental e reprodução

Atualizados os registos de versionamento e as conclusões da comparação de prompts da ficha 01, realizada pelo autor no Gemini Pro, sem incluir os chats no repositório. A comparação reforça a análise de requisitos antes do desenho técnico e não introduz decisões de produto.

Para reproduzir a entrega, seguir os procedimentos de [verification.md](verification.md): usar uma cópia limpa do commit identificado, executar os comandos do README e os testes, percorrer os fluxos por teclado e validar contrato/diagramas. Para cada execução, registar versão, comando ou passos, resultado esperado, observado e evidência. Estes procedimentos não são apresentados como novas execuções realizadas nesta atualização documental.
