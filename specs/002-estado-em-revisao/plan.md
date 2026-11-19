# Implementation Plan: Estado «Em revisão»

**Branch**: não criada nem consultada; BRANCH devolvido pelo helper é o identificador da feature, não evidência Git.
**Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: `specs/002-estado-em-revisao/spec.md`, FR-001–010 e SC-001–006.

**Aprovação desta fase**: mensagem «Executa FASE SPECKIT-PLAN APROVADA», referindo a decisão do utilizador de 18-11-2026 às 23:08:48 UTC. Autoriza exclusivamente os cinco artefactos abaixo, não tarefas ou implementação. Os limites de fase anteriores em spec/checklist conservam a sua proveniência; não foram reescritos para registar esta aprovação posterior.

## Summary

Acrescentar futuramente IN_REVIEW («Em revisão») persistido imediatamente antes de cada nova entrada DONE. TODO→IN_REVIEW é permitido, qualquer participante ativo com permissão atual pode rever/concluir, sem novo papel. Preservar DONE→DONE, dados antigos, versões, locks, autorização, bloqueadores, motivo e histórico. Contar quatro estados e apenas DONE no numerador do progresso.

Desenho proposto: V5 amplia somente CHECK de status; TaskService valida origem persistida na transação; Progress.inReview é aditivo; UI usa base persistida segura, não uma seleção intermédia no rascunho. Sem dependências/endpoints novos.

Conflito deliberado aprovado para este incremento: RF-08/RN-07/US-08 canónicos ainda permitem conclusão direta e enumeram três estados. A implementação futura terá de os alinhar; esta fase não os altera nem anuncia o novo comportamento como implementado.

Exclusões: papéis/revisores atribuídos, separação autor/revisor, notificações,
novas dependências, schema alternativo, mudança de autenticação/permissões,
produção, publicação/release e operações Git. Nenhum commit, push, merge, tag,
deploy ou serviço é autorizado pelo plano.

## Technical Context

**Language/Version**: Java 21; React 19.2.0; TypeScript 5.9.3.

**Primary Dependencies**: Spring Boot 4.0.9/Security/JDBC/Flyway; Vite 7.3.7. Só dependências existentes.

**Storage**: PostgreSQL 17; task.status VARCHAR(20), default TODO e CHECK; histórico JSONB existente.

**Testing**: JUnit/Spring MVC/Testcontainers PostgreSQL; Vitest 4.1.12/Testing Library; Playwright 1.56.1, um worker. Apenas conferência documental nesta fase.

**Target Platform**: monólito web, estáticos/API no mesmo JAR; browser desktop/móvel. Vite separado só em desenvolvimento.

**Project Type**: aplicação web em monólito modular, sem ORM ou serviço adicional.

**Performance Goals**: não introduzir alvo; p95/carga continuam indefinidos. Preservar paginação e leitura global existentes.

**Constraints**: sessão Spring no servidor, CSRF, scrypt, participação ativa, lock/revalidação e versão atual; falhas explícitas/atómicas. Sem editar V1–V4, instalar ou usar serviços nesta fase.

**Scale/Scope**: um estado, uma contagem derivada e superfícies existentes. Sem nova escala, retenção, produção ou release.

## Constitution Check

Avaliação antes da investigação dirigida e após desenho contra a [constituição](../../.specify/memory/constitution.md) e [AGENTS.md](../../AGENTS.md):

| Princípio/gate | Antes | Após desenho |
|---|---|---|
| I — Fontes/rastreabilidade | Contexto/requisitos/restrições/histórias lidos; spec/checklist integralmente lidos | Apenas delta em specs; FR/SC rastreados; conflito RF-08/RN-07/US-08 identificado e alinhamento futuro previsto |
| II — Aprovação humana | Cinco caminhos expressamente autorizados | Escrita limitada a esses caminhos; sem tasks/feature.json/agent context ou fase seguinte |
| III — Arquitetura/produto | Stack/permissões confirmadas | Sem dependências, papéis, autenticação ou infraestrutura novos |
| IV — Dados/falhas | Só fontes necessárias; sem ambiente/segredos | Guarda dentro de transação/locks atuais; nenhum DML de conversão, backfill ou retry automático |
| V — Evidência | Pré-análise fornecida distinguida da observação atual | Pesquisa local dirigida, validações futuras explícitas; nenhuma execução de SC/testes declarada |

