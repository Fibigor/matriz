# Matriz — Verificação atual e histórico

<a id="estado-vigente"></a>

## Estado vigente — 18-11-2026

**Candidato académico `0.4.0-rc.1`, sem bump/release/publicação ou validação do cliente.** Este resumo prevalece sobre estados intermédios datados abaixo, preservados como cronologia; não anuncia novas execuções desta revisão documental.

| Tema | Estado e proveniência |
|---|---|
| Registo académico | Aprovado pelo autor em 17-11; conta ativa sem confirmação email, sucesso regressa ao login sem auto-login. Evolução de usabilidade implementada em 18-11. Contrato vigente: RF-01–17, US-01–20 e 30 operações no OpenAPI. |
| T024 / incremento de usabilidade | **Fechada [x], 28/28 tarefas**, conforme [tasks](../specs/001-usabilidade-contas-tarefas/tasks.md) e registo detalhado abaixo: full autorizado único de **11:55:02.541–11:56:16.986 UTC, 11/11 PASS, exit 0**, sem grep/retries; não soma de seleções. Revisão independente readonly **`review-t024-full-closure` PASS**, sem findings substantivos. Gates B5 e T028 PASS documentados. |
| Visual humano | Aprovação do autor em **18-11-2026T09:42:49Z**, com proveniência própria. Não inferir cobertura específica dessa aprovação nem nova inspeção visual das imagens pelo agente. |
| Testes/build anteriores | Backend **58** e frontend **141/10 ficheiros/build** pertencem a B1/B3. A correção de foco tem seleção **74/build** próprios. Não foram reexecutados pelo full nem por esta revisão documental; 41/43/6 e scans de 13-11 continuam históricos. |
| Artefactos do full | `frontend/test-results/t024-20261118-1155-full`: `.last-run.json` passed/failedTests vazio e oito PNG inventariados no relato. A leitura do JSON isolado não prova totais, tempos ou cobertura; estes vêm da execução/console documentada abaixo. Sem HTML/trace. |
| CI / segurança | Log remoto das **14:08 UTC fornecido pelo autor**, não scan desta tarefa: um HIGH picomatch bloqueou antes dos E2E. Exceção exata aprovada às **14:30:17Z** e implementada no workflow; ver secção seguinte. Não há novo scan limpo nem confirmação remota da política modificada. |
| Ainda pendente | Prova CI positiva/negativa da política atual e uploads/retenção reais, aceitação do cliente, entrega portável de evidência externa e decisões de capacidade/backups/retenção/p95/produção. O fecho T024 não as encerra nem certifica segurança/WCAG integral. |

**Leitura da cronologia:** estados «bloqueado», «parcial», «27/28» e revisões então pendentes nas notas anteriores ao full descrevem essas fases, não o estado vigente. RED e respetivos diagnósticos não foram apagados nem convertidos retroativamente em PASS. O resumo não autoriza novas execuções ou utilização de serviços.

## Sincronização dos testes de foco após registo — 18-11-2026

Log CI fornecido pelo autor às 18:31 UTC: frontend com **140/141 testes PASS**, falha em `App.test.tsx:201` no foco do email após registo com 200 espaços. A mensagem de sucesso já estava no DOM, mas o foco ainda estava no body. A presença da mensagem não garante que o `useEffect` de foco do login já executou.

Correção aprovada pelo autor nesta sessão: as três assertions de foco após sucesso do registo em `frontend/src/App.test.tsx` passam a usar `await waitFor(...)`. Mantêm a exigência de foco no email; não acrescentam sleeps, retries da suite nem alterações ao comportamento da aplicação, contratos ou dependências.

**Execuções próprias locais, Windows, cwd `frontend`:** antes da alteração, `npm test -- src\App.test.tsx` às **18:32:39 UTC**, **57/57 PASS**, exit 0; a falha intermitente não foi reproduzida nessa execução. Depois da alteração, `npm test` às **18:33:05 UTC**, **141/141 PASS em 10 ficheiros**, exit 0, e `npm run build` (**TypeScript + Vite**) PASS, exit 0. Estes resultados são novos e separados das execuções históricas acima; não confirmam o CI remoto nem constituem verificação browser/E2E, visual ou de segurança.

## Exceção temporária do scan CI — 18-11-2026

Log remoto fornecido pelo autor, não execução própria: às14:08 UTC Trivy0.76.2 recuperou o erro `BLOB_UNKNOWN` do mirror através de GHCR; frontend-scan exit1 por **`picomatch@4.0.7 / CVE-2026-112366 / HIGH`, sem fix reportada**, image-scan exit0. Cobertura npm294/294 e JAR63/63, 64 entradas Java reportadas, sem pacotes em falta/erros, highCritical1/gatePassedfalse. O gate bloqueou antes dos E2E; não invalida nem substitui o full local11/11 anterior.

Leitura própria do lock: picomatch4.0.7 `dev: true`, usado por Vite7.3.7, Vitest4.1.12, tinyglobby0.2.17 e peer opcional de fdir6.5.0. [Advisory GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf): ReDoS; nenhum fix publicado identificado na investigação. A classificação dev não prova ausência de exploração.

