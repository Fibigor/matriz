# Matriz — Plano de testes da ficha 04

<a id="feature-002-test-plan"></a>

## Feature 002 — cobertura e gates G0–G5 aprovados, 19-11-2026

T038 alinha este documento com os mesmos
[spec/FR/SC](../specs/002-estado-em-revisao/spec.md),
[plan/ER-01–07](../specs/002-estado-em-revisao/plan.md) e
[tasks](../specs/002-estado-em-revisao/tasks.md), sem os regenerar.
T035–T040 foram antecipadas expressamente antes de T034/G3; essa exceção
histórica não altera a DAG. Na serialização final aprovada às 10:19:48 UTC,
com complemento às 10:41:59 UTC e reconfirmação no pedido final,
**43/43 concluídas; G0–G5 aprovados; T043 fechada após conferências PASS**.
As tabelas de 001 e V4 abaixo são
históricas, não validação de 002. Regras atuais em
[RF-08/RN-07](requirements.md#regras-em-vigor), [US-08](user-stories.md)
e [OpenAPI](../openapi.yaml). Resultados, horários e proveniência exclusivamente
em [verification](verification.md#feature-002).

A matriz FR-001–010/SC-001–006 abaixo está encerrada pela revisão final
`review-002-g5-final` no âmbito académico aprovado: sem achados confirmados
ou teste/revisão/reinício obrigatório pendente. Conserva os níveis de prova
e limites de cada linha; não equivale a certificação integral de segurança,
acessibilidade ou produção. [G5 e fecho](verification.md#feature-002-fecho-final).

| FR / SC da feature 002 | Pacotes / IDs e cobertura implementada | Nível de prova disponível / pendente |
|---|---|---|
| FR-001; SC-004/005 | ER-02/03/04/06; T004–005/T008/T011/T017/T035–037. CHECK/default TODO/desconhecido, enum/labels e preservação dos dados antigos. | Backend testado/relatado, G1 revisto; CI E2E PASS, T031 total aprovada, T033 persistência PASS e G3 aprovado. |
| FR-002; SC-001/002 | ER-02/03/04/05; T006–008/T018–020/T029. TODO/IN_PROGRESS→DONE recusadas com 422 status/mensagem e snapshots de dados/versão/datas/história; revisão guardada permite. | API/componentes relatados PASS; T030 PASS via metadados do CI final, sem logs/totais remotos ou promoção automática de SC integral. |
| FR-003; SC-002/006 | ER-02/03/04/05; T006/T009/T020–021/T029. TODO direto a revisão, entrada desde IN_PROGRESS, devolução aos dois estados, abandono não autoriza DONE e reaberturas protegidas. | API/componentes testados/relatados, G1/G2; CI final E2E completed/success confirmado independentemente, sem detalhe remoto por cenário. |
| FR-004; SC-002 | ER-02/03/05; T006/T010/T029. Membro ativo não atribuído revê/conclui, mesma pessoa, sem papel novo; acesso/CSRF/revalidação preservados. | API relatada PASS; falha local antiga preservada. CI final E2E PASS confirmado, sem detalhe remoto por cenário. |
| FR-005; SC-004 | ER-04/05/06; T017/T022–024/T029–031/T035–037. Ordem/label comum em filtro/lista/detalhe/relação e old/new status; fallback e priority/type não traduzidos. | Componentes relatados PASS; T031 total aprovada pelo autor no âmbito desktop/390/320/teclado, separada do CI final E2E PASS; sem inspeção visual pelo agente. |
| FR-006; SC-003 | ER-02/03/04/05; T012–014/T022–023/T029–031. Quatro estados=4/1/1/1/1/25% nos projetos e ambos TaskPage; filtro/prioridade/página/tamanho não alteram globais; vazio/HALF_UP preservados. | API/componentes relatados PASS; RED local do viewBox/correção preservados. CI final E2E PASS e aprovação humana total desktop/390/320/teclado, não nova medição geométrica pelo agente. |
| FR-007; SC-005 | ER-02/03/06; T009/T011/T021/T035–037. V4 populada→V5 compara tabelas/bytes/eventos/checksums antigos; uma migration, repetição zero; DONE antiga/DONE→DONE sem revisão fictícia. | Cobertura backend testada/relatada e G1 aprovado; V3→V4 continua teste independente target 4, não convertido em prova V5. |
| FR-008; SC-006 | ER-02/03/04/05; T009–011/T021/T028–030. Revisão bloqueada permitida, bloqueador em revisão pendente, review→DONE bloqueada, reabertura/novo BLOCKS para dependente DONE recusados; motivos/remoção intactos. | API e erro BLOCKS de componentes alcançáveis desde base IN_REVIEW, relatados PASS; CI final E2E PASS identificado, sem detalhe remoto por cenário. |
| FR-009; SC-004/005 | ER-02/03/05/07; T008/T011/T013/T029–030/T032–033. História tipada, GET/reload e preservação no upgrade; reinício com identidade/estado/versão/história antes/depois. | T033 efetivamente PASS segundo `concluir-002-persistencia-compose`: snapshots completos tarefa (14 propriedades)/projeto/todo o histórico (1 evento/1 página), hashes iguais após restart só da app, DB/volume preservados, nova autenticação. G3 aprovado; não inferido de CI/visual/001 nem rerun documental. |
| FR-010; SC-001/002 | ER-02/03/04/05/07; T006/T010/T018/T020–021/T029. HTTP direto, 409/CSRF/revogação após espera/rollback, draft conservado; base não promovida por GET sujo ou seleção intermédia. | API/componentes relatados PASS e revisões estáticas; CI final E2E PASS identificado e aprovação humana total incluindo teclado, sem logs remotos/detalhe por cenário ou certificação integral de foco. |

### Proteções contra falsos positivos

- Em `ApiIntegrationTest`, fixtures de conclusão legítima persistem revisão e
  usam a versão confirmada; negativas diretas não recebem revisão por helper
  universal. Races de conclusão/reabertura/inserção BLOCKS, versão antiga,
  revogação/inatividade após espera e rollback tardio devem atingir as guardas
  originais. O teste 422 BLOCKS de componentes parte de base IN_REVIEW.
- No editor, testar separadamente draft TODO/IN_PROGRESS com seleção revisão
  (DONE continua disabled), save confirmado, refetch limpo, recuperação
  explicitamente confirmada e reconhecimento local identidade/previousVersion;
  GET externo dirty/falha não promovem base. Preservar campos/templates/guards.
- `reviewDomainPreservesV4CatalogAndExpandsOnlyStatusOnCleanChain` cobre
  CHECK/default/cadeia limpa; `populatedV4UpgradePreservesEveryTaskAttributeRelationAndHistoricalByteWithoutBackfill`
  cobre snapshots completos, ambas as constraints e execução única/repetição
  zero; teste histórico V3→V4 mantém `.target("4")` no segundo Flyway.
- T028/T029 mantêm 11 percursos e acrescentam 2 (13 totais); logout deve
  aguardar POST 204/formulário/auth-me 401 antes de navegar. Controlos de
  filtro desmontados são readquiridos após GET/DOM. Asserts estritos de
  geometria não são relaxados. CI final E2E PASS está confirmado por
  metadados, sem logs/totais/cenários remotos; aprovação humana total
  desktop/390/320/teclado foi explicitamente recebida para T031.
  Build/jsdom e revisões estáticas não provam foco real, SVG ou visual humano.

### Gates de validação aprovados e limites da evidência

O relato inicial do autor sobre E2E PASS foi corroborado independentemente:
**CI #22/run 44436970582 attempt 1**, canónico público **Fibigor/matriz**,
push/main, SHA **`7c182edf7fe1c2cd1009743b029e3cd9d5759c12`** da base CI,
**quatro jobs completed/success**, incluindo build da imagem e execução
E2E do código final. **T030 tem prova PASS via CI**, não novo full local.
O agente `verificar-002-ci-44436970582` conferiu REST público sem credenciais;
esta escrita não consultou rede. [URLs/horários/HTTP e limites](verification.md#feature-002-ci-final).
Logs anónimos 403: totais remotos backend/frontend/E2E desconhecidos;
68/174 locais e 13 cenários preparados não se transpõem para CI.
Não houve jobs skipped; só dois passos condicionais de diagnóstico E2E.
HEAD atual **`336066253151dd8e3e6229a55827e047c7ac4779`** difere apenas
nos nove canónicos documentais, com código/CI inalterados. Esses documentos
não integram a imagem CI; não se afirma CI do SHA 3360662.

Às **01:49:42 UTC**, o autor respondeu **«confirmo aprovação total visual»**
à pergunta que abrangia desktop/390/320/teclado: **T031 aprovada nesse âmbito**,
separada da automação e sem inspeção visual pelo agente ou reutilização de 001.
O bloqueio local anterior de app-only build/recreate fica histórico, não
contradiz o sucesso remoto nem constitui reinício executado.
T032 recebeu aprovação específica às **10:19:48 UTC** para nova stack
`matriz-review-002-final`, loopback app 18082/DB 15433 e volume novo,
preservando a antiga. T033 **PASS**: TODO v1→IN_REVIEW v2 num único PUT,
snapshots integrais iguais antes/depois de restart apenas da app às
10:32:40.042–40.950; mesma DB/volume/StartedAt, nova sessão e GETs 200.
O seed normal não mascara identidade/v2/datas/história conservadas.
[Prova e limites recebidos](verification.md#feature-002-persistencia-final).
Não foi nova suite E2E.

**T034/G3 APROVADO, sem achados**, por `review-002-g3-persistencia`:
evidência recebida + leitura estática própria, não rerun do revisor.
T040 é conferência documental, não execução de SC.
**T041/G4 APROVADO** por `review-002-g4-01-fecho`, após o único achado
G4-01 LOW da revisão integral `review-002-g4-final` ser resolvido.
**T042/G5 APROVADO** por `review-002-g5-final`, sem achados confirmados
ou teste/revisão/reinício obrigatório pendente. As revisões limitadas
anteriores não substituem esses gates formais. DocConfig é escritor único;
T043 concluída após conferências PASS. [Proveniência](verification.md#feature-002-fecho-final).

## Suplemento de usabilidade — 18-11-2026

Delta implementado com aprovação do autor, não aceitação cliente. **T024 fechada, 28/28 tarefas, full E2E 11/11 PASS às 11:55–11:56 UTC**, revisão independente `review-t024-full-closure` PASS; B5/T028 PASS documentados. Visual humano aprovado às 09:42:49Z separadamente. Esta revisão documental **não executa** testes/builds ou serviços. Backend 58/frontend 141/build anteriores e seleção 74/build da correção de foco mantêm proveniência própria. Critérios em [requisitos](requirements.md), [histórias](user-stories.md) e [OpenAPI](../openapi.yaml); [estado e limites](verification.md#estado-vigente--18-11-2026).

| Rastreio da feature | Cenários/asserções e tarefas | Evidência disponível / pendente |
|---|---|---|
| FR-001–003; SC-001 | RF-17/RN-20–22/US-20, T002–003/T010–012: 5/6/200/201 pontos ASCII/astral/espaços, inclusive só espaços/extremos; null/vazio, confirmação exata, mensagens locais/servidor em resumo/campo sem máximo. Login antigo/até 200, CSRF/PathPattern/quota/scrypt/409/201 só mensagem/sem herança/auto-login preservados. | B1 58 e B2 90 selecionados/124 finais/build históricos, gates PASS; percurso real/fronteiras Unicode no full T024 11/11 documentado. |
| FR-011–014; SC-002 | RF-04/RN-03–04/US-04, T004–009: email completo/Unicode/caixa/espaços/254–255 UTF-16 normalizados, legado userId exato, XOR por presença com ambos/nenhum/null/vazio/unknown/tipo inválido; inexistente/inativo mesmo 422/field; 401/403/404/CSRF. Repetição/races email/email e email/userId uma PK/204 sem alterar papel/datas/versão; ator revogado/inativo após espera e alvo protegido. UI só email, nomes/função/inatividade sem IDs/diretório, erro/foco após busy/entrada conservada/sucesso neutro. | API/componentes históricos; registo/membros/idempotência/acesso limitado no full T024 documentado. E2E não substitui todas as regressões API/concorrência. |
| FR-005–007; SC-003 | RF-16/RN-18/US-19, T013–015: três templates distintos, cancelamento não consome; aplicar→disabled/cinzento mesmo após apagar, mudar/regressar de tipo; save/falha/refetch limpo-sujo/erro/recuperação/layout/navegação recusada conservam. Nova criação após sucesso ou fecho/reabertura efetiva/outra tarefa reiniciam sem persistir. | B3 componentes/final 141 em 10 ficheiros/build e re-review PASS históricos; matriz de templates no full T024 documentado. |
| FR-004/008/009; SC-004 | RF-16/RN-18/US-19, T016–019: toolbar única, maximizar/X à direita, X standalone uma confirmação pelo router; foco/Escape/inert/trap só modal, mesma árvore; Editar/Pré-visualizar/três vistas button/aria-pressed/Tab/Enter/Espaço, negrito/sublinhado sem chrome com seleção/foco; Guardar submit/Eliminar button mesma linha, versão/busy/confirm/erro. | Regressões B3 e seleção 74/build da correção de foco históricos; detalhe/foco/guards/standalone/geometria no full T024. Aprovação visual humana separada. |
| FR-010; SC-005/006 | RF-14/RN-17–18/US-16–17/19, T020–021: FilePicker/AttachmentList diretos/comentários, metadados→X retirar só seleção/seta download/X eliminar canDelete; nomes específicos/SVG decorativo, chooser/drop/paste, download/blob/revogação URL, confirmação/cancel/busy/erros/rascunhos e permissões mantidos. | Componentes B3 históricos; anexos/permissões/bytes/ícones responsivos e geometria 1440/390/320 no full T024 documentado. Não é ensaio exaustivo de dispositivos. |
| FR-015; SC-005/006 transversais | T007/T012/T022–024: autorização servidor/locks/CSRF, confirmações, navegação/resize sem remount, dados/rascunhos conservados, foco/nomes/teclado e Axe nos estados cobertos; sem retry automático de escrita. | B1–B3 revistos; preparação T023 por AST distinta do discovery runtime T024: 11 descobertos/11 pass. Axe nos estados cobertos, sem certificação WCAG integral. |

**T023 ≠ T024:** o handover relata TypeScript sem emissão/incremental e AST (11 cenários, zero diagnósticos/sintaxe); referências Buffer foram substituídas por File/DataTransfer/change nativo sem dependências. Após HIGH B4-01, eliminação de anexo aguarda DELETE 204 e GET 200/corpo sem id/filename, sem erro e um DELETE, não mensagem transitória. Não se alterou LoadState de produção.

**Gate T024 ultrapassado pela execução autorizada:** comando, alvo/imagem, artefactos e cronologia RED→GREEN estão em [verification](verification.md#usabilidade-de-contas-tarefas-e-participantes--18-11-2026). O `.last-run.json` confirma passed/lista vazia, não os totais/tempos por si só. Não houve nova execução neste lote documental. Comandos abaixo são procedimentos, não autorização de instalar/iniciar/reexecutar ou de assumir uma instância disponível.

## Extensões — plano e evidência histórica de 13-11-2026

Âmbito aprovado pelo autor, RN-13–19/US-12–19; não validação do cliente. Esta escrita **não executa** comandos abaixo: confronta fontes e reports guardados. [verification](verification.md#extensões-de-tarefas--13-11-2026) regista 41/43/6, sem confundir critérios com execuções.

| ID | Resultado esperado | Evidência existente e verificação final |
|---|---|---|
| V4-01 | Migração vazia/populada V3→V4; MAT global único, ordem de backfill, lacunas permitidas, UUID/datas/versões preservados, sem eventos fictícios. | Maven final 41 passou, incluindo V3 populada→V4/MAT/defaults; arranque vazio V1–V4 da imagem fresca e persistência após recriação app/db confirmados separadamente nos artefactos finais. |
| V4-02 | PUT antigo conserva type/weight omitidos; weight null limpa, type null no PUT 422; motivos só DONE, omissão/transição/reabertura e todos os DONE no progresso. | Backend 41; campos antigos mantêm semântica. |
| V4-03 | RELATED reversa idempotente, BLOCKS/DUPLICATES dirigidas, mesmo projeto/nested scope, sem self; duas versões, 409 antigo, incremento duplo só na criação/remoção explícita. | Backend, componentes e E2E de revisão. |
| V4-04 | Múltiplos bloqueadores: início permitido, conclusão só todos DONE; reabertura com dependente DONE e novo bloqueador não DONE para DONE recusados; ciclos/races reversas e disjuntas; remoção/eliminar desbloqueia sem mudar estados. | Backend com lock de projeto; histórico sobrevivente sem incremento na cascata. |
| V4-05 | 5 diretos e 5/comentário, 4 MiB; PNG/JPEG/GIF/WebP/PDF/TXT/MD, UTF-8/Unicode/NUL/markup, nome sanitizado, vazio/formato/count/tamanho; multipart JSON-part e JSON antigo. | Backend incluindo concorrência e servlet HTTP real; 400/413/415/422 distintos, não antivírus/parsing completo. |
| V4-06 | Download revalida acesso, MIME/length/attachment/nosniff/no-store; só autor ou gestor participante elimina; revogação/inatividade inclusive writer à espera do lock. | Backend final e HTTP da imagem fresca: downloads/bytes/hashes/headers, 401 anónimo, 404 alheio e 403 não autor confirmados; E2E e browser Markdown só de leitura passaram. Inspeção humana continua pendente, sem garantia exaustiva de segurança. |
| V4-07 | Falha tardia DB/ficheiro reverte lote/comentário/evento; texto obrigatório, sem cmtedit/delete/upload posterior; história typed text/number/userIds, null/listas vazias, snapshots/cascatas/paginação/idempotência. | Backend com falha induzida/FKs; componentes attachments/activity. |
| V4-08 | Markdown básico seguro, HTTP/HTTPS, sem HTML/imagens/GFM; 3 templates/confirmreplace/tipo não automático, 2 000 Unicode mantido. | MarkdownEditor/taskTemplates; vite.config descobre .test.ts e .test.tsx. |
| V4-09 | Mesmo detalhe hash/painel (>960 px)/página móvel/resize; foco/Escape/inert/retorno; preserveDraft em falha/navegação/mudança para página. | Componentes/E2E; inspeção humana screenshots/teclado pendente. |
| V4-10 | Atribuir/retirar e criar/remover link conserva título/descrição/tipo/peso, avança só base local reconhecida; refetch externo não avança base suja; 409/recuperação confirmada; retry/Enter sem alvo não submetem. | 6 regressões + sexto E2E; 43 finais com 13 originais e 2 templates descobertos. |
| V4-11 | Mesma imagem final passa build/gates npm/JAR/Semgrep/E2E; migração e persistência após recriação, readiness/outage/recovery, sem perder volumes/dados; revisão independente. | **Parte local passou**: 41/43/6, imagem/contentores frescos, Trivy 0 HIGH/CRITICAL (294/294 npm, 63/63 JAR), Semgrep 135/47/0, actionlint 1.7.7 PASS; migração populada no Maven, ambos IDs novos no mesmo volume, snapshots/bytehashes iguais após recriação e recuperação DB; readiness 503/liveness 200 durante paragem só da DB própria. App/db próprios parados, volume retido. **Revisão independente/humana e GitHub Actions no âmbito/branch atual, uploads/retenção reais pendentes**. |

Comentários/links/história: page=1, pageSize=20 (1–100), ascendente (createdAt,id), snapshot count/items; beyond-end vazio, zero total zero páginas. Seletor pesquisa só página indicada; filtro visual de história não é parâmetro global API. Autorizar antes de executar; usar ambiente fictício isolado e preservar `.env`/volumes.

## Âmbito e critérios de referência

Este plano deriva dos requisitos e critérios da ficha 03, não apenas do comportamento atual. O foco é criação e consulta de tarefas e a fronteira de autorização entre participantes, conforme RF-05, RF-06, RF-10 e US-05/US-06/US-10. A API e as respostas esperadas seguem `openapi.yaml`; os detalhes de validação de título seguem RN-02/RN-05.

Todos os dados persistentes dos testes de integração vivem no PostgreSQL isolado por Testcontainers. Os testes criam o seu próprio projeto; o E2E usa nomes únicos e elimina o projeto criado. Os testes não alteram dados dos projetos demo existentes.

## Cenários selecionados

| ID | Cenário e entrada | Resultado esperado | Nível e teste |
|---|---|---|---|
| UT-01 | Título válido com espaços exteriores. | `Inputs.title` remove apenas espaços das extremidades e devolve o texto normalizado. | Unitário — `InputsTest.acceptsValidTaskTitleAfterTrimming`. |
| UT-02 | Título com exatamente 200 pontos de código Unicode. | Aceite sem truncagem; caracteres suplementares contam como um ponto de código cada. | Unitário — `InputsTest.acceptsTaskTitleAtUnicodeCodePointLimit`. |
| UT-03 | Título apenas com espaços ou com 201 pontos de código. | Rejeitado como `ApiException` de validação; o limite não é contornado por Unicode suplementar. | Unitário — `InputsTest.rejectsBlankAndOverLimitTaskTitles`. |
| INT-01 | Ana, participante/gestora, cria uma tarefa válida num projeto novo e consulta-a numa nova sessão autenticada. | `POST` devolve 201 e título/estado inicial/prioridade/responsáveis coerentes; `GET` devolve os mesmos dados persistidos. | Integração — `ApiIntegrationTest.taskCreationPersistsAndNonParticipantsCannotReadUpdateOrDeleteIt`. |
| INT-02 | Carla, sem participação no projeto de Ana, tenta consultar, editar e eliminar a tarefa criada em INT-01. | Cada operação devolve 404; nova consulta por Ana confirma que a tarefa, versão e estado não foram alterados. | Integração / autorização — mesmo teste INT-01; PostgreSQL real via Testcontainers. |
| INT-03 | Título composto apenas por espaços na criação da tarefa. | A API devolve 422 e não apresenta criação como sucesso. | Integração — `ApiIntegrationTest.createsAndReadsPersistedTaskAndRejectsInvalidInput`. |
| E2E-01 | Autenticar, criar um projeto de teste, abri-lo, criar uma tarefa e consultar a listagem. | A tarefa aparece exatamente uma vez na interface do projeto; no fim, o projeto isolado é eliminado pela interface. | E2E — `Ficha 04: autenticar, abrir projeto, criar tarefa e confirmar listagem` em `frontend/e2e/matriz.spec.ts`. |

O caso negativo de autorização usa duas contas de demonstração distintas. A resposta 404 para o utilizador sem participação segue a regra RN-01 de não distinguir recursos alheios de inexistentes. Testes unitários verificam a regra isolada; testes de integração exercitam controller, autorização, serviços e PostgreSQL; o E2E valida o percurso observável na interface.

## Comandos

Executar a partir da raiz:

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
```

Executar testes de componentes e build frontend:

```powershell
Set-Location frontend
npm test
npm run build
```

Executar E2E contra Vite/API/seed locais já iniciados, ou contra o Compose:

```powershell
Set-Location frontend
npx playwright install chromium
npm run test:e2e
```

```powershell
Set-Location frontend
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
```

Os E2E necessitam de uma instância Matriz de teste com o seed fictício ativo. Não usar os testes contra dados reais. Para comandos de arranque e configuração, seguir as instruções do README; não substituir `.env` existente nem apagar volumes.

## Registo dos resultados

Os resultados observados para esta ficha e respetivas limitações estão em [quality-security-review.md](quality-security-review.md). Um cenário só deve ser marcado como executado quando o comando terminar e o resultado for observado; cobertura de código não substitui os critérios acima.