Gates documentais satisfeitos no âmbito de planeamento, sem exceção constitucional. Isto não é aplicação validada, aceitação do cliente ou autorização de implementar.

## Project Structure

### Documentation (this feature)

```text
specs/002-estado-em-revisao/
├── spec.md                        # existente; só leitura
├── checklists/requirements.md     # existente; só leitura, 16/16 revistos anteriormente
├── plan.md                        # autorizado nesta fase
├── research.md                    # autorizado nesta fase
├── data-model.md                  # autorizado nesta fase
├── contracts/status-delta.md      # único contrato delta autorizado
└── quickstart.md                  # autorizado nesta fase
```

`specs/002-estado-em-revisao/tasks.md` ainda não existe e requer aprovação exata antes de speckit-tasks. `.specify/feature.json` seleciona 002 e permanece só leitura. Nenhuma escrita em 001.

### Source Code (repository root)

Estrutura pertinente existente; não é autorização de alteração:

```text
backend/src/main/java/pt/matriz/
├── common/ApiModels.java, Inputs.java
├── projects/ProjectService.java
└── tasks/TaskService.java, TaskLinkService.java, TaskActivityService.java
backend/src/main/resources/db/migration/   # V1–V4; V5 só proposta
backend/src/test/java/pt/matriz/           # InputsTest.java, ApiIntegrationTest.java
frontend/src/                             # types, UI, projetos, tarefas/detalhe
frontend/e2e/matriz.spec.ts
docs/                                    # fontes canónicas, só leitura nesta fase
openapi.yaml
```

**Structure Decision**: conservar módulos e ficheiros existentes. Única criação de implementação prevista: `backend/src/main/resources/db/migration/V5__task_in_review.sql`, sujeita a autorização futura. Sem ficheiros de teste novos ou eliminações.

## Phase 0 — Research

[research.md](research.md) regista decisões, evidência local e alternativas descartadas. Confirmados DTOs/chamadores de progresso, CHECK V1, prática V4/teste histórico, base suja do editor, labels partilhadas, história em bruto e geometria do dashboard.

Sem ambiguidades técnicas consequenciais por resolver para decompor o desenho. Confirmar catálogo da constraint no futuro teste não substitui decisão funcional: V1 declara CHECK inline sem nome; PostgreSQL gera o nome esperado task_status_check. Divergência do schema real exige parar, não improvisar outra migration.

## Phase 1 — Design

- [data-model.md](data-model.md): domínio persistido/transições, contagem derivada e preservação V4→V5.
- [contracts/status-delta.md](contracts/status-delta.md): somente delta sobre [OpenAPI](../../openapi.yaml).
- [quickstart.md](quickstart.md): comandos existentes, cenários e gates de ambiente/evidência futura.

### Pacotes de trabalho futuros e caminhos exatos

ER-01–ER-07 são IDs de pacotes **deste plano**, não IDs T de tasks.md nem execução autorizada. Caminhos abaixo relativos à raiz. Todos podem ler os cinco artefactos desta fase, spec/checklist, AGENTS, constituição e fontes canónicas pertinentes.

**ER-01 — Contrato/gates. Responsável: Orquestrador Matriz, sem escrita.**
Confirmar aprovação futura de plano/caminhos, tasks e análise; coordenar concordância backend/frontend sobre enum/guarda/inReview/motivo/compatibilidade. Ler openapi.yaml, docs/requirements.md, docs/constraints.md, docs/user-stories.md e artefactos 002. Aceitação: delta acordado, exclusões preservadas; esta aprovação de plan não arranca implementação.

**ER-02 — Persistência, regra transacional e agregados. Responsável: Engenheiro Backend Matriz.**
Criação futura: `backend/src/main/resources/db/migration/V5__task_in_review.sql`.
Edição futura:
- `backend/src/main/java/pt/matriz/tasks/TaskService.java`
- `backend/src/main/java/pt/matriz/common/ApiModels.java`
- `backend/src/main/java/pt/matriz/common/Inputs.java`
- `backend/src/main/java/pt/matriz/projects/ProjectService.java`

