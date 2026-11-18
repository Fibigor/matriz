# Implementation Plan: Usabilidade de contas, tarefas e participantes

**Branch observada**: `main` (sem alteração) | **Data**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: especificação existente `specs/001-usabilidade-contas-tarefas/spec.md`, FR-001–015, SC-001–006, cinco histórias e decisões transmitidas pelo Orquestrador.

## Summary

Propor um delta localizado: registo com mínimo 6, apresentação acessível/compacta do detalhe e anexos, bloqueio transitório de templates por tipo e participantes adicionados por email completo, mantendo a API antiga por `userId`.

**Aprovação efetiva desta fase P1:** mensagem de encaminhamento do Orquestrador transmite «segue o plano anterior», explicitamente limitada ao planeamento técnico e à escrita de `plan.md`, `research.md`, `data-model.md`, `quickstart.md` e `contracts/delta.md` nesta feature. Decisão do autor, não cliente/produção. O cabeçalho anterior de `spec.md` é histórico; não foi atualizado. Não há autorização para `tasks.md`, alteração do estado da feature, implementação ou edição canónica.

Factos observados, decisões do autor e desenho proposto estão separados em [research.md](research.md). Fontes canónicas continuam [requisitos](../../docs/requirements.md), [restrições](../../docs/constraints.md), [histórias](../../docs/user-stories.md), [arquitetura](../../docs/architecture.md), [dados](../../docs/database.md), [OpenAPI](../../openapi.yaml), [plano anterior](../../docs/implementation-plan.md) e [verificação](../../docs/verification.md). Os canónicos e o código ainda exigem 12 no registo; **6 é o delta aprovado para desenhar**, não uma implementação existente. RF-04/RF-14/RF-16/RF-17; RN-01–04/09/12/17–22; US-04/16/17/19/20 delimitam a compatibilidade.

## Technical Context

**Language/Version**: Java 21; TypeScript 5.9.3/React 19.2.0.

**Primary Dependencies**: Spring Boot 4.0.9, Spring Security/sessão/CSRF/scrypt, JDBC/Flyway; Vite 7.3.7, react-markdown 10.1.0. Nenhuma dependência nova.

**Storage**: PostgreSQL 17 existente, migrations V1–V4 inalteradas; nenhuma persistência de templates, tabela, coluna, migration ou alteração de seed/IDs.

**Testing**: JUnit/MockMvc/Testcontainers no `ApiIntegrationTest.java`; Vitest/Testing Library, Playwright/Axe existentes. Só seleção/documentação nesta fase.

**Target Platform**: aplicação web académica mesma origem, browser desktop/móvel; painel a partir da lista em >960 px, página em hash direto/móvel. Preservar resize e árvore React existente.

**Project Type**: monólito modular, frontend empacotado no backend; sem nova camada/repositório/serviço de rede.

**Performance Goals**: nenhum novo alvo; p95/carga/escala continuam sem decisão. Não inferir metas dos templates.

**Constraints**: erros explícitos, autorização no servidor, idempotência concorrente, segurança atual e rascunhos protegidos. Sem diretório/convites/recuperação/email externo, novos privilégios, dependências ou produção.

**Scale/Scope**: cinco histórias; dois contratos HTTP existentes afetados, sem novas operações.

## Constitution Check

### Gate antes de Phase 0 / investigação local

| Princípio | Verificação antes do desenho | Resultado |
|---|---|---|
| I — Fontes/rastreabilidade | Contexto/README/AGENTS/constituição e fontes canónicas lidos; spec/checklist/feature.json existentes consultados. Delta 12→6 identificado, sem substituir canónicos nesta fase. | PASS |
| II — Aprovação | Só cinco caminhos aprovados; helper analisado antes de executar; suporte `SPECIFY_FEATURE_NO_PERSIST=1` confirmado em `common.ps1`. | PASS |
| III — Arquitetura/produto | Preservar monólito/stack/deps/schema/segurança; não gerar outra feature. | PASS |
| IV — Dados/falhas | Leitura local sem `.env`, serviços, internet ou dados reais; sem retry automático de escrita. | PASS |
| V — Evidência | Distinguir desenho de implementação e evidência anterior de execução nova; selecionar verificações com `validacao-matriz`. | PASS |

