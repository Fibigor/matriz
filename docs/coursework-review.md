# Matriz — Rastreabilidade das fichas 01–05

## Estado, método e alcance

**Atualização vigente — 18-11-2026:** âmbito académico atual RF-01–17/US-01–20 e **30 operações** OpenAPI, incluindo registo aprovado em 17-11 e usabilidade de 18-11. Candidato `0.4.0-rc.1`, sem nova release/publicação. **T024 fechada, 28/28**, full E2E **11/11 PASS às 11:55–11:56 UTC**, revisão `review-t024-full-closure` PASS; B5/T028 PASS documentados. Visual humano aprovado às 09:42:49Z separadamente. Backend 58/frontend 141/build anteriores e seleção 74/build da correção de foco não foram reexecutados nesta revisão. [Estado e proveniência](verification.md#estado-vigente--18-11-2026).

O log remoto das 14:08 de 18-11 fornecido pelo autor reporta um HIGH picomatch e bloqueio antes dos E2E; a exceção CI temporária posterior está em [constraints](constraints.md#restrições-em-vigor--ficha-03-extensões-v4-e-registo-académico). Não é scan limpo. O relatório final preexistente relata CI SUCCESS às 18:46:03 UTC, mas o URL aponta para outro nome de repositório; proveniência não reconciliada nesta tarefa. [Ressalva e cobertura A/B/C](verification.md#documentacao-abc-20261118). A matriz pedagógica e os inventários abaixo preservam a análise de 17-11; as execuções de 12/13-11 não se tornam atuais. Não houve nova leitura dos PDFs/anexos neste lote.

**Suplemento documental A/B/C — aprovação de 18-11 às 21:06 UTC:** A já integrado,
com exceção HIGH exata vigente, não remediado; B acrescenta logs JSON ECS nativos
Boot apenas em `observability`, com **6 testes PASS às 21:09:28Z relatados pelo
engenheiro**, após duas tentativas falhadas. Não são execução documental nem
soma aos 58 anteriores. C está **CONFIGURADO e validado localmente por relato**,
sem build/publicação GHCR comprovados. Revisão independente B/C e desta edição
pendente; gates anteriores não a substituem.

**17-11-2026 — revisão documental autorizada T1 → T2**, sem mudança funcional, dependência, configuração, versão ou publicação. HEAD observado `778ffd1ff8cfa366b444edbb0cc21bcc9f9b28d2`; não é o SHA das execuções de 12/13-11. Mantém-se `0.4.0-rc.1`. Aprovações do autor para implementação/documentação não equivalem a aceitação pelo cliente ou revisão humana independente.

**Consolidação posterior no mesmo dia:** por preferência do utilizador, o conteúdo atual antes separado como V2 foi integrado em `docs/architecture.md`, `docs/database.md` e `docs/ui/wireframe.svg`, removendo a cópia separada. As ligações abaixo apontam agora para esses canónicos completos; arquivo V1, datas e evidência histórica mantidos.

Esta matriz reutiliza **a análise anterior fornecida no handover**: extração textual local dos **16 PDFs (712 páginas) e 28 anexos (27 TXT + 1 YAML)**. Nesta tarefa foram confirmados nomes/existência apenas por inventário da raiz pedagógica e das pastas 06/09/13, e confrontados documentos, código e workflow atuais do repositório. Não se apresenta nova leitura integral dos PDFs, auditoria exaustiva ou inspeção visual. Os anexos são exemplos pedagógicos, não decisões do cliente.

Evidência de testes/scans é a registada em [verification](verification.md); os logs externos aí referenciados **não foram reabertos, copiados ou certificados** nesta tarefa. Nenhum teste/build/scan/workflow/serviço foi executado para esta edição documental. Verificações estáticas do arquivo, links, formatos e preservação não substituem teste funcional, revisão independente ou aceitação.

### Como ler a matriz

- **Artefacto/código presente:** observável no repositório, não prova de execução.
- **Resultado documentado:** relato datado existente; não reexecutado nesta tarefa.
- **Pendente:** falta evidência ou decisão; documentação não a resolve.
- **Complementar/opcional:** não classificado como lacuna obrigatória.

Os títulos dos exercícios/etapas abaixo são sínteses temáticas, não transcrições dos enunciados nem numeração inventada. Páginas referem-se à análise textual anterior; IDs P01–P16 e A01–A28 remetem para o inventário exato no fim.

## Matriz — fichas e entregas

### Ficha 01 — especificação e Human-in-the-Loop

Fonte: **P03**, pp. 2–6; desafio complementar p. 7.

| Exercício/etapa e página | Artefactos rastreáveis | Testes/evidência documentada | Pendente / conclusão factual |
|---|---|---|---|
| Comparar prompt simples/estruturado, p. 2 | [requirements](requirements.md), histórico da ficha 01; [constraints](constraints.md), comparação e triagem | Relato do autor de comparação em conversas distintas no Gemini Pro; conclusões documentadas, sem chats completos. | Não inferir respostas brutas, repetibilidade ou aprovação do cliente a partir do resumo. |
| Requisitos/MVP, pressupostos e prioridades, pp. 2–4 | RF/RNF/RN e âmbito no histórico de requirements; factos F-01–04, Q/P e perguntas em constraints | Separação de pedido do cliente, proposta autorizada e regras assumidas. | Âmbito atual inclui aprovações do autor de 13/17/18-11; retenção/p95/produção não se tornam decisões por repetição textual. |
| ≥5 US, critérios de aceitação para ≥3 User Stories e ≥3 casos excecionais, pp. 3–4 | [user-stories](user-stories.md): nove histórias iniciais preservadas, critérios/exceções; backlog atual US-01–20 separado | Critérios Given/When/Then são especificação; [test-plan](test-plan.md) e verification ligam a implementação posterior. | Não tratar critérios como testes já passados nem aplicar responsável único histórico ao atual. |
| Cinco documentos incluindo AGENTS, pp. 4–5 | README, AGENTS, requirements, user-stories, constraints | Specification Pack referido no histórico como `c13da97`; artefactos presentes. | Não alterados por esta revisão, salvo navegação/estado no README. |
| Revisão crítica, triagem e entrega, pp. 5–6 | Histórico de constraints e requirements; exemplos de uso de IA em verification | Auto-revisão da IA e triagem do autor explicitamente distinguidas de revisão independente. | Validação pelo cliente não demonstrada. Versionamento manual histórico não autoriza novo commit pelo agente. |
| Prompt injection, p. 7 — complementar | Desafio e limites em constraints/AGENTS | Discussão pedagógica e regras persistentes. | Não é vulnerabilidade real provada nem exige executar ataque/instalar ferramenta. |

### Ficha 02 — Architecture Pack

Fonte: **P06**, pp. 1–3.

| Exercício/etapa e página | Artefactos rastreáveis | Testes/evidência documentada | Pendente / conclusão factual |
|---|---|---|---|
| Comparar monólito simples/modular/microserviços, p. 1 | [Entrada de arquitetura / DEC-01](architecture.md#comparação-de-alternativas-e-dec-01), [arquivo V1](architecture/v1/architecture.md#2-comparação-de-alternativas), [ADR-0001](adr/0001-modular-monolith-and-stack.md) | Comparação, escolha do autor e consequências preservadas; implementação atual monólito modular. | Não atribuir stack/produção ao pedido original nem inventar razões de escala. |
| Modelo lógico/ER, p. 2 | [Modelo atual completo](database.md), [arquivo misto V1](architecture/v1/database.md), migrations V1–V4 | ER histórico com quatro entidades preservado; ER atual com nove tabelas confrontado com SQL. | Mermaid conferido como texto, sem afirmar renderização ou validação de desempenho. |
| OpenAPI com ≥2 operações, p. 2 | [openapi.yaml](../openapi.yaml) canónico; relato de duas operações no arquivo | Contrato atual contém V4/registo e 30 operações; 29 era a contagem de 13-11. Verificações estruturais anteriores em verification. | Não existe cópia congelada do OpenAPI da ficha 02 nesta tarefa. Link histórico aponta para contrato atual; parsing YAML/refs não é validação integral OpenAPI/JSON Schema. |
| Wireframe, p. 2 | [UI](ui/README.md), [SVG histórico](architecture/v1/ui/wireframe.svg)/[PNG](architecture/v1/ui/wireframe.png), [SVG atual](ui/wireframe.svg) | Transferência preserva bytes históricos; desenho atual representa filtros, prioridade, múltiplos responsáveis e detalhe atual. | V1 dos MD arquiva o conteúdo completo encontrado, que já misturava 13-11/ficha 02; **não falsifica baseline pura**. Desenho atual não é screenshot/prova de acessibilidade. |
| Revisão e entrega, pp. 2–3 | Secções críticas do arquivo, [ADRs](adr/README.md), [índice de versões/hashes](architecture/README.md) | Triagem histórica aceite pelo autor; Architecture Pack referido como `d1edc51` nos documentos. | Revisão integral/cliente não presumidos. V3 futura não criada; ficheiros preparados na worktree, sem commit nesta tarefa. |

### Ficha 03 — implementação Fullstack

Fonte: **P08**, pp. 1–7; âmbito do autor e regras em vigor prevalecem sobre exemplos A09–A22.

| Exercício/etapa e página | Artefactos rastreáveis | Testes/evidência documentada | Pendente / conclusão factual |
|---|---|---|---|
| Âmbito: auth/CRUD/prioridade/múltiplos responsáveis/comentários/pesquisa/filtros/painel, p. 1 | Requirements RF-01–11, US-01–11, [implementation-plan](implementation-plan.md); módulos Java e frontend | Código e contrato presentes; resultados originais 29-10 documentados em verification. | Aprovação do autor em 29-10, não do cliente; limites aprovados 1–120/1–200/2 000, não os dos exemplos. |
| Conciliar diferenças e planear incrementos, p. 2 | Plano, constraints e secções atuais/históricas dos requisitos | Responsável único/API parcial/exclusões iniciais explicitamente substituídos; plano incremental registado. | Não apagar divergências históricas para simular coerência desde a origem. |
| Persistência e seed, p. 2 | [Migrations](../backend/src/main/resources/db/migration/), DemoSeed, JDBC, Compose/volume | Integração Testcontainers e persistência após reinício/recriação relatadas em verification. | Seed opt-in sem reset; prova de volume não é backup/restore ou policy de retenção. |
| Autenticação/autorização e CRUD projetos/reinício, p. 3 | identity, projects, [ApiIntegrationTest](../backend/src/test/java/pt/matriz/ApiIntegrationTest.java) | Métodos `authenticationCsrfAndLogoutAreEnforced`, `deniesForeignIdentifiersAndManagerOperationsToMembers`; resultados datados em verification. | Sessões não sobrevivem a reinício; não inferir SSO/registo/recuperação. Presença de teste ≠ execução nesta tarefa. |
| Tarefas, atribuições e comentários, p. 4 | tasks, DTOs/API; testes `assignmentsCommentsVersionsRevocationAndCascadeWorkTogether` e `validatesLimitsAndSupportsSearchPriorityAndMemberTaskCrud` | Cenários de versões, revogação, cascatas e validação no código; evidência local guardada relatada. | Só gestor gere atribuições/membros; participantes gerem tarefas/comentam. Não promover permissões dos anexos a decisões. |
| Cinco vistas/integração real/estados/rascunhos/prevenção de duplicados/agregados, p. 5 | App/Layout/Projects/Tasks/TaskDetail, api/ui; [E2E](../frontend/e2e/matriz.spec.ts), testes frontend | Fluxo integrado, navegação móvel/teclado e auditorias axe em testes existentes; contagens globais no código. | Lista filtrada/página não é total do projeto; refetch externo não avança base suja. Wireframe não comprova comportamento/renderização. |
| Nove cenários + ≥3 testes de validação/autorização/persistência, p. 6 | Mapeamento de nove cenários preservado em [verification](verification.md), [test-plan](test-plan.md), InputsTest/ApiIntegrationTest | Ficha 03 original: 7 Java/7 componentes/2 E2E; iteração visual: 13 componentes e 3 percursos repetidos — resultados documentados de fases distintas. | Não somar repetições ou contagens de datas distintas; 41/43/6 é o relatório histórico de 13-11. Estado vigente no resumo acima. |
| Revisão/refatoração se benefício, documentação e ≥3 exemplos IA (incl. rejeitada se ocorreu), versão Git, p. 7 | Exemplos/decisões em verification, requirements/constraints; commits históricos `e73250d`/`f780a29` documentados | Bug/causa/regressão e rejeições são relatos concretos quando disponíveis; sem exigir refactor cosmético. | Não fabricar rejeição, execução ou commit. Revisão independente/humana das extensões continua pendente. |
| Extensões autorais posteriores — fora da baseline inicial | RF-12–16/RN-13–19/US-12–19, V4, [arquitetura atual](architecture.md), contrato e testes novos | Verification regista 41 backend/43 frontend/6 E2E, migração populada, grafo/locks/revogação/ficheiros/histórico/rascunhos em 13-11. | São extensões aprovadas pelo autor, não exigências retroativas do cliente/ficha 02 nem novas execuções nesta tarefa. |

### Ficha 04 — QA, revisão e segurança

Fonte: **P11**, pp. 1–3; contexto P09/P10 e A23–A28.

| Exercício/etapa e página | Artefactos rastreáveis | Testes/evidência documentada | Pendente / conclusão factual |
|---|---|---|---|
| Plano e unitário válido/inválido/limite, p. 1 | [test-plan](test-plan.md), [InputsTest](../backend/src/test/java/pt/matriz/InputsTest.java) | Título válido/trim, vazio, 200/201 pontos de código e progresso; relatório histórico 05-11. | Sem reexecução. Não confundir cobertura medida com ausência de defeitos. |
| Integração criar/consultar + negativo, BD real isolada, p. 2 | ApiIntegrationTest, Testcontainers PostgreSQL | `createsAndReadsPersistedTaskAndRejectsInvalidInput`, `taskCreationPersistsAndNonParticipantsCannotReadUpdateOrDeleteIt`; evidência histórica 05-11. | Bases reais de utilizadores não usadas; isolamento e dados fictícios documentados não certificam todos os endpoints. |
| E2E login/abrir/criar/listar e isolar test data, p. 2 | Cenário “Ficha 04” em matriz.spec.ts | Relatório histórico: 5/5 E2E na suite dessa data, projeto isolado e volume preservado. | Suite atual tem cenário adicional; relatório de 05-11 não se atualiza retroativamente para 6. |
| Code Review do diff, p. 3 | [quality-security-review](quality-security-review.md) | Revisão 05-11 sobre `70e0eca`, sem finding confirmado; âmbito e limites explícitos. | **Histórica**, não revisão independente de Boot 4/V4. Nota de ligação atual não é nova revisão. |
| Security Review/2 contas IDOR/análise estática existente/regressão/revisão humana, p. 3 | Relatório, integração com Ana/Carla, Semgrep, [ADR-0005](adr/0005-semgrep-static-analysis.md) | 404 GET/PUT/DELETE e recurso intacto documentados; 135 regras/29 alvos/0 findings na fase histórica. | Desafio IDOR pedagógico não prova vulnerabilidade real. Sem pentest ou certificação; 47 alvos de 13-11 é outro resultado documentado. |
| Relatório e versão, p. 3 | quality-security-review/verification; workflow presente | Run **42084239819**, commit **71d9fd7**, sucesso registado na ficha 04. | Prova remota **pré-extensões**, não pipeline atual; nova prova e revisão independente/humana pendentes. |

### Ficha 05 — entrega, CI e documentação

Fonte: **P13**, pp. 1–6. Desafios opcionais separados dos requisitos base.

| Exercício/etapa e página | Artefactos rastreáveis | Testes/evidência documentada | Pendente / conclusão factual |
|---|---|---|---|
| Análise e plano de entrega, p. 1 | README, plano, verification, release notes e constraints | Baseline 12-11 e incremento 13-11 distinguidos; decisões/limites registados. | Não declarar ficha integralmente concluída só por documentos presentes. |
| Docker/Compose/config/volume/healthchecks, p. 2 | [Dockerfile](../Dockerfile), [Compose](../compose.yaml), override observability | Build multi-stage estáticos+API no mesmo JAR; DB/volume; health `/` base; readiness opt-in; resultados locais T6/13-11 documentados. | Health `/` não comprova DB; liveness ≠ readiness. Nenhum serviço iniciado nesta tarefa. |
| Acesso/comunicação/persistência/recriação/logs, p. 3 | README/verification, configuração e serviços | Relatos de recriação app/db no mesmo volume, SQL/HTTP/bytehashes e outage/recovery em 13-11. | Não é backup/restore, capacidade ou inspeção atual de contentores. Não abrir logs externos sob pretexto de portabilidade. |
| CI push/PR, permissões mínimas, testes antes de Docker, p. 3 | [.github/workflows/ci.yml](../.github/workflows/ci.yml) | `contents: read`; jobs Semgrep/backend/frontend antes do job integrado; build único e gates antes de E2E na mesma imagem. | Configuração estática ≠ execução remota; preservar workflow. Nenhuma ação remota autorizada. |
| Prova Actions e falha controlada, p. 3 | Run histórico ficha 04; fixtures locais do gate descritas em verification; relato remoto preexistente no relatório final | Fixtures clean/HIGH/CRITICAL/erro/cobertura são resultados locais documentados. Relato SUCCESS de 18:46:03 UTC tem ressalva de repositório/proveniência na nota A/B/C. | **Pendente** reconciliar prova positiva para este repositório/commit final, falha controlada e artefactos/upload em falha/retenção reais. Fixtures/lint não substituem prova remota. |
| README/arquitetura Mermaid/OpenAPI/changelog/candidato SemVer, p. 4 | Canónicos completos de arquitetura/dados/UI, OpenAPI, CHANGELOG, RELEASE_NOTES, ADRs | Candidato `0.4.0-rc.1`; suplementos 13-11 sem apagar baseline 12-11; versões/hashes de arquivo em 17-11. | Sem bump/tag; OpenAPI integral e renderização Mermaid não certificados. Produção/release final não exigidas para declarar os artefactos existentes. |
| Validação final e revisão, p. 5 | [Final local documentado](verification.md#validação-final-local-das-extensões--execução-de-13-11-2026) | 41/43/6; Trivy 294 npm/63 JAR, 0 HIGH/CRITICAL; Semgrep 135/47/0; actionlint 1.7.7 PASS; migração/persistência/readiness relatadas. | São resultados documentados, não executados nem certificados por esta escrita; revisão independente/humana/cliente pendente. |
| Relatório breve: alterações/testes/CI/problemas/IA/limites, p. 6 | Verification, release notes, plano e esta matriz | Relatos separam falhas de harness, correções, fontes e limitações; uso de IA e decisão do autor identificados. | Arquivo portável/sanitizado das evidências externas exige decisão própria; não fabricar novos reports. |
| Desafios opcionais A/B/C: scan dependências/observabilidade/GHCR | CI/Trivy, perfil observability/teste e [release.yml](../.github/workflows/release.yml) existentes | Cobertura e limites separados abaixo. | C configurado não é publicação demonstrada; executar remotamente exige aprovação própria. Desafios continuam opcionais, não lacunas obrigatórias nem autorização de deploy. |

### Cobertura dos desafios opcionais A/B/C — 18-11-2026

| Desafio | Implementação observável / evidência relatada | Limites e estado |
|---|---|---|
| **A — scan de dependências** | Trivy já integrado no CI; política da exceção exata picomatch/HIGH preservada. | Implementado, **risco aceite não remediado**, não scan limpo. Exceção só frontend npm `picomatch@4.0.7`/`CVE-2026-112366`, todas as ocorrências dev, sem fix, até `2026-11-25T00:00:00Z` exclusivo; outros findings/erros/cobertura bloqueiam. Nenhum scan novo nesta revisão. |
| **B — observabilidade e logs JSON** | Consola ECS nativa Boot só no perfil local opt-in. Teste captura evento real com aspas/quebra de linha e valida timestamp/nível/logger/mensagem parseados; contexto default secundário não reconfigura logging global. Engenheiro: Maven selecionado, **6 testes**, zero falhas/erros/skips, exit 0/BUILD SUCCESS às **21:09:28Z**; diff-check PASS. | Implementado/validado localmente por relato, após duas tentativas falhadas de desenvolvimento. Não somar aos 58 nem alegar default isolado validado. Health/CSRF/sessão/autorização preservados; bloqueio do JDBC health indicator, **não paragem real da DB**. Sem dados sensíveis nos exemplos/logging. |
| **C — imagem GHCR de prerelease** | Release published só prerelease não draft; commit exato; exige último CI push desse commit e quatro jobs existentes SUCCESS. Imagem owner/repo lowercase, tag `test-<release-id>-sha-<commit>`, sem latest; `packages: write` só em `publish`, login com GITHUB_TOKEN e summary digest/commit. | **CONFIGURADO / validado localmente por relato**, não desafio comprovado por publicação. Python YAML/AST/estrutura/permissões/41 casos PASS; bash -n dois blocos, cinco casos digest e UTF-8/whitespace PASS relatados. actionlint/shellcheck indisponíveis. Sem build release/login/rede/CI remoto/release/push/publicação. |

No C, API CI pública sem token: privado/rate limit/erro bloqueiam. CI anterior do
mesmo commit **não prova scan da imagem reconstruída nem igualdade do digest**.
Criar prerelease publicada aciona push GHCR e requer aprovação separada; push/CI
prévio pode ter efeitos Render. Nenhuma revisão independente B/C ou aceitação
do cliente é declarada. [Fontes e resultados](verification.md#documentacao-abc-20261118);
[procedimento operacional](development.md#prerelease-de-teste-ghcr).

## Aulas complementares e interpretação

| Fonte/páginas da análise anterior | Aplicação factual à revisão |
|---|---|
| P02 pp. 41–52, 64–74 | Prompting/contexto, limites dos agentes e Human-in-the-Loop. Ferramenta não aprova o âmbito pelo utilizador. |
| P04 pp. 57–96, 98–114, 132–148, 157–160 | Fronteiras/ownership/ADRs, modelo/migrations, contratos e UI/acessibilidade. T1 separa arquivo e atual, não inventa isolamento de processos nem conformidade. |
| P05 pp. 4–15 | Contexto/alternativas/decisão/consequências e numeração ADR; caminhos existentes mantidos. Exemplos de GitHub Pages não impõem publicação. |
| P07 pp. 4–19, 20–29, 30–35 | Incrementos verticais/estados/testes, bugs com causa/evidência/regressão, refactor só com benefício e limites dos agentes. |
| P09 pp. 35–56, 69–93 | SQA/rastreabilidade/baseline revista e aprovada/plano de testes. Arquivo misto não é baseline pura reconstruída. |
| P10 pp. 3–33, 34–48, 49–51 | Limites da cobertura/revisão, autorização/segredos/agentes e desafio IDOR pedagógico. Não há vulnerabilidade real provada pelo exemplo. |
| P12 pp. 91–109, 111–140, 142–161, 174–196, 198–209, 212–219 | Gates/falhas, docs/ADRs/contratos, compatibilidade/release, observabilidade e rollback. Sintaxe não é validação OpenAPI integral; liveness não é readiness; rollback imagem não reverte schema. Não impõem microserviços/JWT/p95/monitorização externa. |
| P14 pp. 1–3 | Apresentação ≤5 min, 1–2 fluxos, stack/metodologia IA/desafio, aplicação pronta, URL GitHub/acesso formador/sem segredos. [Guião existente](presentation-script.md) alinhado documentalmente, **não editado**; slides não obrigatórios. Demonstração/acesso/tempo reais por confirmar pelo autor. |
| P15 pp. 1–2 | Recomenda ferramentas gratuitas e atenção a custos/permissões/revisão; não exige instalação ou ampliação de permissões. |
| P16 p. 1 | Deployment gratuito recomendado “se possível”, não requisito de produção nem autorização para mudar stack/fornecedor, instalar ou migrar. |

Exemplos A01–A28 apoiam prompts de desenho, implementação, estados, bugs/refactor e QA. Não sobrepõem limites/permissões aprovados, não criam requisitos de autenticação distintos e não servem como prova de implementação. A01 foi reportado vazio na análise textual anterior.

## Pendências e decisões humanas

| Prioridade/tema | Estado e próximo responsável |
|---|---|
| CI atual positiva/negativa | Reconciliar a proveniência do SUCCESS preexistente para este repositório e commit final; falha controlada e artefactos em falha/retenção reais não demonstrados. Autor decide execução autorizada; `checksPass` do Render pode disparar deploy, portanto sem ações remotas nesta tarefa. |
| GHCR C | Configuração/validação local relatada não é publicação. Aprovar separadamente prerelease publicada, push GHCR e efeitos remotos; recolher run/digest/commit reais se executado, sem presumir scan/igualdade da imagem reconstruída. |
| Revisão/aceitação | Revisões B5/T028 e `review-t024-full-closure` PASS documentadas para o delta; aprovação visual humana de 09:42:49Z separada. Cliente ainda não validou âmbito/regras. Revisão própria D1/D2 e desta edição A/B/C não demonstrada; revisão independente B/C pendente. Não estender gates anteriores a toda a entrega ou chamar auto-verificação de revisão independente. |
| Evidência portável | Relatórios anteriores apontam para pasta de sessão externa. Autor decide seleção, sanitização, autorização e entrega; não se copiam logs nem se inventam manifests novos aqui. |
| Capacidade/recuperação/retention | BYTEA e história fazem crescer DB/backups. Definir capacidade, backups/restore, âmbito/evento inicial/policy e base legal antes de dados reais. Um ano é pressuposto; expiração da infraestrutura não é retenção da aplicação. Sem purga automática. |
| p95/produção/manutenção | Definir alvo/carga e condições operacionais; produção diferida. Confirmar suporte da stack e estado dos serviços antes de operação prolongada, não inferi-los de documentos históricos. |
| Formatos/visuais | Inspeção humana dos PDFs/imagens não substituída pela extração textual; renderização Mermaid/inspeção do SVG e validação integral OpenAPI continuam não demonstradas nesta tarefa. |
| Versionamento/apresentação | Ficheiros preparados não são commit/release. Autor decide versionamento, acesso do formador e ensaio ≤5 min sem segredos/dados reais. |

## Inventário dos 16 PDFs

Nomes confirmados por listagem local em 17-11; paginação/alcance provenientes da análise textual anterior. Não são links para ficheiros portáveis no repositório.

| ID | Nome exato | Páginas |
|---|---|---:|
| P01 | `01 - Introdução.pdf` | 9 |
| P02 | `02 - Mindset Engenharia IA.pdf` | 76 |
| P03 | `03 - Ficha Prática 01.pdf` | 7 |
| P04 | `04 - Arquiteturas e Prototipagem.pdf` | 161 |
| P05 | `05 - ADRs.pdf` | 36 |
| P06 | `07 - Ficha Prática 02.pdf` | 3 |
| P07 | `08 - Desenvolvimento Fullstack.pdf` | 35 |
| P08 | `10 - Ficha Prática 03.pdf` | 7 |
| P09 | `11 - Introdução Quality Assurance.pdf` | 93 |
| P10 | `12 - Quality Assurance AI.pdf` | 51 |
| P11 | `14 - Ficha Prática 04.pdf` | 3 |
| P12 | `15 - Devops e Documentação.pdf` | 219 |
| P13 | `16 - Ficha Prática 05.pdf` | 6 |
| P14 | `17 - Apresentações Finais.pdf` | 3 |
| P15 | `Turma_B_ AI Coding Agents _ Platforms - Free _ Moodle ESMAD.pdf` | 2 |
| P16 | `Turma_B_ Deployment do Projeto Matriz — Plataformas Gratuitas _ Moodle ESMAD.pdf` | 1 |
| **Total** | **16 PDFs** | **712** |

## Inventário dos 28 anexos

### 06 - Anexos — 8 ficheiros

| ID | Nome exato | Uso pedagógico / limite |
|---|---|---|
| A01 | `ExemploOpenAPI.txt` | Reportado vazio na análise anterior; não contém contrato utilizável. |
| A02 | `matriz-openapi.yaml` | Exemplo de contrato, não substitui o OpenAPI canónico aprovado. |
| A03 | `PromptGerarERD.txt` | Prompt ER, não evidência de schema implementado. |
| A04 | `PromptGerarOpenAPI.txt` | Prompt de contrato, não decisão de endpoints. |
| A05 | `PromptModelacaoDados.txt` | Modelação proposta, não regras do cliente. |
| A06 | `PromptWireframes.txt` | Prototipagem, não prova de acessibilidade. |
| A07 | `ResultadoGerarERD.txt` | Resultado exemplificativo, não ER aprovado da Matriz. |
| A08 | `ResultadoModelacaoDados.txt` | Resultado exemplificativo, não schema de referência. |

### 09 - Anexos — 14 ficheiros

| ID | Nome exato | Uso pedagógico / limite |
|---|---|---|
| A09 | `01 - PromptExploracaoProjeto.txt` | Explorar fontes antes de alterar. |
| A10 | `02 - PromptPlaneamentoAlteracoes.txt` | Planear sem promover propostas a aprovações. |
| A11 | `03 - PromptImplementacaoBackend.txt` | Implementação backend incremental, limites dos exemplos não prevalecem. |
| A12 | `04 - PromptValidacaoBackend.txt` | Validar backend, não relato de teste executado. |
| A13 | `05 - PromptImplementacaoFrontend.txt` | Integração frontend, não novo produto. |
| A14 | `06 - PromptEstadosInterface.txt` | Loading/vazio/erro/sucesso. |
| A15 | `07 - PromptDescricaoBug.txt` | Descrever bug com evidência, não inventar defeito. |
| A16 | `08 - PromptInvestigarBug.txt` | Causa antes de correção. |
| A17 | `09 - PromptCorrecaoRegressao.txt` | Correção mínima e regressão. |
| A18 | `10 - PromptRefatoracaoControlada.txt` | Refactor condicionado a benefício. |
| A19 | `11 - PromptCompreenderLegado.txt` | Compreender código, não reescrever sem autorização. |
| A20 | `12 - IssueParaAgente.txt` | Contexto/limites de delegação, não ordem de execução. |
| A21 | `13 - PromptApoioRevisao.txt` | Apoio não é revisão independente humana. |
| A22 | `14 - PromptReportAgente.txt` | Relatar resultados/limitações reais. |

### 13 - Anexos — 6 ficheiros

| ID | Nome exato | Uso pedagógico / limite |
|---|---|---|
| A23 | `PromptCodeReview.txt` | Revisão do incremento/diff com findings demonstráveis. |
| A24 | `PromptIntegrationTesting.txt` | Integração com persistência/isolamento. |
| A25 | `PromptSecurityChallenge.txt` | Desafio pedagógico, não vulnerabilidade real provada. |
| A26 | `PromptSecurityReview.txt` | Revisão de segurança com evidência e limites. |
| A27 | `PromptTestesE2E.txt` | Percurso real e dados isolados. |
| A28 | `PromptUnitTesting.txt` | Válido/inválido/limite, sem métricas inventadas. |

Total: **27 TXT + 1 YAML**, todos os nomes inventariados; não são ficheiros adicionados ao repositório nesta revisão.

## Limitações da extração textual

Análise anterior cobriu o texto extraído, **não elementos visuais** dos 16 PDFs. Em particular:

- P02: páginas 4, 20, 28, 33, 34, 40 e 63 sem texto extraído.
- P04: páginas 1, 40, 63, 100, 105–109, 141–146, 151 e 153–156 só com autor/número.
- P09: páginas 1, 6, 9, 23, 30 e 81 só com autor/número.
- P10 e P12: página 1 só com autor/número.

Outras imagens/diagramas também **não foram inspecionados**; ausência de texto não significa página vazia. A matriz não afirma equivalência visual entre protótipos e aplicação. Inventário/extracção não são auditoria exaustiva do projeto, teste de segurança, revisão independente ou validação do cliente.

## Entrega ao revisor

Ver [estado vigente](verification.md#estado-vigente--18-11-2026), [cobertura A/B/C](verification.md#documentacao-abc-20261118), [verification — T1/T2 histórico](verification.md#revisão-documental-t1-e-t2--17-11-2026) e [proveniência do arquivo](architecture/README.md). Na revisão D1/D2 e desta edição documental A/B/C, verificar âmbito autorizado, migração dos detalhes operacionais do README para development, preservação do índice, links/âncoras/imagens, fidelidade código↔documentação e distinção histórico/atual. Não foi feita revisão independente pelo próprio agente que escreveu os documentos.