Leitura adicional: migrations V1–V4, `backend/src/main/java/pt/matriz/tasks/TaskLinkService.java`, `backend/src/main/java/pt/matriz/tasks/TaskActivityService.java`, `backend/src/main/java/pt/matriz/common/ApiErrors.java`.
Aceitação: ampliar somente CHECK; nenhuma conversão/default novo/backfill. STATES/filtro aceitam revisão; nova entrada DONE exige before.status=IN_REVIEW, exceto manutenção DONE→DONE. Guarda após lock/revalidação/versão e antes de UPDATE/evento; 422 status, mensagem «Coloque a tarefa em revisão antes de a concluir.». Preservar restantes campos/validações, motivo e BLOCKS; bloqueadores só exigidos para DONE. Progress recebe long inReview, Inputs.progress quatro contagens e ProjectService a quarta agregação; total soma quatro, HALF_UP e numerador done intactos. Lista/detalhe de projetos e TaskPage.project.progress/TaskPage.progress recebem o delta. TaskLinkService já distingue DONE/não-DONE: não editar sem necessidade demonstrada e autorização adicional.

**ER-03 — Regressões backend/migrations. Responsável: Engenheiro Backend Matriz.**
Edição futura:
- `backend/src/test/java/pt/matriz/InputsTest.java`
- `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`

Aceitação: positivas/negativas e snapshot de recusa (dados/versão/datas/história), membro sem atribuição, abandono, desconhecido/closeReason, DONE antigo/DONE→DONE, reaberturas livres/protegidas, bloqueador em revisão, filtro/página/globais e quatro estados→25%. Cobrir conflito/concorrência/revogação após espera sem contornar locks. Atualizar fixtures que concluem legitimamente com gravação prévia IN_REVIEW; não modificar helper genérico para tornar toda recusa artificialmente válida. Fixar target("4") no segundo Flyway do teste histórico V3→V4 que espera uma migration; criar cenário V4 populada→V5 no mesmo ficheiro, com snapshots de tarefas/relações/história, um migrate e repetição zero. Arranque limpo aplica V1→V5. Fixtures de BLOCKS, races, rollback e motivo devem estar em revisão antes da tentativa crítica para não mascarar a proteção antiga.

**ER-04 — Interface/componentes. Responsável: Engenheiro Frontend Matriz.**
Edição futura:
- `frontend/src/types.ts`
- `frontend/src/ui.tsx`
- `frontend/src/Projects.tsx`
- `frontend/src/TaskDetail.tsx`
- `frontend/src/TaskActivity.tsx`
- `frontend/src/styles.css`
- `frontend/src/Tasks.test.tsx`
- `frontend/src/TaskDetail.test.tsx`
- `frontend/src/TaskDetailPanel.test.tsx`
- `frontend/src/TaskLinks.test.tsx`

Leitura adicional: `frontend/src/Tasks.tsx`, `frontend/src/TaskLinks.tsx`, `frontend/src/TaskDetailPanel.tsx`, `frontend/src/api.ts`. Tasks e TaskLinks já consomem statusLabels; nenhuma edição funcional destes dois ficheiros está pressuposta.
Aceitação: ordem TODO/IN_PROGRESS/IN_REVIEW/DONE e label comum, filtros/lista/relações por labels existentes; Progress tipado com inReview e fixtures completas. Editor mantém snapshot seguro do estado persistido associado à versão de base; DONE disponível apenas se essa base é IN_REVIEW ou DONE. Selecionar revisão e DONE no mesmo rascunho não satisfaz a regra: opção DONE desativada com explicação para base TODO/IN_PROGRESS, sem converter seleção, salvar automaticamente ou perder campos. Atualizar snapshot só na inicialização, save confirmado, refetch limpo, recuperação explicitamente confirmada ou reconhecimento local correspondente à base; nunca por GET externo sobre rascunho sujo. Defesa final permanece API/409/422. Histórico traduz apenas valores reconhecidos do campo status; não altera payload/outros campos/fallbacks. Dashboard apresenta quatro barras/cartões: redistribuir barras dentro do viewBox e adaptar grelha, sem append à fórmula 120+index*200. Preservar texto/desc, teclado/foco, guards e responsividade. Cobrir nos quatro testes existentes; teste de erro BLOCKS deve partir de base IN_REVIEW.