### Gate após Phase 1 / desenho

PASS nos mesmos cinco princípios: nenhum contrato completo concorrente, apenas [delta](contracts/delta.md); [modelo](data-model.md) sem persistência nova; inventário futuro explícito abaixo é **proposta não autorizada**. As duas extrações pequenas de validação de email evitam divergência em três consumidores, não criam um módulo de negócio. Gates futuros de canónicos/instruções estão identificados, não contornados. Não há exceção constitucional a justificar.

`speckit-analyze` **não executado**: falta `tasks.md`; a revisão documental desta fase não é análise cruzada completa nem aprovação de implementação.

## Project Structure

### Documentation (this feature)

```text
specs/001-usabilidade-contas-tarefas/
  spec.md                       # existente, só leitura
  checklists/requirements.md    # existente, só leitura
  plan.md                       # autorizado nesta fase
  research.md                   # autorizado nesta fase
  data-model.md                 # autorizado nesta fase
  quickstart.md                 # autorizado nesta fase
  contracts/delta.md            # autorizado nesta fase
```

`.specify/feature.json` existente é só leitura. `tasks.md` não foi criado nem autorizado. Diretório da feature não equivale a branch Git: o campo `BRANCH` do helper devolveu `001-usabilidade-contas-tarefas` por fallback ao nome da pasta; Git observou `main`.

### Source Code (repository root)

```text
backend/src/main/java/pt/matriz/
  common/ApiModels.java          # MemberInput
  common/Emails.java             # criação futura proposta: normalização/validade pura
  identity/{AuthController,IdentityService}.java
  projects/{ProjectController,ProjectService}.java
backend/src/test/java/pt/matriz/ApiIntegrationTest.java
frontend/src/
  App.tsx, Projects.tsx, Tasks.tsx, TaskDetail.tsx, TaskDetailPanel.tsx
  MarkdownEditor.tsx, TaskActivity.tsx, TaskAttachments.tsx, styles.css
  email.ts                      # criação futura proposta: validador puro extraído de App
  testes existentes             # inventário exato abaixo
frontend/e2e/matriz.spec.ts
```

**Structure Decision**: manter componentes e serviços existentes. Não criar catálogo de templates, hook genérico, biblioteca de ícones ou componente visual global. Reutilizar `FilePicker`/`AttachmentList`, `.icon-button` e SVG local decorativo; partilhar a pequena toolbar apenas dentro de `TaskDetailPanel.tsx`.

## Desenho técnico proposto

### D1 — Registo e email partilhado (história 2; compatibilidade história 1)

- Em `IdentityService.register`, contar `password.codePointCount` sem trim: `<6` → 422/field `password`/«Mínimo de 6 caracteres»; `>200` → 422/mesmo field/«Palavra-passe demasiado longa». `ApiErrors` já repete a mensagem em `detail` e `errors`: ambos devem omitir o número máximo. Não modificar o handler global.
- Em `Register` (`App.tsx`), contagem `Array.from(password).length` ou spread bruto, nunca `taskTemplates.codePoints` (este faz trim). Ajuda exatamente «Mínimo de 6 caracteres»; mensagens locais correspondentes. Não impor `maxLength` HTML no registo (UTF-16/truncagem). Confirmação exata só local.
- A resposta de validação do servidor atualizado já traz mensagem segura; conservar apresentação explícita em resumo e campo/foco. Acrescentar teste do caminho servidor que injeta excesso com `detail` e `errors.password` seguros, independentemente do tamanho aceite localmente. Não usar substituição cega de números ou esconder falhas gerais; não prometer compatibilidade com backend antigo de 12 (cliente/servidor devem ser entregues juntos).
- Login mantém antigas curtas, máximo 200, mensagens/status/throttle atuais, sem aplicar o novo mínimo. Manter CSRF, PathPattern, scrypt, quotas, sucesso 201 só mensagem, sem auto-login/transporte/armazenamento de password e sem projetos herdados.
- Extrair **sem mudar comportamento** email para `common/Emails.java`: normalização null→vazio, `String.trim().toLowerCase(Locale.ROOT)`; validade com `isBlank`, máximo 254 unidades UTF-16 e regex Java atual. Consumidores: `AuthController`, `IdentityService`, `ProjectService`. O helper é puro e não decide HTTP/field; cada chamador conserva os seus erros.
- Extrair `validEmail` de `App.tsx` para `frontend/src/email.ts`; consumidores App/Projects. Preservar trim U+0000–U+0020, lowercase e regex ASCII whitespace atuais; sem JS `trim()` alargado, restrição HTML `type=email`, normalização NFC/NFKC ou deteção de posse/entrega. API é a autoridade de normalização. Testar Unicode, astral, caixa/espaços, 254/255 e rejeição de parcial.