Autor aprovou às14:30:17Z uma [exceção de risco exata e temporária](constraints.md#restrições-em-vigor--ficha-03-extensões-v4-e-registo-académico), implementada apenas no Python de `.github/workflows/ci.yml`. Aceita só frontend/npm, CVE/pacote/versão/severidade exatos, todas as ocorrências dessa versão no lock dev, sem fix e antes de **2026-11-25T00:00:00Z**. Report/console mantêm finding, motivo, validade e disposição ACCEPTED RISK, total `highCritical` real, lista `acceptedHighCritical`, contagem `blockingHighCritical` e instante UTC `assessedAt`. Outros findings e falhas operacionais/cobertura permanecem bloqueantes; sem ignores, redução de severidade ou exclusão de dev.

`--exit-code 0` nos scans delega a decisão de vulnerabilidades ao gate Python; exit não zero do scanner continua a bloquear. Não é remediação ou “zero vulnerabilidades”.

**Validação própria nesta alteração:** PowerShell here-string via `python -`, Python3.14.10: extraído/compilado o Python real do passo scan e executado integralmente com filesystem/subprocess/relógio simulados em memória, sem escrever fixtures ou iniciar Docker: **23/23 cenários PASS, exit0**. Cobriu exceção exata visível, instante imediatamente anterior/igual/posterior à expiração, pacote/versão/CVE/severidade diferentes, fix disponível, tipo/report errados, dependência de produção/dev ausente/ocorrência mista, finding adicional bloqueante, falha operacional de cada um dos três comandos, ambos JSON inválidos, cobertura npm/JAR incompleta e ausência do finding após expiração. Verificou tentativa de ambos os scans, flags e disposição/contagens/gate. Fixtures não são um novo scan nem prova de acesso à DB pública.

Segundo here-string `python -`, com PyYAML já disponível: YAML carregado e **dois blocos Python embutidos analisados por AST, PASS/exit0**. `git diff --check` PASS; índice preservado vazio. `actionlint` não disponível no PATH, não instalado/executado; parsing não substitui lint integral de Actions. Nenhuma nova execução Trivy ou GitHub Actions, teste funcional/build/E2E, instalação ou alteração de serviços nesta fase; confirmação remota da política modificada permanece pendente.

## Usabilidade de contas, tarefas e participantes — 18-11-2026

**Contexto do incremento e cronologia:** implementação aprovada pelo autor («aprovo» ao início pelos caminhos do plano, incluindo dois helpers de email, testes e documentação), não cliente/produção/publicação. P1/P2 e speckit-analyze readonly anteriores sem findings, 28 tarefas, segundo handover. Mesmos [spec](../specs/001-usabilidade-contas-tarefas/spec.md), [plan](../specs/001-usabilidade-contas-tarefas/plan.md), [tasks](../specs/001-usabilidade-contas-tarefas/tasks.md), research/data-model/contracts delta/quickstart/checklist, sem regeneração nem outro contrato concorrente. Cabeçalhos antigos de aprovação e estados T4/B5 são históricos; prevalece o resumo vigente acima.

### Implementação e evidência recebida, não executada pela B5

| IDs / fonte | Resultado e alcance |
|---|---|
| T001, confirmação do Orquestrador no handover | Contexto/artefactos/aprovação/inventário incluindo duas criações, testes e docs confirmados; sem Git writes. |
| B1 T002–T007, relato executor + gate independente PASS | Sete caminhos, incluindo novo Emails.java. Registo 6–200 pontos brutos, mensagens mínimo/excesso seguras em detail/errors; login curto/até 200, sessão/CSRF/PathPattern/quota/scrypt/201 só mensagem/sem auto-login preservados. MemberInput email/userId XOR por presença inclusive null; extra 400; addMember autoriza/lock de projeto/revalida ator após espera, alvo FOR SHARE e ON CONFLICT dirigido à PK; 204 idempotente/races mistas, inelegibilidade igual por campo. Seleção ApiIntegrationTest 11 passou; `mvn -f backend\pom.xml test '-Dapi.version=1.44'`: **58**, zero falhas/erros/skips, relatados. Revisor leu reports 44 API +1 LoginThrottle +3 RegistrationThrottle +5 Inputs +5 Observability; não executou testes. |
| B2 T008–T012, relato executor + gate independente PASS | Cinco caminhos, novo email.ts; UI Members só email/nome/função/inatividade, sem IDs/diretório, erro/foco após busy/entrada conservada/204 neutro. Register 6–200 bruto, ajuda só mínimo, excesso sem máximo; login inalterado. Em frontend `npm test -- src/App.test.tsx src/Tasks.test.tsx`: **90**; `npm test`: **124**, duas execuções finais; `npm run build`: PASS, todos relatados, não rerun B5. |
| B3 T013–T022, relato executor + re-review independente PASS | Catorze caminhos, templates por tipo/ciclo conservados em save/refetch/erro/recuperação/maximizar/resize; NewTask montado após primeira carga inclusive em erro recuperável; toolbar/seletores/ações finais/anexos partilhados. Primeiro gate encontrou P2/B3-01, dupla confirmação X standalone. Corrigido TaskDetailPanel + teste integrado TaskDetail com App/hash: toolbar só callback, router guard standalone e guard explícito no painel. RED três confirmações em vez de duas para cancel+accept; GREEN seleção TaskDetail/Panel/App **74**; `npm test` final **141 em 10 ficheiros**, `npm run build` PASS, relatados. Primeira seleção teve falha temporal pontual de foco B2; repetição/full passaram sem alteração de código B2. Não é prova de ausência de instabilidade, nem falha funcional ativa demonstrada no final. |
| B4 T023, relato executor + revisor da correção readonly PASS | Só frontend/e2e/matriz.spec.ts, **11 cenários por AST**, não discovery Playwright. Fonte preparada para SC-001–006, 1440/390/320 px/geometria/teclado/Axe/email/registo/templates/ficheiros/permissões/standalone uma confirmação. Referências Buffer (três preexistentes e seis novas) substituídas por File/DataTransfer/change nativo; TypeScript sem emissão/incremental e AST: zero diagnósticos/erros de sintaxe relatados, sem instalação. Não se inventa aqui comando exato não fornecido. |
| Correção HIGH B4-01, relato executor/revisor | Assertion de mensagem transitória após eliminar anexo substituída por espera DELETE 204 + GET 200, corpo sem id/filename, ausência de erro e um único DELETE. LoadState preexistente confirmado no HEAD pelo revisor; sem correção de produção fora do âmbito. Revisor liberou B5 com T024 bloqueado, não B4 PASS runtime. |

<a id="t024--parcial-visual-aprovado-pelo-autor-e2e-automático-pendente"></a>

### T024 — parcial: visual aprovado pelo autor, E2E executado com falha

**Título histórico da fase das 09:52 UTC**, conservado para compatibilidade de ligações. A cronologia seguinte termina no full 11/11 PASS e fecho T024 às 11:56; não descreve uma falha ainda aberta.

**Atualização de 18-11-2026T09:42:49Z:** análise visual manual realizada e aprovada pelo autor, segundo o seu relato/aprovação: «ok podes dar como feita e aprovada a análise visual».

O alvo disponibilizado ao autor foi `http://localhost:18086` (equivalente a `http://127.0.0.1:18086`). Segundo o relato do executor de arranque transmitido no handover, após a autorização do autor de 18-11-2026 às 09:35 («podes lançar o serviço para fazer analise visual»), o projeto próprio `matriz-signup-check` foi reutilizado, apenas a app reconstruída com o código atual e a DB/volume preservados; imagem `sha256:550f89e69d64727d1713f66b8b8576278e2fb7a11c5d192a4a443a4f3f368c96`. Trata-se de proveniência relatada do alvo servido, não de uma sonda ou confirmação de disponibilidade atual por este agente documental.

**Alcance da nota visual de 09:42:49Z, anterior à execução E2E abaixo:** esta nota regista exclusivamente a aprovação visual humana. O agente documental não executou browser, inspeção visual, screenshots, Axe ou testes; não se atribui à aprovação cobertura específica de viewports, dispositivos, cenários, geometria ou teclado. Naquele momento, E2E automáticos e restante cobertura planeada de T024 continuavam pendentes/não executados, sem dispensa explícita desse requisito. Não encerra todos os FR/SC nem constitui validação do cliente ou de produção.

**Atualização — execução de 18-11-2026, 09:52:06–09:52:18 UTC: E2E EXECUTADO COM FALHA/PARCIAL.** Fonte: relato do Engenheiro Frontend `executor-t024`, transmitido pelo utilizador, não execução/revisão independente deste agente documental. O utilizador aprovou E2E contra `http://localhost:18086`, saídas em `frontend/test-results` e esta atualização dos dois ficheiros. Uma única execução da suite completa, sem seleção por grep, interrompida à primeira falha; duração relatada **11,892 s**, **exit 1**. Comando PowerShell, com cwd `frontend`:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://localhost:18086'
$env:PLAYWRIGHT_NO_COPY_PROMPT='1'
npm run test:e2e -- --output=test-results/t024-20261118-0949 --reporter=line --trace=off --retries=0 --max-failures=1
```

O executor filtrou stdout em memória, omitindo valores de assertions/excertos de fixtures para preservar segredos e mantendo o exit. **11 testes descobertos em runtime: 0 passaram, 1 falhou, 10 não executados devido a `--max-failures=1`; sem skip reportado e sem retries.** Os 11 cenários AST de T023 continuam evidência histórica de preparação estática, não discovery nessa fase; agora há discovery pela execução relatada, sem executar `--list`.

| Evidência relatada pelo executor | Resultado e limites |
|---|---|
| Primeira falha, `frontend/e2e/matriz.spec.ts:279:49` | `expect(members.getByRole('status')).toHaveText(...)`: strict mode violation, dois elementos simultâneos — confirmação de participação e «A carregar…». POST de participação já devolvera **204**. Após confronto de Projects.tsx/ui.tsx, o executor aponta provável ambiguidade temporal do seletor, não recusa da API; diagnóstico não confirmado independentemente aqui. Sem correção nem nova execução. |
| Pré-requisitos observados antes da execução | `matriz-signup-check-app-1` running/healthy, iniciada às 09:38:09 UTC; imagem `sha256:550f89e69d64727d1713f66b8b8576278e2fb7a11c5d192a4a443a4f3f368c96`. HTTP raiz/assets 200, JS/CSS iguais a frontend/dist e textos do delta confirmados. Playwright 1.56.1/Chromium 141.0.7390.37 instalados e lançados; Node 26.13.1/npm 11.2.0. Nesta execução, sem instalação/gestão de serviços ou POST de sondagem. Não são sondas deste agente nem garantia de disponibilidade atual. |
| Cobertura anterior à falha, dentro do cenário que falhou | Registo real **201**, login explícito, ausência de projetos/herança e adição por email **204**; quatro análises Axe sem violações nos estados anteriores, teclado/foco parcial e verificação de overflow a 390 px. Não significa cenário aprovado, suite completa, conformidade integral nem nova inspeção visual pelo agente. |
| Artefactos e preservação | Destino novo `frontend/test-results/t024-20261118-0949/.last-run.json`, estado failed; sem PNG/HTML/trace, diretórios temporários vazios do runner. Evidência anterior preservada por comparação de hashes, segundo executor. **Conferência própria documental:** leitura do JSON confirma `status: failed` e um identificador em `failedTests`; este ficheiro não confirma por si tempos, totais, diagnóstico ou cobertura. |
| Efeitos e quota | Uma conta fictícia, três projetos fictícios e uma participação; sem cleanup. Consumido um pedido de registo; os dois outros cenários de registo não correram. Não inferir saldo atual da quota. Zero alterações de fontes/config/docs/tasks durante a execução, segundo executor; sem Git writes, leitura de `.env`, reset de seed ou alteração de volumes. Índice SHA-256 relatado e conferido por este agente antes da edição: `887B4E26E84A105255DAD087275C8F6DFE13224EAF0E6730A98090B6CA3F57F5`. |

**Pendências registadas às 09:52 UTC (histórico, atualizado pela execução seguinte):** geometria dedicada 1440/390/320 px, restante teclado/foco/guards, templates, anexos/download/permissões e Axe dos estados posteriores; conclusão da suite e revisão independente desta nova nota/evidência. A aprovação visual humana de **09:42:49Z permanece válida, com proveniência própria**, sem ser convertida em cobertura automática específica. Backend **58** e frontend **141/10 ficheiros/build PASS** acima pertencem às execuções anteriores B1/B3, não a este E2E falhado. Nenhuma nova revisão PASS é declarada; correção/reexecução depende de encaminhamento/autorização, sem novo backlog nem continuação automática.

Esta atualização documental segue `contexto-matriz`, `validacao-matriz` e `speckit-implement` por leitura dos SKILL.md, sem mecanismo nativo de invocação; apenas registo de evidência T024/T027 e progresso serializado autorizado. Mesmos spec/plan/tasks e constituição lidos; checklist de qualidade 16/16 por leitura, não validação funcional. Sem helper de resolução, hooks, persistência de feature state, testes/builds/serviços/probes ou subagentes; apenas os dois caminhos aprovados são editados. Estados antigos noutros documentos fora desse âmbito não foram atualizados.

**Atualização posterior — execução de 18-11-2026, 10:00:39.406–10:03:09.400 UTC: E2E EXECUTADO COM FALHA/PARCIAL, 5 pass / 1 fail / 5 não executados.** Fonte: novo relato do executor transmitido pelo utilizador, não execução ou revisão independente deste agente documental. O autor aprovou a correção do seletor e a repetição nas mesmas condições do plano, incluindo atualização destes dois documentos. O RED de **09:52 UTC (0 pass / 1 fail / 10 não executados)** acima permanece histórico; «sem correção nem nova execução» na respetiva tabela descreve apenas aquela fase.

Correção relatada: **uma única linha fonte**, `frontend/e2e/matriz.spec.ts:279`, de `members.getByRole('status')` para `members.getByRole('status').filter({ hasText: 'Participação confirmada.' })`. Assertion da mensagem completa, POST **204** e participação única preservados; sem `first`/`nth` arbitrários, sleeps ou edições de produção. A leitura documental confirma esse seletor e as assertions adjacentes, mas não comprova por si o diff de uma linha entre as duas execuções. Não houve correção extra nem rerun após a nova falha.

Comando relatado, cwd `frontend` (registo de evidência, **não executado nesta atualização documental**):

```powershell
$env:PLAYWRIGHT_BASE_URL='http://localhost:18086'
$env:PLAYWRIGHT_NO_COPY_PROMPT='1'
npm run test:e2e -- --output=test-results/t024-20261118-0958 --reporter=line --trace=off --retries=0 --max-failures=1
```

Console filtrada em memória para proteger credenciais, exit preservado. Duração de parede relatada **149,995 s**; runner **2,5 min**, **exit 1**. **11 descobertos, 5 passaram, 1 falhou, 5 não executados**, interrupção por `--max-failures=1`, sem skip reportado e sem retries.

| Nova evidência relatada pelo executor | Resultado e limites |
|---|---|
| Cenário corrigido | Passou, incluindo repetição da adição, participação única e acesso limitado. Não converte o RED anterior em sucesso retroativo nem a suite atual em PASS. |
| Nova falha de templates | Timeout de **120 s** em `exerciseTemplates`, `frontend/e2e/matriz.spec.ts:93`, caller `:768`, à espera de «Tipo» dentro de «Nova tarefa». O runner reportou também um erro fora dos testes associado à interrupção. Fonte/configuração lidas confirmam a operação e timeout configurado; **causa ainda não investigada nem investigação/correção autorizada**, sem diagnóstico definitivo. |
| Cobertura dos cinco cenários passados | Registo/fronteiras Unicode/login, membros/idempotência/permissões, percurso integrado, download, relações e preservação/recuperação de rascunhos passaram, segundo executor. **Cinco análises Axe passaram** (quatro no primeiro cenário + uma Ficha 04); não cinco cenários exclusivamente Axe, nem prova de conformidade integral. |
| Cobertura parcial ou não executada | Teclado/foco, resize **1440↔390** e overflow apenas parciais. Cenários dedicados de geometria **1440/390/320**, seletores/guards e anexos **não executados**; o download no percurso integrado não substitui o cenário dedicado de anexos. Matriz de templates não concluída. Sem inspeção visual pelo agente; aprovação visual humana de **09:42:49Z** preservada separadamente, sem lhe atribuir estes resultados automáticos. |
| Alvo e condições | Antes da execução, HTTP **200**, imagem autorizada saudável e JS/CSS correspondentes a `frontend/dist`; saudável após execução, segundo executor. Mesma imagem `sha256:550f89e69d64727d1713f66b8b8576278e2fb7a11c5d192a4a443a4f3f368c96`. Sem instalação, restart ou sondas POST pelo executor; nenhuma sonda/serviço por este agente documental. Não é confirmação de disponibilidade atual. |
| Artefactos | `frontend/test-results/t024-20261118-0958/.last-run.json` failed; sem PNG/HTML/trace/error-context segundo executor. **Conferência própria por leitura:** JSON contém `status: failed` e um identificador em `failedTests`; não prova tempos, totais ou cobertura. Artefacto anterior preservado. |
| Dados e quota | **Três pedidos de registo nesta execução; quatro conhecidos na janela contando o anterior**, sem 429 reportado; não inferir saldo atual. Três novas contas fictícias; restantes dados deixados, exceto eliminações já inerentes aos próprios testes, sem cleanup extra. |
| Preservação relatada | Hashes dos outros ficheiros/índice idênticos antes/depois; uma linha fonte foi a única edição do executor, sem docs/tasks editados por ele. Conferência documental própria de preservação é separada da evidência de execução. |

**Pendências históricas após 10:03 UTC, ultrapassadas pelas fases seguintes:** investigar a falha de templates apenas sob nova autorização; concluir matriz de templates e os cinco cenários não executados, geometria dedicada/seletores/guards/anexos e restante teclado/foco/Axe, sem promover cobertura parcial a integral. Revisão independente da correção e desta nova nota/evidência **pendente naquela fase**, sem nova revisão PASS então. Sem correção adicional, rerun ou continuação automática nesse registo. Este registo T024/T027 usa as mesmas skills por leitura, limitado a `docs/verification.md` e `specs/001-usabilidade-contas-tarefas/tasks.md`; checklist 16/16 de qualidade, sem regenerar plano, helper, hooks ou estado persistido.

**Registo de investigação e correção autorizadas, 18-11-2026, 10:36–10:48 UTC:** o autor autorizou investigação sem edições, depois aprovou os seis seletores abaixo, atualização destes dois documentos, uma execução dirigida e uma execução completa condicionada ao sucesso da primeira, com revisão independente readonly. Skills `debug`, `contexto-matriz` e `validacao-matriz` invocadas nativamente; ferramentas IDE disponíveis, mas sem sessão/configuração de execução. O autor escolheu continuar por fonte/artefactos/Playwright, **sem evidência do debugger IDE**.

Alvo revalidado: raiz `http://localhost:18086` **HTTP 200**, app/DB `matriz-signup-check` saudáveis, imagem da app exatamente `sha256:550f89e69d64727d1713f66b8b8576278e2fb7a11c5d192a4a443a4f3f368c96`; app ainda saudável após a execução completa. Não houve instalação, arranque/restart, reset/cleanup, leitura de `.env`, alteração de produção ou operação no índice.

**Causa estabelecida para o timeout de templates:** o helper fazia `getByLabel('Tipo', { exact: true })` num label que envolve o select e as opções. Reprodução isolada em Chromium, com markup equivalente ao componente: texto do label `TipoTarefaBugMelhoria`, **zero** correspondências pelo label exato, **uma** por `getByRole('combobox', { name: 'Tipo', exact: true })`, seleção de BUG bem-sucedida. O filtro de estado tem o mesmo problema (zero por label exato, uma por role). A reprodução no alvo, sem edições, voltou a falhar na primeira seleção, linha 93/caller 768, após 120 s; não era espera por aplicação de template nem motivo para aumentar timeout.

Correção aprovada/aplicada **só em `frontend/e2e/matriz.spec.ts`**: quatro seletores de Tipo (duas ocorrências no helper e duas no cenário) e dois de Filtrar por estado passaram de label exato para combobox/nome exato, mantendo scope, valores e todas as assertions. Preservada a correção anterior do status de participação; sem sleeps, seletores posicionais, aumento de timeout ou mudança de produção.

Comandos realmente executados em `frontend`, com `PLAYWRIGHT_BASE_URL=http://localhost:18086`, `PLAYWRIGHT_NO_COPY_PROMPT=1` e `FORCE_COLOR=0`; stdout capturado/filtrado em memória para não imprimir credenciais:

```powershell
npm run test:e2e -- --grep '^templates:' --output=test-results\t024-20261118-1040-templates-red --reporter=line --trace=off --retries=0 --max-failures=1
npm run test:e2e -- --grep '^templates:' --output=test-results\t024-20261118-1040-templates-fix --reporter=line --trace=off --retries=0 --max-failures=1
npm run test:e2e -- --output=test-results\t024-20261118-1048-full --reporter=line --trace=off --retries=0 --max-failures=1
```

| Execução observada nesta sessão | Resultado e limites |
|---|---|
| RED dirigido, 10:37:44.126–10:39:49.540 UTC | **0 pass / 1 fail**, exit **1**, mesmo timeout de 120 s em Tipo/Nova tarefa; erro adicional fora de teste após interrupção. Só um cenário selecionado, sem registos. |
| Correção dirigida, 10:47:35.490–10:47:53.275 UTC | **1 pass**, runner **9,1 s**, exit **0**. Matriz de templates em criação/edição, cancelamento, save/refetch/erros/recuperação e ciclos percorreu o cenário completo. Sem registos; não prova a suite completa. |
| Suite completa, 10:48:00.893–10:48:46.285 UTC | **11 descobertos, 6 pass / 1 fail / 4 não executados**, runner **44,2 s**, exit **1**; templates passou novamente. Sem retries; interrupção por max-failures=1. |
| Novo bloqueio, `frontend/e2e/matriz.spec.ts:1044` | `expect(origin).toBeFocused()` após reabrir o painel e fechar com Escape. O diálogo já não existia; o link foi resolvido sete vezes como não focado e depois não encontrado durante a espera. **Causa ainda não estabelecida**: não atribuir automaticamente a produção, locator ou timing. Runner voltou a indicar um erro fora dos testes associado à interrupção, sem causa independente demonstrada. Sem nova correção/rerun. |
| Cobertura adicional antes da nova falha | Cenário de templates completo; no cenário de detalhe, seletores textuais/CSS/teclado, trap Tab/Shift+Tab, cancelamentos, erro de save/busy, geometria do painel a **1440/390/320**, ausência de overflow, conservação dos nós/rascunhos e três Axe do painel ultrapassaram as assertions. A parte posterior de hash direto/standalone não foi executada; quatro outros cenários não correram, incluindo cobertura dedicada de anexos. Não declarar cenário de detalhe aprovado nem cobertura integral. |
| Artefactos | Diretórios novos acima; `.last-run.json` lidos para dirigido corrigido (**passed**, lista vazia) e full (**failed**, um identificador). Inventário do full contém apenas `.last-run.json`: sem PNG/HTML/trace persistidos, embora o código anterior à falha tenha chamado screenshot/attach nas três larguras. Console desta sessão é a fonte dos totais/tempos/diagnóstico; JSON isolado não os comprova. Diretórios das falhas anteriores preservados. |
| Efeitos e quota | Dois cenários dirigidos criaram dados fictícios de projeto/tarefa conforme o ponto atingido; sem registos. Full fez os **três registos previstos**, sem 429, mais de 15 minutos após a execução anterior que usou registo; nenhum restart/spoof para contornar quota. Dados fictícios deixados salvo eliminações inerentes aos testes; sem cleanup adicional. Backend/frontend/build históricos não reexecutados. |

**Estado após 10:48 UTC: 27/28, T024 `[ ]` PARCIAL; suite completa continua FALHADA.** Aprovação visual humana de 09:42:49Z permanece separada. Nova investigação de foco/correção requer apresentação de âmbito e aprovação; não houve continuação automática. Revisão independente `review-template-locators` pelo Revisor Matriz **PASS, sem findings substantivos**, limitada aos seis seletores e novas notas/rastreabilidade destes dois documentos. Revisor conferiu fonte/artefactos/27 checkboxes e índice vazio por leitura, sem executar testes/builds/serviços nem editar ficheiros; tempos/totais/cobertura são evidência da execução acima, não rerun do revisor. A proveniência do delta de sessão foi fornecida explicitamente porque o diff Git inclui trabalho anterior. Esta nota substitui o estado das 10:03 acima, conservado como histórico.

**Atualização vigente — investigação do foco e correção local, após aprovação de 18-11-2026T10:51:58Z:** o autor aprovou diagnóstico Playwright em memória, com um projeto/uma tarefa fictícios e sem registos/screenshots/escritas de ficheiros; depois aprovou `frontend/src/App.tsx`, regressão em `frontend/src/TaskDetailPanel.test.tsx`, estes dois documentos e testes unitários/build. Aprovou ainda o refinamento do router para consumir uma única vez o destino de fecho já confirmado. **Atualizar/reiniciar/reconstruir a app servida e executar E2E da correção não estão autorizados nesta fase.**

Diagnóstico próprio no alvo antigo reconfirmado HTTP200/saudável/mesma imagem autorizada, sem debugger IDE: `closePanel` limpava `background` antes de o hash observado pelo router mudar. A renderização intermédia substituía `ProjectDetail` por `TaskDetail` standalone e depois remontava o projeto; o link original era desligado do DOM. Dois percursos distintos no mesmo projeto/tarefa, sem retries automáticos: no percurso simples o fecho maximizado já desmontou a lista, mas o Escape posterior conservou foco; no percurso com rascunhos/resize1440–390–320/maximização/cancelar-confirmar fecho/reabertura/Escape, o diagnóstico registou **originFocused=false, reopenedLinkConnected=false, sameReopenedLink=false, inertCount=0**, foco em BODY e link novamente criado. Não era apenas demora da assertion nem fundo ainda inert. O segundo percurso reutilizou os dados do primeiro; sem novas contas, pedidos de registo, limpeza ou capturas.

Correção apenas em **App.tsx**: conservar `background` até o efeito existente observar a saída da rota de tarefa, mantendo a lista montada. O fecho já autorizado pelo guard regista o hash de destino numa referência; a subscrição consome-a uma vez e apenas dispensa a confirmação duplicada desse destino. Qualquer outra navegação continua sujeita ao guard. A regressão integrada cobre identidade do link, maximizar/fechar/reabrir/Escape/foco, uma confirmação por fecho sujo e nova navegação recusada depois de o destino confirmado ter sido consumido. Assertion E2E da linha1044 preservada, sem sleeps/timeout maior.

| Validação própria, cwd `frontend` | Resultado observado |
|---|---|
| `npm test -- src/TaskDetailPanel.test.tsx`, antes da correção, 10:54 UTC | **4 pass / 1 fail**: o link reapresentado não era o mesmo nó (`toBe(origin)`), reproduzindo o remount no teste integrado. |
| Primeira correção, seleção de três ficheiros, 10:55 UTC | **73 pass / 1 fail**: identidade preservada, mas três confirmações em vez de duas. Build não executado porque a seleção falhou; não enfraquecida a assertion. Refinamento de consumo único autorizado depois desta falha. |
| `npm test -- src/TaskDetailPanel.test.tsx src/TaskDetail.test.tsx src/App.test.tsx`, 11:00 UTC | **74 pass / 3 ficheiros**, exit0. |
| `npm run build`, após a seleção de 11:00 UTC | **PASS**, TypeScript/Vite, 201 módulos; saída local JS `index-Gxk2DZB1.js`. Não atualiza o serviço Docker. |
| Mesma seleção de três ficheiros, 11:01 UTC, após reforço da regressão | **74 pass / 3 ficheiros**, exit0; inclui recusa de navegação suja posterior e um único pedido de confirmação no fecho seguinte. Só o teste foi reforçado depois do build, não o código de produção. |

**Estado histórico após os testes locais: fonte corrigida e testes/build passam; E2E da correção de foco ainda não executado naquela fase.** A suite mais recente então era **FALHADA, 6 pass / 1 fail / 4 não executados**, contra a imagem anterior. T024 `[ ]`, **27/28**, visual humano separado. Revisão independente `review-focus-routing`, Revisor Matriz, **PASS sem findings substantivos** no delta de foco, regressão e evidência dos quatro caminhos: apenas leitura/consistência manual/diff check, sem executar testes/builds/serviços nem editar ficheiros. Confirmou 27 checkboxes/T024 aberta e assertion E2E intacta; resultados runtime/unit/build são os do executor, não rerun do revisor. A autorização/execução seguintes ultrapassam a pendência de atualização do alvo, sem reescrever a proveniência desta fase.

**Atualização vigente — nova imagem e E2E autorizado em 18-11-2026T11:06:29Z:** autor pediu substituir a imagem e executar novamente os testes. Não houve nova alteração de código. Configuração Compose existente validada sem a imprimir, sem abrir/mostrar `.env`; `.dockerignore` exclui ficheiros de ambiente/segredos do contexto. Build da app reutilizou as camadas npm/Maven de dependências em cache, compilou frontend e empacotou backend com testes omitidos no Dockerfile existente (não é nova execução de testes backend).

Comandos próprios na raiz, no mesmo processo com `APP_HOST_PORT=18086` e `POSTGRES_HOST_PORT=55436`; recriação também com os flags não secretos existentes `DEMO_ENABLED=true` e `COOKIE_SECURE=false`:

```powershell
docker compose -p matriz-signup-check -f compose.yaml config --quiet
docker compose -p matriz-signup-check -f compose.yaml build app
docker compose -p matriz-signup-check -f compose.yaml up -d --no-deps --no-build --force-recreate --wait --wait-timeout 120 app
```

App anterior substituída apenas após build, nova imagem efetiva **`sha256:c6574eab7734e5ec279b0fa221589d0b77cc9568a5ada91a85c8ca9de1b00f30`**, novo contentor `83ae09bae0a6`, iniciado **11:07:42.759 UTC**, saudável/HTTP200 antes dos testes e saudável após. DB **mesmo contentor `01f83a240ac0`**, mesmo início **09:37:44.866 UTC** e mesmo volume `matriz-signup-check_matriz_data`, saudável; sem recriação/reset/remoção da DB/volume. JS/CSS servidos comparados por SHA-256 com `frontend/dist`: `index-Gxk2DZB1.js` = `72851DD5702BE93F1035C109023C51FEA86B6BE9DB4B2E8E68917BCF71DC372C`, `index-DGmtWoRp.css` = `D20B05E4E98F209CBD3CFF052B78C758E042D0CFF34499BAB64D8DDF46883634`, ambos iguais. O restart autorizado da app não foi usado para contornar quota: decorreram mais de 15 minutos desde os três registos da execução de 10:48.

Em `frontend`, mesmos env de execução anteriores (`PLAYWRIGHT_BASE_URL=http://localhost:18086`, `PLAYWRIGHT_NO_COPY_PROMPT=1`, `FORCE_COLOR=0`), stdout filtrado em memória:

```powershell
npm run test:e2e -- --output=test-results\t024-20261118-1108-full --reporter=line --trace=off --retries=0 --max-failures=1
```

Execução própria **11:08:07.641–11:08:58.261 UTC**, runner **47,4 s**, **exit1: 11 descobertos, 7 pass / 1 fail / 3 não executados**, sem retries. **Cenário de detalhe/foco passou integralmente**, incluindo a assertion E2E1044 intacta e o restante percurso standalone; templates também passou. Oitavo cenário, anexos, falhou em `frontend/e2e/matriz.spec.ts:1220`: `postDataBuffer()` devolveu **null** e o teste forçou `.toString('utf8')` com non-null assertion. Antes disso, resposta real do comentário **201** e header **multipart/form-data; boundary=...** já verificados. É comprovada a desreferência nula no teste; **não está estabelecida a razão de o corpo não estar disponível neste acesso Playwright**, nem demonstrada uma falha de produção. Assertions posteriores sobre partes do corpo, anexos guardados do comentário e restante cenário não correram; não anunciar cobertura integral de anexos. Runner voltou a reportar erro fora de teste após interrupção, sem diagnóstico adicional.

Diretório novo **`frontend/test-results/t024-20261118-1108-full`**, contém apenas `.last-run.json`, conferido **failed/um identificador**; sem PNG/HTML/trace persistidos. Tempos/totais/diagnóstico vêm da console, não do JSON. Evidência anterior preservada. Três registos previstos da suite sem429; restantes dados fictícios deixados salvo operações inerentes, sem cleanup extra, nova instalação ou Git writes. **T024 continua `[ ]`, 27/28; última suite FALHADA7/1/3 na nova imagem, foco validado em E2E, anexos e três cenários seguintes pendentes.** Sem correção adicional nem rerun automático; eventual investigação/correção do teste de anexos exige âmbito apresentado e aprovação. Aprovação visual humana anterior permanece separada.

**Histórico — correção autorizada do teste de anexos e seleção de quatro cenários, 18-11-2026, 11:11–11:13 UTC:** autor aprovou só `frontend/e2e/matriz.spec.ts`, estes dois documentos, seleção do cenário de anexos e dos três seguintes, com revisão independente; **nova suite completa explicitamente pendente naquela fase**, sem restart nem pedidos de registo para ultrapassar quota.

Causa da exceção: non-null assertion em `postDataBuffer()` assumia disponibilidade que o Playwright não garante. A implementação Chromium instalada inicializa esse corpo a null e só o preenche quando existem entradas de bytes do protocolo; a execução de 11:08 comprovou retorno null neste pedido. Não se atribui uma causa mais específica à omissão dos bytes. Testes unitários existentes `TaskActivity.test.tsx` e `TaskAttachments.test.tsx`, conferidos por leitura, verificam partes `comment` application/json e `files` repetidos; **não reexecutados nesta fase**.

Correção apenas no E2E: import do tipo `Comment` como `TaskComment`, conteúdo fictício do ficheiro numa constante partilhada e substituição das assertions de corpo bruto por **conteúdo/autor/taskId do comentário devolvido, exatamente um anexo com nome/MIME/tamanho UTF-8/autor/commentId/canDelete esperados, GET autenticado200 e bytes exatos do ficheiro guardado**. Mantidos POST201, header multipart/boundary e todas as assertions posteriores de UI/erro/permissões/download/eliminação. Não há catch/fallback para corpo null nem sucesso simulado. Tipo JSON das partes continua coberto pelos testes unitários referidos; o E2E verifica envio real aceite e dados/bytes persistidos, não captura raw da rede.

Alvo antes da seleção: imagem exata `sha256:c6574eab7734e5ec279b0fa221589d0b77cc9568a5ada91a85c8ca9de1b00f30`, HTTP200; saudável após. Sem rebuild/restart, produção/configuração/dependências inalteradas. Em `frontend`, mesmos env de alvo/console anteriores:

```powershell
npm run test:e2e -- --grep '^(anexos:|login rejeita|workspace Jira:|acessibilidade:)' --output=test-results\t024-20261118-1114-remaining --reporter=line --trace=off --retries=0 --max-failures=1
npm run test:e2e -- --grep 'anexos:|login rejeita|workspace Jira:|acessibilidade:' --output=test-results\t024-20261118-1114-remaining-selected --reporter=line --trace=off --retries=0 --max-failures=1
```

Primeiro comando **11:12:46.652–11:12:48.199 UTC**, exit1, **No tests found**, zero testes executados: o filtro ancorado não selecionou os títulos completos usados por Playwright. Corrigido apenas o filtro, com destino novo; não é retry de cenário falhado. Segundo comando **11:13:03.353–11:13:34.274 UTC**, runner **29,5 s**, **4 descobertos / 4 pass, exit0**, sem retries: anexos; login inválido/vista móvel; workspace/navegação/teclado; acessibilidade. Anexos concluiu as verificações posteriores antes bloqueadas, incluindo multipart real/metadados/bytes/ícones responsivos/autor-gestor versus membro e respetivas recusas; sem transformar a seleção em suite completa.

Artefacto **`frontend/test-results/t024-20261118-1114-remaining-selected/.last-run.json` passed/lista vazia**, mais **oito PNG persistidos do cenário workspace** (login/dashboard desktop, dashboard/navigation/projects/project-detail/task-detail mobile e task-detail desktop). Os attach em memória de outros cenários não produziram PNG persistido; sem HTML/trace. Tempos/totais vêm da console. Evidências anteriores preservadas, sem cleanup extra, registos novos, instalações ou operações no índice; dados fictícios criados/deixados conforme os próprios testes. Screenshots não receberam nova inspeção/aprovação visual pelo agente.

**T024 `[ ]`, 27/28, PARCIAL: última seleção4/4 PASS; última execução completa continua o resultado histórico7/1/3 FALHADO, anterior à correção do teste de anexos.** Os sete pass anteriores mais os quatro agora não são uma execução integral11/11. Nova suite completa ficou pendente por escolha explícita do autor; aprovação visual humana permanece separada. Revisão independente `review-multipart-evidence`, Revisor Matriz, **PASS sem findings substantivos** no delta aprovado destes três caminhos: conferiu fonte/contrato/assertions posteriores/artefactos/oito PNG/27 checkboxes/índice vazio por leitura, sem testes/builds/serviços/escritas ou inspeção visual das imagens. Totais/tempos são os do executor, não rerun do revisor; revisão não autoriza suite completa.

**Atualização vigente — suite completa autorizada em 18-11-2026T11:54:44Z, execução única 11:55–11:56 UTC: 11/11 PASS.** O autor aprovou executar o full, registar/rever o resultado e confirmar os critérios antes de fechar T024. Não houve alteração de fonte, configuração, build ou restart nesta fase.

Preflight próprio: `http://localhost:18086` HTTP200, app saudável e mesma imagem corrigida **`sha256:c6574eab7734e5ec279b0fa221589d0b77cc9568a5ada91a85c8ca9de1b00f30`**; JS `index-Gxk2DZB1.js` e CSS `index-DGmtWoRp.css` novamente iguais a `frontend/dist` por SHA-256, hashes iguais aos registados às11:08. A app manteve início11:07:42.759; DB mesmo contentor01f83a240ac0/início09:37:44.866/volume `matriz-signup-check_matriz_data`. Ambos saudáveis após o full. Janela de15min dos registos anteriores já decorrida; três registos da suite completados sem429, sem restart/spoof para libertar quota.

Comando realmente executado em `frontend`, env `PLAYWRIGHT_BASE_URL=http://localhost:18086`, `PLAYWRIGHT_NO_COPY_PROMPT=1`, `FORCE_COLOR=0`, console filtrada em memória para omitir credenciais:

```powershell
npm run test:e2e -- --output=test-results\t024-20261118-1155-full --reporter=line --trace=off --retries=0 --max-failures=1
```

**11:55:02.541–11:56:16.986 UTC**, runner **1,1 min**, **exit0: 11 descobertos / 11 passaram / 0 falhas / 0 não executados**, um worker, sem grep/retries. Não houve erro do runner fora de teste nesta execução; apenas aviso de depreciação Node. É **uma execução integral11/11**, não soma dos7+4 anteriores. Passaram registo/fronteiras Unicode/membros/idempotência/acesso limitado, percurso integrado, Ficha04, drafts/conflitos/recuperação, matriz de templates, detalhe/seletores/foco/guards/standalone/geometria1440/390/320, anexos/permissões/download/bytes/ícones responsivos, login inválido/móvel, workspace/teclado e Axe nos estados cobertos. Não representa certificação WCAG integral ou validação de produção.

Artefactos novos preservados em **`frontend/test-results/t024-20261118-1155-full`**: `.last-run.json` lido **passed/failedTests vazio**, mais **oito PNG workspace** (os mesmos nomes da seleção anterior, agora neste destino). Sem HTML/trace; attach de outros cenários não persistiu PNG com reporter line. JSON não comprova sozinho tempos/totais/cobertura, cuja fonte é a console/execução própria. Sem nova inspeção visual das imagens pelo agente: aprovação visual humana de09:42:49Z permanece com proveniência separada, não é inferida do full ou screenshots.

**Fecho vigente: T024 `[x]`, 28/28, E2E11/11 PASS e visual humano aprovado separadamente.** Revisão independente readonly **`review-t024-full-closure`: PASS, sem findings substantivos**, confirmou os critérios T024/quickstart V1–V5 face às asserções, evidência de execução e aprovação visual separada; autorizou documentalmente o fecho no âmbito já aprovado pelo autor. Revisor leu diretamente JSON/inventário, fontes e documentos e conferiu diff/índice; não reexecutou testes/build/serviços nem inspecionou screenshots. Totais/tempos/preflight são da execução própria acima, não prova independente do JSON; não foi executado `speckit-analyze`. Não existe já um teste E2E falhado por resolver nesta execução. Resultados RED/seleções anteriores conservados como história, ultrapassados por este full, sem os converter retroativamente em PASS. Dados fictícios deixados salvo operações inerentes, sem cleanup, instalação, Git writes, alteração de índices ou serviços. Backend58/frontend141/build históricos não reexecutados nesta fase; seleção74/build da correção de foco conserva a própria proveniência.

**Registo histórico anterior ao arranque e à aprovação visual acima:** o bloqueio seguinte descreve o fecho documental anterior, não ausência atual de arranque ou de análise visual humana.

Faltam **alvo/versão runtime/uso, quota livre de registo e destinos de artefactos expressamente autorizados**. Não houve sondas/arranque de serviços, E2E, browsers, screenshots, inspeção visual/geométrica ou teclado browser deste delta. `npm run test:e2e -- --list` **não executado**, porque a cache externa escreveria fora do âmbito; os 11 cenários AST não provam discovery nem execução. Não assumir disponibilidade/atualização/autorização da instância antiga 18086. A execução anterior do registo de 17-11 (1 E2E/quatro Axe relatados) e os resultados/scans de 13-11 abaixo permanecem intactos como histórico, não prova do delta.

**Estado atual após o registo histórico acima: B4/T024 concluídos, 28/28.** Execução integral11/11 PASS às11:55–11:56 UTC, visual humano aprovado separadamente e revisão independente de fecho `review-t024-full-closure` PASS; já não há falha E2E ativa na última execução. As execuções tiveram autorização própria, não apenas aprovação visual. Gates B5/B6 e revisões das correções anteriores mantêm os alcances descritos; o novo revisor não reexecutou a suite. Não implica aceitação do cliente ou produção/publicação.

O revisor confirmou 38 caminhos B1–B5 (36 edições rastreadas e dois helpers não rastreados) mais oito artefactos da feature, branch main/índice/staging sem alterações e cobertura planeada FR/SC 21/21. Confirmou por leitura os resultados YAML/estrutura restrita já documentados (não validação integral OpenAPI), 177 links/42 âncoras e XML backend 58 = 44+1+3+5+5, sem falhas/erros/skips; frontend final 141/build PASS continua relato do executor. T023: 11 casos por AST e zero diagnósticos TypeScript, não discovery/E2E. B3-01/B4-01 corrigidos e revistos sem remanescentes. Revisor sem testes/builds/probes; estes resultados recebidos não foram executados novamente.

### Rastreabilidade atual

| FR / SC da feature | Fontes canónicas e implementação/testes | Evidência / limite |
|---|---|---|
| FR-001–003 / SC-001 | RF-17/RN-20–22/US-20 AC-20.1–8; IdentityService/AuthController/Emails, App/email e testes API/App (T002–003/T010–012). | Fronteiras 5/6/200/201 ASCII/astral/espaços, confirmação local e login/segurança preservados: B1/B2 relatados e fontes lidas. T024 10:00–10:03: registo/fronteiras Unicode/login passaram segundo executor; não substitui todas as regressões API nem conclui T024. |
| FR-011–014 / SC-002 | RF-04/RN-03–04/US-04; MemberInput/ProjectController/ProjectService/Emails, Projects/email e testes API/Tasks (T004–009). | XOR/presença/null/tipos/unknown, elegibilidade/permissões/locks/races/compatibilidade e UI sem IDs: B1/B2. RED do seletor às 09:52 preservado; cenário corrigido passou às 10:00–10:03, incluindo repetição/participação única/acesso limitado/permissões e percurso integrado, segundo executor. |
| FR-005–007 / SC-003 | RF-16/RN-18/US-19; Tasks/TaskDetail/Panel e testes (T013–015). | Ciclos/cancelamento/save/refetch/recuperação/layout: B3 relatado, sem estado persistido. T024: timeout de locator diagnosticado/corrigido; cenário completo de templates passou no dirigido e no full de 10:48. Não conclui os restantes critérios T024. |
| FR-004/008/009 / SC-004 | RF-16/RN-18/US-19; App/TaskDetail/Panel/MarkdownEditor/TaskActivity/styles e testes (T016–019). | B3 e aprovação visual humana geral separados. Remount corrigido em App, seleção74/build/revisão PASS; T02411:08 na imagem nova: cenário dedicado completo de detalhe/foco/seletores/geometria1440/390/320/standalone passou. Não converte anexos/restante suite em PASS. |
| FR-010 / SC-005/006 | RF-14/RN-17–18/US-16–17/19; TaskAttachments/TaskActivity/styles e testes (T020–021). | T02411:08 falhou por postDataBuffer null no teste. Correção autorizada verificando resultado/metadados/bytes reais; cenário dedicado completo de anexos passou na seleção4/4 de11:13, incluindo verificações posteriores/permissões/geometria. Não é suite completa nem nova aprovação visual humana. |
| FR-015 / SC-005/006 transversais | RN-01/09/12/17–22 e critérios transversais; T007/T012/T022–024. | Full próprio11:55–11:56:11/11 PASS, incluindo relações/drafts/permissões/guards/geometria/teclado/Axe nos estados cobertos; confirma também os cenários das cinco linhas anteriores numa execução completa. Visual humano separado; não WCAG integral, build convertido em E2E ou produção. Revisão readonly `review-t024-full-closure` PASS; T024 concluída. |

### Conferência documental B5

Skills seguidas por leitura de SKILL.md, sem mecanismo nativo de invocação disponível: **contexto-matriz, validacao-matriz, speckit-implement**, limitada a T025–T027 e aos marcadores/nota de progresso autorizados. Lidos AGENTS/README/fontes obrigatórias/constituição e mesmos artefactos; helper/common inspecionados antes de usar `SPECIFY_FEATURE_NO_PERSIST=1`. Executado `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`, com feature explícita: resolveu os mesmos caminhos sem persistir estado. Checklist readonly **16/16**, qualidade de especificação, não execução. `.specify/extensions.yml` ausente; sem hooks, ignore changes, novo plano/backlog ou delegação.

Fontes reais confrontadas: Emails/IdentityService/AuthController/MemberInput/ProjectController/ProjectService, App/email/Projects/Tasks/TaskDetail/Panel/MarkdownEditor/TaskActivity/TaskAttachments/styles, testes/cenário E2E pertinentes, package.json/playwright.config e OpenAPI. Leitura própria dos cinco XML existentes em backend/target/surefire-reports confirma **58 = 44+1+3+5+5**, zero falhas/erros/skips; isto não é execução, nem certificação independente de frescura/correspondência binária.

Treze caminhos B5 autorizados (README, AGENTS, Copilot, skill contexto, requirements/constraints/user-stories/architecture/database/implementation-plan/verification/test-plan e openapi.yaml), mais tasks.md apenas progresso serializado. Regras atuais alinhadas; resultados datados anteriores preservados, incluindo o mínimo histórico 12 e T4 executado. Sem ficheiros novos/removidos, arquivos V1/ADRs/release notes/changelog/version bump/configuração/código/testes alterados por B5.

Verificações locais de formatos/referências/links e preservação são documentais em memória, sem instalar ou criar relatórios/configurações; resultados finais reportados na entrega. PyYAML existente permite parsing/estrutura/refs e conferência restrita de JSON Schema do delta, **não validador integral OpenAPI/JSON Schema**; jsonschema/openapi_spec_validator não estão disponíveis. Sem testes/builds/scans/E2E/workflows/serviços/sondas/remoto, leitura de `.env`, escrita Git/índice/branch, commit/push/deploy ou alteração de dados/volumes. O encaminhamento B5/B6 previsto nessa entrega foi concluído conforme fecho acima; resta decisão T024, sem prosseguir automaticamente.

Resultados da conferência B5: **PyYAML 6.0.3**, sem chaves duplicadas; **18 caminhos / 30 operações / 47 schemas / 237 referências** internas (incluindo mappings discriminator) resolvidas, operationIds únicos. Dez casos estruturais em memória conferiram `oneOf`/required/type/additionalProperties para alternativas email/userId válidas, ambos/nenhum/null/tipo incompatível/unknown; normalização/elegibilidade continuam regras semânticas do serviço, não provadas por esse avaliador restrito. Conferidos RegistrationRequest password 6/200/writeOnly, login mínimo 1 e LocalEmail sem format/maxLength bruto; restantes operações/schemas/configuração iguais ao HEAD fora do delta autorizado.

Links/âncoras/fences/Unicode conferidos nos 12 Markdown B5 mais tasks.md, sem URLs externas. `git diff --check` passou; avisos LF→CRLF não são falhas de whitespace. Comparação bruta dos históricos com blobs HEAD (LF) diferiu inicialmente do checkout CRLF; conferência com a convenção de checkout (`core.autocrlf=true`) confirmou o conteúdo anterior integral de plano/test-plan/verification e dos três históricos dobrados, sem reescrever texto. SHA-256 agregado dos **143 caminhos fora do âmbito**, excluindo ficheiros de ambiente, igual antes/depois: `158ebd3abf497790f23ac57eb982fd04ec8a180e60ec46e3e133be5e78e9c38c`; índice, HEAD simbólico, branch main e feature.json preservados. Sem novas criações/remoções no inventário. Progresso histórico na entrega B5, antes da revisão independente: 26/28 checkboxes, abertas apenas T024/T028; gate B5 independente então pendente. Superado pelo fecho atual acima: 27/28, T028 concluída e T024 parcial (visual aprovado pelo autor; E2E automático/restante cobertura planeada pendentes).

## Registo académico — 17-11-2026

**Âmbito vigente:** decisão do autor para demonstração académica, não validação do cliente ou publicação. T1 backend/T2 frontend implementadas e revistas, findings concretos corrigidos, segundo handover do utilizador. T3 é exclusivamente documental, sem delegação. HEAD observado `33dee9bc748126573d52914a86a34861a558b2e4`; implementação T1/T2 já modificada/não rastreada na worktree, preservada. Candidato `0.4.0-rc.1` sem bump/tag. Os registos T1/T2 de **reorganização documental** mais abaixo são de outro plano; não confundir com T1/T2 de registo.

As secções de 12/13-11 e da consolidação anterior permanecem intactas como evidência histórica. “Atual/final” e **29 operações/41–43–6/scans** nesses registos referem-se às respetivas fases, não ao registo público. Contrato vigente: **30 operações**, incluindo POST `/api/auth/register`; Actuator continua fora do contrato de negócio.

### Contrato e rastreabilidade do registo

Fontes lidas em T3: AGENTS/README/requisitos/restrições/histórias, instruções Copilot/skills contexto e validação, arquitetura/dados/plano/verificação/OpenAPI, AuthController, IdentityService, SecurityConfig, RegistrationThrottle, Inputs/ApiErrors, migrations V1/V3, App.tsx/App.test.tsx/api.ts e testes backend. RF-17/RN-20–22 e [US-20/AC-20.1–8](user-stories.md#registo-académico--us-20) definem critérios, **não resultados de execução**.

Confirmado por leitura: POST público **com CSRF**, JSON displayName/email/password; conta ativa imediatamente sem envio/confirmação email; 201 application/json apenas `{"message":"Conta criada. Inicie sessão."}`, sem perfil/credenciais/autenticação. UI confirma e regressa ao login sem auto-login/transporte ou armazenamento de password. Nome 1–120 pontos após trim; email trim/lowercase até 254 unidades UTF-16 normalizadas, regex compatível login/Unicode; password 12–200 pontos sem trim/composição, espaços permitidos; confirmação só local. Login mantém antigas curtas e até 200 pontos; UI partilha validador Unicode sem type=email.

422 usa errors por campo; 409 explícito de email existente inclusive concorrência (divulgação aceite pelo autor), sem alterar conta/hash existente. 429 com Retry-After; limite independente do login de 5 pedidos/endereço remoto observado/15 min, sucessos e falhas após CSRF válido, memória por instância limpa no restart. PathPatternRequestMatcher partilhado filtro/autorização após CSRF cobre segmentos codificados; não confia em forwarded cliente nem promete IP real atrás de proxy. UUID/username internos únicos gerados, hash scrypt, schema V3 suficiente sem migration/deps; sem projetos/participações/privilégios herdados, mas pode criar projetos após login.

### Proveniência e alcance da evidência T1/T2

| Fonte disponível | Resultado observado ou relatado | O que T3 não alega |
|---|---|---|
| `backend/target/surefire-reports/TEST-pt.matriz.ApiIntegrationTest.xml`, `TEST-pt.matriz.identity.LoginThrottleTest.xml`, `TEST-pt.matriz.identity.RegistrationThrottleTest.xml`, `TEST-pt.matriz.InputsTest.xml`, `TEST-pt.matriz.ObservabilityIntegrationTest.xml` | Leitura local em T3: **35 + 1 + 3 + 5 + 5 = 49**, zero falhas/erros/skips. Suite API inclui `registrationThrottleSharesLiteralAndEncodedPathsOverHttp`; fonte testa HTTP real `/api/auth/registe%72`, CSRF antes de quota, caminho literal/codificado partilhado e 201/409/422/400/429. | Não é nova execução Maven nem certificação independente de correspondência binária/frescura. Reports são artefactos locais ignorados, não evidência publicada/portável. |
| Handover do utilizador sobre T1/revisão | Suite backend 49 sem falhas/erros/skips após regressão HTTP real; revisor confirmou reports e correção do bypass pathencoded. | Revisão relatada, não realizada de novo pelo agente documental. |
| Handover sobre T2/revisão; App.tsx e App.test.tsx lidos | **npm test 56 OK/build OK/diffcheck OK relatados** após correção Unicode. Revisor conferiu fontes/testes sem rerun. Fontes cobrem limites, confirmação local, foco/erros, duplicação, CSRF, Unicode no login/registo, antigas curtas e sucesso sem auto-login/password. | T3 não executou npm/test/build, não consultou report bruto frontend novo nem tratou testes com mocks como E2E/browser real. |

### Verificações documentais T3 e pendências

Edição autorizada apenas nos 12 caminhos: README, AGENTS, .github/copilot-instructions, skill contexto-matriz, OpenAPI, requirements, constraints, user-stories, architecture, database, implementation-plan e verification. Sem criação/remoção, alteração de implementação, migrations, dependências, `.github/workflows/ci.yml`, Render, históricos V1 ou outros caminhos. Sem leitura de `.env`, instalação, serviços/workflows/contas externas, staging/commit/push/deploy.

Verificações estáticas locais e respetivos resultados estão registados abaixo; não são teste funcional, validação integral OpenAPI/JSON Schema, renderização Mermaid, inspeção visual ou E2E.

| Verificação efetivamente executada em T3, scripts efémeros em memória | Resultado observado |
|---|---|
| YAML com PyYAML 6.0.3 existente, rejeitando chaves duplicadas | **18 caminhos / 30 operações / 47 schemas / 236 referências** (incluindo mappings discriminator) resolvidas; operationIds únicos, parâmetros de caminho conferidos. Assertions do registo: CSRF sem Session, respostas/campos obrigatórios, password 12–200/writeOnly e sucesso só mensagem; login mantém mínimo 1 e email partilhado. Não validador integral OpenAPI/JSON Schema. |
| Links/referências e estrutura Markdown nos 11 MD autorizados | **140 ligações locais / 31 âncoras / 15 blocos fenced** conferidos, zero erros; sem caracteres de substituição Unicode. Sem consultas a URLs externos. |
| Preservação SHA-256 antes/depois | **106 caminhos fora do âmbito**, incluindo código/testes T1/T2 rastreados e não rastreados, CI/configurações e V1, inalterados; ficheiros de ambiente excluídos da leitura. Digest `4b212fd76bf55a6f283df3e318739a6fb702c0c845bfe41172e032043b2c8455`. HEAD e índice inalterados (SHA-256 do índice `b6126ef7072668dc511e200024e146ea3855e8b153914025ecbcef021c7b76ee`). Três históricos dobrados e conteúdo anterior integral de plano/verificação preservados byte a byte; sem caminhos novos/removidos. |
| Git somente leitura | `git diff --check` passou; diff/status conferidos sem alterar staging. Avisos de conversão LF→CRLF do Git não são execução de conversão nem falhas de whitespace. |

Conferência adicional das 30 operações com annotations dos controllers mais logout da configuração de segurança passou após normalizar **apenas os nomes dos parâmetros de rota**. A primeira sonda literal falhou por comparar `{id}`/`{target}` do Java com `{projectId}`/`{taskId}`/`{userId}` do contrato; corrigido o comparador efémero, sem alteração de código/contrato por esse motivo.

**Referências fora da autorização, não alteradas:** `docs/adr/0002-local-session-authentication.md` conserva a decisão anterior sem registo público/contas previamente disponibilizadas; `docs/coursework-review.md` ainda descreve o contrato como atual com 29 operações. Eventual suplemento/correção exige aprovação própria; V1 e demais históricos permanecem históricos, não devem ser reescritos para aparentar nova decisão.

### Fecho pontual T3 após implementação T4 — 17-11-2026

**Registo histórico anterior ao arranque autorizado:** o bloqueio abaixo descreve apenas este fecho T3. Foi ultrapassado pela execução local posterior, documentada na secção seguinte; não é o estado atual do E2E do registo.

Atualização autorizada apenas neste ficheiro, sem delegação, criação de ficheiros ou reescrita dos históricos abaixo. Segundo handover do utilizador: revisão T1 com P1 de pathencoded reproduzido por HTTP, corrigido e revisto; T2 com P2 de email Unicode corrigido e revisto; T3 documental sem findings; T4 com revisão independente apenas por leitura, sem findings. Não são novas revisões efetuadas neste fecho nem certificação do cliente.

**Nesse fecho, T4 implementada, ainda não executada em E2E:** leitura de [frontend/e2e/matriz.spec.ts](../frontend/e2e/matriz.spec.ts) e `git diff --numstat` confirmam **114 adições/0 remoções**. O novo cenário de registo contém assertions para:

- Confirmação inválida conservar os campos sem POST de registo/login; dados Unicode, teclado/foco e análise Axe em desktop/móvel.
- Resposta 201 JSON apenas com a mensagem e payload correto sem confirmação; retorno ao login com password vazia, `/api/auth/me` 401 e nenhum auto-login.
- Login explícito, projetos inicialmente vazios sem herança demo; criação de projeto como `MANAGER`, presença após reload e logout com `/api/auth/me` 401. O cenário não elimina a conta/projeto fictícios.

São verificações **escritas no teste**, não resultados observados num navegador; não demonstram por si só conformidade integral de acessibilidade, persistência após reinício ou todas as regressões das contas demo/permissões/sessão/CSRF.

| Evidência T4 fornecida no handover | Alcance e limitações |
|---|---|
| Engenheiro T4 executou testes frontend: **56 OK**; TypeScript do projeto sem emissão e sem incremental: **OK**; build Vite: **OK**. | Revalidação reportada pelo engenheiro T4, não execução deste agente T3. Testes/build usaram configuração externa segura e saída de build na sessão; não são E2E. Os 49 backend permanecem os reports anteriormente conferidos em T3, sem nova execução. |
| Descoberta Playwright filtrada por “registo académico:”: **1 cenário encontrado**. | Listagem reportada, **não execução do cenário** nem E2E passed. |
| TypeScript autónomo do ficheiro E2E bloqueado por **3 referências preexistentes a `Buffer`**, sem tipos Node. | Não passou essa verificação autónoma; não foi instalada qualquer dependência. O sucesso do TypeScript do projeto não substitui esta limitação. |
| Artefactos `t4*` em `C:\Users\CTW03863\.copilot\session-state\3ebaea67-61c5-4f8c-9372-db12b660125d\files`. | Neste fecho foi lido `t4-validation.config.mts`: desativa carregamento de ficheiros de ambiente (`envDir: false`), dirige cache/build para a sessão e não esvazia o destino de build. Existe o diretório `t4-build`, mas não foram encontrados logs brutos `t4*`; configuração/artefactos não certificam execução. Por isso não se transcrevem comandos exatos como conferidos em logs. |

**Bloqueio histórico, entretanto ultrapassado:** segundo T4, não havia listener HTTP local em **5173/8080/18085**, com timeout nas sondas; alvo e versão atual não comprovados. **Até esse fecho, nenhum E2E do registo tinha sido executado, nenhum serviço tinha sido iniciado e não tinha havido inspeção visual em navegador.** A retoma dependia então de autorização separada para arranque local ou de instância atual disponível, versão comprovada e quota de registo livre (5 pedidos/endereço remoto observado/15 minutos). A descoberta do cenário, a revisão estática e os seis E2E históricos de 13-11 não fechavam essa pendência. A autorização posterior «autorizo arranque local» e a execução seguinte ultrapassaram este bloqueio; a autorização não está pendente para essa execução.

Verificações deste fecho limitadas à leitura de contexto/cenário/configuração externa e a verificações documentais locais de links/âncoras/diff; sem rerun de npm, TypeScript, build, Maven, E2E ou sondas HTTP, sem leitura de `.env`, serviços, alteração do índice ou publicação. Prova CI atual, uploads/retenção reais e aceitação humana/cliente continuam pendentes. Recuperação/email/integrações externas excluídos; **produção continua diferida**. Identidade empresarial, capacidade/backups/policy/p95 e publicação exigem decisão própria.

### Execução local autorizada do registo e revisão por leitura — 17-11-2026

**Estado posterior ao bloqueio:** com a autorização do utilizador «autorizo arranque local», o engenheiro executor arrancou o Compose local isolado **`matriz-signup-check`**, com build atual, e relatou a execução real do novo cenário de registo: **1 passou / 0 falhas / 10,7 s**, com **quatro análises Axe sem violações** nos estados cobertos em **1440×1000 e 390×844**. Este registo documental resulta do handover, da leitura dos artefactos locais e da fonte do teste; **não é execução de testes/serviços por este agente documental** nem certificação de revisão completa ou aceitação do cliente.

#### Alvo, comandos executados e dados preservados

Segundo o executor, app e DB ficaram `running/healthy`, publicadas apenas em **`127.0.0.1:18086`** e **`127.0.0.1:55436`**, respetivamente. Imagem da app: **`sha256:0172ab8e5af4af47c00dd3f4284a10b9e2550f8ba6b09afbf89c87e8f53de870`**. Volume próprio **`matriz-signup-check_matriz_data`** preservado. Variáveis desta execução: `APP_HOST_PORT=18086`, `POSTGRES_HOST_PORT=55436`, `DEMO_ENABLED=true`, `COOKIE_SECURE=false`; esta última é configuração da demonstração HTTP local, não recomendação de produção.

Comandos reportados pelo executor e registados em `validation-result.json` (não reexecutados nesta atualização), na raiz e com as quatro variáveis acima:

```powershell
docker compose -p matriz-signup-check --env-file .env config --quiet
docker compose -p matriz-signup-check --env-file .env up --build -d --wait --wait-timeout 240 --quiet-build
```

`.env` foi apenas input opaco do Compose, sem leitura do conteúdo nem apresentação de configuração expandida. Em `frontend`, com `PLAYWRIGHT_BASE_URL=http://localhost:18086` e `PLAYWRIGHT_NO_COPY_PROMPT=1`, o executor reportou:

```powershell
npm run test:e2e -- --grep 'registo académico:' --reporter=line --output='C:\Users\CTW03863\.copilot\session-state\3ebaea67-61c5-4f8c-9372-db12b660125d\files\registo17-11-local\e2e'
```

O cenário `registo académico: confirmação, login explícito e projetos sem herança demo` cobre confirmação inválida sem POST de registo/login e com campos conservados; Unicode e teclado/foco; POST real com **201 JSON só mensagem**, sem confirmação no payload; retorno ao login com password vazia, sem auto-login e `/api/auth/me` **401**; login explícito; projetos inicialmente vazios; criação de projeto próprio como **`MANAGER`**, presença após reload e logout com `/api/auth/me` **401**. Estes são resultados **relatados pelo executor**, coerentes com as assertions lidas na fonte e com o resumo, não reconstruídos a partir de log bruto.

Foi adicionada e preservada **uma conta e um projeto fictícios**. O executor reportou seed inicial **3 utilizadores/2 projetos** e estado final **4/3**; o revisor confirmou apenas o estado final, incluindo uma participação da conta nova, **não observou as contagens iniciais**. Migrations **V1–V4** bem-sucedidas segundo resumo e conferência SQL relatada pelo revisor. Reload não equivale a teste de persistência após reinício, que não foi executado nesta validação.

**Instância deixada em execução pelo executor, disponível ao utilizador em [http://localhost:18086](http://localhost:18086).** Não foi parada por esta tarefa; conta/projeto, artefactos, dados e volume não foram eliminados. A disponibilidade é a observação reportada pelo executor/revisor, não uma nova sonda deste agente documental.

#### Artefactos, inspeção visual e alcance da revisão

Base local persistente, fora do repositório: `C:\Users\CTW03863\.copilot\session-state\3ebaea67-61c5-4f8c-9372-db12b660125d\files\registo17-11-local`.

| Evidência lida nesta atualização | Alcance / limitação |
|---|---|
| `validation-result.json` | **Resumo da execução, não log bruto.** Regista alvo/imagem/comandos, resultados relatados, fixture, quatro hashes de fontes e serviços deixados em execução. Não prova autonomamente todas as etapas. |
| `e2e\.last-run.json` | Observado `status: passed` e `failedTests: []`. **Não identifica cenário, contagem, duração ou resultados Axe**; não permite reconstruir por si só 1 teste/10,7 s/quatro análises. |
| `visual-capture.json` | Metadados de três capturas do registo em Chromium **141.0.7390.37**; sem overflow horizontal. Desktop 1440×1000; móvel 390×844 com documento de 902 px, ou 924 px no erro: scroll vertical normal. Não é uma análise Axe nem registo de todas as quatro imagens. |
| `login-desktop.png`, `registo-desktop.png`, `registo-mobile.png`, `registo-mobile-confirmacao-invalida.png` | As quatro imagens foram abertas nesta atualização e são coerentes com o relato do executor/revisor: sem sobreposições ou overflow horizontal visíveis, rótulos/ações/foco legíveis, erro textual da confirmação com foco e passwords mascaradas. São capturas headless, não ensaio em dispositivo físico, teclado virtual, leitor de ecrã ou auditoria integral de acessibilidade. |

**Revisão independente relatada no handover, sem findings:** o revisor trabalhou apenas por leitura, consultou os sete artefactos acima, fonte do teste/diff e quatro imagens; confirmou quatro hashes de fontes atuais, app/DB healthy em loopback e mesmo image ID, HTTP `/` **200** e `/api/auth/me` anónimo **401**, SQL final **4 utilizadores/3 projetos**, fixture com uma participação e migrations V1–V4 OK. Reportou ainda `git diff --check` sem erros e índice vazio/inalterado. Estas verificações são do revisor, não novas execuções deste agente documental. Saúde do Compose base verifica HTTP `/`, **não readiness JDBC**; a consulta SQL confirma a DB no momento observado, não um ensaio de indisponibilidade/recuperação.

**Limite de reconstrução independente:** 1 teste/0 falhas/10,7 s e quatro análises Axe são resultados de execução relatados pelo engenheiro e coerentes com os artefactos e a fonte, mas **não autonomamente reconstruíveis pelo revisor** a partir destes ficheiros. O revisor não reexecutou o E2E nem certificou integralmente a execução; não há aqui log bruto do runner.

#### Verificações documentais e pendências remanescentes

Nesta atualização, só `docs/verification.md` foi editado, sem delegação nem criação de ficheiros. Leitura de contexto, fonte E2E, Compose base, dois resumos JSON, `.last-run.json` e quatro PNG; verificações limitadas a links/âncoras locais e diff/preservação do histórico/índice/diff alheio. Sem testes, builds, serviços, sondas HTTP/SQL, leitura de `.env`, mutações Git ou publicação por este agente. Os históricos e evidências anteriores não são substituídos por estes resultados.

**Não reexecutados nesta execução local:** suites **49 backend/56 frontend**, restantes E2E e persistência após restart. Aviso Node **DEP0205** relatado como não bloqueante. Permanecem pendentes prova CI atual/uploads/retenção reais, aceitação humana/cliente, acessibilidade física/assistiva e decisões próprias sobre identidade empresarial, capacidade/backups/policy/p95/publicação. Os estados T4 pendentes noutros documentos não foram atualizados por estarem fora do âmbito autorizado. **Produção continua diferida**; a autorização de arranque foi satisfeita para esta execução local e não alarga autorização para futuras operações sensíveis.

## Consolidação canónica posterior — 17-11-2026

Preferência expressa do utilizador após T1/T2: manter a informação atual completa em `docs/architecture.md`, `docs/database.md` e `docs/ui/wireframe.svg`, sem cópia documental V2 separada. A aprovação incluiu corrigir navegação e referências em RELEASE_NOTES/CHANGELOG, preservando datas, baseline e resultados históricos. Os registos T1/T2 abaixo descrevem a organização e verificações anteriores à consolidação, não uma cópia ainda existente.

Fontes: AGENTS, skills contexto/validação, requisitos/restrições/histórias atuais, README, canónicos anteriores, fontes documentais então separadas, índice/proveniência, UI, matriz, plano, verificação, release notes/changelog, OpenAPI e migrations SQL. Consolidação editorial, sem novas decisões de produto ou validação do cliente.

| Verificação local nesta consolidação, scripts efémeros em memória | Resultado observado |
|---|---|
| Fidelidade das três fontes | Revertendo apenas títulos, destinos relativos, navegação introdutória e secções de histórico acrescentadas, os canónicos reproduzem os SHA-256 iniciais das duas fontes MD. O SVG reproduz o SHA-256 inicial ao repor “V2” nos dois títulos; restantes bytes, incluindo fins de linha, preservados (12 239 → 12 233 bytes). Regras e diagramas completos mantidos. |
| Links, âncoras e fences | 25 Markdown na raiz e `docs/`, incluindo V1/ADRs: 245 ligações locais e 35 âncoras resolvidas, 23 blocos fenced fechados; zero erros. Âncora de comparação/DEC-01 preservada. Sem consultas a URLs externos. |
| SVG e ER | Dois SVG com XML bem formado. ER atual: nove entidades e respetivas colunas iguais às tabelas/migrations V1–V4; semântica preservada pela comparação integral com a fonte. Oito blocos Mermaid textuais presentes; sem renderização Mermaid, inspeção visual ou alegação de validação semântica integral. |
| Remoções delimitadas | Ausentes apenas os três ficheiros da antiga cópia documental separada; os diretórios exatos `docs/architecture/v2/ui` e `docs/architecture/v2` foram confirmados vazios e removidos sem recursão. Nenhum destino funcional residual para essa cópia nos Markdown da raiz/`docs/`. Menções históricas e à migration SQL V2 mantidas. |
| Preservação | Os quatro ficheiros V1 ficaram byte a byte iguais ao início. Digest SHA-256 dos 105 caminhos protegidos (incluindo ausências preexistentes, sem ler ficheiros de ambiente) manteve `d231c70565697c5ba38805e3fe158888228bbbb0b225f900c1636604022a2a09`. Inclui código, configurações/CI, OpenAPI, ADRs, requisitos, critérios, testes, guião, revisão de qualidade e agente Planeador. Só navegação/estado aprovados foram ajustados no README preexistente. |
| Git somente leitura | HEAD `778ffd1ff8cfa366b444edbb0cc21bcc9f9b28d2` e SHA-256 do índice `5b7aa7bfe4354193c983112fbf2350b3cd7493627fb0b594f329822337810a62` inalterados. `git diff --check` passou. Nenhum staging/commit/push/merge/publicação. |

Nenhum teste funcional, build, scan, workflow ou serviço executado; sem instalação, logs externos, `.env`, novos ficheiros de tracking ou outros agentes. Os resultados de 12/13-11 não foram reexecutados. Revisão independente será encaminhada separadamente; inspeção humana/cliente, CI atual positiva/negativa/uploads/retenção reais e decisões de capacidade/backups/policy/p95/produção continuam pendentes.

## Revisão documental T1 e T2 — 17-11-2026

Âmbito aprovado na organização T1/T2: arquivo integral V1 dos dois documentos mistos encontrados, então atual V2 de arquitetura/dados/UI em separado, transferência byte a byte do wireframe histórico, entradas canónicas e rastreabilidade/navegação/histórico nos caminhos T1/T2. [Proveniência e hashes originais](architecture/README.md), [matriz fichas 01–05 e inventário](coursework-review.md).

HEAD observado no início: `778ffd1ff8cfa366b444edbb0cc21bcc9f9b28d2`; índice sem alterações staged. README e `.github/agents/planeador.agent.md` já tinham alterações, preservadas. Não confundir esta observação com os HEADs das execuções históricas abaixo.

**Natureza da evidência:** esta tarefa lê código/contrato/documentos e reutiliza a análise textual pedagógica anterior fornecida no handover. Não reabre logs externos, não reexecuta Maven/npm/E2E/build/scans/CI, não inicia serviços e não valida remotamente Render/GitHub. Os resultados de 12/13-11 abaixo são **resultados documentados**, não certificados novamente. Sem instalação, leitura de `.env`, staging, commit, push ou deploy.

T1: hashes SHA-256 dos originais e dimensões registados no índice; comparação dos MD arquivados com os originais confirmou **apenas rebase de destinos relativos**, mantendo texto/diagramas/histórico; hashes dos SVG/PNG transferidos iguais aos de origem. Parsing XML dos dois SVG passou. A então V2 era representação documental, não screenshot, renderização Mermaid ou prova de acessibilidade.

Verificações finais estáticas observadas em T1/T2, antes da consolidação posterior:

| Verificação local, scripts efémeros em memória | Resultado observado |
|---|---|
| Markdown na raiz e `docs/`, incluindo arquivos/ADRs | 27 ficheiros; 253 links locais e 35 âncoras resolvidos; 23 blocos fenced fechados; zero erros. Conferência local, sem consultar URLs externos. |
| Mermaid textual e SVG XML | 8 blocos Mermaid com tipos/estrutura básica conferidos; ER atual: nove entidades e respetivas colunas iguais ao SQL V1–V4. Dois SVG com XML bem formado. `mmdc` e módulos Mermaid/CLI não disponíveis; sem instalação/renderização. Não é validação semântica integral Mermaid, visual ou de acessibilidade. |
| Inventário e contrato preservado | 16 linhas PDF + 28 anexos; 712 páginas na análise anterior. OpenAPI lido com parser YAML existente: 29 operações, sem o alterar; não validador integral OpenAPI/JSON Schema. |
| Arquivo V1 e transferências | MD iguais aos originais após apenas rebase de links. SVG/PNG com SHA-256 de origem preservado. Sem reescrita de texto/diagramas históricos. |
| Preservação do trabalho e âmbito | Novos caminhos exatamente os dez destinos aprovados (incluem dois ficheiros transferidos); texto anterior de CHANGELOG/RELEASE_NOTES/plano/verificação/revisão de qualidade preservado. Quatro trechos preexistentes do README e hash do agente Planeador conferidos. |
| Fontes fora do âmbito, HEAD/índice | Digest dos 99 ficheiros rastreados protegidos, sem ler ficheiros de ambiente, igual antes/depois: `0c6636895ba768c995e55b2afd5323480073541a4097d0fc615c0984105a82d9`. HEAD inalterado; SHA-256 do índice `5b7aa7bfe4354193c983112fbf2350b3cd7493627fb0b594f329822337810a62`, inalterado. |
| Diff e texto | `git diff --check` exit 0; verificação adicional dos novos MD/SVG sem whitespace final ou caracteres de substituição Unicode. |

Não foram criados reports/logs adicionais no repositório. A portabilidade das evidências externas continua pendente. A [revisão de qualidade da ficha 04](quality-security-review.md) permanece histórica (05-11/70e0eca), não revisão das extensões. Arquivar preserva pendências; revisão independente e decisão humana continuam necessárias.

## Extensões de tarefas — 13-11-2026

**Estado atual:** âmbito académico aprovado pelo autor, não cliente. HEAD de referência `640b7e847f385cd69fabf0ff5ffd62dbf7f06cc2`; candidato mantém `0.4.0-rc.1`, implementação em worktree, sem SHA final publicado/tag ou bump. Esta tarefa **só leu fontes e reports armazenados e validou documentação**; não executou Maven/npm/build/E2E/scans/serviços, instalou dependências, consultou `.env`, escreveu no Git ou publicou.

**Final local atual concluído:** a [execução final de 13-11](#validação-final-local-das-extensões--execução-de-13-11-2026) passou com **41 Maven / 43 frontend / 6 E2E sem falhas**, imagem final fresca em contentores novos, Trivy **0 HIGH/CRITICAL** (**294/294 pares npm, 63/63 bibliotecas JAR**), Semgrep **135 regras/47 alvos/0 findings** e actionlint **1.7.7 PASS**. V3 populada→V4/MAT/defaults foi testada no Maven; HTTP real confirmou BLOCKS, anexos/comentário multipart e downloads/bytehashes, com limites/413 nos testes backend. Recriação app/db mudou ambos IDs mantendo o volume e snapshots de dados/links/comentários/bytes; paragem somente da DB própria deu readiness **503**/liveness **200**, retoma **200** e dados iguais. App/db próprios terminaram parados, volume retido. **Pendentes atuais:** revisão independente, inspeção/aceitação humana/cliente, prova GitHub Actions no âmbito/branch atual e uploads/retenção reais; capacidade/backups/policy de retenção/p95/produção continuam por decidir.

Os relatórios de revisão UI e as suas pendências abaixo, até «Verificação desta escrita documental», registam a fase documental anterior ao final local. O contentor reutilizado, scans anteriores e final então pendente são proveniência histórica legítima, não o estado atual: prevalecem o resumo acima e a execução final no fim deste documento. Não se reescrevem esses resultados nem os recibos brutos.

### Contrato atual e fontes

Confirmado em ApiModels, TaskController, TaskAttachmentController, serviços Task/Link/Attachment/Activity, migration V4 e frontend atual (types/api/detalhe/painel/Markdown/templates/links/anexos/atividade). OpenAPI descreve **29 operações**; POST comentário JSON e multipart é uma operação, Actuator não pertence ao contrato de negócio. `info.version`, sessão/CSRF mantidos.

Cobertura: MAT global/lacunas/UUID estável, tipos/peso/motivo só DONE/todo DONE no progresso, omissão/presença PUT, links/duas versões/BLOCKS real, lock/revalidação/atomicidade, BYTEA 5 diretos/5 por comentário/4 MiB/download autorizado, história tipada sem conteúdo/backfill, Markdown/templates e painel/página/rascunhos. [Requirements](requirements.md), [histórias](user-stories.md), [test-plan](test-plan.md).

Artefactos externos: `C:\Users\CTW03863\.copilot\session-state\511773b1-1ef5-450c-9195-750d6ee3d4ed\files`. Nomes são proveniência local, não links portáveis/artefactos publicados; originais preservados.

| Evidência guardada consultada | Resultado registado, não executado pelo agente documental |
|---|---|
| tasks-backend-contract.md, tasks-backend-results.md, tasks-backend-final-41.log, tasks-backend-final-audit.json | Maven final 13-11, 01:45:18Z: **41**, zero falhas/erros/skips, API 30 + Inputs 5 + LoginThrottle 1 + Observability 5; 8 API originais preservados + 22 novos. Migração populada/vazia, null/omissão, grafo/races/revogação/lock, limites servlet reais, rollback, história tipada/paginação/FKs/cascatas. |
| tasks-frontend-final-audit.json | Fase UI anterior: 35 componentes/5 E2E e gate **294/294 pares npm**, **63 bibliotecas JAR**, 0 HIGH/CRITICAL; anterior às últimas correções P2, não resultado final de testes/scan da imagem final. |
| tasks-ui-reviewfix-summary.md, tasks-ui-reviewfix-tests-final.log, tasks-ui-reviewfix-tests-repeat.log, tasks-ui-reviewfix-final-audit.json | **43/43**, nove ficheiros, duas execuções finais; 13 originais conservados, 35 anteriores + 2 templates descobertos + 6 regressões. vite.config.ts inclui TS+TSX: ajuste técnico necessário, não novo âmbito de produto. |
| tasks-ui-reviewfix-build-final.log, tasks-ui-reviewfix-docker-build-final.log | Build host e Docker --no-cache passaram na revisão; Docker frontend Node 22, testes/runner host Node 26.13.1. Não execução deste agente nem ensaio de todos os testes host com Node 22. |
| tasks-ui-reviewfix-e2e.log, tasks-ui-reviewfix-e2e-report.json, tasks-ui-reviewfix-final-audit.json | **6/6**, zero skipped/unexpected/flaky, início 02:24:25.974Z, 29,499 s. Sexto cenário: rascunhos/atribuição/relação, retries/Enter e conflito externo 409/recuperação confirmada. |

### Precisão do runtime e dos relatórios

Projeto existente `matriz-tasks-ui-check`, app/db previamente parados, loopback 18086/55436. Executou JAR extraído de build fresco copiado para **contentor app existente reutilizado**, não contentor fresco da imagem final. JAR fresco/executado SHA-256 `f09a87584c027a4dcb814d0628ad5df12a35d78cbb8e7b867947702a7f7e6f90`; imagem fonte `sha256:16c2630ad1414938a769164292ee5c6b2a77aef67f96969701f96df371c3805b`. ID histórico da imagem do contentor não prova a imagem fonte. Reports confirmam readiness HTTP 200/asset, contentores próprios parados no fim e volume preservado; tasks-ui-reviewfix-runtime-receipt.json regista proveniência.

Linhas brutas Playwright são coordenadas JS ESM transformadas por Babel no runner Windows/Node 26, não fontes antigas: 43→40, 232→110, 479→209, 713→319, 745→335, 888→399 (coluna 1). Harness anterior verificou cache exclusiva nova, declarações test no JS, mappings VLQ e SHA sourcesContent; fonte E2E final SHA `f18d8c05928aad50f0422e240d9ed8a393e6de33a21410b4d4559436e88c9711`, igual ao embutido. Report bruto preservado SHA `4ea88bb8ece85e1ac2f44ffb149351ac42c106c4f5bfa1487d1ba06af3b85949`. Esta escrita leu auditoria, não repetiu descodificação/browser.

Falhas intermédias preservadas: novo E2E enviava read-only no PUT de preparação (400); teste componente observava mock antes do fim UI. Corrigidos testes, finais repetidos sem ocultar logs. Três achados UI corrigidos: rascunho/base após mutação local, retry no form, seleção/Enter inválidos; summary detalha. Refetch externo não avança base suja; só resposta local reconhecida correspondente à versão de partida; recuperação exige confirmação.

### Segurança temporal e pendências

- Gate npm/JAR pré-última revisão P2: 294 pares npm/63 bibliotecas JAR, 0 HIGH/CRITICAL. Lock/backend não mudaram, **não houve scan da imagem final**; gate fresco pendente.
- Semgrep **135 regras/29 alvos/0 findings** T6 é pré-extensões, não cobertura V4/TSX atual.
- Sucesso GitHub antigo reportado pelo autor é histórico/pré-funcionalidades, não nova prova remota positiva/negativa, upload em falha ou retenção real.
- Final integrado autorizado necessário: imagem/contentores frescos identificados, scans atuais npm/JAR/Semgrep, E2E da mesma imagem, migração V3 populada→V4/persistência após recriação, readiness/outage/recovery, preservação de volumes/dados e revisão independente/humana.
- Inspeção visual humana screenshots/teclado/resize pendente; axe não certifica acessibilidade integral. Ficheiros: validação limitada, não antivírus/parsing completo/certificação PDF.
- Capacidade BYTEA/história, backups/recuperação, retention/base legal/p95/produção e aceitação do cliente por decidir, sem autosweep/policy nova. Sem Defcon/Goal, @mentions, notificações/serviços externos.

### Verificação desta escrita documental

Exclusivamente README, AGENTS, OpenAPI e oito docs requirements/constraints/user-stories/architecture/database/implementation-plan/test-plan/verification; nenhum ficheiro novo/removido no repositório. Guião, implementação dirty, outras configurações/índice preservados por SHA-256. Histórico dobrado fichas 01/02 e resultados/datas T6 abaixo mantidos, não promovidos a V4.

Verificações estáticas: YAML sem chaves duplicadas, refs/esquemas/parâmetros/operationIds e 29 operações contra controllers; links/âncoras Markdown locais, fences/histórico; git diff --check e hashes fora do âmbito/índice/HEAD. Logs/manifesto na pasta de sessão prefixo **tasks-docs-**: tasks-docs-validation.json, tasks-docs-validation.log, tasks-docs-preservation-before.json, tasks-docs-final-audit.json. Não validador integral OpenAPI, execução workflow, Mermaid renderizado ou teste funcional.

Resultado desta escrita: PyYAML 6.0.3, **17 caminhos / 29 operações / 44 schemas / 225 referências** (incluindo mappings discriminator) resolvidos; **75 links locais / 12 âncoras** válidos. Propriedades obrigatórias conferidas em 14 schemas DTO; cinco blocos históricos dobrados iguais ao HEAD. `git diff --check` exit 0; **98 ficheiros fora do âmbito**, guião incluído, sem diferenças SHA-256; nenhum ficheiro novo no repositório, HEAD/índice inalterados. O módulo jsonschema não está instalado; a sondagem de disponibilidade falhou sem instalação, não se alega validação integral JSON Schema.

## Baseline histórica anterior às extensões

Secções seguintes mantêm datas, contagens e fontes originais de 12-11/fases anteriores. “Final/T6” é dessas fases, não final integrado V4 de 13-11.

## Ficha 05 — candidato 0.4.0-rc.1

**Data: 12-11-2026. Estado: T6 integrado LOCAL passou; critérios remotos e revisão humana final PENDENTES.** Candidato não publicado; sem tag, commit, push, deploy ou execução GitHub Actions nesta tarefa. HEAD de referência **`46694e535333c15769ac14a70d1d3b61010b8216`**, alterações do candidato **não committed**: não existe SHA final inventado. Aprovações do autor para ficha 05, dependências, observabilidade local e migração Boot 4 não constituem validação do cliente ou certificação de produção.

As secções T2–T5 abaixo conservam resultados e limitações das respetivas fases. Menções a T6 pendente nessas fases são históricas; os resultados finais locais estão em [T6 — validação integrada final local](#t6--validação-integrada-final-local).

Stack atual conferida no POM/configuração e nas evidências de build/dependências: Java 21, Boot 4.0.9, Framework 7.0.10, Security 7.0.8, Jackson 3.1.7, Flyway 11.14.1, PostgreSQL 17; Docker usa Node 22/Java 21. POM já `0.4.0-rc.1`, preservado em T5; frontend e `info.version` OpenAPI são alinhados com este candidato. O título OpenAPI “API da ficha 03” identifica a origem do contrato de negócio, não a versão atual do runtime. Não foram acrescentadas rotas operacionais sob `/api`.

### Fontes e rastreabilidade

Fontes locais consultadas: `AGENTS.md`, skills `contexto-matriz`/`validacao-matriz`, README, requisitos/restrições/US em vigor, arquitetura, modelo, plano de implementação, OpenAPI, POM/manifests, Dockerfile, Compose base/override, `application.yaml`, `application-observability.yaml`, `SecurityConfig.java`, `ObservabilityIntegrationTest.java`, workflow e Blueprint Render. O plano/âmbito de T5 e o estado dos reviews T2/T3 foram fornecidos pelo autor nesta sessão, não deduzidos dos exemplos históricos.

As evidências externas ao repositório abaixo estão na pasta local da sessão **`511773b1-1ef5-450c-9195-750d6ee3d4ed/files`**, sob `C:\Users\CTW03863\.copilot\session-state\`. São referências de proveniência, não ligações portáveis nem artefactos publicados no Git. Originais preservados; evidência T6 persistida e auditada fisicamente nessa pasta, com prefixo `t6-`. Empacotamento/publicação da evidência continua a exigir autorização própria.

| Âmbito | Evidência consultada | Resultado/alcance |
|---|---|---|
| T2/T3 | Estado fornecido pelo autor; `t4-summary.md` e `t4-validation.json` assinalam falta de registos brutos originais | Reviews aceites como estáticos. T3 reportou 5 E2E e snapshot persistido após `force-recreate` **antes de Boot 4 (Boot 3.5)**; não há registos brutos independentes nesta pasta que permitam revalidar o relato. Não é resultado final do candidato. |
| T4 CI | `t4-validation.json`, `t4-summary.md`, `t4-findings.md`, `t4-image-trivy.json`, `t4-frontend-trivy.json` | YAML/estrutura, Python embutido, 14 blocos Bash e fixtures locais; gate real bloqueou com 38 findings (26 HIGH/12 CRITICAL), cobertura completa 216 npm e 49 JARs internos. Sem workflow remoto. |
| Remediação compatível parcial | `t-remediation-summary.txt`, `t-remediation-coverage.json`, testes/build/scans com o mesmo prefixo | Boot 3.5.16/Framework 6.2.19: 16 testes passaram; scan fresco reduziu 38→2 CRITICAL, gate ainda bloqueado. Sem supressões/exceções. |
| Migração Boot 4 | `t-boot4-summary.md`, `t-boot4-tests-first.txt`, `t-boot4-tests.txt`, `t-boot4-dependency-tree.txt`, `t-boot4-build.txt` | Regressões corrigidas; Maven final 19 testes, 0 falhas/erros/ignorados; build fresco concluído sem arrancar a aplicação Compose. |
| Scan Boot 4 e revisão local | `t-boot4-coverage.json`, `t-boot4-frontend-trivy.json`, `t-boot4-image-trivy.json`, `t-boot4-final-verification.json` | 0 HIGH/CRITICAL, 216/216 pares npm, 63/63 JARs internos encontrados (64 pacotes Java com a aplicação), sem erros; gate local passou. Corrobora revisão da configuração CI, não execução GitHub. |

Ligação ao contrato funcional preservado: RF-01/US-01 → sessão/scrypt/CSRF/login; RF-02–11/US-02–11 → API/JDBC/validação/colaboração/transações existentes; regressões Boot 4 → formato estrito, Unicode/datas/Problem Details e segurança operacional. Estes testes não alteram RF/RN ou critérios do cliente. O mapeamento detalhado dos nove cenários da ficha 03 é conservado no histórico abaixo.

### Resultados anteriores a T5 — Boot 4, 12-11-2026

| Comando registado (não repetido em T5) | Resultado real nas fontes |
|---|---|
| `mvn -f backend\pom.xml test '-Dapi.version=1.44'` | Exit 0, 19 testes: API 8, Inputs 5, LoginThrottle 1, Observability 5; 0 falhas/erros/skips. Baseline de 16 testes preservada e 3 regressões acrescentadas. |
| `mvn --batch-mode --no-transfer-progress -f backend\pom.xml dependency:tree` | Exit 0; versões efetivas conferidas no log e JAR entregue. |
| `docker compose --project-name matriz-ficha05-check --env-file .env.example build --no-cache app` | Exit 0; frontend TypeScript/Vite e JAR integrados. `npm ci` reportou zero vulnerabilidades nessa execução. Docker package usa `-DskipTests`; os testes foram executados separadamente no host. |
| Scans Docker Trivy e gate de cobertura, argumentos completos nos logs `t-boot4-*-scan.txt` | Scanner/version/DB/frontend/image exit 0; gate passou com 0 HIGH/CRITICAL e cobertura completa. Leitura do JAR por `docker create/cp`, sem iniciar a aplicação; só contentor temporário removido. |

Imagem pré-T5: **`sha256:c7a09e3b878c2548e180e8127fb604a3fb1db39b4a120c5478a6bc01da790327`**. SHA256 do `/app/app.jar`: **`1accf5067fe55c3c5ca4cee5a48cb43c0f95da4851e1c45d2943ac79c30acb5a`**; manifest backend `0.4.0-rc.1`. O log de build ainda diz **`matriz-frontend@0.3.0 build`**: esta imagem antecede o alinhamento de metadados T5 e **não é a imagem final validada**.

Scanner: `aquasec/trivy:0.76.2@sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb`. DB de vulnerabilidades atualizada em `2026-11-12T18:57:38Z`, descarregada em `20:37:23Z`; Java DB atualizada em `00:58:04Z`, descarregada em `20:39:47Z`, cache isolada `t-boot4-trivy-cache`. Só `vuln`/`library`, npm com dev, sem ignores/`ignore-unfixed`/VEX/exceções; sem scan de SO, segredos, licenças ou prova de exploitability. Zero findings é resultado temporal desta imagem/DB, não ausência de todas as vulnerabilidades.

### Problemas, causas e correções

| Observação | Causa/evidência e correção já realizada | Estado |
|---|---|---|
| Gate T4: 38 HIGH/CRITICAL | Bibliotecas realmente entregues, não apenas POM; remediação compatível autorizada removeu 36 findings, sem mudar severidade/policy. | Histórico preservado; não reescrito como scan limpo. |
| Restaram `CVE-2026-47884`/`CVE-2026-47890` em `spring-webmvc:6.2.19` | Scan parcial manteve 2 CRITICAL; a migração major foi autorizada separadamente, sem misturar Framework 7 com Boot 3.5 ou tratar falta de uso aparente como exceção. Boot 4.0.9 entrega `spring-webmvc-7.0.10.jar`; ambos ausentes no scan fresco. | 38→2→0, sem exceções. Páginas vendor retornaram 403 na consulta Boot 4; não se afirma revalidação independente desses advisories nessa fase. |
| Primeiro Maven Boot 4: 3 erros em 19 testes | Framework 7 não inicializa `ProblemDetail.type`; fixtures inválidas de `EndpointId` com inicial maiúscula. Definido `about:blank` e corrigidas fixtures, mantendo assertions e testes. | Segunda execução: 19/19, sem erros; ambos os logs conservados. |
| Metadados desfasados | POM candidato, frontend/OpenAPI ainda 0.3.0; o build pré-T5 confirma a divergência. | T5 alinha somente versões; rebuild final fica em T6. |
| Texto antigo de branch/staging | `docs/constraints.md` menciona branch em `c13da97`; a observação local T5 é `main`, HEAD `46694e5`. As antigas onze eliminações staged descritas nos relatos não representam o status atual, que não apresentou entradas staged no início de T5. | Errata histórica assinalada aqui; documento e índice preservados, sem integração/rebase. |

### IA, intervenção humana e limites

A IA consulta fontes, confronta código/evidência, atualiza documentação/metadados e executa validações locais mínimas. Não delegou nesta tarefa. O autor aprovou âmbito T5, novos caminhos, candidato frontend e migração major; os reviews T2/T3 aceites são estáticos. Não se converte aprovação do autor em validação de cliente ou auditoria independente. Decisões de publicação/produção, arquivo final de evidência e validação integrada são humanas e permanecem separadas.

CI conferida estaticamente e corroborada por scans/testes locais: gates básicos antes do build integrado; scans npm/JAR antes de E2E; HIGH/CRITICAL bloqueiam mesmo sem fix e erros/coverage falham. Upload/retention de sete dias estão **configurados**, não executados/comprovados remotamente nesta sessão. A referência CI `71d9fd7` fornecida como histórica não valida este candidato. Não há prova de GitHub Actions final nem de upload numa falha real.

Observabilidade atual confirmada em fonte/testes: opt-in local, mesma porta, health root com `status` e grupos; probes só `status`; liveness sem DB, readiness com indicador JDBC; métricas apenas `jvm.*`/`http.server.requests`, autenticadas pela sessão local. O teste de readiness bloqueia aquisição de ligação **no indicador JDBC**, não para o servidor PostgreSQL; não é prova de falha real da stack Compose. Sem monitoring externo por omissão, logs de corpos/cookies ou perfil Render.

O projeto `matriz-ficha05-check` foi reportado previamente criado/parado, volume preservado; portas 18085/55435 são propostas para o ensaio isolado, não listeners verificados em T5. Nenhum serviço arrancado/parado nesta tarefa e nenhum `.env` lido/alterado ou volume removido. Render/expiração `2026-12-02` são registo histórico/configuração não revalidada ao vivo; `checksPass` pode desencadear deploy, logo ações remotas exigem aprovação específica.

### Validações T5 — execução desta tarefa

Âmbito de escrita: `README.md`, `docs/architecture.md`, este documento, novos `CHANGELOG.md`/`RELEASE_NOTES.md`, somente `info.version` de `openapi.yaml` e somente versões dos manifests frontend. Sem alteração ao POM, configurações, restantes documentos ou índice.

| Comando/verificação executado em 12-11-2026 | Resultado observado T5 |
|---|---|
| Em `frontend`: `npm version 0.4.0-rc.1 --no-git-tag-version --ignore-scripts --allow-same-version` | Exit 0; só três campos de versão mudaram: package, lock raiz e `packages[""]`. Sem scripts lifecycle ou tag Git; dependências/scripts íntegros por comparação JSON com HEAD. |
| Em `frontend`: `npm test` | Exit 0; Vitest 4.1.12, 2 ficheiros, **13/13 testes** em 6,92 s; comando identifica `matriz-frontend@0.4.0-rc.1`. Dependências locais já presentes; sem instalação. |
| Python inline via here-string PowerShell, PyYAML 6.0.3 BaseLoader com rejeição de chaves duplicadas | Exit 0; sete YAMLs analisados (OpenAPI, Compose base/override, Render, workflow, application base/observability). Não executa steps do workflow nem configurações contra serviços. |
| Python inline: JSON/XML/semver e comparação OpenAPI com HEAD, descontando só `info.version` | Versões package/lock/root/POM/OpenAPI iguais a `0.4.0-rc.1`; lock v3. OpenAPI idêntico fora da versão: **21 operações**, operationIds únicos, **102 referências locais resolvidas**, sem rotas Actuator. A contagem 99 no histórico é de outra verificação, não reescrita. |
| Python inline: links e estrutura Markdown dos cinco documentos de T5 | **47 destinos locais** e **7 âncoras** existentes; fences e blocos de histórico equilibrados; candidato/T6 rastreáveis nos cinco documentos. Conferência editorial de stack, gates, origem do contrato e distinção histórico/atual. |
| `docker compose -p matriz-ficha05-check --env-file .env.example config --quiet` | Exit 0, sem output/arranque, usando só exemplo fictício. |
| `docker compose -p matriz-ficha05-check --env-file .env.example -f compose.yaml -f compose.observability.yaml config --quiet`, com `APP_HOST_PORT=18085` e `POSTGRES_HOST_PORT=55435` no processo | Exit 0, sem output/arranque; override analisado nas portas propostas. Não leu `.env` nem confirmou listeners/estado da stack. |
| `git --no-pager diff --check` | Exit 0; avisos de conversão LF→CRLF, sem erros de whitespace. |

Ambiente local observado T5: Node **26.13.1**, npm **11.2.0**, dependências de teste existentes; isto não é ensaio com Node 22 nem altera a versão Docker/CI. `npm run build`, Maven, Semgrep, Trivy e E2E **não foram repetidos em T5**: documentação/metadados não justificaram novo build funcional aqui; build integrado fresco/gates e ensaio Node 22 ficam em T6. Não foi instalado validador integral OpenAPI/Actions/JSON Schema; Mermaid revisto como texto, não renderizado.

Preservação verificada por hash de 82 ficheiros versionados/não ignorados fora dos oito caminhos autorizados (sem ler `.env`) e do índice Git, antes/depois de T5. Workflow, POM, configurações Docker/Compose/Render, testes/código e restantes docs mantêm-se byte a byte; alterações preexistentes conservadas. Sem mudanças staged, commit/push, serviços ou volumes.

### T6 — validação integrada final local

Execução em **12-11-2026, 20:53–21:06 UTC**, seguida de auditoria física e atualização documental. Autorização explícita do autor: projeto novo **`matriz-ficha05-final`**, app/db próprios, portas **18085/55435** verificadas livres antes de iniciar, seed fictício opt-in, `.env.example` e nenhuma leitura/alteração de `.env`. As alterações T2/T3/T4/migração/T5 e o índice foram preservados. Escrita documental T6 limitada a este ficheiro e `RELEASE_NOTES.md`; scripts/evidências apenas na pasta de sessão autorizada. Builds geraram os artefactos locais ignorados normais, sem novos caminhos fonte no repositório.

#### Comandos e resultados efetivos

Nos comandos Compose seguintes, `C` designa `docker compose -p matriz-ficha05-final --env-file .env.example`; `O` acrescenta `-f compose.yaml -f compose.observability.yaml`. Ambos usaram `APP_HOST_PORT=18085`, `POSTGRES_HOST_PORT=55435` e `DEMO_ENABLED=true` somente no processo. Comandos completos e exits estão nos logs físicos.

| Execução T6 | Resultado observado e evidência |
|---|---|
| `mvn -f backend\pom.xml test '-Dapi.version=1.44'` | Exit 0, **19 testes**, 0 falhas/erros/skips: API 8, Inputs 5, LoginThrottle 1, Observability 5. `t6-backend-tests.log`, XML/TXT sanitizados; XML válido em `t6-surefire-structured-reports/`. |
| Em `frontend`: `npm test`; `npm run build` | Ambos exit 0, **13/13** testes, 2 ficheiros; TypeScript/Vite 7.3.7 compilou 35 módulos. Logs `t6-frontend-tests.log`/`t6-frontend-build.log` identificam `0.4.0-rc.1`. Host Node 26.13.1/npm 11.2.0; sem instalação no host. |
| Docker Semgrep, mount `/src` readonly, `scan --config .semgrep.yml --config p/java --config p/typescript --error`, `SEMGREP_SEND_METRICS=off` | Exit 0, **0 findings**, 135 regras, 29 alvos Java/TS, ~100% linhas analisadas; 4 ficheiros excluídos por ignore e âmbito limitado pelo Git reportado pelo scanner. `t6-semgrep.log`. Rulesets públicos, sem conta/token/upload de código. Não é cobertura exaustiva. |
| `C config --quiet`; `O config --quiet` | Dois exits 0, sem imprimir valores de ambiente. `t6-compose-base-config.log`/`t6-compose-obs-config.log`. |
| `C build --no-cache app` | **Um único build fresco**, exit 0, Node 22/Java 21 no Dockerfile; frontend `0.4.0-rc.1`, JAR Boot 4.0.9. `t6-fresh-build.log`; `npm ci` do Dockerfile reportou 0 vulnerabilidades. Não se confunde package `-DskipTests` com execução de testes. |
| Python scanner extraído do workflow atual, sem alteração à lógica/argumentos/policy | Exit 0 para versão, scan npm e scan imagem; **0 HIGH/CRITICAL**, **216/216 pares npm incluindo dev**, **63/63 JARs internos** encontrados, 64 pacotes Java incluindo aplicação; sem erros ou cobertura em falta. `t6-workflow-scanner-source.py`, `t6-trivy-gate.log`, `t6-trivy-reports/coverage.json` e reports JSON/TXT. Ambos scans tentados pela lógica original. |
| Fixtures da expressão de gate extraída do AST do mesmo workflow | **5/5**: clean passa; HIGH sem fix, CRITICAL sem fix, erro scanner/DB e erro coverage bloqueiam. Python embutido compilado; **14 blocos Bash** passaram `bash -n`. `t6-gate-fixtures.json` inclui hash do workflow. Fixtures de gate locais, não execução GitHub nem simulação de upload. |
| `C up --no-build -d --wait --wait-timeout 180 app db` | Base healthy e `/` **200**, sem sessão; `/api/projects` anónimo **401**. Actuator base anónimo **401**, health/metrics autenticados **403**. Login real com CSRF **200**; `t6-base-http.json`/`t6-base-state.json`. |
| `PLAYWRIGHT_BASE_URL=http://localhost:18085`, `npm run test:e2e -- --reporter=line,json --output=<sessão>/t6-e2e-results` | Exit 0, **5/5 E2E**, 0 falhas/skips/flaky, **22,0 s**, imagem integrada real. Percurso CRUD/filtros/atribuições/comentários, cenário ficha 04, login inválido/móvel, navegação/teclado e axe WCAG selecionado. `t6-e2e.log`, `t6-e2e-report.json`, screenshots em `t6-e2e-results/`. Não certifica WCAG integral. |
| `C up --no-build -d --force-recreate --wait --wait-timeout 180 app db` | Dois contentores recriados, **mesmo volume e dados iguais**, sessão antiga **401**, novo login **200**. Snapshots e IDs persistidos **antes** e depois; seed opt-in não duplicou nem reinicializou os dados. |
| `O up --no-build -d --force-recreate --wait --wait-timeout 180 app` | Perfil ativado na mesma porta; publicações só `127.0.0.1`. Health root/probes GET anónimos **200/UP**, root só status/grupos e probes só status, **sem Set-Cookie**. Métricas anónimas **401**, sessão local **200** com nomes apenas `jvm.*`/`http.server.requests` e medidas efetivas JVM/HTTP. Endpoints sensíveis/discovery/componentes/outras famílias negados **403**; POST operacional com CSRF **403**, escrita de negócio sem CSRF **403**. |
| `O stop db`; probes e inspeções seletivas; `O start db` | DB própria realmente parada: readiness **503/DOWN**, liveness **200/UP**, app Docker **unhealthy** e DB exited. Após retoma: readiness/liveness **200/UP**, Docker healthy, **mesma sessão 200 e snapshot igual**, sem recriar app. `t6-http-db-stopped.json`, `t6-db-stopped-docker-samples.json`, snapshots antes/depois de recovery. |
| `O stop app db` | Exit 0; só app/db próprios parados, volume/fixture preservados. `t6-final-own-stop.log`, `t6-final-state.json`. Sem `down`, `down -v` ou eliminação de volume. |

#### Identidade da entrega e persistência

- Imagem: **`matriz-ficha05-final-app:latest`**, ID **`sha256:ce51e8d51b9f02005386b577e2ea55ea203a3ee27c53fb621781a30517eb0644`**. É ID Docker da imagem local, **não SHA Git**.
- SHA256 de `/app/app.jar`: **`2c14025d99739d991ec5cd2d1ad885dfb2868321ef390241950a57e176478dc6`**. Manifest: `Implementation-Version: 0.4.0-rc.1`, `Spring-Boot-Version: 4.0.9`, `Build-Jdk-Spec: 21`; estáticos integrados presentes. `t6-image-jar-metadata.json`; mesma imagem no scan, E2E, recriação e observabilidade, sem rebuild adicional.
- Volume: **`matriz-ficha05-final_matriz_data`**, driver local, criado `2026-11-12T20:59:56Z`; identidade conservada por Name/CreatedAt/Mountpoint/Labels e mount dos contentores. Docker volumes locais não fornecem um UUID autónomo: não se inventou volume ID. Mountpoint `/var/lib/docker/volumes/matriz-ficha05-final_matriz_data/_data`.
- Contentores app/db antes da recriação: **`597669f5f481` / `2e293e1c6f62`**; depois: **`f1a57b98c91b` / `4cf528647c83`**. O override recriou só app para **`94160df1da49`**; este e a DB `4cf528647c83` ficaram parados no fim. IDs completos nos snapshots.
- Fixture dedicada: projeto **`e56e1046-4c65-43bb-9b17-7c1375ec6902`**, tarefa **`a4d585e5-95cc-4c67-9bd9-0917f386eaed`**, comentário **`e994484a-4a6b-4bf7-a97c-51353dd36c60`**, responsável `user-bruno`. Conteúdo exclusivamente fictício; IDs em `t6-fixture-ids.json`.
- Snapshot SQL read-only + API: 3 utilizadores (sem campos de credenciais), 3 projetos, 5 participações, 6 tarefas, 3 atribuições, 1 comentário e migrations V1–V3. Igualdade integral dos dados antes/depois de recriação e de paragem/retoma DB; seed idempotente observado nesta fixture, não prova de migração de qualquer base externa.

#### Proveniência, problemas e limites finais

Evidência física auditada por `t6-review.py`: `t6-physical-review.json` lê efetivamente logs, reports Trivy/Playwright/XML e snapshots, verifica contagens/igualdade/IDs/volume e **88 ficheiros fonte fora dos dois paths T6**, índice e HEAD inalterados. `t6-artifact-manifest.json` regista caminhos/tamanhos/SHA256 dos artefactos T6, excluindo os grandes ficheiros binários de cache. `t6-docs-final-check.json` regista YAML, versões, refs, links e preservação; `t6-git-diff-check-final.log` regista whitespace. `t6-containers-before.log`/`t6-containers-after.log` confirmam mesmos IDs/estados das outras instâncias, incluindo **`sep-local-control-plane`** ainda Up. Não houve delegação, remoto, commit/push/tag/deploy ou publicação.

Ocorreram problemas **do harness de evidência**, não falhas de testes de produto: impressão cp1252 após Semgrep/build já concluídos com exit 0; leitura cp1252 do README antes do login base, seguida de paragem segura e retoma sem rebuild; sanitização por linhas que retirou markup XML com palavras de segurança. Corrigiu-se apenas UTF-8 e sanitização de nós de texto em scripts da sessão. Cópias iniciais conservadas; XML válido reextraído dos reports Maven inalterados, com hashes de origem em `t6-surefire-sanitization-correction.json`. Não houve correção backend, relaxamento de assertions, exceção ao gate ou nova instalação no host.

Trivy **0.76.2** com digest **`sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb`**, cache nova `t6-trivy-reports/trivy-cache`: vulnerability DB atualizada **18:57:38Z**, descarregada **20:56:09Z**; Java DB atualizada **00:58:04Z**, descarregada **20:58:15Z**, ambas 12-11-2026. A comparação física lista em `t6-physical-review.json` os **38 CVEs HIGH/CRITICAL históricos ausentes** no scan final, incluindo **CVE-2026-47884/CVE-2026-47890**, com package/versão/severidade de origem. Remediação aprovada **38→2→0** confirmada nesta nova imagem, sem ignores, `ignore-unfixed`, VEX ou exceções; ausência no report não é revalidação vendor/exploitability. Só `vuln/library` e cobertura lock/JAR: não scan de SO, segredos, licenças, pentest ou análise exaustiva de dependências/vulnerabilidades. Zero findings é temporal à imagem e DB.

A falha real DB produziu WARNs JDBC/DNS/health, com aquisição de ligação a demorar cerca de **30 s** em alguns probes; diagnóstico próprio sanitizado em `t6-sanitized-own-diagnostics.log`. Não foram alterados timeouts para acelerar o ensaio. Isto não mede p95/SLO; não se afirma resposta instantânea de readiness. Logs/artigos de sessão não conservam Authorization, cookies, passwords ou valores CSRF; probes registam somente presença/ausência de Set-Cookie, não o seu valor. Login/CSRF em memória; snapshots contêm apenas dados fictícios da stack própria.

Contribuição IA: leitura das fontes/skills, execução controlada, confronto dos reports físicos, fixtures da lógica real do gate e redação destes dois documentos. Decisões humanas: âmbito ficha 05/major Boot 4/sem exceções, seed local e paragem/recriação/outage isolados autorizados pelo autor. A auditoria aqui é auto-verificação da IA, **não revisão independente nem aceitação humana final**; resultados T6 novos não fabricam os raws originais T2/T3 em falta.

**Pendências que impedem declarar todos os critérios concluídos:**

- Prova **positiva e negativa GitHub Actions**, incluindo artefactos/upload em falha e retenção real: **não verificada**, só definição/fixtures locais. Requer autorização específica; Render `checksPass` pode desencadear deploy. Não acionar checks/push como parte deste fecho.
- Revisão final humana/independente e decisão de entrega/publicação/arquivo portável das evidências.
- YAML/JSON/XML/versões/refs/links e fences conferidos; sem validador integral OpenAPI/Actions/JSON Schema ou renderização Mermaid/browser documental. As verificações de formato não certificam semântica integral.

**Correção documental final P2, 12-11-2026:** README e arquitetura já alinhados com T6 concluído localmente; a errata de estado está resolvida, sem alteração desses ficheiros nesta correção. CHANGELOG, release notes e este documento distinguem o candidato reconstruído/E2E 5/5 da baseline histórica pré-T5. Não houve nova execução de build/testes/CI/serviços nem revisão independente. `t6-final-receipt.json`, `t6-artifact-manifest.json` e restantes evidências T6 foram preservados como histórico: os hashes documentais antigos identificam as versões de então, não os documentos após esta correção. Apenas o suplemento `t6-documentation-final.json`, na pasta da sessão acima, regista UTC, motivo e hashes antes/depois dos três ficheiros; não substitui resultados, datas ou aprovação humana final.

Produção continua diferida. A janela curta de suporte OSS Boot 4.0 **indicada na decisão de migração para dezembro de 2026** é um risco de manutenção a reconfirmar nas [datas de suporte Spring Boot](https://spring.io/projects/spring-boot#support) antes de operação prolongada; não foi reconsultada ao vivo em T5. Retenção anual e p95 continuam pressuposto/métrica sem policy/carga/alvo aprovados; sem purga ou certificação de segurança, acessibilidade, conformidade ou desempenho.

Datas de suporte Boot/estado e expiração Render **2026-12-02** também não foram revalidados ao vivo em T6. Não se afirma que a demonstração remota esteja disponível ou execute o candidato.

---

## Histórico — ficha 03 e interface

O registo abaixo é preservado nas suas datas e versões originais, incluindo RF/RN/testes antigos. Descrições de pipeline, branch, autenticação anterior e estado Render pertencem a essas execuções, não substituem o estado da ficha 05 acima.

## Identificação e alcance — histórico

Execução local em 29-10-2026, aplicação 0.3.0. Stack aprovada: Java 21/Spring Boot 3.5.7, React 19.2/TypeScript 5.9, PostgreSQL 17, monólito modular. No host: Windows, Maven 3.9.9, Node 25.6 e Docker Desktop 29.8; o Dockerfile compila com Node 22 e Java 21.

Entrega original da ficha 03 em `e73250d` (`feat: full stack implementation-plan.md and setup`) e revisão visual em `f780a29` (`feat: enhance UI components with improved accessibility and visual organization`), commits efetuados pelo autor. `main` e `origin/main` foram observados em `f780a29` em 29-10-2026. O código da aplicação foi conferido com essa versão, normalizando CRLF/LF; o README atualizado pelo autor também foi consultado na versão Git.

O âmbito alargado e as regras de acesso foram aprovados antes de implementar. Limites 1–120/1–200/2 000 mantidos por decisão do autor, em vez de copiar os limites meramente exemplificativos da ficha. Não se presume aceitação pelo cliente ou preparação para produção.

## Migração de autenticação — login local

A decisão mais recente substituiu Keycloak OIDC por login local com email/palavra-passe. O backend usa hash scrypt, sessão Spring no servidor, CSRF no login e escritas, erros genéricos e bloqueio após cinco falhas por email/endereço em 15 minutos. O seed cria apenas contas fictícias quando ativado; o Render está configurado com seed ativo e os visitantes podem alterar os mesmos dados demo. Não há registo público ou recuperação de palavra-passe.

Verificações locais em 02-11-2026:

| Verificação | Resultado observado |
|---|---|
| `mvn -f backend\pom.xml test '-Dapi.version=1.44'` | 8 testes passaram com PostgreSQL 17/Testcontainers; Flyway aplicou V1–V3. Cobertura inclui login, email case-insensitive, credenciais inválidas/inativas, CSRF, logout e bloqueio de tentativas. |
| Em `frontend`: `npm test` e `npm run build` | 13 testes passaram; TypeScript e Vite concluíram o build. |
| Compose isolado `matriz-auth-check` | Build concluído; aplicação saudável em porta alternativa 18080 e PostgreSQL em 55433; seed demo ativo. |
| E2E contra Compose | 4/4 passaram: fluxos integrados, login inválido, navegação móvel/teclado e auditorias axe-core. |
| YAML e configuração Compose | `render.yaml` e `openapi.yaml` analisados por PyYAML; `docker compose ... config --quiet` e `git diff --check` passaram. |
| Fecho do ensaio | Serviços `matriz-auth-check` parados; volume `matriz-auth-check_matriz_data` preservado. Não foi feito deploy, commit ou push. |

## Render — demonstração temporária

Foi autorizado preparar `render.yaml` para um serviço Docker e PostgreSQL 17 gratuitos em Frankfurt; nessa fase, não foram provisionados recursos nem efetuado deploy. A aplicação usa `PORT` quando fornecido pelo Render, preservando a porta local 8080; a ligação PostgreSQL Render é montada a partir de host/porta/base/utilizador/segredo referenciados no Blueprint, enquanto Compose continua a fornecer `DATABASE_URL`. O Blueprint define `COOKIE_SECURE=true`, mantém `SameSite=Strict`, ativa o seed das contas demo, usa a página estática `/` como health check para não criar sessões de verificação e só inicia deploys automáticos quando os checks GitHub passam.

**Estado atual da demonstração (05-11-2026):** o backend está disponível em [https://matriz-demo-h27u.onrender.com](https://matriz-demo-h27u.onrender.com). A base PostgreSQL gratuita atual, com duração de 30 dias, expira em **2 de dezembro de 2026**. Após expirar, há 14 dias para upgrade antes da eliminação; o serviço gratuito pode dormir após 15 minutos sem tráfego. As contas e a palavra-passe de demonstração ficam públicas; os visitantes podem alterar os mesmos dados, que são descartáveis. Esta é uma demonstração temporária, não produção. A expiração da base hospedada não constitui nem substitui uma policy de retenção da aplicação.

## Pipeline automatizada

`.github/workflows/ci.yml` executa em pushes, pull requests para `main` e por acionamento manual. Os jobs cobrem testes Java com PostgreSQL via Testcontainers, testes de componentes e build TypeScript/Vite, e os percursos E2E contra a aplicação Compose, incluindo auditoria axe-core. O job E2E usa exclusivamente dados/credenciais fictícios de `.env.example` e, em caso de falha, conserva relatórios Playwright como artefactos durante sete dias.

A definição do workflow foi validada no checkout, mas ainda não há uma execução GitHub Actions registada nesta atualização. Os resultados locais abaixo são evidência separada e não são apresentados como resultado da pipeline.

Registo histórico, antes da migração de autenticação: após adicionar a auditoria axe-core, a suite E2E correu contra um Compose isolado com PostgreSQL 17 e Keycloak 26.3.5: 4/4 testes passaram; as dez combinações auditadas não reportaram violações WCAG nos critérios selecionados. Os serviços foram parados e o volume isolado foi preservado. A instalação de `@axe-core/playwright` reportou zero vulnerabilidades conhecidas pelo `npm audit` nessa execução.

## Verificação histórica — OIDC (substituído), retenção, p95 e produção

O registo seguinte documenta a implementação OIDC que precedeu a decisão do utilizador de a substituir por login local. Não descreve o comportamento atual. Retenção de um ano continua a ser pressuposto provisório, sem âmbito/evento inicial definidos e sem purga automática. p95 é métrica sem alvo/carga definidos. Produção está diferida.

Verificações locais desta atualização:

| Verificação | Resultado observado |
|---|---|
| `mvn -q -f backend\pom.xml test '-Dapi.version=1.44'` | 7 testes passaram; PostgreSQL 17/Testcontainers aplicou V1 e V2. Testes cobrem claim OIDC, conta desconhecida/inativa, perfis demo sem hash local, CSRF e logout. |
| Em `frontend`: `npm test` e `npm run build` | 13 testes passaram; TypeScript e Vite concluíram o build. |
| Compose isolado `matriz-keycloak-check` | Imagem da aplicação construída; PostgreSQL, Keycloak 26.3.5 e realm fictício iniciados em portas alternativas 18080/55433/18180. |
| E2E contra a aplicação Compose e Keycloak reais | 3/3 passaram: fluxo integrado, credenciais inválidas e navegação móvel/teclado. O login OIDC foi também percorrido por teclado, do botão da Matriz aos campos/ação do Keycloak. |
| `npx --yes @redocly/cli lint openapi.yaml` (2.72.1) | Contrato OpenAPI 3.1 válido; 24 avisos de lint, incluindo respostas 4xx recomendadas, descrições de tags/licença e a operação de redirecionamento sem resposta 2xx. |
| Fecho do ensaio | Serviços do projeto isolado parados; volume `matriz-keycloak-check_matriz_data` preservado. Não foi removido nenhum volume. |

Não foi feita nova cópia limpa da versão atual porque as alterações ainda não estão num commit; a cópia limpa anterior verificou apenas o commit histórico `f780a291b62a35bb051b4d99421a0aa534ec5cc9`. p95 não foi medido: workload e alvo continuam por definir. Estas verificações não certificam segurança, conformidade ou desempenho.

Para medir p95 quando houver carga aprovada, registar endpoint/operação, volume de dados, concorrência, duração, ambiente e ferramenta; calcular o percentil sobre pedidos concluídos e reportar distribuição/erros junto com a latência. Não há ainda workload de referência, alvo aprovado nem medição desta versão.

## Iteração visual posterior — tema escuro e estrutura Jira

Direção aprovada pelo autor: manter a paleta escura/azul inspirada no Black Dashboard React e reorganizar a interface como espaço de trabalho ao estilo Jira, sem novas dependências nem mudanças de API/permissões. Barra superior global, navegação lateral compacta, breadcrumbs, vistas e tabelas; navegação móvel em diálogo modal nativo.

| Verificação desta iteração | Resultado observado |
|---|---|
| Em `frontend`: `npm test` | 13 testes de componentes passaram: os 7 existentes, 4 do layout e 2 sobre dados reais/ausência de projetos no painel. |
| Em `frontend`: `npm run build` | TypeScript e Vite concluídos após a correção final de foco/scroll. |
| `docker compose -p matriz-ficha3 --env-file .env.example up --build -d` | Imagem reconstruída; aplicação respondeu HTTP 200 na porta 8080 com a base de dados existente. |
| Em `frontend`, `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080`; `npm run test:e2e -- --repeat-each=2` | 3 percursos repetidos duas vezes: 6 execuções passaram em 19,6 s. Inclui CRUD/colaboração/reload, credenciais inválidas e nova navegação desktop/móvel. |
| Navegação e dados reais | Alfa apresenta 2/1/2 tarefas e 2 de 5 concluídas; seleção não soma a página de projetos. O menu abre, recebe foco, permite Tab, impede foco no logout de fundo, fecha com Escape/devolve foco e fecha ao navegar. |
| Layout responsivo | Sem overflow horizontal do documento a 390 px em painel, lista de projetos, projeto e tarefa; tabelas podem deslocar horizontalmente dentro do seu contentor. Capturas revistas a 1440 px e 390 px, incluindo login, painel, menu, projeto e tarefa. |
| Atalho para o conteúdo | Mantém a rota hash, foca `main` e não o coloca sob a barra superior. `scroll-margin-top` corrigiu a sobreposição reproduzida no browser. |

Uma execução intermédia do percurso completo falhou após reload de comentários. Reprodução com POST intercetado antes do envio confirmou que `getByText` correspondia ao `TEXTAREA` com o rascunho mesmo sem comentário persistido. O E2E passou a exigir o texto dentro de um `article` de comentário antes e depois do reload; não se aumentou o timeout nem se alterou a persistência para satisfazer o teste. As duas repetições finais passaram.

Não foram alterados backend, contrato API, dependências, políticas de acesso ou dados existentes deliberadamente. Os percursos concluídos eliminam os seus próprios projetos; o ensaio interrompido conserva os seus dados fictícios, sem limpeza indiscriminada. Não se repetiram os testes Java ou o audit npm nesta iteração exclusivamente visual; os resultados originais abaixo são históricos, não novas execuções.

Fecho da execução desta iteração: aplicação/PostgreSQL parados; volume `matriz-ficha3_matriz_data` existente; portas 8080, 5173 e 55432 sem listeners. O autor versionou posteriormente a revisão visual em `f780a29`; o agente preservou o staging e não efetuou commit/push.

## Procedimentos de verificação da entrega

As instruções desta secção descrevem como efetuar e registar uma verificação; não são resultados de execução. Usar apenas contas fictícias e guardar em cada registo: commit, ambiente, comando ou passos, resultado esperado, observado e evidência.

### Reprodução a partir de uma cópia limpa

O commit fixo neste procedimento é histórico e não valida a versão atual com login local. Para a validar, repetir numa cópia limpa do commit que contém a migração de autenticação, confirmar portas 8080 e 55432 livres e manter o projeto Compose `matriz-verificacao` separado. Se outra instância Matriz as ocupar, não a parar sem autorização; escolher um projeto/portas isolados e preservar todos os volumes existentes.

Com Git, Docker/Compose e os pré-requisitos de desenvolvimento do README disponíveis, executar em PowerShell:

```powershell
git clone https://github.com/Fibigor/matriz-ai-powered.git matriz-verificacao
Set-Location matriz-verificacao
git switch --detach f780a291b62a35bb051b4d99421a0aa534ec5cc9
git rev-parse HEAD
Copy-Item .env.example .env
docker compose -p matriz-verificacao --env-file .env config --quiet
docker compose -p matriz-verificacao --env-file .env up --build -d
```

Abrir `http://localhost:8080`, usar uma das contas de demonstração documentadas no README e confirmar que o perfil é apresentado após o login local. O contrato atual exige CSRF no `POST /api/auth/login`.

Na raiz dessa cópia, executar:

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
Set-Location frontend
npm ci
npm test
npm run build
npx playwright install chromium
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
Set-Location ..
```

Criar pela interface um projeto, uma tarefa, um comentário e uma atribuição; anotar os identificadores. Recarregar a página e confirmar os dados. Executar `docker compose -p matriz-verificacao --env-file .env restart app`, voltar a autenticar e consultar os mesmos registos, incluindo autor/data do comentário e responsável. Registar o resultado e os relatórios dos testes.

No final, executar `docker compose -p matriz-verificacao --env-file .env stop`. Conservar os dados de verificação; não usar `down -v`. Em futuras entregas, substituir o commit de referência pelo identificador completo da versão que se pretende verificar.

### Percurso por teclado

Usar Tab, Shift+Tab, Enter, Espaço, Escape e as teclas nativas dos selects, sem rato. Repetir a navegação em desktop e a 390 px, confirmando foco visível, ordem compreensível e ausência de controlos ocultos a receber foco.

| Fluxo | Ações a realizar e resultado a registar |
|---|---|
| Sessão e navegação | Testar credenciais fictícias inválidas e válidas, usar o atalho para o conteúdo, navegar entre vistas e terminar sessão Matriz; verificar rótulos, foco e mensagens. |
| Menu móvel | Abrir, percorrer os links, fechar por Escape e confirmar retorno do foco; reabrir e navegar, confirmando fecho do diálogo. |
| Projetos | Criar, pesquisar, percorrer a paginação e abrir um projeto; editar como gestor e testar cancelamento/confirmação da eliminação num projeto criado para o ensaio. |
| Tarefas e filtros | Criar e abrir uma tarefa, editar título/descrição/estado/prioridade, aplicar filtros, navegar nas páginas e cancelar/confirmar eliminação; conferir atualização da lista e do progresso. |
| Participantes e responsáveis | Como gestor, abrir as secções, adicionar um membro elegível, associar vários responsáveis e retirar uma atribuição; conferir nomes, seleção e feedback. |
| Comentários e erros | Adicionar e consultar comentários; submeter campos só com espaços e corrigir os erros sem perder o texto. Confirmar que estados e erros são compreensíveis sem depender apenas de cor. |

Registar por fluxo os passos, o controlo focado e o resultado. Associar qualquer desvio à evidência e repetir o percurso após uma correção, sem equiparar esta verificação funcional a certificação WCAG.

### Contrato e diagramas

Validar `openapi.yaml` com um validador local compatível com OpenAPI 3.1/JSON Schema, registando ferramenta, versão, comando e resultado. Rever a ferramenta e aprovar a instalação antes de acrescentar componentes ao ambiente. Conferir referências, parâmetros, schemas e operações; verificar que `POST /auth/login` documenta email/palavra-passe, CSRF, respostas genéricas e limite de tentativas.

Abrir `docs/database.md` e `docs/architecture.md` no renderizador Mermaid do GitHub, usando os ficheiros já versionados. Confirmar renderização, entidades, chaves e cardinalidades face à migration Flyway e às regras atuais. Distinguir os diagramas da implementação dos blocos históricos; registar o commit e o resultado da inspeção.

## Registo original da ficha 03

As secções seguintes conservam as verificações da entrega original, anteriores à iteração visual e ao commit manual do autor.

## Nove cenários da ficha

| Caso | Esperado | Observado | Evidência |
|---|---|---|---|
| 01 — Acesso | Login válido, perfil e logout; credenciais inválidas/pedido sem sessão recusados; CSRF nas escritas. | Login/perfil 200; inválidas/sem sessão 401; escrita sem CSRF 403; logout 204. Página inicial anónima não anuncia falsamente sessão expirada. | `ApiIntegrationTest.authenticationCsrfAndLogoutAreEnforced`; os dois E2E; prova de reinício abaixo. |
| 02 — Projetos | Criar, listar, pesquisar, consultar, editar e eliminar segundo permissões. | Gestor autenticado inferido no servidor; criação 201; pesquisa sem distinção de maiúsculas; edição incrementa versão; membro sem gestão 403; eliminação 204. Novo projeto fica visível mesmo após a primeira página. | Testes API `validatesLimitsAndSupportsSearchPriorityAndMemberTaskCrud`, `deniesForeignIdentifiersAndManagerOperationsToMembers`; E2E completo; teste de componente “apresenta o projeto criado além da primeira página”. |
| 03 — Persistência | Tarefa aparece sem reload e mantém-se após reinício do backend. | Lista/contagens atualizadas uma única vez; teste cobre 21.ª tarefa; tarefa HIGH, versão 2, associação e comentário iguais antes/depois de reinício real. | Testes de componentes; API `createsAndReadsPersistedTaskAndRejectsInvalidInput`; prova de reinício com identificadores abaixo. |
| 04 — Validação | Campos vazios/só espaços e valores inválidos recusados, sem truncagem. | Título só espaços, título 201, nome 121 e descrição 2 001 dão 422; 120/200/2 000 aceites nos casos de fronteira; Unicode normalizado sem truncagem; campos JSON desconhecidos e versão obrigatória ausente dão 400. | `InputsTest.validatesUnicodeAfterTrimmingWithoutTruncation`; testes API de criação/limites; componente conserva texto perante 422. |
| 05 — Estado/prioridade | Edição e filtros coerentes com contagens globais. | DONE/HIGH persistidos; filtro TODO oculta a tarefa, mas mantém progresso global a 100%; filtro por prioridade usa o subconjunto correto. Nova tarefa mantém filtros ativos. | E2E completo; API de filtros/prioridade; componente de filtro; `InputsTest.roundsProgressHalfUpAndHandlesEmptyProjects`. |
| 06 — Responsáveis | Vários elegíveis, remoção isolada e ausência de duplicados. | Ana e Bruno na mesma tarefa; associação repetida com versão atual não duplica; versão antiga 409; Carla fora do projeto 422; membro não gere atribuições; remoção de uma mantém a outra. | API `assignmentsCommentsVersionsRevocationAndCascadeWorkTogether` e teste de limites/CRUD; E2E completo. |
| 07 — Comentários | Conteúdo, autor autenticado e data ficam guardados e visíveis. | Autor Bruno no teste API, Ana na prova de reinício; data do servidor; reload preserva comentário; novo comentário após 20 resultados aparece na última página. Conteúdo só espaços recusado. | API de colaboração/validação; E2E completo; componente de paginação de comentários; prova de reinício. |
| 08 — Autorização API | Trocar identificadores não permite acesso indevido. | Carla recebe 404 para projeto alheio e inexistente com o mesmo detalhe; criação alheia recusada; Bruno sem permissão de gestão recebe 403; após remoção da participação perde acesso. | `deniesForeignIdentifiersAndManagerOperationsToMembers`; `assignmentsCommentsVersionsRevocationAndCascadeWorkTogether`. |
| 09 — Eliminação/erros | Dependências removidas atomicamente; erros não geram sucesso nem perda de rascunho. | Eliminar tarefa/projeto confirmado na UI; recurso eliminado deixa de existir; projetos com atribuições/comentários podem ser eliminados; membro com atribuições não pode ser removido; falha 422 mantém título e não chama atualização de sucesso. | API de colaboração/cascata e CRUD de membro; E2E completo; componente “conserva o texto e mostra a falha sem anunciar sucesso”. |

Os testes MockMvc usam a aplicação Spring e PostgreSQL real isolado por Testcontainers, incluindo Flyway e BCrypt. Os mocks do cliente API existem apenas nos testes de componentes; os E2E usam frontend, backend, sessão e PostgreSQL reais. “Observado” descreve os casos executados, não todas as interleavings possíveis em produção.

## Comandos e resultados reais

Executados a partir da raiz, salvo indicação:

| Comando | Resultado final |
|---|---|
| `mvn -q -f backend\pom.xml test '-Dapi.version=1.44'` | 7 testes: 5 de integração e 2 unitários; zero falhas/erros/ignorados. Relatórios gerados em `backend/target/surefire-reports/`. |
| `mvn -q -f backend\pom.xml package '-DskipTests'` | JAR criado na verificação inicial; a imagem final voltou a compilar/empacotar o backend. Não é uma execução de testes. |
| Em `frontend`: `npm test` | 7 testes de componentes passaram com Vitest 4.1.12. |
| Em `frontend`: `npm run build` | TypeScript e Vite 7.3.7 concluídos; bundles de produção gerados. |
| Em `frontend`: `npm audit --omit=dev --audit-level=high` | Zero alertas de dependências de produção na verificação inicial. |
| Em `frontend`: `npm audit --audit-level=moderate` | Zero alertas em toda a árvore após atualização aprovada de Vite/Vitest e lockfile. |
| `docker compose -p matriz-ficha3 --env-file .env.example up --build -d` | Imagem construída com `npm ci` e Maven; PostgreSQL saudável e aplicação iniciada em `127.0.0.1:8080`. Página React e endpoint CSRF responderam 200. |
| Em `frontend`, `$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:8080'`; `npm run test:e2e` | 2 testes passaram contra a imagem final, em 15,8 s no total: percurso completo e credenciais inválidas/layout a 390 px. |
| `docker compose -p matriz-ficha3 --env-file .env.example restart app` | Reinício real concluído; sessão anterior 401; dados idênticos após novo login. |

Também foram executados E2E com Vite em `127.0.0.1:5173` antes do teste final da imagem. Chromium foi instalado com `npx playwright install chromium` depois de o primeiro ensaio indicar que o browser estava ausente.

### Persistência após reinício

Foi criado pela API, com conta fictícia Ana, um conjunto dedicado à prova:

| Registo | Identificador / valor confirmado |
|---|---|
| Projeto | `41c0736b-cb3f-4ed4-9807-d421feb972c2`, nome `Restart proof 20261029` |
| Tarefa | `73357355-81c8-4b65-89a5-39342af95f80`, HIGH, versão 2 |
| Responsável | `user-bruno`, nome Bruno |
| Comentário | `aa190602-bd69-4984-ac2f-a3657080fe41`, autor `user-ana`, texto `Persistence proof: comment and assignment.` |

Após substituir a JVM local pela imagem Docker e depois reiniciar novamente o serviço `app`, as respostas completas do projeto, tarefa e comentários mantiveram-se iguais. A sessão anterior deixou de ser válida; um novo login permitiu consultar os mesmos dados.

Consulta SQL só de leitura antes/depois do reinício: **3 utilizadores, 5 projetos, 8 tarefas, 1 comentário, 3 atribuições e 1 migration bem-sucedida**, sem variação. Isso confirma que o seed não apagou, duplicou ou reinicializou os dados neste ensaio; não substitui testes de todas as possibilidades de inicialização parcial.

Os registos da prova e de tentativas E2E anteriormente interrompidas foram conservados no volume de demonstração; não foi feita limpeza indiscriminada. Os E2E finais criam e eliminam os seus próprios projetos.

### Contrato e documentação

OpenAPI 3.1 com **21 operações**, sessão/CSRF, DTOs atuais, responsáveis múltiplos, filtros, versões e regras de cascata. Foram analisados YAML, 99 referências internas, unicidade de operationId e parâmetros de caminho. Oito operações GET foram chamadas na aplicação e comparadas com os campos obrigatórios, tipos e enums dos schemas.

Estas verificações estruturais são limitadas: **não foi instalado/executado um validador integral de OpenAPI/JSON Schema**, nem se afirma validação exaustiva de cada resposta possível. Os limites após remoção de espaços são regras semânticas descritas no contrato, não `maxLength` sobre o texto bruto, que recusaria incorretamente entradas normalizáveis.

Requisitos, onze histórias atuais, restrições, arquitetura e modelo de seis tabelas foram alinhados. Os desenhos e decisões das fichas 01/02 ficam identificados como histórico, não como regras incompatíveis ainda em vigor. O wireframe antigo não representa todas as extensões da ficha 03.

## Problemas investigados e correções limitadas

| Evidência / reprodução | Causa confirmada e correção | Regressão |
|---|---|---|
| Submeter tarefa, obter erro de campo e procurar o input pelo rótulo original. | A mensagem estava dentro do `label` e alterava o nome acessível. Mensagem movida para fora do rótulo; não se enfraqueceu o teste de preservação. | Componente de erro/rascunho passou. |
| Criar item quando já há 20 tarefas/projetos/comentários. | Ordenação ascendente colocava a criação fora da página atual. Navegar para a última página prevista quando o item corresponde aos filtros; caso contrário preservar filtros e informar sucesso sem fingir correspondência. | Três casos com total 20→21 e caso de filtro não correspondente passaram. |
| E2E aguardava select de “Estado” e expirava. | `getByLabel` exato não correspondia ao texto integral do rótulo; o controlo tinha role/nome acessível corretos. Usar `getByRole('combobox', {name:'Estado', exact:true})`. Aumentar só o timeout não resolveu a causa. | Percurso real final passou, incluindo alteração DONE/HIGH. |
| Dois novos testes de paginação falharam apesar de item/autor já estarem visíveis. | Expectativa inventada “Página 2 / 2” diferia do texto real “Página 2 · 21 resultados · 2 páginas”. Corrigida a expectativa, não a interface. | Os sete componentes passaram. |
| `npm ci` da primeira imagem indicou alertas em ferramentas de desenvolvimento. | Audit identificou Vite/Vitest e dependências transitivas. Autor aprovou Vite 7.3.7/Vitest 4.1.12; lockfile regenerado, sem `audit fix --force`. | Testes/build/E2E repetidos; audit completo sem alertas. |
| Primeiro arranque Compose falhou ao publicar 8080. | A JVM local ainda detinha a porta após terminar o shell. PID e comando foram confirmados antes de parar exclusivamente esse processo; reconstrução/arranque seguintes passaram. | React/API 200 e E2E da imagem final passaram. |

### Revisão e refatoração

A revisão incidiu em permissões no servidor, conta ativa, identidade inferida, parâmetros SQL, limites Unicode, versões, FKs, cascatas, rascunhos/duplicados, coerência dos agregados e alinhamento documental. Os testes cobrem autorização direta e falhas, não apenas botões escondidos. Parâmetro obrigatório ausente passou a usar o mesmo Problem Details dos restantes erros de formato, com regressão API.

Oportunidade identificada: evitar duplicar validação, autorização e estados de submissão. `Inputs`, `ProjectService.access`, cliente API e hooks/componentes comuns já concentram essas regras desde a implementação. **Não foi feita uma refatoração adicional sem benefício demonstrado.** As correções de paginação e rótulos são alterações funcionais limitadas, não foram disfarçadas como refatoração sem mudança de comportamento.

## Três exemplos de utilização da IA

| Objetivo do pedido | Decisão humana / correção | Verificação |
|---|---|---|
| Conciliar a ficha 03 com os documentos anteriores antes de implementar. | Autor aprovou comentários, prioridade, pesquisa, CRUD e responsabilidade N:M, mantendo limites anteriores e as regras explícitas de gestão/participação. O scope não foi promovido automaticamente a decisão do cliente. | Rastreabilidade RF-01–11 / US-01–11; API e cenários acima. |
| Escolher uma implementação simples e preparar o incremento de persistência/autenticação. | A alternativa Django sugerida não foi adotada: o autor escolheu Java/Spring Boot, React e PostgreSQL. Foram aprovados sessão/CSRF/BCrypt e execução local, não JWT, mocks ou deploy público. | Build Maven/npm/Docker, testes com PostgreSQL e reinício real. |
| Investigar um E2E que expirava e evitar aceitar a primeira explicação da IA. | Hipótese de timeout insuficiente foi rejeitada como causa: contagem de localizadores confirmou zero para rótulo exato e um para role/nome. Corrigiu-se o localizador, sem alterar o comportamento da aplicação para satisfazer o teste. | E2E completo passou contra Vite e imagem Docker; resultado final registado acima. |

## Limitações e estado de entrega

- Não houve auditoria independente, pentest, ensaio de carga ou certificação de acessibilidade/segurança. O audit npm não cobre dependências Maven, imagens, configuração operacional ou falhas de lógica.
- Não foram simuladas todas as falhas de rede/base de dados nem todas as corridas concorrentes; conflito de versão e revogação têm testes, mas não há ensaio multicliente exaustivo. A resposta de transporte pode ser incerta e não deve ser repetida automaticamente.
- Seed local é opt-in e não reinicializa uma demonstração já existente. Contas fictícias e palavra-passe pública não servem produção. Retenção, identidade empresarial, HTTPS, limitação de tentativas, backups e recuperação continuam pendentes.
- Na entrega original foi verificado o build Docker com contexto de fontes e exclusão de builds/dependências locais, antes de existir um commit da ficha 03. O autor versionou-a em `e73250d` e a revisão visual em `f780a29`. Esta worktree mantém as onze eliminações staged anteriores; nenhum ficheiro foi adicionado ao índice pelo agente. O procedimento acima permite registar a reprodução de uma versão Git identificada.
- O autor autorizou parar os serviços locais ao terminar, conservando o volume `matriz-ficha3_matriz_data`. Para voltar a executar, seguir [README.md](../README.md); nunca remover o volume para um simples reinício.

Fecho observado na entrega original: aplicação e PostgreSQL parados; volume `matriz-ficha3_matriz_data` confirmado existente; portas locais 8080, 5173 e 55432 sem listeners. Verificação documental dessa entrega: 32 ligações locais existentes, nove cenários presentes e blocos de histórico equilibrados. O índice manteve as mesmas onze eliminações anteriores.

## Validação final local das extensões — execução de 13-11-2026

Este registo **acrescenta uma execução nova** à atualização documental e aos relatórios históricos acima; não transforma as suas execuções em provas atuais. As indicações de final integrado pendente na fase documental anterior são históricas; a abertura e os documentos com contradição atual foram agora alinhados, sem repetir execuções ou mudar o âmbito. A validação local abaixo não equivale a revisão independente/humana, aceitação do cliente ou publicação.

Autorização: escrita no repositório somente neste ficheiro; harnesses/evidência externa com prefixo `tasks-final-` na pasta de sessão já indicada. HEAD `640b7e847f385cd69fabf0ff5ffd62dbf7f06cc2`, candidato `0.4.0-rc.1`, worktree dirty aprovada preservada. Sem alterações de produto, testes, migrations, fixtures/configuração versionadas, dependências ou workflow; sem commit/push/deploy/escrita no índice. `.env` não foi lido; Compose utilizou exclusivamente `.env.example` fictício e variáveis locais de portas/seed. Nenhum volume foi eliminado.

### Comandos e resultados desta execução

Comandos a partir da raiz, salvo frontend. Logs registam argumentos reais, início e exit code; corpos das autenticações, headers de sessão/CSRF e palavras-passe não são guardados.

| Verificação executada | Resultado observado e evidência `tasks-final-*` |
|---|---|
| `mvn -f backend\pom.xml test -Dapi.version=1.44` | **41 testes**, zero falhas/erros/skips; 30 API, 5 Inputs, 1 LoginThrottle e 5 Observability. `backend-tests.log`, `backend-structured.json`, quatro XML válidos em `surefire-reports/`. Hashes dos XML originais e nomes/resultados de cada testcase preservados; cópias persistentes sanitizadas por nós XML, não removendo linhas de markup. |
| Em frontend: `npm test`; `npm run build` | **43 testes em 9 ficheiros**, todos passaram; TypeScript/Vite 7.3.7 passou, 200 módulos. `frontend-tests.log`, `frontend-build.log`. Host Node 26.13.1/npm 11.2.0; isto não é execução dos testes host em Node 22. |
| Docker Semgrep, mount readonly `/src`, `SEMGREP_SEND_METRICS=off`, `scan --config .semgrep.yml --config p/java --config p/typescript --error` | Exit 0, **135 regras / 47 alvos / 0 findings**: 19 Java e 28 TS/TSX; ~100% linhas analisadas, quatro exclusões por ignore e âmbito Git reportado pelo scanner. `semgrep.log`. Não reutiliza os 29 alvos históricos, não prova cobertura exaustiva. |
| `docker run --rm rhysd/actionlint:1.7.7@sha256:887a259a5a534f3c4f36cb02dca341673c6089431057242cdc931e9f133147e9 -version`; validação do workflow readonly com `-shellcheck= -pyflakes= /work/ci.yml` | Versão **1.7.7**, validação exit 0. `actionlint-version.log`, `actionlint.log`. Subvalidadores shellcheck/pyflakes não executados; `bash -n` verificou separadamente todos os blocos `run`. Nenhum workflow novo ou alteração de CI. |
| `docker compose -p matriz-tasks-final-check --env-file .env.example config --quiet`, base e com `-f compose.yaml -f compose.observability.yaml` | Ambos exit 0, sem imprimir configuração expandida. `compose-base-config.log`, `compose-obs-config.log`. Docker cliente/servidor 29.8.0. |
| Mesmo Compose: `build --no-cache app` | **Um único build integrado**, após as fontes finais; sem rebuild ou alterações posteriores de código. Docker frontend Node 22; Maven empacotou com `-DskipTests`, não segunda execução dos 41 testes. `fresh-build.log`, `sources-before-build.json`, `image-jar-metadata.json`. |
| Código Python do passo atual `Scan dependencies and verify delivered library coverage`, extraído de `.github/workflows/ci.yml` inalterado | Trivy **0.76.2** com digest CI `sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb`; versão e ambos os scans exit 0, **0 HIGH/CRITICAL**, sem erros de scanner/DB/cobertura. `workflow-scanner-source.py`, `trivy-gate.log`, `trivy-reports/coverage.json` e JSON/TXT dos scans. |
| Em frontend: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:18087`; `npm run test:e2e -- --reporter=line,json --output=<sessão>\tasks-final-e2e-results` | **6/6**, zero unexpected/flaky/skipped, início **02:50:07.085Z**, duração **28,608 s**. Backend real, frontend estático da imagem nova, PostgreSQL e sessões/CSRF reais. `e2e.log`, `e2e-report.json`, `e2e-results/`, cache exclusiva `playwright-cache/`. Sem edição ou relaxamento dos E2E existentes. |
| YAML/contrato e revisão documental local | PyYAML 6.0.3: **17 caminhos, 29 operações, 44 schemas, 225 referências** incluindo mappings discriminator resolvidos; IDs únicos, parâmetros de caminho e rotas conferidos contra controllers/logout. YAML sem chaves duplicadas, links/âncoras e Markdown conferidos na revisão final. `openapi.json`, `final-receipt.json`. Validação estrutural, não validador integral OpenAPI/JSON Schema nem Mermaid renderizado. |

O gate compara os pares nome/versão do lock **incluindo dev**: **294 esperados/294 reportados**, sem pares em falta. Compara também os caminhos físicos do JAR entregue: **63/63 `BOOT-INF/lib/*.jar` cobertos**. Trivy reportou **64 entradas Java**, não 63: a adicional é a aplicação `pt.matriz:matriz:0.4.0-rc.1`, caminho `app/app.jar`. Inventário completo e hashes individuais de entradas/JARs constam de `image-jar-metadata.json`; packages/caminhos reais constam de `coverage.json`.

Flags do código atual: `--scanners vuln --pkg-types library --offline-scan --disable-telemetry --skip-version-check --ignorefile "" --severity HIGH,CRITICAL --exit-code 1 --list-all-pkgs --format json`, mais `--include-dev-deps` no npm e `--image-src docker` na imagem. Sem `ignore-unfixed`, ignores ou exceções; **SO fora do âmbito**. Nesta execução as DBs públicas em falta foram descarregadas de `mirror.gcr.io/aquasec/trivy-db:2` e `mirror.gcr.io/aquasec/trivy-java-db:1`, com sucesso; não houve fallback de harness para ocultar erros. Scans locais, sem upload de código, `.env` ou credenciais.

As **cinco fixtures locais** avaliam a expressão real `failed` do workflow atual: clean permite; HIGH sem fix, CRITICAL sem fix, erro de scanner/DB e cobertura incompleta bloqueiam. `workflow-gate-fixtures.json` regista SHA do workflow e resultados; não são execuções GitHub Actions.

### Imagem/contentores realmente frescos e proveniência E2E

Projeto **novo** `matriz-tasks-final-check`, portas **18087/55437**, ambas com bind local bem-sucedido antes do arranque, volume inicialmente inexistente. Foi usado `up --no-build -d --wait --wait-timeout 180 app db` após o gate. Sem arranque/paragem de `matriz-tasks-ui-check` nem de outros projetos existentes. O ensaio não copiou um JAR para um contentor histórico.

- Imagem criada/scanned/executada: `sha256:b830dc1bd50640e6302597e7f16ba8819fb9301cb63ae49dec35a71cc43136a9`.
- JAR extraído em memória e efetivamente servido (`sha256sum /app/app.jar`): `0ab257671a838828dbb12e86ab9287f48bf8d5fa2d23a313c7ef5f30d5a42ca5`.
- App nova no E2E: `b491b1bc316489f80f1d07424047b6b63345874e2fbacc9c658106061318f9e6`.
- DB nova: `7e8c1810196afaf69151cde820730f23a7950215871f141ca8efd480a2381162`.
- Após recriar ambas: app `a3ce7091d5a81fe3c9c9a9c1c2d04c836e708daff2ea4a413c32e579b7394108`, DB `22e1300a215d901978bc517f71f52da22a0482fe0609737558000ce6b1d9c0e2`.
- App recriada com override observability: `c015b13eda22d717b0fd8fc133ec75d51dd2d94c962cb04b016916eb35c1033f`; imagem permanece a mesma. Volume **`matriz-tasks-final-check_matriz_data`** conservado durante todos os passos e no fecho.

`fresh-runtime-receipt.json` e os snapshots contêm IDs completos, imagem, estado, health, publicações loopback e identidade do volume. Base `/` respondeu 200 e Docker healthy; API anónima 401; Actuator base indisponível para anónimo e utilizador autenticado.

Report E2E bruto SHA-256 `086b6402972220efb6c2d61d64c69db66b78b4a797dc5d9343def432ec8e7107`. Fonte exata e `sourcesContent` SHA-256 `f18d8c05928aad50f0422e240d9ed8a393e6de33a21410b4d4559436e88c9711`. **110 hashes de ficheiros de origem** permaneceram iguais entre pré-build, pré-E2E e pós-E2E; não existe apenas um agregado sem inventário.

Foram verificadas novamente as seis declarações no JS gerado e os segmentos VLQ do mapa fresco: linhas brutas **43/232/479/713/745/888 → 40/110/209/319/335/399**, todas coluna 1. `e2e-source-map-receipt.json` contém por teste os frames brutos, posições originais, segmentos/valores VLQ, resultados/durações e hashes físicos do JS/mapa. Report não reescrito; cache exclusiva conserva artefactos transformados e source maps da execução atual, não reports antigos.

### Provas adicionais HTTP, SQL, browser e persistência

Harness `runtime.py` externo usou logins reais fictícios Ana/Bruno/Carla; credenciais, cookies e tokens apenas em memória. Fixture final: projeto `82c28a9c-a82c-4541-aded-78cddd34753c`; aliases **A/B/C**, chaves **MAT-15/MAT-16/MAT-17**, versões finais **5/7/1**, IDs e cada passo/versão/resposta em `retry1-fixture-ids-and-steps.json`.

Observado na aplicação real:

- Criação BUG/peso 5/chaves distintas; PUT sem type/weight preservou-os e incrementou versão. A BLOCKS B aparece na consulta de links **de entrada** de B; ciclo e auto-relação 422; alvo de outro projeto 404. POST repetido com versões atuais 200 sem incremento.
- B pode iniciar mas concluir antes de A dá **422**. Concluir A e depois B é permitido; reabrir A com B DONE e inserir C não DONE BLOCKS B DONE dá **422**. Após reabrir B, reabrir A é permitido. DONE→DONE sem motivo preserva CANCELLED; reabertura limpa motivo; entrada em DONE sem motivo resulta null. Não se substituiu o bloqueio semântico por expectativa 409.
- Upload direto de **PNG RGB 1×1 de 69 bytes com chunks/CRC reais** e **TXT UTF-8 de 35 bytes**, multipart tipado; download compara os bytes exatos/SHA, `attachment`, `nosniff`, `no-store`. Anónimo 401; Carla e caminho de outra tarefa 404; Bruno não autor ao eliminar anexos de Ana **403**. Sem pseudo-PDF.
- Comentário multipart de Bruno com parte `comment` application/json e TXT gera um comentário, metadados e **um único COMMENT_ADDED**, sem duplicar ATTACHMENT_ADDED para esse ficheiro. Histórico não contém cópias de título/descrição/texto do comentário; autoria e metadados conferidos.
- Browser adicional **só de leitura** na mesma imagem: descrição fictícia guardada com Markdown e `<b>`; preview cria `h1`/`strong`, não cria `b/script/img/iframe`, conserva texto literal. `ui-probe.json`, captura PNG física `ui-markdown.png`, SQL antes/depois igual em `ui-probe-data-unchanged.json`. Complementa o E2E de imagens/URLs perigosas, não certifica HTML/Markdown em geral.

Uma **falha inicial do harness**, não um defeito de produto confirmado, foi preservada: comparação associava anexos pela ordem da resposta, não garantida pelo contrato. Correção externa passou a associar por `filename`; tentativa original/log HTTP/fixtures permanecem, serviços próprios foram parados e retomados sem rebuild. `integrated-failure.json`, `integrated-runtime-http.json` e `harness-notes.json` distinguem esta tentativa de **retry1 passada**. Sem alteração de testes/produto ou limpeza dos dados da tentativa.

Snapshots completos **antes** e **depois** de `up --no-build -d --force-recreate --wait --wait-timeout 180 app db` foram persistidos: HTTP de projetos/membros/tarefas/comentários/links/atividade/anexos, downloads/bytehashes e SQL, sem hashes de palavras-passe/bytes de anexos no dump. Ambos IDs mudaram, volume igual; sessão antiga **401**, novo login e snapshots de dados **iguais**. Contagens SQL inalteradas: **3 users, 7 projetos, 10 participações, 15 tarefas, 3 atribuições, 2 comentários, 2 links, 5 anexos, 46 eventos e 4 migrations**. Incluem seed e fixtures preservadas da primeira tentativa; não são números de uma base sem ensaios.

A migração **V3 populada→V4** foi efetivamente executada no teste Maven `populatedV3MigrationAssignsDeterministicGlobalKeysWithoutChangingDatesVersionsOrInventingHistory`: três tarefas fora de ordem, em dois projetos/datas empatadas; aplicação de uma migration, UUID/campos/datas/versões iguais, MAT-1/2/3 por `(created_at,id)`, TASK, opcionais null, zero backfill, nova MAT-4, repetição sem migration e unicidade recusando duplicado. Testcase passou no XML persistente atual; não se confunde com o arranque vazio V1–V4 da imagem fresca.

### Observabilidade, fecho e limites

Após E2E base e recriação app/db, só app própria foi recriada com `-f compose.yaml -f compose.observability.yaml ... up --no-build -d --force-recreate --wait --wait-timeout 180 --no-deps app`. Health raiz/grupos mínimo UP, sem Set-Cookie; métricas anónimas **401**, sessão **200**, nomes restritos e medidas reais `jvm.memory.used`/`http.server.requests`.

`stop db` parou **somente a DB própria**: readiness **503/DOWN**, liveness **200/UP** e Docker app **unhealthy**, amostras temporais em `retry1-db-stopped-samples.json`. `start db` recuperou readiness **200/UP** e Docker healthy; sessão continuou válida e snapshot HTTP/SQL/downloads ficou igual ao pré-paragem. Evidência `retry1-snapshot-before-db-stop.json`, `retry1-snapshot-after-db-recovery.json`, `retry1-integrated-runtime-http.json`, `retry1-runtime-results.json`.

Fecho com `stop app db`, inclusive após o browser de leitura: ambos **exited**, volume retido. O health residual dos contentores parados não é medição de readiness em execução. Diagnósticos próprios sanitizados; instâncias preexistentes e fontes fora deste documento conferidas na revisão final. `final-receipt.json` e `sources-after-final.json` registam preservação dos **109 ficheiros fora do âmbito**, HEAD/índice, zero ficheiros novos/removidos no inventário do repositório e estado dos contentores anteriores.

Evidência física adicional: `preservation-before.json`, `workflow-gate-fixtures.json`, `harness-notes.json`, `git-diff-check-final.log`, `final-receipt.json`, `raw-artifact-manifest.json` e `raw-manifest-receipt.json`. O manifesto lista **cada ficheiro existente** com caminho/tamanho/SHA-256, incluindo XML, JSON/logs, PNGs, JS/source maps e relatórios/DBs do scanner; exclui-se a si próprio, cujo hash é dado no recibo separado. Nomes nesta secção usam o prefixo comum **`tasks-final-`**, não são artefactos publicados.

**Concluído localmente:** testes/builds/gates atuais, imagem/contentores frescos, E2E, contrato estrutural, migração Maven populada, persistência/recriação e outage/recovery próprios; afirmações documentais atuais de final local pendente corrigidas nesta atualização estreita. **Continua pendente:** nova prova positiva/negativa GitHub Actions neste âmbito/branch atual, uploads/retenção reais e revisão independente/humana/cliente. Axe nos seis E2E não certifica WCAG integral. SO, pentest, interleavings exaustivas, capacidade BYTEA/história, backups/recuperação, retention/base legal/p95 e produção não foram aprovados/validados; sem autosweep ou nova policy.

Rastreabilidade desta correção exclusivamente documental: `tasks-final-documentation-receipt.json`, apenas na pasta de sessão, lista os sete caminhos afetados com hashes antes/depois/atuais, UTC e hash do manifesto bruto anterior `tasks-final-raw-artifact-manifest-v2.json` (102 entradas). Recibos T6, relatório documental anterior e manifestos brutos mantêm os seus hashes históricos, incluindo o hash antigo deste documento; o suplemento não os substitui nem apresenta esses hashes como atuais.