**ER-05 — Jornada integrada/apresentação. Responsável: Engenheiro Frontend Matriz.**
Edição futura: `frontend/e2e/matriz.spec.ts`. Leitura: `frontend/playwright.config.ts`, README e quickstart.
Aceitação: percursos existentes guardam revisão e aguardam confirmação antes de concluir; jornada P1 mostra impedimento de conclusão direta/API não contornável, reload persistido, abandono/devolução, filtros/agregados quatro estados. Verificar lista/detalhe painel/página/relação/história e dashboard sem clipping em desktop/390/320 px, por teclado e sem depender só de cor. Browser e avaliação visual humana são evidências separadas, não inferíveis de build. E2E e reinício dependem de gates operacionais próprios; não criar teste adicional em novo ficheiro.

**ER-06 — Alinhamento canónico. Responsável: Engenheiro de Documentacao e Configuracao Matriz.**
Edição futura proposta:
- `openapi.yaml`
- `README.md`
- `docs/requirements.md`
- `docs/user-stories.md`
- `docs/database.md`
- `docs/architecture.md`
- `docs/implementation-plan.md`
- `docs/test-plan.md`
- `docs/verification.md`

Aceitação: substituir DONE direto em RF-08/RN-07/US-08; refletir enum/422/inReview/fórmula, V5 e fluxos/globais; README e diagrama de arquitetura deixam de anunciar apenas V1–V4 para a versão alterada. Registar o incremento e resultados reais separados de 001. Não reescrever arquivos/históricos, migrar funcionalidades antigas para specs ou anunciar produção/release. Leitura de `docs/constraints.md`, `AGENTS.md`, `.github/skills/contexto-matriz/SKILL.md` e `.github/copilot-instructions.md` não revelou regra vigente de três estados/RN-07 ali copiada: sem edição desses quatro caminhos por formalidade. Pressupostos históricos de três estados em constraints ficam históricos. Se evidência futura exigir caminho adicional, pedir aprovação exata.

**ER-07 — Verificação/revisão independente. Responsáveis: executores respetivos e Revisor Matriz (só leitura).**
Sem novos caminhos de escrita para o Revisor. Validar delta/preservação/evidência contra FR/SC; revisão após backend, frontend e alinhamento final antes de fecho. Comandos/gates no quickstart, não executados nesta fase. Quando criado com aprovação própria, tasks.md terá único escritor designado, Engenheiro de Documentacao e Configuracao Matriz, que serializa os relatos; engenheiros não o atualizam concorrentemente. Orquestrador não escreve ficheiros.

### Rastreabilidade e verificações futuras

| Requisito | SC | Pacotes | Caminhos principais | Evidência futura |
|---|---|---|---|---|
| FR-001 | SC-004/005 | ER-02/03/04/06 | V5, TaskService, types, OpenAPI/dados | enum/default/desconhecido, leitura persistida/upgrade |
| FR-002 | SC-001/002 | ER-02/03/04/05 | TaskService, ApiIntegrationTest, TaskDetail/testes/E2E | recusas diretas; origem persistida; abandono; review→DONE |
| FR-003 | SC-002/006 | ER-02/03/04/05 | serviço/editor e testes | entradas/devoluções/reabertura |
| FR-004 | SC-002 | ER-02/03/05 | TaskService, ApiIntegrationTest, E2E | membro ativo sem atribuição, sem papel novo |
| FR-005 | SC-004 | ER-04/05/06 | types, TaskActivity, Projects, CSS/testes | labels/ordem/filtro/relação/história, teclado/geometria |
| FR-006 | SC-003 | ER-02/03/04/05 | ApiModels, Inputs, ProjectService, ui, Projects/fixtures | quatro tarefas/uma revisão/25%; filtros/páginas globais |
| FR-007 | SC-005 | ER-02/03/06 | V5, ApiIntegrationTest, docs/database | snapshot V4→V5 igual; antigos DONE editáveis; zero backfill |
| FR-008 | SC-006 | ER-02/03/04/05 | TaskService; leitura TaskLinkService; testes | review bloqueia dependente; review permitida bloqueada; motivo/reabertura |
| FR-009 | SC-004/005 | ER-02/03/05/07 | TaskService, ApiIntegrationTest, E2E | história tipada/reload; reinício só com autorização própria |
| FR-010 | SC-001/002 | ER-02/03/04/05/07 | TaskService, ApiIntegrationTest, TaskDetail/testes | HTTP direto 422/409; atomicidade; draft conservado; revogação/locks |

