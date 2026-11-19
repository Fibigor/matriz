# Tasks: Estado «Em revisão» obrigatório antes da conclusão

**Input**: [spec.md](spec.md), [checklist](checklists/requirements.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contrato delta](contracts/status-delta.md) e [quickstart.md](quickstart.md), feature 002.

**Estado vigente — serialização final autorizada de 19-11-2026:** T001–T043
concluídas (**43/43**); **G0–G5 aprovados, T043 fechada após conferências PASS**.
T041/G4 aprovado por `review-002-g4-01-fecho`, após resolução de G4-01.
T034/G3 aprovado sem achados por `review-002-g3-persistencia`.
Âmbitos restritos de preflight/geração e notas de progresso anteriores
abaixo conservam a fase de origem; a consolidação T028–T040 e o registo
G4 limitado a tasks/verification constam nas secções finais como histórico.
G5 aprovado por `review-002-g5-final`; [registo final e limites](../../docs/verification.md#feature-002-fecho-final).

**Prerequisites — proveniência da geração**: desenho aprovado segundo handover `review-plan-002-em-revisao`, então sem implementação. Aprovação de geração recebida em 18-11-2026, referindo 23:21:18 UTC. Essa fase criou apenas este ficheiro; análise readonly e aprovação de implementação eram futuras. Os limites de fases anteriores nos documentos de entrada são proveniência histórica, não foram reescritos.

**Histórico — autorização de preflight 002**: segundo o handover recebido, `analyze-002-em-revisao` foi realizado e aprovado: zero findings, cobertura FR/SC 100%, dez campos e 43 tarefas/DAG conferidos. É evidência recebida, não nova análise desta sessão. O utilizador aprovou em **2026-11-18T23:33:19Z**, com «sim», implementar T001–T043 nos caminhos definidos, incluindo V5/testes/documentação, mantendo gates próprios E2E/reinício/visual e sem commit/push/publicação. A atribuição presente é exclusivamente T001/T002 e registo de progresso por DocConfig, escritor único: única escrita em `specs/002-estado-em-revisao/tasks.md`, sem código, testes executados ou alterações de outros IDs/checklists. T003/G0 pelo Revisor continua obrigatório antes do backend.

**Tests**: explicitamente pedidos em spec/plano; tarefas incluem preparação RED, implementação e confirmação GREEN futura. Nenhum teste, SC, revisão de aplicação ou gate operacional passou por gerar esta lista.

**Organization**: US1 P1 (revisão obrigatória), US3 P1 (compatibilidade/BLOCKS), US2 P2 (visibilidade). Para respeitar a sequência do plano, as histórias são divididas em fatias backend e frontend, mantendo essa prioridade dentro de cada lote, com gate backend antes de qualquer frontend. Não se entrega US1 isolada das proteções de US3. Fases partilhadas não recebem rótulo de história.

## Format: `[ID] [P?] [Story] Description`

- Todas as tarefas começam desmarcadas; IDs T únicos e sequenciais.
- `[US1]`, `[US3]`, `[US2]` referem exclusivamente as histórias de [spec.md](spec.md); não a US-08 canónica.
- `Executor` identifica o responsável futuro, não uma delegação nesta fase. `Deps: nenhuma` ou IDs exatos definem pré-requisitos cumulativos.
- Nenhuma tarefa tem marcador de paralelismo: ficheiros, contrato e recursos de validação partilhados tornam o fluxo sequencial preferível.
- Caminhos em backticks são relativos à raiz; links de desenho são relativos a este ficheiro.

## Path Conventions e limites de escrita

Neste preflight, único caminho de escrita: `specs/002-estado-em-revisao/tasks.md`. A aprovação global acima cobre os caminhos exatos de ER-01–ER-07, sujeitos às dependências/gates; não atribui a esta sessão a sua escrita/execução. Confirmados sete caminhos backend de ER-02/03, dez frontend de ER-04, o E2E existente de ER-05 e nove canónicos de ER-06; nenhum caminho adicional. O plano prevê uma única criação de implementação: `backend/src/main/resources/db/migration/V5__task_in_review.sql`. Não criar ficheiros de teste adicionais.

Backend, Frontend, Orquestrador e Revisor entregam relatos na resposta; não editam este ficheiro nem criam relatórios/tracking. O Engenheiro de Documentacao e Configuracao Matriz (DocConfig) é o único escritor de tasks; a presente autorização de progresso cobre apenas T001/T002, com escritas serializadas. Restantes atualizações exigem IDs expressamente atribuídos e evidência identificada. Implementação concluída não equivale a validação/revisão concluída: tarefas de teste/gate bloqueadas continuam abertas.

Evidência futura dos executores/revisores será consolidada por DocConfig em `docs/verification.md`, **apenas após aprovação desse caminho**, por T039. Até lá, respostas identificadas pelo ID da tarefa e gate são a proveniência; nenhum ficheiro extra. Cada relato deve identificar leitura/escrita, comandos literais, ambiente, horários, exits, totais, falhas/limitações e ligação à evidência disponível, sem segredos.

Fontes canónicas continuam [requisitos](../../docs/requirements.md), [restrições](../../docs/constraints.md), [histórias](../../docs/user-stories.md), [dados](../../docs/database.md) e [OpenAPI](../../openapi.yaml). O conflito deliberado RF-08/RN-07/US-08 só será resolvido em T035–T038, não nesta geração.

## Phase 1: Setup — aprovação e prontidão, sem scaffold

**Purpose**: confirmar o incremento e separar autorização documental, implementação e operações. Sem inicializar bibliotecas, instalar dependências, criar estrutura ou fazer commits.

- [x] T001 Confirmar análise readonly posterior, aprovação exata de implementação e caminhos de ER-01–ER-07, entrega coordenada enum/guarda/inReview/motivo e exclusões; ler `specs/002-estado-em-revisao/spec.md`, `specs/002-estado-em-revisao/plan.md`, `specs/002-estado-em-revisao/tasks.md`, `specs/002-estado-em-revisao/contracts/status-delta.md`, `openapi.yaml`, `docs/requirements.md`, `docs/constraints.md`, `docs/user-stories.md`, `AGENTS.md` e `.specify/memory/constitution.md`. Executor: Orquestrador, só leitura. Deps: nenhuma. Bloqueia implementação até aprovação; não executar análise nem gerar outro artefacto por esta tarefa.
- [x] T002 Confirmar autorização e disponibilidade de Java/Maven/Docker para testes PostgreSQL Testcontainers isolados e de dependências frontend já instaladas, consultando `backend/pom.xml`, `frontend/package.json`, `README.md` e `specs/002-estado-em-revisao/quickstart.md`; separar aprovação de edição da execução e indicar o que permanece bloqueado. Executor: Orquestrador, só leitura. Deps: T001. Sem instalação/serviços/seed; este gate não aprova E2E ou reinício.
- [x] T003 Rever readonly o acordo de desenho e âmbito de T001–T002 contra `specs/002-estado-em-revisao/data-model.md`, `specs/002-estado-em-revisao/contracts/status-delta.md`, `openapi.yaml`, `docs/database.md` e `docs/requirements.md`; confirmar que a lista cobre origem persistida, invariantes e quatro contagens, sem redesenhar o plano. Executor: Revisor Matriz. Deps: T002. Evidência: resposta gate G0, arquivo futuro em `docs/verification.md` por T039; nenhum report novo.

**Checkpoint**: G0 e aprovações confirmados; nenhuma prontidão operacional é presumida de execuções antigas.

## Phase 2: Foundational — domínio persistido comum

**Purpose**: ampliar apenas o domínio da coluna existente, pré-requisito das três histórias.

- [x] T004 Preparar teste RED do catálogo/default/domínio em `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`: schema até V4 confirma nome/corpo esperado de task_status_check e preservação de task_close_reason_status; cadeia limpa futura aceita IN_REVIEW, mantém TODO inicial e rejeita desconhecido/motivo não-DONE. Referenciar `task.status` e `task.close_reason` em [modelo §1](data-model.md#1-tarefa-domínio-de-estado), [§3](data-model.md#3-evolução-física-futura) e [dados canónicos](../../docs/database.md#entidades-cardinalidades-e-integridade). Executor: Backend. Deps: T003. Executar RED apenas se T002 autorizar; divergência do catálogo bloqueia T005, sem heurística SQL.
- [x] T005 Criar apenas `backend/src/main/resources/db/migration/V5__task_in_review.sql`, substituindo CHECK de `task.status` pelo domínio de quatro estados conforme [modelo §1](data-model.md#1-tarefa-domínio-de-estado) e [§3](data-model.md#3-evolução-física-futura), com nome estável e preservação de `task.close_reason`/CHECK V4 conforme [dados canónicos](../../docs/database.md#evolução-física-confirmada). Executor: Backend. Deps: T004. Só DDL do CHECK: nenhum DML, default novo, backfill, alteração de colunas/índices ou V1–V4; confirmar GREEN do caso de domínio quando execução autorizada.

**Checkpoint**: fundação desenhada e testável; prova completa de upgrade populado continua em T011/T015.

## Phase 3: US1 — submeter a revisão antes de concluir, backend (P1)

**Goal**: impor origem imediatamente persistida na API existente, sem novos papéis.

**Independent Test**: tarefas próprias preparadas diretamente nos estados necessários; chamadas HTTP atuais/válidas recusam TODO/IN_PROGRESS→DONE e aceitam revisão guardada→DONE por membro ativo sem atribuição. Não depende da UI nem de executar US2.

### Tests for US1 — RED antes da guarda

- [x] T006 [US1] Acrescentar testes RED em `backend/src/test/java/pt/matriz/ApiIntegrationTest.java` para TODO→IN_REVIEW, IN_PROGRESS→IN_REVIEW, devolução aos dois estados, mesma pessoa/membro ativo não atribuído a rever/concluir e abandono de revisão seguido de DONE recusado. Nas negativas diretas TODO/IN_PROGRESS→DONE, pedir campos/versão válidos e provar 422 status/mensagem de revisão e igualdade de dados/versão/datas/histórico, sem depender de bloqueador para recusar. Executor: Backend. Deps: T005. FR-002/003/004/010, SC-001/002.

### Implementation for US1

- [x] T007 [US1] Ampliar STATES/validação do filtro e PUT em `backend/src/main/java/pt/matriz/tasks/TaskService.java` para `task.status` segundo [modelo §1](data-model.md#1-tarefa-domínio-de-estado), [§2](data-model.md#2-matriz-de-transições), [contrato C-02](contracts/status-delta.md#c-02--escrita-e-origem-imediatamente-persistida) e [RN-05/09/14–16/19 canónicas](../../docs/requirements.md#regras-em-vigor). Nova entrada DONE exige before.status=IN_REVIEW; DONE→DONE é manutenção. Guarda após autorização/lock de projeto, revalidação de ator e versão, antes do UPDATE/evento e da consulta de bloqueadores para entrada direta válida; devolver 422 status «Coloque a tarefa em revisão antes de a concluir.». Preservar ordem dos restantes erros, transação, sessão/CSRF, `task.close_reason` conforme [modelo §1–2](data-model.md#2-matriz-de-transições) e `task_activity.payload` conforme [modelo §5](data-model.md#5-histórico-e-relações), sem escrita de revisão automática/histórica. Executor: Backend. Deps: T006.
- [x] T008 [US1] Atualizar explicitamente fixtures antigas de conclusão legítima em `backend/src/test/java/pt/matriz/ApiIntegrationTest.java` para guardar IN_REVIEW e usar a versão confirmada antes de DONE; cobrir as duas gravações/eventos e novo GET persistido. Manter as negativas TODO/IN_PROGRESS→DONE de T006 sem preparação de revisão e não generalizar helper que esconderia recusas. Reexecutar seleção US1 para confirmação GREEN quando autorizada; suite integral em T015. Executor: Backend. Deps: T007. FR-001/002/009/010, SC-001/002/004.

**Checkpoint**: núcleo obrigatório preparado; US1 não é entrega segura sem US3 e G1.

## Phase 4: US3 — compatibilidade e bloqueios, backend (P1)

**Goal**: preservar dados antigos, DONE→DONE e proteções originais, sem fazer os testes passarem pela razão errada.

**Independent Test**: amostra V4 populada e grafo fictício próprios; comparação de snapshots e transições críticas com origem IN_REVIEW assegurada, sem executar a jornada US1 como preparação.

### Tests and compatibility implementation for US3

- [x] T009 [US3] Expandir regressões em `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`: DONE antigo/DONE→DONE sem revisão artificial, motivo omitido preservado, entrada desde revisão sem motivo null, motivo não null em revisão recusado, reaberturas livres para três não-DONE limpam motivo e reduzem progresso; manutenção sem alteração efetiva incrementa versão sem evento. Provar entrada em revisão mesmo bloqueada, bloqueador IN_REVIEW pendente, conclusão desde revisão bloqueada, reabertura para revisão com dependente DONE recusada e criação BLOCKS de revisão para DONE recusada; remoção/eliminação desbloqueia sem mudar dependente. Respeitar `task.status`/`task.close_reason` em [modelo §1–2](data-model.md#2-matriz-de-transições), `task_activity.payload` em [§5](data-model.md#5-histórico-e-relações) e [RN-13–16/19](../../docs/requirements.md#regras-em-vigor). Executor: Backend. Deps: T008. FR-007/008, SC-005/006.
- [x] T010 [US3] Adaptar fixtures/asserts de concorrência, revogação/inatividade após espera, versão antiga, inserção concorrente de bloqueador, conclusão/reabertura e rollback tardio em `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`; preparar IN_REVIEW persistido antes de cada tentativa crítica de conclusão para que 409/401/403/422 BLOCKS/falha DB continuem a demonstrar a proteção original, não a nova guarda. Manter snapshots atómicos e regressão não participante/CSRF. Ler `backend/src/main/java/pt/matriz/tasks/TaskService.java`, `backend/src/main/java/pt/matriz/tasks/TaskLinkService.java` e `backend/src/main/java/pt/matriz/tasks/TaskActivityService.java`; não editar estes dois últimos. Executor: Backend. Deps: T009. FR-004/008/010, SC-001/006.
- [x] T011 [US3] No mesmo `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`, fixar target("4") no segundo Flyway de populatedV3MigrationAssignsDeterministicGlobalKeysWithoutChangingDatesVersionsOrInventingHistory, conservando a prova V3→V4; acrescentar cenário V4 populada→V5 com estados antigos/DONE com motivo, datas/versões distintas, relações e história. Comparar snapshots completos antes/depois (incluindo identidades/chaves/restantes atributos), uma migration e repetição zero; confirmar catálogo de ambos os CHECKs e cadeia limpa V1→V5. Referências: `task.status`, `task.close_reason` [modelo §1](data-model.md#1-tarefa-domínio-de-estado), `task_activity.payload` [§5](data-model.md#5-histórico-e-relações), preservação [§3](data-model.md#3-evolução-física-futura) e [migrations canónicas](../../docs/database.md#evolução-física-confirmada). Executor: Backend. Deps: T010. FR-001/007/008/009, SC-004/005/006; sem alterar migrations antigas nem produzir backfill.

**Checkpoint**: regressões de compatibilidade implementadas nos testes existentes; falha que exija desenho/caminho adicional bloqueia e regressa à aprovação, não autoriza editar TaskLinkService.

## Phase 5: US2 — quatro estados e agregados globais, backend (P2)

**Goal**: não perder revisão do total nem tratá-la como concluída.

**Independent Test**: preparar projeto vazio, casos de arredondamento e projeto com uma tarefa por estado; consultar todos os DTOs de progresso e filtrar/paginar independentemente da jornada de edição.

### Tests for US2 — RED do agregado

- [x] T012 [US2] Adaptar chamadas de progresso e acrescentar casos RED em `backend/src/test/java/pt/matriz/InputsTest.java`: quatro contagens, 4 totais/1 revisão/25%, vazio e arredondamentos existentes, só DONE no numerador independentemente de motivo/peso. Citar `ApiModels.Progress.inReview`, `ApiModels.Progress.total`, `ApiModels.Progress.completedPercent` e contagens `ApiModels.Progress.todo`, `ApiModels.Progress.inProgress`, `ApiModels.Progress.done` em [modelo §4](data-model.md#4-progresso-do-projeto-apenas-derivado) e [RN-08/13](../../docs/requirements.md#regras-em-vigor). Executor: Backend. Deps: T011.
- [x] T013 [US2] Acrescentar testes RED em `backend/src/test/java/pt/matriz/ApiIntegrationTest.java` para filtro IN_REVIEW/desconhecido e quatro estados→25% na lista/detalhe de projeto e nos dois agregados TaskPage.project.progress/TaskPage.progress; filtro/priority/página/tamanho afetam apenas itens/paginação, não globais; projeto vazio continua coerente. Preparar DONE legitimamente após revisão sem remover negativas US1 e verificar leitura persistida/história tipada. Executor: Backend. Deps: T012. FR-005/006/009, SC-003/004.

### Implementation for US2

- [x] T014 [US2] Alterar conjuntamente `backend/src/main/java/pt/matriz/common/ApiModels.java`, `backend/src/main/java/pt/matriz/common/Inputs.java` e `backend/src/main/java/pt/matriz/projects/ProjectService.java`: `ApiModels.Progress.inReview` obrigatório/não negativo e demais campos `ApiModels.Progress.todo`, `ApiModels.Progress.inProgress`, `ApiModels.Progress.done`, `ApiModels.Progress.total`, `ApiModels.Progress.completedPercent` seguem [modelo §4](data-model.md#4-progresso-do-projeto-apenas-derivado), [contrato C-04](contracts/status-delta.md#c-04--progress-aditivo-e-global) e [progresso canónico](../../docs/database.md#eliminação-índices-e-dados-derivados). Inputs.progress recebe quatro contagens; total soma quatro, numerador só done e HALF_UP/vazio preservados. ProjectService agrega IN_REVIEW global e propaga ProjectView e ambos TaskPage sem cache/coluna nem agregado filtrado; não manter sobrecarga de três contagens que omita revisão. Executor: Backend. Deps: T013.

**Checkpoint**: backend completo para as três histórias, ainda sujeito à execução e revisão.

## Phase 6: Gate backend — partilhado

- [x] T015 Executar validação backend autorizada com `mvn -f backend\pom.xml test '-Dapi.version=1.44'` na raiz, usando apenas PostgreSQL Testcontainers isolado; cobrir `backend/src/test/java/pt/matriz/InputsTest.java` e `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`, incluindo domínio/catálogo, ambos upgrades, arranque limpo, atomicidade, permissões e corridas. Executor: Backend. Deps: T014, T002. Evidência na resposta e consolidação futura T039 em `docs/verification.md`; relatar RED/GREEN observados separadamente, ou bloqueio sem inventar execução.
- [x] T016 Rever readonly lote backend e evidência T004–T015: `backend/src/main/resources/db/migration/V5__task_in_review.sql`, `backend/src/main/java/pt/matriz/tasks/TaskService.java`, `backend/src/main/java/pt/matriz/common/ApiModels.java`, `backend/src/main/java/pt/matriz/common/Inputs.java`, `backend/src/main/java/pt/matriz/projects/ProjectService.java`, `backend/src/test/java/pt/matriz/InputsTest.java`, `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`; confrontar [modelo](data-model.md), [contrato](contracts/status-delta.md), migrations V1–V4 e ler `backend/src/main/java/pt/matriz/tasks/TaskLinkService.java`. Executor: Revisor Matriz. Deps: T015. Gate G1 exige provas não mascaradas de bloqueios/concorrência/migration, sem executar testes ou escrever; resposta identificada, arquivo futuro `docs/verification.md` por T039. Bloqueio/findings não libertam frontend.

## Phase 7: Foundational frontend — contrato e fixtures partilhadas

- [x] T017 Atualizar `frontend/src/types.ts` com Status/labels na ordem TODO, IN_PROGRESS, IN_REVIEW, DONE e «Em revisão», Progress.inReview obrigatório; completar todas as fixtures Progress existentes em `frontend/src/Tasks.test.tsx`, `frontend/src/TaskDetail.test.tsx` e `frontend/src/TaskDetailPanel.test.tsx`, com total de quatro estados coerente. Citar `task.status` [modelo §1](data-model.md#1-tarefa-domínio-de-estado), `TaskReference.status` [§5](data-model.md#5-histórico-e-relações) e correspondência DTO/frontend de `ApiModels.Progress.inReview`, `ApiModels.Progress.total`, `ApiModels.Progress.completedPercent`, `ApiModels.Progress.todo`, `ApiModels.Progress.inProgress`, `ApiModels.Progress.done` [§4](data-model.md#4-progresso-do-projeto-apenas-derivado); fonte canónica [OpenAPI](../../openapi.yaml). Executor: Frontend. Deps: T016. Não editar common types em paralelo nem inventar Projects.test.tsx/fixture Progress em TaskLinks sem evidência; testes comportamentais RED nas fases seguintes.

## Phase 8: US1 — base persistida segura no editor, frontend (P1)

**Goal**: exigir guardar revisão antes de escolher DONE, sem substituir a defesa API.

**Independent Test**: mocks dos estados/versões de base em detalhe/painel, sem percorrer US2; draft, save confirmado e refetch distinguem persistência de mera seleção.

### Tests for US1 — RED do editor

- [x] T018 [US1] Acrescentar casos RED em `frontend/src/TaskDetail.test.tsx` e `frontend/src/TaskDetailPanel.test.tsx`: DONE desativado/explicação em base TODO/IN_PROGRESS; escolher IN_REVIEW no mesmo draft não habilita DONE, sem auto-save; save de revisão confirmado habilita; 422/409/transporte preservam texto/base e não repetem escrita. Refetch externo com dirty, acesso painel/página e mudança de layout não promovem base; refetch limpo/recuperação confirmada e reconhecimento local de versão correspondente são distinguidos. Executor: Frontend. Deps: T017. FR-002/003/010, SC-001/002.

### Implementation for US1

- [x] T019 [US1] Implementar em `frontend/src/TaskDetail.tsx` snapshot seguro de estado persistido associado à versão-base, separado de `values.status`, conforme [modelo §6](data-model.md#6-estado-local-de-edição-não-persistência-adicional), domínio `task.status` [§1–2](data-model.md#2-matriz-de-transições) e [RN-09/18 canónicas](../../docs/requirements.md#regras-em-vigor). Só base IN_REVIEW/DONE permite DONE; explicar necessidade de guardar revisão, sem converter escolha nem fazer duas escritas automáticas. Avançar base apenas na inicialização/save confirmado/refetch limpo/recuperação explicitamente confirmada ou reconhecimento local com identidade/previousVersion correspondentes; GET externo sujo e falhas não avançam. Não inventar campo persistido/API/storage para snapshot. Executor: Frontend. Deps: T018.
- [x] T020 [US1] Confirmar GREEN dos casos do editor em `frontend/src/TaskDetail.test.tsx` e `frontend/src/TaskDetailPanel.test.tsx`, incluindo devoluções revisão→TODO/IN_PROGRESS, abandono seguido de DONE indisponível e draft conservado com erro da API. Preservar guards, foco/Escape/inert, templates por ciclo e reconhecimento local de atribuição/relação sem perder campos editáveis. Executor: Frontend. Deps: T019. Executar apenas testes existentes sob T002; full/build em T025, sem anunciar validação browser.

**Checkpoint**: UI não permite revisão fictícia no rascunho; G2 ainda obrigatório.

## Phase 9: US3 — compatibilidade do editor (P1)

**Goal**: edição de DONE existente e erro real BLOCKS continuam alcançáveis.

**Independent Test**: fixtures DONE e IN_REVIEW independentes; sem gravar uma jornada prévia só para habilitar o caso crítico.

- [x] T021 [US3] Adaptar/ampliar regressões em `frontend/src/TaskDetail.test.tsx` e `frontend/src/TaskDetailPanel.test.tsx`: edição DONE→DONE antiga mantém disponibilidade e semântica de motivo; reabertura/limpeza e preservação do draft perante recusa. O teste de 422 BLOCKS parte de base IN_REVIEW persistida e continua a atingir a API/mostrar mensagem original, não fica barrado pela opção DONE; fechar com motivo segue `task.close_reason` [modelo §1–2](data-model.md#2-matriz-de-transições) e [RN-14/15](../../docs/requirements.md#regras-em-vigor). Executor: Frontend. Deps: T020. FR-007/008/010, SC-005/006; se exigir mudança funcional fora de T019/caminhos aprovados, parar e pedir aprovação.

## Phase 10: US2 — superfícies e progresso, frontend (P2)

**Goal**: reconhecer revisão em todas as consultas e apresentar quatro estados sem clipping.

**Independent Test**: fixtures com uma tarefa de cada estado e eventos tipados conhecidos/desconhecidos; filtros e globais testados sem executar a história de edição.

### Tests for US2 — RED de apresentação

- [x] T022 [US2] Ampliar `frontend/src/Tasks.test.tsx`, `frontend/src/TaskLinks.test.tsx` e `frontend/src/TaskDetail.test.tsx` com ordem/label de revisão em filtro/lista/detalhe/relação e old/new status no histórico; provar fallback desconhecido e priority/type/outros campos não traduzidos indevidamente. Usar fixtures quatro estados/25%, filtro com globais constantes, vazio e fixtures completas de T017; montar componentes exportados existentes apenas nesses ficheiros se necessário, sem criar testes novos. Executor: Frontend. Deps: T021. FR-005/006/009, SC-003/004; geometria/browser não se provam por DOM isolado.

### Implementation for US2

- [x] T023 [US2] Alterar `frontend/src/ui.tsx`, `frontend/src/Projects.tsx` e `frontend/src/styles.css` para consumir quarta contagem e desenhar quatro barras/cartões legíveis; redistribuir barras dentro do viewBox e adaptar grelha, sem acrescentar quarta barra à fórmula antiga 120+index*200. Seguir `ApiModels.Progress.inReview`, `ApiModels.Progress.total`, `ApiModels.Progress.completedPercent` e contagens `ApiModels.Progress.todo`, `ApiModels.Progress.inProgress`, `ApiModels.Progress.done` em [modelo §4](data-model.md#4-progresso-do-projeto-apenas-derivado), [contrato C-04/05](contracts/status-delta.md#c-04--progress-aditivo-e-global) e [RN-08](../../docs/requirements.md#regras-em-vigor). Preservar texto/descrição, vazio, só DONE no progresso e acessibilidade não dependente de cor; ler `frontend/src/Tasks.tsx` e `frontend/src/TaskLinks.tsx` para confirmar propagação das labels sem pressupor edição destes ficheiros. Executor: Frontend. Deps: T022.
- [x] T024 [US2] Traduzir em `frontend/src/TaskActivity.tsx` apenas old/new reconhecidos quando field=status, conforme `task_activity.payload` [modelo §5](data-model.md#5-histórico-e-relações), domínio `task.status` [§1](data-model.md#1-tarefa-domínio-de-estado) e [RN-19](../../docs/requirements.md#regras-em-vigor). Manter payload/tipos/fallbacks e apresentação dos demais campos intactos, usar label comum e confirmar GREEN dos casos de T022 nos mesmos testes existentes. Executor: Frontend. Deps: T023.

**Checkpoint**: frontend completo nas três histórias; sem declarar SC visual/persistência provado.

## Phase 11: Gate frontend — partilhado

- [x] T025 Executar em `frontend` os comandos existentes `npm test` e `npm run build`, apenas com prontidão/autorização de T002, cobrindo `frontend/src/Tasks.test.tsx`, `frontend/src/TaskDetail.test.tsx`, `frontend/src/TaskDetailPanel.test.tsx`, `frontend/src/TaskLinks.test.tsx` e consumidores de `frontend/src/types.ts`. Executor: Frontend. Deps: T024, T002. Evidência: resposta com RED/GREEN, exits/totais/falhas e limitações, arquivo futuro `docs/verification.md` por T039; não inferir geometria/teclado browser do build.
- [x] T026 Rever readonly `frontend/src/types.ts`, `frontend/src/ui.tsx`, `frontend/src/Projects.tsx`, `frontend/src/TaskDetail.tsx`, `frontend/src/TaskActivity.tsx`, `frontend/src/styles.css` e os quatro testes de T025, contra `specs/002-estado-em-revisao/data-model.md`, `specs/002-estado-em-revisao/contracts/status-delta.md` e evidência T017–T025; ler `frontend/src/Tasks.tsx`, `frontend/src/TaskLinks.tsx`, `frontend/src/TaskDetailPanel.tsx` e `frontend/src/api.ts` para integração sem ampliar escrita. Executor: Revisor Matriz. Deps: T025. Gate G2 verifica base suja/versão, revisão não guardada, BLOCKS alcançável e quatro estados sem omissão; resposta e arquivo futuro `docs/verification.md` T039, sem ficheiro de relatório nem rerun.

## Phase 12: Polish & Cross-Cutting Concerns — integração, canónicos e fecho

**Purpose**: jornada integrada das três histórias, gates operacionais separados e alinhamento documental. Sem deploy, publicação ou operações Git como tarefa implícita de polish.

### Ambiente e jornada integrada — ER-05/07

- [x] T027 Obter autorização explícita para ambiente E2E/serviços/seed fictício já disponíveis e exclusivos; ler `frontend/playwright.config.ts`, `frontend/package.json`, `README.md` e `specs/002-estado-em-revisao/quickstart.md`, confirmar alvo API/Vite ou Compose autorizado e worker único. Executor: Orquestrador, só leitura. Deps: T026. Sem iniciar/parar/reutilizar serviços por inferência, instalar browser ou escrever configuração; falta de ambiente bloqueia T030, não se confunde com T002/Testcontainers.
- [x] T028 Atualizar percursos/fixtures existentes de `frontend/e2e/matriz.spec.ts` para guardar IN_REVIEW e aguardar confirmação/versão antes de concluir legitimamente; manter negativas diretas e assertions de bloqueios originais alcançáveis desde revisão. Ler `frontend/playwright.config.ts`; não editar configuração, relaxar asserts/timeouts ou usar revisão automática universal. Executor: Frontend. Deps: T027. FR-002/008/010, SC-001/006.
- [x] T029 Ampliar no mesmo `frontend/e2e/matriz.spec.ts` jornada das três histórias: ambas as entradas em revisão e devoluções/abandono, impedimento UI e chamadas API diretas não contornáveis por draft, membro ativo sem atribuição, save/GET/reload e história; lista, detalhe painel/página, relação/filtro e quatro estados globais=4/1 revisão/25%, sem perder globais por página/filtro. Incluir asserts desktop/390/320 px para quatro barras/cartões sem corte/sobreposição, labels/valores legíveis e teclado/foco/guards, sem depender só de cor. Executor: Frontend. Deps: T028. FR-001–010, SC-001–006 nos aspetos observáveis; upgrade e reinício conservam provas próprias, não são inferidos desta jornada.
- [x] T030 Executar em `frontend` `npm run test:e2e` para `frontend/e2e/matriz.spec.ts` somente no alvo de T027; se Compose já autorizado, usar a alternativa documentada PLAYWRIGHT_BASE_URL=http://localhost:8080, não ambas as variantes por formalidade. Executor: Frontend. Deps: T029, T027. Registar ambiente/seed/horários/exits/totais e evidência real na resposta, arquivo futuro `docs/verification.md` por T039; sem alterar config, novos destinos ou limpar dados/volumes preexistentes.
- [x] T031 Submeter apresentação desktop/390/320 px e navegação por teclado à apreciação visual humana, com referência a `frontend/src/Projects.tsx`, `frontend/src/styles.css`, `frontend/src/TaskDetail.tsx`, `frontend/src/TaskActivity.tsx` e resultados de `frontend/e2e/matriz.spec.ts`. Executor: Orquestrador recolhe decisão do autor, sem escrita. Deps: T030. Decisão/evidência visual separada da automação, futura localização `docs/verification.md` T039; não reaproveitar aprovação visual de 001 nem marcar concluída se apreciação pendente.
- [x] T032 Obter autorização operacional específica para reinício exato do ambiente isolado, exclusividade e preservação de dados/volume, lendo `README.md` e `specs/002-estado-em-revisao/quickstart.md` §4; identificar operação/recursos sem revelar configuração. Executor: Orquestrador, só leitura. Deps: T030. Não executar reinício nem criar serviços neste gate; sem aprovação T033 fica bloqueada, ainda que E2E tenha passado.
- [x] T033 Verificar estado após o reinício expressamente autorizado em T032, seguindo apenas a operação aprovada e `specs/002-estado-em-revisao/quickstart.md` §4/`README.md`: capturar identidade/estado/versão/história antes/depois, autenticar novamente se necessário e confirmar IN_REVIEW persistido sem seed mascarar perda. Executor: Backend no ambiente exclusivo autorizado, sem edição de ficheiros. Deps: T032. Resposta com evidência para `docs/verification.md` T039; sem down -v, apagar/recriar DB ou pressupor sobrevivência de sessão. FR-009, SC-004; bloqueio não equivale a PASS.
- [x] T034 Rever readonly jornada/evidência integrada contra `frontend/e2e/matriz.spec.ts`, `frontend/playwright.config.ts`, `specs/002-estado-em-revisao/spec.md` e `specs/002-estado-em-revisao/quickstart.md`; distinguir T030, visual T031 e reinício T032–T033, recusas diretas e bloqueios originais. Executor: Revisor Matriz. Deps: T031, T033. Gate G3 em resposta, futuro arquivo `docs/verification.md` T039; nenhuma nova execução, escrita ou aprovação operacional pelo Revisor.

### Alinhamento canónico — ER-06, escrita futura apenas DocConfig

- [x] T035 Atualizar `openapi.yaml` conforme [contrato delta](contracts/status-delta.md), sem o copiar integralmente para a feature: Status enum, filtro/Task/TaskReference, PUT/422 status e mensagem, Progress.required/exemplos. Citar `task.status` [modelo §1–2](data-model.md#2-matriz-de-transições), `task.close_reason` [§1](data-model.md#1-tarefa-domínio-de-estado), `TaskReference.status` [§5](data-model.md#5-histórico-e-relações) e `ApiModels.Progress.inReview`, `ApiModels.Progress.total`, `ApiModels.Progress.completedPercent`, `ApiModels.Progress.todo`, `ApiModels.Progress.inProgress`, `ApiModels.Progress.done` [§4](data-model.md#4-progresso-do-projeto-apenas-derivado). Preservar endpoints, formatos, autenticação e permissões, declarar necessidade de coordenação cliente/servidor, sem prometer compatibilidade transparente do DONE direto. Executor: DocConfig. Deps: T034. Exige aprovação futura exata deste caminho.
- [x] T036 Alinhar `docs/requirements.md` e `docs/user-stories.md`: substituir permissão de DONE direto em RF-08/RN-07/US-08 pelo pré-requisito persistido de revisão, quatro estados/contagens e critérios afetados RF-05/06/09/15; preservar RN-08/09/13–16/19 e restantes regras, sem duplicar verbatim limites base. Referenciar [modelo §1–5](data-model.md#1-tarefa-domínio-de-estado) e `openapi.yaml`, sem confundir US1/US3/US2 com IDs canónicos nem reescrever arquivos históricos. Executor: DocConfig. Deps: T035.
- [x] T037 Atualizar `docs/database.md`, `docs/architecture.md` e `README.md` quanto a V5/CHECK, domínio, nova origem persistida, quatro contagens e fluxos; remover anúncio vigente apenas V1–V4 na versão alterada, mantendo proveniência histórica. `task.status`/`task.close_reason` seguem [modelo §1–3](data-model.md#1-tarefa-domínio-de-estado), `ApiModels.Progress.inReview`/`ApiModels.Progress.total`/`ApiModels.Progress.completedPercent` [§4](data-model.md#4-progresso-do-projeto-apenas-derivado), `task_activity.payload` [§5](data-model.md#5-histórico-e-relações); canónicos não se transferem para specs. Executor: DocConfig. Deps: T036. Sem anunciar release, imagem, produção ou novo arranque executado.
- [x] T038 Alinhar `docs/implementation-plan.md` e `docs/test-plan.md` com implementação e cobertura reais de ER-01–ER-07, matriz FR/SC, upgrade V4→V5, preservação V3→V4, base suja, globais, BLOCKS e gates operacionais distintos; referenciar fontes canónicas/artefactos 002 sem gerar novo plano ou report. Executor: DocConfig. Deps: T037. Preservar histórico de 001 e distinguir implementado, testado, revisto e pendente.
- [x] T039 Consolidar em `docs/verification.md` relatos identificados T004–T034/G0–G3 e evidência documental T035–T038: comandos, ambiente, horário, exits, totais/falhas, RED/GREEN e proveniência; separar backend Testcontainers, componentes/build, E2E, visual humano e reinício. Mapear FR-001–010/SC-001–006 sem anunciar SC plenamente comprovado perante bloqueio/inconclusivo. Executor: DocConfig. Deps: T038. Único destino documental de evidência proposto; sem novo relatório, sem promover resultados históricos/relatos não conferidos a execução própria.
- [x] T040 Conferir formatos/links/âncoras e referências OpenAPI existentes em `openapi.yaml`, `README.md`, `docs/requirements.md`, `docs/user-stories.md`, `docs/database.md`, `docs/architecture.md`, `docs/implementation-plan.md`, `docs/test-plan.md` e `docs/verification.md`; verificar que RF-08/RN-07/US-08 vigentes já não contradizem o incremento e arquivos mantêm proveniência. Executor: DocConfig, verificações locais sem rede/instalação. Deps: T039. Relatar ferramentas/comandos realmente disponíveis, não alegar validador integral inexistente nem executar suites de aplicação por formalidade.
- [x] T041 Rever readonly os nove caminhos de T040 e evidência documental contra `specs/002-estado-em-revisao/spec.md`, `specs/002-estado-em-revisao/plan.md`, `specs/002-estado-em-revisao/data-model.md` e `specs/002-estado-em-revisao/contracts/status-delta.md`. Executor: Revisor Matriz. Deps: T040. Gate G4: canónicos continuam fonte, conflito resolvido só no âmbito aprovado, nenhum PASS inventado; resposta sem ficheiro novo, futura incorporação em `docs/verification.md` apenas por DocConfig aprovado.

### Fecho — ER-07

- [x] T042 Fazer revisão final independente readonly da cobertura FR-001–010/SC-001–006, preservações e evidência G0–G4 em `specs/002-estado-em-revisao/tasks.md`, `docs/verification.md`, `openapi.yaml` e nos caminhos de implementação/teste explicitamente enumerados em T005/T007/T014/T017/T019/T023/T024/T028–T029. Executor: Revisor Matriz. Deps: T041. Gate G5: bloquear fecho perante teste/revisão/reinício pendente, proteção mascarada ou escrita fora de âmbito; sem iniciar testes, corrigir código, convergir ou publicar.
- [x] T043 Com aprovação futura expressa de progresso/IDs, serializar em `specs/002-estado-em-revisao/tasks.md` apenas conclusões sustentadas por relatos/evidência identificados, incorporando G4/G5 em `docs/verification.md` somente se esse caminho continuar aprovado. Executor: DocConfig, escritor único. Deps: T042. Distinguir implementação de validação/revisão; não marcar bloqueios completos. Conferir limites finais sem branch/índice/commit/push/merge/refs/release/network/deploy, sem tocar `.env`, feature state, skills, CI/configuração ou dados/volumes; não certificar índice/hash sem comparação empírica autorizada.

## Dependencies & Execution Order

### Phase Dependencies

Fluxo prescrito sequencial, sem batches concorrentes:

`T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021 → T022 → T023 → T024 → T025 → T026 → T027 → T028 → T029 → T030`.

Depois de T030: T031 e T032→T033 são dependências explícitas de T034; executar sequencialmente T031→T032→T033 por preferência de ambiente exclusivo, embora a DAG não imponha T031 como pré-requisito funcional de T032. Continua `T034 → T035 → T036 → T037 → T038 → T039 → T040 → T041 → T042 → T043`. T015 e T025 também dependem explicitamente de T002. Todos os restantes pré-requisitos são os IDs declarados nas tarefas, não a proximidade textual.

### User Story Dependencies

- **US1 P1**: backend T006–T008 após fundação; frontend T018–T020 após G1 e contrato tipado T017. Não depende da jornada US2 para preparar os seus testes.
- **US3 P1**: T009–T011 e T021 reutilizam domínio/guarda de US1, mas têm amostras e asserts independentes; são obrigatórias para qualquer entrega segura do núcleo.
- **US2 P2**: T012–T014 e T022–T024 consomem enum/contrato comum; fixtures próprias de quatro estados, sem dependência da execução da jornada anterior.
- Integração T028–T034 cobre as três histórias. G1→frontend e G2→E2E respeitam a sequência do plano; não se altera prioridade por colocar agregado backend antes do editor frontend.

### Within Each User Story

Testes específicos primeiro; evidência RED futura quando execução autorizada, sem declarar falha já observada. Alterações de modelo/serviço/consumidores integradas antes de GREEN/full. Compatibilidade de proteções antigas não pode ser substituída por nova recusa de origem. Testes e gate de revisão têm IDs distintos de implementação.

### Mapeamento dos pacotes aprovados

| Pacote do plano | IDs reais decompostos |
|---|---|
| ER-01 — contrato/gates | T001–T003 |
| ER-02 — persistência/regra/agregados | T005, T007, T014 |
| ER-03 — regressões backend/migrations | T004, T006, T008–T013, T015 |
| ER-04 — interface/componentes | T017–T025 |
| ER-05 — jornada/apresentação | T027–T033 |
| ER-06 — canónicos/evidência | T035–T040 |
| ER-07 — revisão/fecho | T003, T016, T026, T034, T041–T043; gates operacionais T002/T027/T032 e execuções dos respetivos responsáveis |

### Parallel Opportunities e exemplos por história

**Zero tarefas de implementação/validação marcadas para paralelo.** ApiIntegrationTest.java, tipos/fixtures, matriz.spec.ts, tasks.md e ambientes são partilhados. Mesmo tarefas sem ficheiro comum mantêm dependências de contrato e revisão; o template não autoriza ignorá-las.

- US1: alternativa apenas de leitura, se futuramente coordenada, é comparar o desenho [modelo §2/6](data-model.md#2-matriz-de-transições) com C-02 enquanto outra leitura examina critérios de spec; não executar T007/T019 nem editar testes simultaneamente.
- US3: leituras de [modelo §3/5](data-model.md#3-evolução-física-futura) e RN-14–16 podem ser revistas separadamente sem escrita; não dividir ApiIntegrationTest/recursos Docker entre executores.
- US2: leituras de [modelo §4](data-model.md#4-progresso-do-projeto-apenas-derivado) e C-04/05 são alternativa de revisão, não autorização de paralelo em types/fixtures/dashboard ou E2E.

Não há delegação prescrita nesta geração. Qualquer estratégia concorrente futura exige coordenação/aprovação próprias e escritor único preservado.

## Rastreabilidade e campos do delta

As citações nas tarefas usam os nomes reais do modelo físico (`task.status`, `task.close_reason`, `task_activity.payload`), DTO `ApiModels.Progress` com os seus campos e `TaskReference.status`. O modelo §4 nomeia o DTO e lista os campos; `inReview` é o campo novo proposto, não coluna já existente. Não se inventam entidade Progresso persistida, reviewerId, timestamp de revisão ou nome de snapshot local. `values.status` é o rascunho existente; §6 define a regra do snapshot sem impor identificador novo.

| FR | SC relacionados | Implementação/contrato | Testes e verificação futuros |
|---|---|---|---|
| FR-001 | SC-004/005 | T005, T007, T017, T035–T037 | T004, T008, T011, T013, T029 |
| FR-002 | SC-001/002 | T007, T019, T035–T036 | T006, T008, T018, T020, T029 |
| FR-003 | SC-002/006 | T007, T019, T036 | T006, T009, T020–T021, T029 |
| FR-004 | SC-002 | T007, T035–T036 | T006, T010, T029 |
| FR-005 | SC-004 | T017, T023–T024, T035–T037 | T013, T022, T029–T031 |
| FR-006 | SC-003 | T014, T017, T023, T035–T037 | T012–T013, T022, T029–T031 |
| FR-007 | SC-005 | T005, T007, T035–T037 | T009, T011, T021 |
| FR-008 | SC-006 | T007, T019, T035–T037 | T009–T011, T021, T028–T030 |
| FR-009 | SC-004/005 | T005, T007, T024, T037 | T008, T011, T013, T029–T030, T032–T033 |
| FR-010 | SC-001/002 | T007, T019, T035–T036 | T006, T010, T018, T020–T021, T029 |

G1/G2/G3/G4/G5 verificam os relatos associados, não substituem execução. T039/T043 nunca transformam cobertura planeada em SC provado.

## Implementation Strategy

### MVP First — núcleo US1, inseparável de US3 para entrega

1. Obter análise e aprovação próprias; completar Setup/fundação.
2. Implementar núcleo US1 e provar negativas diretas, depois US3/compatibilidade e backend de US2 para fechar contrato de quatro estados.
3. Passar G1 antes de frontend; implementar fatias US1→US3→US2 e passar G2.
4. Validar histórias independentemente com dados próprios; executar integração apenas após gate E2E.
5. Não publicar/demo/deploy como passo automático. US1 é o núcleo funcional do MVP, mas não pode ser entregue sem compatibilidade/segurança US3 e consumidores coordenados.

### Incremental Delivery e condições de paragem

Cada lote entrega relato, validação autorizada e revisão readonly antes do seguinte. Falta de autorização, schema divergente, consumidor/caminho adicional, novo teste/ficheiro/dependência, requisito consequencial, necessidade de alterar TaskLinkService ou ambiente não exclusivo exigem parar; não alterar plano/skills/ignore files ou executar hooks para contornar.

Comandos futuros existentes, **não executados nesta fase**:

| Local/condição | Comando |
|---|---|
| Raiz, autorização backend/Testcontainers isolado T002/T015 | `mvn -f backend\pom.xml test '-Dapi.version=1.44'` |
| `frontend`, autorização local T002/T025 | `npm test` e `npm run build` |
| `frontend`, alvo e seed explicitamente aprovados T027/T030 | `npm run test:e2e` |

Alternativa Compose documentada: PLAYWRIGHT_BASE_URL=http://localhost:8080 no ambiente, só com autorização do alvo; reinício tem T032 próprio. Não criar/arrancar serviços nem instalar dependências para fazer um gate passar. Preservar RNs de locks, participação/conta ativa, sessão/CSRF, versões e histórico na mesma transação.

## Notes — registo desta geração

Skill speckit-tasks invocada pelo parent segundo handover; nesta sessão sem mecanismo de invocação nativa, foram lidos e seguidos os SKILL.md de speckit-tasks, contexto-matriz e validacao-matriz. Não se simula nova invocação. Nenhum speckit-implement/converge/analyze executado, nenhuma delegação.

Helper `setup-tasks.ps1` e `common.ps1` inspecionados integralmente. Inventário sem presets/extensões: o ramo de composição que criaria temporários de manifest não é percorrido. Executado na raiz `.specify/scripts/powershell/setup-tasks.ps1 -Json`, com SPECIFY_FEATURE_NO_PERSIST=1 explícito, SPECIFY_INIT_DIR na raiz e SPECIFY_FEATURE_DIRECTORY=specs\002-estado-em-revisao; as três variáveis foram guardadas/restauradas em try/finally. Exit 0; FEATURE_DIR absoluto 002, AVAILABLE_DOCS research/data-model/contracts/quickstart e TASKS_TEMPLATE_CONTENT composto consumido como estrutura, sem copiar manualmente template fixo. Helper não cria tasks nem executa hooks; escrita por apply_patch só neste caminho.

Conferência atual limitada ao documento: formato/IDs/labels/caminhos/dependências DAG, cobertura FR/SC e referências de campos/âncoras; releitura do tasks persistido. Sem análise cruzada de três artefactos, testes/build/browser, migrations executadas, rede, instalação, serviços ou Git. Nenhum resultado histórico de 001/CI prova esta feature. Nenhum SC demonstrado agora; não há certificação empírica do índice nem hash inventado.

`.specify/extensions.yml` ausente nas verificações antes/depois da geração; nenhum hook executado. Validação estrutural PowerShell inicial: exit 0, 43 tarefas e zero erros de IDs/labels/paths por tarefa/dependências. Primeira conferência de links terminou exit 1 por duas âncoras distintas C-02/C-04 (três ocorrências); corrigidas neste ficheiro, sem alterar as fontes referenciadas.

Revalidação documental final PowerShell: exit 0, zero erros; 43 IDs sequenciais/abertos, executores/dependências/caminhos em todas as tarefas, labels coerentes por fase e DAG dirigida sem ciclos, 24 links locais distintos com âncoras resolvidas, 42 caminhos referenciados (única ausência esperada: V5 futura), dez FR e seis SC na matriz, sem espaços finais e sem tarefas paralelas. Campos confrontados com modelo e definições existentes de Progress/TaskReference/editor; inReview continua delta proposto. Não é análise cruzada nem validação de aplicação.

**Inventário de tarefas**: 43 totais; US1 6 (T006–T008, T018–T020), US3 4 (T009–T011, T021), US2 6 (T012–T014, T022–T024), partilhadas 27. Todas inicialmente abertas; zero oportunidades de implementação paralela prescritas. Revisão/análise readonly posterior permanece tarefa separada, não iniciada automaticamente.

## Progresso autorizado — preflight T001/T002, 18-11-2026 UTC

Registo DocConfig com observação local e handover identificados separadamente. Skills `contexto-matriz`, `validacao-matriz` e `speckit-implement` lidas e seguidas no âmbito atribuído; sem mecanismo nativo de invocação nesta sessão. Invocação de `speckit-implement` pelo parent é informação do handover, não invocação simulada aqui. Sem delegação, regeneração de plano ou nova análise.

**T001 concluída — confirmação de âmbito, não implementação.** Lidos todos os oito artefactos 002, AGENTS/README/constituição, requisitos/restrições/histórias atuais, partes pertinentes de OpenAPI/dados e resumo vigente de verification. Confirmada entrega coordenada de IN_REVIEW/guarda de origem persistida/Progress.inReview/motivo: DONE→DONE preservado, nenhuma revisão histórica/automática, quatro contagens globais, apenas DONE no numerador e proteções BLOCKS/permissões/versão/locks mantidas. RF-08/RN-07/US-08 e enum/Progress canónicos ainda exprimem o contrato anterior; alinhamento autorizado só nos IDs futuros próprios. As restrições de aprovação anteriores nos artefactos são históricas. Exclusões do plano mantidas, sem novo papel/dependência/endpoint, alterações V1–V4, segurança, deploy ou publicação.

**Checklist read-only**, contado em 23:35:07Z; inventário contém apenas este checklist:

| Checklist | Total | Checked | Unchecked | Estado |
|---|---|---|---|---|
| requirements.md | 16 | 16 | 0 | PASS |

Nenhum marcador de checklist alterado; qualidade de requisitos não comprova implementação/testes.

**Helper inspecionado antes de executar**: `check-prerequisites.ps1` e funções chamadas de `common.ps1`. Sem `-Template`, não entra na composição de templates/temporários; NoPersist impede Save-FeatureJson. Comando literal na raiz:

```powershell
$env:SPECIFY_FEATURE_NO_PERSIST='1'
$env:SPECIFY_INIT_DIR=(Get-Location).Path
$env:SPECIFY_FEATURE_DIRECTORY='specs\002-estado-em-revisao'
$env:SPECIFY_FEATURE='002-estado-em-revisao'
& ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

As quatro variáveis foram guardadas/restauradas em try/finally. Execução 23:35:21.7608245–23:35:21.9256063Z: exit 0, FEATURE_DIR absoluto 002, AVAILABLE_DOCS research/data-model/contracts/quickstart/tasks. Hashes feature.json/índice iguais antes/depois; extensions.yml ausente antes/depois. A primeira asserção de restauro devolveu False ao comparar ausência e vazio via API .NET; não foi ocultada. Repetição 23:35:43.6166786–23:35:43.7439565Z com preservação explícita de presença (Set-Item ou Remove-Item apenas Env:): exit 0, mesmo JSON, quatro asserções RESTORED=True. Cada comando decorreu num processo PowerShell isolado. Nenhum hook executado nem fase seguinte despachada.

**T002 concluída — prontidão observada, não suite aprovada por resultado.** Aprovação recebida cobre testes backend PostgreSQL Testcontainers isolados e frontend `npm test`/`npm run build`, após os gates/dependências próprios. Manifests confirmam Java 21, Testcontainers/PostgreSQL e scripts existentes. Leitura dirigida de ApiIntegrationTest confirma PostgreSQLContainer postgres:17-alpine e datasource fornecido pelo próprio container; nenhum acesso a instâncias existentes.

| UTC de 18-11-2026 | Comando/verificação literal | Resultado observado |
|---|---|---|
| 23:35:21.9136439 | `java -version` | exit 0; Java 21.0.5 LTS |
| 23:35:22.0771584 | `mvn -version` | exit 0; Maven 3.9.9, JVM Java 21 |
| 23:35:22.4602588 | `node --version` | exit 0; v26.13.1 |
| 23:35:22.5349558 | `npm --version` | exit 0; 11.2.0 |
| desde 23:35:24.7887509, fim 23:35:26.2543537 | `docker --version`; `docker info --format '{{.ServerVersion}}\|{{.OSType}}\|{{.Architecture}}'` | ambos exit 0; CLI/Engine 29.9.3, linux, x86_64; só componentes sanitizados, sem info integral/auth/configuração |
| 23:35:21.8234974 | `Test-Path -LiteralPath frontend/node_modules -PathType Container`; leitura dos package.json das dependências diretas; `Test-Path` dos .bin | node_modules existente; 15/15 versões coincidem com package.json; vitest.cmd/tsc.cmd/vite.cmd presentes; zero falhas |

No comando Docker, os separadores `|` acima estão escapados só para a tabela Markdown. Inspeção às 23:35:43Z dos engines de Vitest/Vite/TypeScript/jsdom admite o Node observado. Isto não verifica a árvore transitiva integral, caches Maven/imagens ou execução de Testcontainers; nenhum resultado antigo foi usado para presumir disponibilidade. Sem instalar pacotes/browser/Docker, executar testes/build, contactar rede externa, iniciar/parar/reutilizar serviços, seed ou reinício. E2E, browser/visual e reinício permanecem gates próprios T027/T031/T032; nenhuma prontidão desses ambientes foi inferida.

**Ignore files — só leitura**: `.gitignore` cobre .env da raiz, backend/target, frontend/node_modules/dist/resultados e logs; `.dockerignore` cobre .git, padrões .env, segredos/chaves e outputs específicos. Faltam padrões genéricos recomendados pela skill (por exemplo `.env.*` no Git, `*.log*`/coverage no Docker); não se afirma existência de ficheiros sensíveis correspondentes nem se abre configuração. Inventário limitado raiz/backend/frontend/infra sem configuração ESLint/Prettier/Terraform/Helm nos níveis consultados; package.json é private, sem publicação npm. Qualquer hardening de ignores é fora dos caminhos aprovados: apenas reportado, sem alteração/criação.

**Baseline empírica**, 23:34:34.2359958Z: `git --no-pager status --short` mostrou sete ficheiros tracked modificados (AGENTS.md, README.md, docs/architecture.md, docs/coursework-review.md, docs/development.md, docs/relatorio-final.md, docs/verification.md) e um diretório untracked 002 (o inventário contém oito ficheiros). `git --no-pager rev-parse HEAD`: `181b267bc3e5e44d173aa82614cf23054b63f94d`; `git --no-pager diff --cached --numstat` vazio, zero paths staged. `Get-FileHash -LiteralPath .git/index -Algorithm SHA256`: `E8A645DF721CCE016F559119210138697391DA7CC99A9312D937C66C31249D59`. Sem escrita no índice/branches.

Fingerprint em memória às 23:35:07Z: 61 entradas normalizadas/ordenadas de caminhos pertinentes de implementação/testes/docs, artefactos 002 exceto tasks e governação/helper/ignores; inclui ausências de V5/extensions. SHA256 agregado `0629681A064715E9C8C296F76F46712F616C65D615CD5CFBB15FE4A3F5E03B6B`. Tasks anterior: `B3DD16F9E72E06177A8B3BF1415BB951CF0CE40BF856B07171B1B818F2305F23`. Não foi criado artefacto de tracking; comparação final será relatada na resposta.

**Estado de saída**: apenas T001/T002 marcadas, 2/43; T003–T043 permanecem abertas. Próximo passo é revisão readonly **T003/G0**; backend não iniciado. Este preflight não marca T043, reviews futuras, testes, SC ou aceitação do cliente como completos.

## Progresso autorizado — T003–T016, 18-11-2026 UTC

Atualização serializada por DocConfig, escritor único, autorizada nesta mensagem de progresso apenas em `specs/002-estado-em-revisao/tasks.md`. Proveniência: relatos abaixo transmitidos pelo utilizador, não execuções ou revisão de código/XML desta sessão. Preservam-se o preflight T001/T002 e o histórico de geração; a aprovação de implementação de 23:33:19Z abrange a aplicação, incluindo V5, não apenas geração de artefactos.

- **T003/G0 — `review-002-g0`: APROVADO, sem achados**, incluindo prontidão T002; gate anterior ao lote backend satisfeito segundo o relato.
- **T004–T015 — `implementar-002-backend`**: criada V5 limitada ao CHECK de status e alterados seis Java existentes. RED relatados antes de GREEN: T004 catálogo, uma falha; T006 transições, três falhas; T012 compilação por assinatura antiga; T013 agregado, seis testes/dois falhados (total 3 em vez de 4 e 100% em vez de 33%). Última seleção InputsTest/ApiIntegrationTest: 57/57 GREEN, 23:49:21–23:50:09 UTC. Execução integral pelo engenheiro, na raiz, `mvn -f backend\pom.xml test '-Dapi.version=1.44'`, 23:50:13–23:51:06 UTC: exit 0, **68 testes, zero falhas/erros/skips**.
- **Provas backend relatadas**: HTTP 422 no campo status/mensagem exatos e snapshots atómicos; conclusão legítima com duas escritas, novas versões/histórico; versão, CSRF e participação revalidada após espera; fixtures BLOCKS/concorrência com revisão persistida, sem mascarar proteções; rollback tardio DB/503. V3→V4 conserva target("4"); V4→V5 preserva catálogo/bytes/relações/histórico por snapshots, aplica uma migration e zero na repetição. Quatro superfícies de agregados globais incluem quatro estados/25%.
- **T016/G1 — `review-002-g1-backend`: APROVADO, sem achados**. Revisor relata leitura própria dos sete caminhos e de seis XML Surefire: 68 testes (ApiIntegrationTest 52, InputsTest 5, restantes 11), zero falhas/erros/skips. **XML observado pelo revisor, sem rerun Maven**; `diff --check` tracked exit 0 e índice sem staged são observações relatadas dessa revisão, não conferências novas de DocConfig.

**Estado atual**: T001–T016 concluídas (**16/43**); T017–T043 abertas (**27/43**), incluindo T043. Implementação da feature em curso, não entrega integral validada pelos 68 testes backend. G1 liberta **somente T017**, mantendo as dependências seguintes e gates próprios E2E, reinício e apreciação visual. Sem revalidação Maven/SC integral, novos hashes ou certificação do índice nesta atualização; `docs/verification.md` não alterado, consolidação reservada a T039.

## Progresso autorizado — T017–T026, 19-11-2026 UTC

Atualização serializada por DocConfig, limitada a este ficheiro e aos marcadores T017–T026. Proveniência: relatos confirmados transmitidos pelo utilizador, não testes/revisão de aplicação executados nesta sessão. Skills `contexto-matriz`, `validacao-matriz` e `speckit-implement` seguidas por leitura dos SKILL.md, sem mecanismo nativo de invocação; sem hooks ou regeneração do plano. Notas anteriores preservadas como histórico.

- **T017–T025 — `implementar-002-frontend`: concluídas**, segundo o engenheiro, apenas nos dez caminhos ER-04. Base persistida IN_REVIEW/DONE associada à versão, sem promoção por refetch sujo/revisão não guardada; compatibilidade DONE/BLOCKS, fixtures, quatro contagens/globais 25%, quatro barras SVG/cartões e tradução de histórico só para status reconhecido.
- **RED/GREEN relatados pelo engenheiro**, em `frontend`: `npm test -- src/TaskDetail.test.tsx src/TaskDetailPanel.test.tsx -t "revisão obrigatória"`, 00:01:42.868–00:02:05.305, 9 falhas/1 passou/17 skips; seleção do editor GREEN 35, 00:03:24.244–00:03:40.708. Seleção de apresentação `-t quatroestados`: RED 4 falhas/71 skips, 00:05:16–00:05:20; GREEN 5 passaram/71 skips, 00:06:35–00:06:38. Full 167/build PASS relatado às 00:07:28; após reforço, full 00:08:50.829–00:09:09.648 teve 166 passaram/1 falhou por referência DOM obsoleta; corrigida, seleção 3 PASS às 00:09:23–00:09:26. **Finais T025**: `npm test`, 00:09:51.891–00:10:10.636, **167/167, dez ficheiros, exit 0**; `npm run build`, 00:09:51.932–00:09:57.640, **exit 0**. Node 26.13.1/npm 11.2.0, diferente do Node CI 22.12.0; dependências preexistentes, sem instalação.
- **T026/G2 — `review-002-g2-frontend`: APROVADO, sem achados**, segundo revisão independente readonly do diff dos dez caminhos e integração. Revisor observou `git diff --check` desses caminhos PASS/índice vazio; cache Vitest com dez ficheiros failed=false e mtime 19-11 00:10:10 sustenta os ficheiros, **não certifica o total 167, horários das execuções ou execução do build**, que são relatos do engenheiro. Inspeção estática: barras x=50–590 em largura 640, cartões responsivos em duas colunas e identificação não só por cor; não é certificação visual humana. Sem rerun, browser/E2E ou reinício pelo revisor.
- **Preservação relatada, não certificação local**: engenheiro reportou fingerprints inalterados dos sete caminhos backend e de sete docs/artefactos specs, HEAD `181b267bc3e5e44d173aa82614cf23054b63f94d` e índice vazio. Nenhuma nova verificação Git ou de disponibilidade operacional por DocConfig.

**Estado atual**: T001–T026 concluídas (**26/43**), T027–T043 abertas (**17/43**). G2 não autoriza T027 nem uso/arranque/reutilização de serviços, seed, E2E, reinício ou aprovação visual. Esta sessão apenas regista progresso; `docs/verification.md` continua reservado a T039. Próximo gate: autorização explícita de ambiente/alvo/recursos exclusivos em T027; reinício conserva autorização separada T032.

## Progresso autorizado — T027, 19-11-2026 UTC

Registo breve por DocConfig, escritor único, apenas neste ficheiro. Proveniência: relatos `preparar-002-e2e-compose` e `review-002-t027-ambiente` transmitidos pelo utilizador, não observação operacional desta sessão. Notas anteriores conservam o estado histórico.

- **T027 concluída — prontidão de ambiente, não teste funcional E2E.** Aprovação expressa do autor às **00:21:59 UTC** para novo Compose exclusivo `matriz-review-002-e2e`, aplicação `127.0.0.1:18081`, DB `127.0.0.1:55433`, volume/seed fictício, único temporário não secreto fora do repositório, build/downloads e arranque/migrations. Preparador relata `config --quiet`, build e arranque com espera: todos exit 0; app/DB running/healthy, Flyway V1–V5 com sucesso e seed conferido por SQL read-only. Imagem local construída da worktree 002, não GHCR; recursos preexistentes e estado Git preservados segundo o relato.
- **`review-002-t027-ambiente`: APROVADO, sem achados**, revisão independente estática: Playwright com um worker, sem paralelismo integral e com override de baseURL; raiz 200 e health/readiness anónimos 401 compatíveis com o contrato sem observabilidade opt-in. Healthcheck Compose verifica raiz, não JDBC. Disponibilidade/contagens são relatos do preparador, não observação atual independente do revisor; sem rerun Docker/HTTP/SQL. Raiz 200 e SQL não provam jornada autenticada ou E2E funcional.

**Estado atual**: **27 concluídas, 16 abertas, 43 IDs únicos**; T001–T027 concluídas, T028–T043 abertas. T030 continua sem aprovação própria; nenhum E2E/browser, reinício, limpeza ou publicação realizado. Só conferência documental nesta atualização, sem testes/serviços/rede/escritas Git; consolidação canónica da evidência permanece reservada a **T039** em `docs/verification.md`.

## Bloqueio operacional — T028–T030, 19-11-2026 UTC

Nesta sessão, o autor autorizou build local/recriação exclusivamente de `matriz-review-002-e2e-app-1` e, após atualização confirmada, seleção E2E `Em revisão:` seguida da suite integral apenas se PASS. Correções e revisões `review-002-two-e2e-fixes`/`review-002-save-focus` aprovadas são evidência recebida, não nova execução browser.

Preflight próprio **01:19:19.775–01:19:20.234Z**, consultas Docker estritamente formatadas e HTTP, exits 0: app `2a7f7c2318e5af09e0b86e4b1f1eec095a5456387ff3c5f0b017e1a27de90c3f`, DB `8e9d9d032ae7524c8d9a5ac70306b498fc63b13cb8cb4b7ebe055b46de3160a8`, ambas running/healthy; portas loopback 18081/55433, projeto/rede/volume esperados, raiz 200. Imagem ainda antiga `sha256:36db57e9afbd0b504b8949f64b4624e3ca054f2890c4bdb9e9a708ea0a936f04`, criada em 19-11 às 00:24:40.906765895Z.

**Bloqueio antes do build/recreate**: `compose.yaml` exige `POSTGRES_PASSWORD` para interpolar também `app.environment.DATABASE_PASSWORD`; a credencial original não está disponível nesta sessão pelo método autorizado. Inventário de scripts do repositório não encontrou procedimento operacional alternativo. Não ler/procurar credenciais, `.env`, Env de inspect ou configuração expandida; não inventar password nem alterar DB. Build/recriação e ambas as execuções E2E **não executados**, sem resultado PASS/FAIL browser novo ou artefactos novos. Proposta pendente: responsável disponibilizar um mecanismo de recriação que preserve a configuração sem expor/recolher segredos, sujeito a confirmação do método.

Marcadores preservados: **27/43 concluídas, 16 abertas**; T028/T029 implementadas/revistas segundo handover, sem promoção dos marcadores nesta sessão bloqueada; T030 não validada. Esta autorização não conclui T031–T034/G3, T035–T040 ou fecho, nem constitui prova de persistência após reinício. Única escrita: esta nota; evidência canónica continua reservada a T039.

## Progresso autorizado — consolidação T028–T040, 19-11-2026 UTC

**Estado à data desta consolidação: 40/43 concluídas, 3 abertas; T001–T040 [x],
T041/G4, T042/G5 e T043 [ ]**. As notas anteriores são histórico datado,
incluindo o bloqueio local antigo; não exprimem as pendências atuais.
Autorização expressa recebida de **10:19:48 UTC**, reconfirmada no pedido
de consolidação: apenas README, verification, test-plan, implementation-plan
e este tasks existentes, sem novos relatórios. DocConfig é escritor único,
com atualização serializada apenas dos marcadores T028–T040; T001–T027,
descrições, dependências e T041–T043 preservadas. Não é execução de T043.

- **T028/T029 concluídas:** 11 cenários preservados + 2 novos (13 preparados).
  `review-002-e2e-r1` aprovado após correção de teclado; revisões estáticas
  posteriores `review-002-two-e2e-fixes` e `review-002-save-focus` aprovadas.
  Negativas API/draft/origem persistida e BLOCKS desde revisão não mascaradas.
- **T030 PASS via CI recebido:** `verificar-002-ci-44436970582` confirmou
  às 01:51:27–28 UTC CI #22/run 44436970582/attempt 1, push/main,
  `.github/workflows/ci.yml`, SHA `7c182edf7fe1c2cd1009743b029e3cd9d5759c12`,
  quatro jobs success; início 01:26:55, último fim 01:37:23, atualização
  01:37:24. Logs anónimos 403: totais remotos desconhecidos, não 13/13.
  HEAD atual `336066253151dd8e3e6229a55827e047c7ac4779` difere apenas
  em nove canónicos documentais, código/CI inalterados; não é CI de 3360662.
- **T031 concluída:** aprovação **humana do autor**, «confirmo aprovação
  total visual», às 01:49:42 UTC, desktop/390/320/teclado; não aprovação
  visual do agente nem inferência de build/automação.
- **T032 concluída:** nova autorização específica às 10:19:48 para stack
  `matriz-review-002-final`, loopback app 18082/DB 15433, volume novo e
  credencial só runtime; restart apenas app, DB/stack antiga preservadas.
- **T033 PASS recebido de `concluir-002-persistencia-compose`:** config,
  pull, build do HEAD 3360662 e up exit 0. Um PUT no seed novo
  `proj-alfa/task-04`/MAT-4 TODO v1→IN_REVIEW v2, 200; restart só app às
  10:32:40.042–40.950 exit 0. Snapshots completos tarefa (14 propriedades),
  projeto e todo o histórico (1 evento/1 página), ordenação/paginação/tipos
  e hashes antes/depois iguais; identidade/v2/datas/evento preservados,
  nova autenticação/GETs 200. Mesma DB/imagem/volume/StartedAt, sem restart
  DB/SQL/DELETE/recriação/limpeza. Seed normal não mascara esses snapshots.
  Harness final exit 0; falhas prévias do harness e bind Windows antigos
  não são defeitos de aplicação nem novo resultado E2E.
- **T034/G3 APROVADO, sem achados:** `review-002-g3-persistencia`,
  leitura própria do código idêntico 7c182ed→3360662 e evidência recebida
  T030/T031/T033; quatro estados/25% globais/filtros/paginação e geometria
  desktop/390/320 contemplados. Sem rerun pelo revisor.
- **T035–T040 concluídas:** antecipação documental aprovada às 01:31:49,
  nove canónicos alinhados e revisões limitadas
  `review-002-documentacao-antecipada`/`review-002-ci-visual-final` PASS.
  Conferências anteriores recebidas: YAML, 229 referências/30 operações,
  UTF-8 9/9 e 63 fragmentos locais; sem validador integral OpenAPI disponível.
  Consolidação atual e verificações locais próprias em
  [verification — T040](../../docs/verification.md#feature-002-doc-checks).

Evidência operacional é recebida, não execução de DocConfig; prova completa,
hashes/identidades/cronologia/limites e rastreio FR-009/SC-004 em
[verification](../../docs/verification.md#feature-002-persistencia-final).
174 testes frontend/build locais de 01:16 e backend 68 de 18-11 mantêm
proveniência distinta de totais CI desconhecidos. RED históricos da imagem
antiga não são bloqueios atuais. Imagem nova apenas local, sem release,
cliente/produção ou publicação do novo SHA; candidato `0.4.0-rc.1` mantido.

Skills seguidas por leitura: contexto-matriz, validacao-matriz e
speckit-implement, sem invocação nativa disponível; sem hooks/helpers,
persistência de estado, agentes, rede, testes/build/serviços/instalações ou
escritas Git. **Paragem para revisão formal T041/G4, depois T042/G5**;
nenhuma aprovação desses gates ou fecho T043 presumida.

## Progresso autorizado — T041/G4, 19-11-2026 UTC

Escrita serializada por DocConfig apenas neste tasks e em
`docs/verification.md`, conforme autorização atual do utilizador.
Única alteração de checkbox: **T041 [x]**; restantes IDs, descrições e
dependências preservados. Não é execução nem fecho de T043.

**T041/G4 APROVADO — `review-002-g4-01-fecho`**, segundo relato formal
recebido do utilizador. A revisão original `review-002-g4-final` leu os
nove canónicos e identificou apenas **G4-01 LOW**: referências obsoletas
a G3/browser/visual/persistência pendentes em architecture/database.
Correção dos dois ficheiros aprovada pelo autor às **10:41:59 UTC** e já
presente; nenhum deles foi alterado por este registo.
O novo revisor formal leu os dois diffs, referências de verification,
regras e critério T041; confirmou a distinção T030 CI no SHA 7c182ed,
T031 humana e T033 persistência/G3. Relatou âncoras e diffcheck PASS,
índice vazio e sete caminhos modificados. **G4-01 resolvido**, sem outros
achados na revisão integral original; estas observações são do revisor,
não nova execução operacional de DocConfig.

Proveniência e limites em
[verification — T041/G4](../../docs/verification.md#feature-002-g4-final).
Skills contexto-matriz, validacao-matriz e speckit-implement seguidas por
leitura dos SKILL.md, sem mecanismo de invocação nativa disponível.
Somente conferências documentais locais; sem testes, CI, HTTP, reinício,
serviços, rede, hooks, agentes, novos relatórios ou escritas Git.

**Estado de saída: 43 IDs únicos, 41 marcados, 2 abertos: T042/G5 e T043.**
Pronto para **revisão final independente T042/G5**, sem a executar ou
aprovar neste registo; nenhum fecho da feature presumido.

## Serialização final autorizada — T042/G5 e T043, 19-11-2026 UTC

As notas de geração/preflight/progresso acima preservam os seus estados
à data; apenas o resumo de abertura e este registo exprimem o estado final.
Autorização de 10:19:48 UTC e complemento de 10:41:59 UTC reconfirmados
pelo utilizador: apenas os sete caminhos existentes README, architecture,
database, implementation-plan, test-plan, verification e este tasks;
architecture/database somente referências de estado G4/G5/T043.
DocConfig continua escritor único; descrições, dependências e T001–T041
preservadas, sem regenerar spec/plan ou criar relatórios.

**T042/G5 [x] — `review-002-g5-final` APROVADO**, evidência recebida:
sem achados confirmados ou teste/revisão/reinício obrigatório pendente.
Cobertura FR-001–010/SC-001–006, dez campos restringidos, preservações e
G0–G4 conferidos; sem novas suites/build/rede/serviços/visual pelo revisor.
**T043 [x]** após conferências locais PASS observadas em
**10:52:21.179938–10:52:21.729035 UTC**, antes de marcar este ID:
UTF-8 7/7, links/âncoras, 43 IDs sequenciais (então 42 marcados/1 aberto),
descrições/dependências e predecessoras preservadas, YAML existente,
históricos, âmbito, HEAD/índice/staged e diffcheck. Primeira asserção
CRLF/LF corrigida só no verificador em memória, sem reescrever conteúdo.
**Estado final: 43 IDs únicos/sequenciais, 43/43 [x], zero abertos;
G0–G5 APROVADOS.** Implementação e validações/revisões obrigatórias
encerradas no âmbito académico aprovado, não release/publicação/produção,
aceitação do cliente ou garantia integral de segurança.
Proveniência, verificações próprias e limites exclusivamente em
[verification — registo final](../../docs/verification.md#feature-002-fecho-final).