### D2 — Participantes por um de dois critérios (história 1)

- `MemberInput` deixa de conter só `userId`: incluir `email` e presença de ambas as propriedades, seguindo a técnica de setters de `UpdateTask`, para distinguir omissão de null e implementar XOR real. DTO simples localizado, não um framework de desserialização.
- `ProjectController.add` passa o input ao serviço. `ProjectService.addMember` autoriza/obtém lock de projeto primeiro; após espera, revalida conta ativa/participação/gestor no âmbito **deste método**. Não generalizar refatoração a todos os serviços.
- Exatamente uma propriedade fornecida: `email` ou `userId`. Ambas fornecidas (mesmo uma null), nenhuma, valor escolhido null/vazio/inválido → 422 sem escrita. Erro de critério ambíguo/ausente associado a `email` com mensagem explícita; `userId` inválido conserva field legado. Campos desconhecidos continuam 400.
- Email normalizado/validado pelas regras de D1; procurar conta ativa por igualdade de `lower(email)` com parâmetro JDBC, não LIKE/prefixo. Ausente e inativa: mesmo 422 `email`/«Conta não elegível.», sem retornar dados. Via `userId`: igualdade exata, field `userId`/mesma mensagem anterior, sem normalizar IDs.
- Manter transação e lock do projeto, consulta elegível após lock, e proteger a linha da conta-alvo por `FOR SHARE` até inserção, para não aceitar desativação concorrente entre elegibilidade e escrita. Revalidar ator após espera e cobrir a recusa em testes. Sem endpoint de gestão de contas novo.
- `INSERT ... ON CONFLICT (project_id,user_id) DO NOTHING`: 204 tanto criada como já existente, incluindo email/email e email/userId concorrentes. PK existente assegura unicidade; nenhuma versão/privilégio extra. Não mascarar outras falhas da DB.
- `Members` pede «Email completo do membro», `type=text`/`inputMode=email`, exemplo fictício `pessoa@example.invalid`, envia apenas `{email: target}`. Validação local/erro associado e foco, busy/lock via `useMutation`, erro conserva entrada, sucesso neutro «Participação confirmada. Adicionar novamente não cria duplicados.» e reload. Não inferir de 204 que foi criada.
- Mostrar apenas `displayName`, função traduzida e «Inativo» quando aplicável; IDs continuam em chaves/URLs/seleções internas. Manter remoção/confirmação/gestor e restrição de atribuições. Sem lista/sugestões de emails ou novo GET de contas; `MemberView`/types não precisam de email.

### D3 — Templates por ciclo de edição/criação (história 3)

- `taskTemplates.ts` já distingue TASK/BUG/IMPROVEMENT: só leitura, sem mudar textos ou a semântica de `codePoints`.
- `NewTask` e `TaskEditor` recebem cada um um conjunto React local de `TaskType` aplicados, atualizado imutavelmente apenas depois de aplicação efetiva (confirmação aceite ou descrição vazia segundo regra existente). Defesa no handler e `disabled` nativo; estado cinzento explícito em CSS, incluindo após apagar descrição.
- Mudar tipo só altera o campo; ação disponível se tipo ausente no conjunto. Voltar a tipo aplicado mantém desativação; cancelar confirmação não insere no conjunto.
- `NewTask`: limpar conjunto apenas após POST confirmado e começo da criação seguinte (ou montagem de outra criação/projeto). Falha mantém texto/conjunto. Em `ProjectDetail`, uma vez carregado, manter `NewTask` montado no mesmo projeto durante refetch **e erro recuperável**; a condição atual `!resource.error` desmonta-o. Não mudar `ui.LoadState` globalmente.
- `TaskEditor`: montar por identidade estável, não por versão/revision/dirty. Não limpar conjunto em PUT bem-sucedido/falhado, GET/refetch, atualização local de atribuições/relações ou recuperação confirmada da versão atual. Esta recuperação substitui dados mas não inicia nova edição. Só fechar e reabrir efetivamente a tarefa ou outra tarefa inicia outro conjunto.
- `App`/`TaskDetailPanel` já mantêm árvore ao maximizar/resize; preservar essa estrutura/keys. Não colocar estado no servidor, storage, `Task` ou num singleton. Testar ainda refetch externo limpo e sujo, navegação recusada e separação entre tarefas.