### Ordem, dependências e condições de paragem

Preferência sequencial: ER-01 → ER-02 → ER-03 → revisão backend → ER-04 → revisão frontend → ER-05 → ER-06 → ER-07 final. Cada executor valida apenas no ambiente/caminhos autorizados; execução operacional pode ficar bloqueada mesmo após edição.

Nenhum lote paralelo prescrito. Backend/frontend só poderiam ser paralelos depois de contrato acordado, sem conflito de leitura/escrita, tasks partilhado ou recurso de validação; exigiriam coordenação explícita, máximo três tarefas por lote. Não partilhar ambiente E2E/reinício com outro executor.

Parar perante falta de aprovação de tasks/implementação/caminhos, schema/constraint divergente, consumidor adicional não coberto, necessidade de novo ficheiro/teste/dependência, requisito consequencial por resolver, mudança de permissões ou ambiente não autorizado. Não contornar com SQL alternativo, hooks, edição de V1–V4 ou relaxamento dos testes existentes.

## Validation and phase record

Skills seguidas por leitura dos SKILL.md: contexto-matriz, validacao-matriz e speckit-plan. Sem mecanismo de invocação direta nesta sessão; não se afirma nova invocação nativa. Sem delegação.

Helper inspecionado antes de executar, incluindo common.ps1 e resolvedor: com inventário atual sem presets/extensões, não percorre o ramo de manifest que cria temporários. Setup usa Resolve-TemplateContent com precedência/composição override/preset/extension/core; sem copiar manualmente template fixo. Execução real na raiz:

```powershell
$env:SPECIFY_FEATURE_NO_PERSIST='1'
$env:SPECIFY_INIT_DIR='c:\Users\CTW03863\Desktop\Projects\matriz-ai-powered'
$env:SPECIFY_FEATURE_DIRECTORY='specs\002-estado-em-revisao'
& 'c:\Users\CTW03863\Desktop\Projects\matriz-ai-powered\.specify\scripts\powershell\setup-plan.ps1' -Json
```

Exit 0; `Copied plan template to ...\specs\002-estado-em-revisao\plan.md`. JSON resolveu FEATURE_SPEC, IMPL_PLAN e FEATURE_DIR para 002 e BRANCH para o identificador 002. NoPersist impede gravação de feature.json. Redações finais por apply_patch.

Conferência desta fase: releitura integral dos cinco artefactos, headings do template devolvido, links/caminhos/FR/SC e limites; pesquisa textual sem placeholders do template ou espaços finais nos cinco ficheiros. Não são testes de aplicação. Sem Git status/diff/diff --check ou comparação empírica do índice; preservação limitada às ações efetuadas e à releitura de feature.json (continua 002), não certificação do estado Git. Sem comandos arbitrários, builds, testes, instalações, rede, serviços, migrations executadas ou hooks. extensions.yml não encontrado nas verificações pré-plano e pós-escrita; sem hooks a despachar.

speckit-analyze não executado: falta tasks.md. Só após aprovação exata/geração de tasks, análise readonly com SPECIFY_FEATURE_NO_PERSIST=1; correções de artefactos em fase autorizada separada. Fase seguinte não iniciada; implementação exige nova aprovação distinta de autorização de artefactos.

## Complexity Tracking

Sem violações ou complexidade adicional a justificar. Não se propõe novo módulo, papel, tabela de revisão, evento de aprovação, endpoint ou dependência.
