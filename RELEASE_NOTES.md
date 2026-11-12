# Matriz — Release notes 0.4.0-rc.1

**2026-11-12 — release candidate académico, não publicado. T6 LOCAL passou; critérios remotos e revisão humana final PENDENTES.** HEAD de referência `46694e535333c15769ac14a70d1d3b61010b8216`; alterações do candidato não committed, sem SHA Git final.

Esta ficha 05 prepara documentação e versões após migração autorizada. Não é certificação de produção, segurança, conformidade, desempenho ou aceitação pelo cliente. [Changelog](CHANGELOG.md) e [verificação](docs/verification.md#ficha-05--candidato-040-rc1) distinguem trabalho atual, evidência anterior e histórico.

## Baseline e compatibilidade

| Componente | Versão/decisão atual |
|---|---|
| Aplicação backend/frontend/OpenAPI | `0.4.0-rc.1`; frontend privado, sem publicação/tag |
| Runtime | Java 21, Spring Boot 4.0.9 |
| Spring | Framework 7.0.10, Security 7.0.8 |
| JSON MVC | Jackson 3 core/databind 3.1.7, `JsonMapper` autoconfigurado |
| Persistência | JDBC PostgreSQL 42.7.14, PostgreSQL 17, Flyway 11.14.1 |
| Bibliotecas/testes | Bouncy Castle 1.85, Micrometer 1.16.8, Tomcat 11.0.27, Testcontainers 2.0.5 (test scope) |
| Frontend/build Docker | React/TypeScript/Vite, Node 22, Maven 3.9 / Java 21 |

Migração major de Boot 3.5/Framework 6 para Boot 4/Framework 7 **aprovada separadamente**; não misturar Framework 7 com a antiga baseline Boot 3.5. Starters MVC/MVC-test/Flyway e imports de testes acompanham a modularização oficial.

`spring.jackson.use-jackson2-defaults=true` preserva defaults de JSON/datas/coerção Boot 3 **em Jackson 3**; mantém-se `fail-on-unknown-properties=true`. Não há módulo MVC de compatibilidade Jackson 2 nem mapper paralelo. Jackson 2 core/databind 2.21.7 continua no JAR por dependência interna Flyway; annotations `com.fasterxml.jackson` 2.21, conforme BOM. Regressões conferiram formato estrito, Unicode/limites, instantes ISO, Problem Details `about:blank`/extensões/UTF-8 e transporte IOException.

Fontes oficiais arquivadas na sessão: [BOM Boot 4.0.9](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.0.9/spring-boot-dependencies-4.0.9.pom), [guia de migração Boot 4](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide) e Javadocs/source JARs; versões corroboradas pelo Maven/JAR entregue, não apenas exemplos documentais.

## Migração de dados e operação local

Não há migration SQL nova, alteração de schema ou procedimento de conversão de dados nesta baseline: Flyway continua com **V1–V3**. Mantêm-se JDBC/transações, RF-01–11/RN atuais, sessão/scrypt/CSRF e seed fictício opt-in sem redefinir dados/credenciais existentes. T6 confirmou persistência e seed idempotente na nova stack fictícia isolada, não migração de qualquer base externa.

Guardar os volumes e o `.env` existentes; não os remover/substituir para atualizar a versão. Arranque/paragem/retoma seguros e comandos reais em [README.md](README.md#executar-localmente). `stop`/`start` mantêm configuração e imagem já criadas; mudanças de imagem/perfil requerem recriação autorizada, sem apagar volume. Sem operação sobre contas, clusters ou serviços reais nesta tarefa.

Actuator está **desligado por omissão**, opt-in exclusivamente local com `observability`, na mesma porta da aplicação e sem serviço adicional:

- `/actuator/health`: GET anónimo, `status` + nomes dos grupos, sem detalhes/componentes/sessão.
- `/actuator/health/liveness`: só `status`, `livenessState`, sem DB.
- `/actuator/health/readiness`: só `status`, `readinessState,db`; UP 200, DOWN 503.
- `/actuator/metrics` e leituras `jvm.*`/`http.server.requests`: sessão autenticada local existente. Outras famílias e endpoints sensíveis recusados; sem `/livez`/`/readyz`.

Sem monitoring externo, tracing ou logs de corpos/cookies/tokens. As rotas operacionais não são endpoints `/api`; o OpenAPI de negócio só mudou em `info.version`. Compose base usa health HTTP `/`; override usa readiness DB. T6 usou projeto novo **`matriz-ficha05-final`**, portas livres **18085/55435**, publicadas só em loopback. App/db próprios parados no fim; volume **`matriz-ficha05-final_matriz_data`** e fixture preservados. Projeto anterior e `sep-local-control-plane` não foram alterados. Não ativar perfil no Render/hosts públicos.

## Qualidade e segurança — evidência limitada

Em 12-11-2026, antes do alinhamento T5: 19 testes Maven passaram; imagem fresca Boot 4 compilou frontend/JAR; scan Trivy 0.76.2 com digest fixo encontrou **0 HIGH/CRITICAL**, **216/216 pares npm com dev** e **63/63 JARs internos** (64 pacotes Java incluindo aplicação). Remediação anterior **38→2→0**, sem ignores/exceções; as correções foram de bibliotecas entregues, não supressões ou downgrade de severidade.

CI definida: Semgrep/testes backend/testes-build frontend antes do build integrado; gate npm/JAR antes de E2E na mesma imagem. HIGH/CRITICAL bloqueiam mesmo sem fix; scanner/DB/coverage em erro também falham. Só bibliotecas, não SO/segredos/licenças/exploitability. Downloads de DB públicos não são upload de código; scanner local, sem telemetry ou consultas remotas de dependências. Relatórios/diagnósticos sanitizados têm retenção **configurada** de sete dias; execução GitHub/upload em falha não demonstrados para este candidato.

**Atenção:** o build arquivado pré-T5 ainda identifica `matriz-frontend@0.3.0`, apesar do JAR backend candidato. O scan limpo dessa imagem não valida o rebuild final com todos os metadados `0.4.0-rc.1`. Os 5 E2E/persistência T3 reportados são pré-Boot 4, sem registos brutos independentes disponíveis nesta pasta, e não são resultados finais.

### T6 — resultados finais locais

Resultados novos de 12-11-2026, sem reutilizar o scan/E2E pré-T5:

| Verificação | Resultado T6 |
|---|---|
| Maven `test -Dapi.version=1.44` | **19/19**, 0 falhas/erros/skips. |
| Frontend `npm test` / `npm run build` | **13/13**, TypeScript/Vite compilou; host Node 26.13.1/npm 11.2.0, dependências existentes. |
| Semgrep Docker readonly, regra local + `p/java`/`p/typescript`, `--error` | **0 findings**, 135 regras/29 alvos; âmbito/ignores reportados, não análise exaustiva. Metrics off, sem upload de código. |
| Compose base/override `config --quiet`; build `--no-cache app` | Exits 0; **um build fresco**, frontend/backend `0.4.0-rc.1`, Node 22/Java 21 dentro do Dockerfile. |
| Bloco Trivy extraído do workflow atual | **0 HIGH/CRITICAL**, **216/216 npm com dev**, **63/63 JARs internos**, 64 pacotes Java incluindo aplicação; sem erros/ignores/exceções. |
| Fixtures locais do gate real | **5/5**: clean passa; HIGH/CRITICAL sem fix, erro scanner/DB e coverage bloqueiam; 14 blocos Bash sintaticamente válidos. Não prova GitHub runtime/upload. |
| E2E contra a mesma imagem integrada | **5/5**, 22,0 s; 0 falhas/skips/flaky, fluxos reais e axe WCAG selecionado. Reports/screenhots fora do repositório. |
| Base, sessão/CSRF e observabilidade opt-in | Base `/` 200/healthy, API anónima 401, Actuator negado. Override health/probes mínimos anónimos 200, sem Set-Cookie; métricas anónimas 401/autenticadas 200, só JVM/HTTP; endpoints sensíveis/escritas operacionais negados. |
| Recriação app/db com mesmo volume | IDs dos dois contentores mudaram; fixture projeto/tarefa/comentário/atribuição e snapshot SQL/API iguais; sessão antiga 401, novo login 200, seed não reinicializou dados. |
| Paragem real só da DB própria e retoma | Readiness **503/DOWN**, liveness **200/UP**, Docker unhealthy; após retoma readiness/Docker saudáveis, mesma sessão 200 e dados iguais. Aquisição JDBC chegou a ~30 s: não é SLO/p95. |
| Fecho/preservação | App/db próprios stopped, volume/fixture preservados; **88 ficheiros fonte fora dos dois paths T6**, índice e HEAD inalterados, outras instâncias preservadas. |

Imagem final local: **`matriz-ficha05-final-app:latest`**, ID **`sha256:ce51e8d51b9f02005386b577e2ea55ea203a3ee27c53fb621781a30517eb0644`**. SHA256 de `/app/app.jar`: **`2c14025d99739d991ec5cd2d1ad885dfb2868321ef390241950a57e176478dc6`**; manifest `0.4.0-rc.1`/Boot 4.0.9/Java 21. Sem rebuild depois do scan; esta imagem foi usada nos E2E e nos ensaios. Nenhum destes hashes é SHA Git final.

Trivy 0.76.2/digest fixo manteve a policy original. Cache T6 nova: vulnerability DB atualizada 12-11-2026 **18:57:38Z**, descarregada **20:56:09Z**; Java DB atualizada **00:58:04Z**, descarregada **20:58:15Z**. Comparação física confirmou os **38 CVEs históricos ausentes**, incluindo `CVE-2026-47884`/`CVE-2026-47890`, com lista package/versão/severidade em `t6-physical-review.json`. Resultado temporal de `vuln/library`, não scan SO, auditoria exaustiva, prova de exploitability ou ausência de todas as vulnerabilidades.

Evidência física em **`C:\Users\CTW03863\.copilot\session-state\511773b1-1ef5-450c-9195-750d6ee3d4ed\files`**, prefixo `t6-`: logs de comandos, `t6-trivy-reports/`, `t6-surefire-structured-reports/`, `t6-e2e-report.json`/`t6-e2e-results/`, IDs e snapshots **antes/depois** da recriação e outage, `t6-runtime-http.json`, `t6-physical-review.json`, `t6-docs-final-check.json` e `t6-artifact-manifest.json`. Artefactos locais, não publicados nem links portáveis.

Problemas de harness UTF-8/sanitização XML foram corrigidos **só em scripts da sessão**, mantendo cópias iniciais e extraindo XML válido dos reports Maven inalterados; nenhum teste de produto falhou ou foi relaxado. Login/CSRF/cookies apenas em memória, sem valores persistidos; snapshots exclusivamente fictícios e sem campos de credenciais. A IA executou/confrontou evidência e redigiu os dois documentos sem delegação; autor aprovou âmbito/major Boot 4/policy sem exceções e operação isolada. Auto-verificação não substitui revisão humana/independente final. Detalhes/IDs completos e rastreabilidade em [verificação T6](docs/verification.md#t6--validação-integrada-final-local).

## Limitações e próximos passos

- **T6 local passou, não todos os critérios:** prova positiva/negativa GitHub Actions, upload em falha/retention reais **não verificados**; revisão final humana/independente e arquivo/entrega portável pendentes.
- Sem release/tag/publicação, commit/push, deploy ou execução remota T5/T6. Blueprint Render preservado, sem perfil operacional; `autoDeployTrigger: checksPass` pode reagir a checks. Ações remotas precisam de autorização própria.
- README/arquitetura já alinhados: T6 concluído localmente, sem declarar a ficha 05 integralmente concluída; critérios remotos e aprovação humana final continuam pendentes. A correção documental final não repete os ensaios T6 nem sobrescreve receipts/manifests históricos; transição de hashes em `t6-documentation-final.json` na pasta da sessão. YAML/JSON/XML/versões/refs/links/fences conferidos em T5/T6; sem validador semântico integral OpenAPI/Actions/JSON Schema ou renderização Mermaid.
- Endereço/expiração Render **2026-12-02** mantidos como registo temporário, sem validação ao vivo ou afirmação de que execute este candidato.
- Janela curta de suporte OSS **Boot 4.0 indicada para dezembro de 2026** na decisão de migração: risco de manutenção; reconfirmar [datas oficiais de suporte](https://spring.io/projects/spring-boot#support) e decidir atualização antes de operação prolongada. Suporte Boot e estado/expiração Render não foram revalidados ao vivo em T5/T6.
- Produção diferida; retenção anual é pressuposto sem policy/âmbito/evento inicial, sem purga; p95 sem alvo/carga aprovados. Sem pentest, carga, conformidade integral WCAG ou certificação de segurança.