### D4 — Ações de detalhe, seletores e linha final (história 4)

- Toolbar atual vive em `TaskDetailPanel`; a página hash direta usa apenas `TaskDetail`. Reutilizar toolbar pequena exportada do primeiro ficheiro: `close` e ação opcional de maximizar. `TaskDetail` recebe indicação explícita de apresentação standalone (omissa = página; App passa false dentro do painel), para evitar duas toolbars.
- Painel: maximizar (SVG de cantos) e X à direita (`margin-left:auto`/justificação final), nomes «Abrir em página completa» e «Fechar detalhe» preservados; link conserva `href`, modificadores e `data-task-preserve`, evento `task-full-page`, sem remount. Fechar continua botão/`requestTaskClose`. Na página já completa não oferecer maximização sem destino; manter X para voltar ao projeto pelo guard/hash existente. Não criar navegação ou minimizar novo.
- SVG `aria-hidden`/não focável; nome na âncora/botão, não apenas title. Foco inicial continua no fecho, apesar de ordem visual maximizar/X: trocar `querySelector('button')` por referência/seletor explícito ao fecho, se necessário. Preservar trap Tab/Shift+Tab, Escape, devolução de foco e inert no painel. Página standalone não adquire modal/trap.
- Markdown muda «Escrever» para «Editar». Manter botões nativos `type=button`/`aria-pressed`; Tab, Enter e Espaço funcionam sem inventar roles de tab sem implementar o padrão. Mesma aparência nos três filtros de atividade; não mudar consultas, páginas ou filtragem.
- CSS local dos seletores remove gradiente/fundo, borda/relevo/sombra também em hover/seleção. Todos negrito+sublinhado; seleção distinguida por cor e espessura/offset de sublinhado, foco independente visível (não confundido com seleção). Substituir outline permanente de `[aria-pressed=true]`, preservar `:focus-visible`. Não afetar restantes botões.
- `TaskEditor`: mover Eliminar para a mesma linha de Guardar, no form/fieldset existente, com `type=button` explícito; submit continua apenas Guardar. Grid/flex de duas colunas `minmax(0,1fr)`, margem destrutiva local anulada, texto pode quebrar **dentro** da coluna, mas botões não empilham no móvel. Confirmação, versão DELETE, busy, eventos e erros preservados.

### D5 — Ícones dos ficheiros (história 5)

- Só `TaskAttachments.tsx` precisa de alterar renderização: `FilePicker` e `AttachmentList` são usados também por comentários/atividade. Não duplicar componente no comentário.
- Linha com bloco de metadados `min-width:0; overflow-wrap:anywhere` seguido de grupo inline de ações não encolhível: seleção só X «Retirar {nome}»; guardado seta descendente «Descarregar {nome}» e, apenas `canDelete`, X destrutivo «Eliminar {nome}». SVG oculto de AT; sem texto visível das ações nestas linhas.
- Nome/tamanho e restantes metadados mantidos; quebra dos metadados permitida sem afastar ações para coluna invisível/overflow. Controlos com área de alvo adequada (reutilizar 40px), foco visível, ordem DOM metadados→download→eliminar.
- Manter chooser/drop/paste, validações/limites, multipart, blob/revogação URL, disabled/bloqueio de duplicação, confirmação de eliminação, feedback de erro/sucesso. Retirar seleção nunca envia DELETE. API continua autoridade para autor/gestor ainda participante e download.

## Inventário EXAUSTIVO proposto de caminhos futuros

