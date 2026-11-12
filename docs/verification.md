# Matriz — Verificação atual e histórico

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