**Nenhum caminho desta secção está autorizado para escrita nesta P1.** Todas as operações futuras são edição ou criação explicitamente listadas; **nenhuma eliminação** prevista. Cada lote lê ainda `AGENTS.md`, constituição, spec, os cinco artefactos P1 e os canónicos citados no Summary. Sem escrita concorrente ou leitura de ficheiros enquanto outro lote os altera; sequência deliberadamente conservadora.

### B1 — Contratos/contas/participação; Engenheiro Backend Matriz

**Editar**:
- `backend/src/main/java/pt/matriz/identity/IdentityService.java`
- `backend/src/main/java/pt/matriz/identity/AuthController.java` (só extração de email, sem mudar login)
- `backend/src/main/java/pt/matriz/common/ApiModels.java`
- `backend/src/main/java/pt/matriz/projects/ProjectController.java`
- `backend/src/main/java/pt/matriz/projects/ProjectService.java`
- `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`

**Criar**: `backend/src/main/java/pt/matriz/common/Emails.java`, helper puro justificado por três consumidores e fronteira identity/projects; testes ficam na suite API existente.

**Leitura adicional exata**: `backend/src/main/java/pt/matriz/common/Inputs.java`, `backend/src/main/java/pt/matriz/common/ApiErrors.java`, `backend/src/main/java/pt/matriz/common/ApiException.java`, `backend/src/main/java/pt/matriz/identity/SecurityConfig.java`, `backend/src/main/java/pt/matriz/identity/RegistrationThrottle.java`, `backend/src/main/java/pt/matriz/identity/LoginThrottle.java`, `backend/src/main/java/pt/matriz/tasks/TaskService.java`, `backend/src/main/resources/db/migration/V1__initial_schema.sql`, `backend/src/main/resources/db/migration/V3__local_email_password_auth.sql`, `backend/pom.xml`.

**Aceitação**: D1/D2, FR-001/002/003/011/012/014/015; testes de fronteira, API/permissões, XOR incluindo null/omissão, erros iguais inexistente/inativa, idempotência concorrente, uma participação e acesso limitado. Preservar testes antigos por userId e toda regressão de auth/CSRF/quota/hash. Dependência: aprovação futura de B1 e contratos.

### B2 — UI registo/participantes; Engenheiro Frontend Matriz

**Editar**: `frontend/src/App.tsx`, `frontend/src/Projects.tsx`, `frontend/src/App.test.tsx`, `frontend/src/Tasks.test.tsx` (já reúne testes Projects; acrescentar Members sem ficheiro de teste novo).

**Criar**: `frontend/src/email.ts` (extração pura, dois consumidores, impede deriva Unicode); cobrir diretamente através dos testes existentes App/Members.

**Leitura adicional**: saídas B1, `frontend/src/api.ts`, `frontend/src/types.ts`, `frontend/src/ui.tsx`, `frontend/package.json`.

**Aceitação**: D1/D2 frontend, FR-001–003/011–015, SC-001/002; erro servidor sem máximo nos dois locais visíveis, foco/associação e formulário preservado, UI sem IDs/sugestões, payload só email, mensagem idempotente neutra. Dependência B1 estabilizado/revisto; sem alterar estilos globais neste lote.

### B3 — Usabilidade de tarefas; Engenheiro Frontend Matriz

**Editar**:
- `frontend/src/App.tsx` (só integração da apresentação standalone)
- `frontend/src/Tasks.tsx`
- `frontend/src/TaskDetail.tsx`
- `frontend/src/TaskDetailPanel.tsx`
- `frontend/src/MarkdownEditor.tsx`
- `frontend/src/TaskActivity.tsx`
- `frontend/src/TaskAttachments.tsx`
- `frontend/src/styles.css`
- `frontend/src/Tasks.test.tsx`
- `frontend/src/TaskDetail.test.tsx`
- `frontend/src/TaskDetailPanel.test.tsx`
- `frontend/src/MarkdownEditor.test.tsx`
- `frontend/src/TaskActivity.test.tsx`
- `frontend/src/TaskAttachments.test.tsx`

**Criar**: nenhum ficheiro. **Leitura adicional**: saídas B2, `frontend/src/taskTemplates.ts`, `frontend/src/taskTemplates.test.ts`, `frontend/src/types.ts`, `frontend/src/ui.tsx`, `frontend/src/api.ts`.

**Aceitação**: D3–D5, FR-004–010/015, SC-003–006; testes de ciclo/rascunho/save/refetch/layout, teclado/nomes/seleção, ações não submetem acidentalmente, confirmações/permissões e seleção de ficheiros mantidas. Dependência B2 (App e Tasks.test partilhados); uma só escrita de styles.

### B4 — Percursos integrados e visuais; Engenheiro Frontend Matriz

**Editar**: `frontend/e2e/matriz.spec.ts`. **Criar**: nenhum ficheiro fonte/evidência novo aprovado.

**Leitura adicional**: saídas B1–B3, `frontend/playwright.config.ts`, `frontend/package.json`, `README.md`.

**Aceitação**: todos SC e FR, conforme matriz abaixo e quickstart; substituir locator de participante por email e assertion sem ID; preservar IDs internos de options/seed. Registo→login explícito→gestor adiciona por email→acesso limitado; desktop/móvel/teclado e anexos diretos/comentários, validações/mensagens; Axe mais inspeção geométrica/visual, não só testes DOM. Dependência B1–B3 revistos e autorização de alvo/execução. Artefactos de execução fora de caminhos fonte precisam de autorização/localização própria; não escolher diretório adicional implicitamente.

### B5 — Alinhamento canónico e instruções; Engenheiro de Documentação e Configuração Matriz

**Editar**, após aprovação específica destes caminhos e do comportamento:
- `README.md` — limites atuais e orientação de utilização/estado de evidência.
- `docs/requirements.md` — RF-04/RF-16/RN-20 e delta das regras de UI/templates.
- `docs/constraints.md` — limite 6, email exato/compatibilidade e exclusões.
- `docs/user-stories.md` — critérios US-04/19/20, 5/6/200/201.
- `docs/architecture.md` — limite/validador/adição por email e estado transitório.
- `docs/database.md` — limite de entrada 6; confirmar ausência de schema novo.
- `docs/implementation-plan.md` — suplemento datado deste incremento, sem reescrever aprovações anteriores.
- `docs/verification.md` — acrescentar resultados reais/limitações do incremento; os 12–200 e assertions da execução anterior permanecem datados, não são falsificados para 6.
- `docs/test-plan.md` — cenários novos e rastreabilidade ao delta, sem declarar execução.
- `openapi.yaml` — somente delta definido em `contracts/delta.md`.
- `AGENTS.md` — instrução atual ainda diz 12; alteração pelo agente competente, não pelo Planeador.
- `.github/copilot-instructions.md` — instrução atual ainda diz 12 e estado T4 anterior.
- `.github/skills/contexto-matriz/SKILL.md` — contexto ainda diz 12/estado anterior; preservar governança e responsabilidade da skill.

**Criar/eliminar**: nenhum. **Leitura adicional**: saídas/evidências B1–B4, `.github/skills/contexto-matriz/SKILL.md`, `.github/copilot-instructions.md`, `docs/test-plan.md`. Sem reescrever arquivos V1/ADRs/históricos de outras fases, release/version bump ou configuração. Estes são todos os caminhos de instruções/canónicos encontrados diretamente afetados; os números 12 usados como passwords fictícias válidas não devem ser substituídos globalmente.

**Aceitação**: coerência com todos FR/SC, distinção autor/cliente e proposta/implementado/verificado, preservação da execução anterior de 17-11. Dependência B4 concluído ou bloqueio de validação registado explicitamente; não transformar bloqueio em sucesso.

### B6 — Revisão independente; Revisor Matriz

Só leitura de todos os caminhos B1–B5 e artefactos de planeamento/evidência autorizados. Confirmar critérios, diff/estado preservado, acessibilidade e limites da prova. Sem escrita/testes/serviços por omissão. Dependência B5; findings devolvidos ao autor competente, sem alargar paths.

### Gates intermédios de planeamento (não execução dos lotes)

1. Revisor Matriz revê **esta P1**, só leitura, antes de a considerar concluída.
2. Autor aprova caminho `specs/001-usabilidade-contas-tarefas/tasks.md` e apenas então Planeador usa `speckit-tasks`; os IDs futuros devem derivar destes lotes, sem criar plano concorrente. Este ficheiro não existe nesta entrega.
3. Após tasks, `speckit-analyze` só leitura/`SPECIFY_FEATURE_NO_PERSIST=1`, sem hooks/escritas; corrigir apenas numa fase separada autorizada.
4. Autor aprova plano/tasks, inventário incluindo as duas criações e instruções/canónicos, e **implementação/validação separadamente**. Se não aprovar os helpers ou qualquer caminho, rever desenho antes de implementar; não duplicar regras silenciosamente.
5. Execução B1→B2→B3→B4→B5→B6, sequencial, sem lote paralelo proposto: App/Tasks.test/contratos/estilos e ambiente partilham dependências. Orquestrador não implementa nem executa comandos. Um único escritor futuro de `tasks.md`: Engenheiro de Documentação e Configuração, se esse caminho for aprovado, com relatos serializados.

## Matriz de aceitação e verificação planeada

| Critério | Desenho/lote | Evidência futura exigida (não executada em P1) |
|---|---|---|
| FR-001 | D1/B1/B2 | API e App: 5/6/200/201, ASCII/astral/espaços; 6 e 200 aceites, sem trim/truncagem. |
| FR-002 | D1/B1/B2 | Ajuda exata; 422 servidor e validação local sem número máximo no resumo/campo/ajuda, erro de excesso explícito. |
| FR-003 | D1/B1/B2/B4 | Regressões CSRF/quota/PathPattern/scrypt/login curto e máximo 200, 201 só mensagem/sem autenticação/password. |
| FR-004 | D4/B3/B4 | Ícones à direita no painel, X standalone; guard, foco/Escape/inert e maximizar sem remount. |
| FR-005 | D3/B3 | Três conteúdos existentes em criação/edição, aplicação só manual, confirmação preservada. |
| FR-006 | D3/B3 | Aplicar→disabled/cinzento; apagar não reativa; cancelar não consome; TASK→BUG→TASK bloqueia TASK. |
| FR-007 | D3/B3/B4 | Conjunto preservado em save/erro/refetch limpo-sujo/recuperação/resize/painel→página; reinicia criação após sucesso ou fecho/reabertura. |
| FR-008 | D4/B3/B4 | Editar/Pré-visualizar e três vistas; pressed, teclado/foco/seleção, CSS computado e aparência sem botão; páginas/filtros iguais. |
| FR-009 | D4/B3/B4 | Guardar/Eliminar mesma linha em desktop/móvel; DELETE confirmado/cancelado, type/busy/versão sem regressão. |
| FR-010 | D5/B3/B4 | Seleção e anexos diretos/comentários, ordem/metadados/ícones/nome por ficheiro, canDelete e cancelamento/erros/busy. |
| FR-011 | D1/D2/B1/B2/B4 | Só gestor; email completo/Unicode/normalização, inexistente/inativa, sem diretório/pesquisa/convite. |
| FR-012 | D2/B1/B2/B4 | Repetição e concorrência email/email e email/userId: 204/uma PK, igual inelegibilidade, sem privilégios extra. |
| FR-013 | D2/B2/B4 | Nomes/funções/inatividade, sem ID/placeholder interno na UI; seed e options internas iguais. |
| FR-014 | D2/B1 | Clientes userId intactos; XOR de presença, ambos/nenhum/null/vazio recusados; adicionais 400. |
| FR-015 | D1–D5/B1–B4 | Permissões diretas 401/403/404/CSRF, autorização após espera, confirmações/feedback/rascunhos e sem retry de escrita. |
| SC-001 | B1/B2/B4 | Quatro fronteiras e variantes Unicode; ausência do máximo em todos os textos de registo, inclusive servidor. |
| SC-002 | B1/B2/B4 | Conta nova por email entra só no projeto autorizado; repetição/concorrência uma participação, sem gestão/herança alheia. |
| SC-003 | B3/B4 | Matriz dos três tipos em criação/edição, ciclos/cancelamento/save/refetch/layout/reabrir. |
| SC-004 | B3/B4 | Cinco seletores textuais, teclado/seleção, sem modo «Escrever» e sem chrome de botão. |
| SC-005 | B3/B4 | Geometria 1440×1000 e 390×844, adicional 320px de largura; direita/mesma linha/anexos, sem overflow/overlap, nomes longos. |
| SC-006 | B3/B4 | Nomes acessíveis de todos ícones, cada ficheiro distinto, cancelamentos conservam dados/rascunhos e foco. |

### Comandos e pré-requisitos para fase autorizada

Na raiz: `mvn -f backend\pom.xml test '-Dapi.version=1.44'` (Java 21/Maven e Docker/Testcontainers autorizados/disponíveis). Dentro de `frontend`: `npm test`, `npm run build` (dependências já presentes; não instalar por omissão). Depois, **apenas com alvo e uso expressamente autorizados**, `npm run test:e2e`; Vite/API/seed disponíveis ou `PLAYWRIGHT_BASE_URL` definido para Compose autorizado. Playwright não arranca serviços neste projeto. Detalhes e cenários em [quickstart.md](quickstart.md).

Evidência esperada: comando/ambiente/versão/resultados reais, reports, assertions de API/DOM, capturas e geometria/teclado desktop-móvel; Axe não prova auditoria integral. A execução posterior do registo em `docs/verification.md`, secção «Execução local autorizada do registo e revisão por leitura — 17-11-2026», relata 1 E2E e quatro análises Axe; **não foi reexecutada nesta fase nem valida o delta**. Não chamar essa execução de mero bloqueio T4 pendente; estados anteriores de T4 noutros documentos ficaram desatualizados. Serviços anteriormente reportados ativos não foram sondados nem têm nova autorização de uso/arranque.

## Registo efetivo desta P1 e riscos

- Skills seguidas por leitura do `SKILL.md` (sem mecanismo nativo de invocação disponível): `contexto-matriz`, `validacao-matriz`, `speckit-plan`. Investigação direta local; sem subagentes.
- `.specify/extensions.yml` ausente na listagem de `.specify`; sem hooks antes/depois. Sem atualização automática de contexto de agentes.
- Lidos `setup-plan.ps1`, `resolve-template.ps1` e ramos relevantes de `common.ps1` antes de execução. `common.ps1` suporta no-persist. Sem presets/extensions na pasta observada; resolver ativo não precisou do ramo de ficheiros temporários de composição de presets.
- Executados `git --no-optional-locks --no-pager status --short` e `branch --show-current`: início `?? specs/`, branch `main`. Não foi alterado Git/index/branch.
- Executados `resolve-template.ps1 plan-template -Json` e `setup-plan.ps1 -Json` com `SPECIFY_FEATURE_NO_PERSIST=1`: template oficial resolvido e copiado só para plan autorizado. Conteúdo preenchido pela estrutura do template. Sem setup-tasks/check-prerequisites/analyze/implement/converge.
- Conferência documental final: diretório contém spec/checklist anteriores e os cinco artefactos P1, sem tasks; feature.json relido com o mesmo caminho. Referências Markdown dos artefactos e matriz FR-001–015/SC-001–006 conferidas por leitura; schema OpenAPI confirmado como `RegistrationRequest`. Nova listagem `.specify` continua sem extensions.yml. `git status --short --untracked-files=all` lista apenas os sete ficheiros não rastreados desta feature; `git diff --stat`, `git diff --cached --stat` e `git diff --check` sem saída, branch `main`. Estes comandos confirmam ausência de alterações rastreadas/índice, mas **não validam o conteúdo dos Markdown não rastreados**; a revisão deles é documental, não lint automático nem prova por hashes dos ficheiros anteriores.
- Sem testes/builds/serviços/sondas/instalações/internet/PDF/PPT nesta fase. Leitura de documentos Markdown/código, não inspeção visual da aplicação.
- Riscos remanescentes: entrega cliente/servidor coordenada (regra 6); testes de lifecycle precisam provar ausência de remount; CSS móvel não demonstrável por leitura; transações/concorrência requerem PostgreSQL real de teste; aprovação específica de duas criações e de instruções/canónicos. Se surgir novo ficheiro, alteração de permissão/schema/deps ou requisito, parar.

## Complexity Tracking

Sem violações constitucionais ou nova infraestrutura. Dois helpers puros de email são a única criação futura de código proposta; sem catálogo/template engine ou abstração visual global.
