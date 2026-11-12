# Changelog — Matriz

## 0.4.0-rc.1 — 2026-11-12 — candidato não publicado

Baseline documental da ficha 05 na worktree, não release/tag/publicação. **T6 LOCAL concluído**: candidato reconstruído com metadados atuais e E2E 5/5 passaram; README e arquitetura alinhados com este estado. Os resultados Boot 4 pré-T5 abaixo antecedem a atualização de metadados frontend/OpenAPI e permanecem históricos. Prova positiva/negativa GitHub Actions, upload em falha/retenção reais não verificados e aprovação humana final pendente; não se declara a ficha 05 integralmente concluída. Não foram inventadas datas de releases anteriores; os registos das fichas 01–04 permanecem nos documentos históricos.

### Adicionado

- Observabilidade **local opt-in** por Actuator no perfil `observability`, na mesma porta da aplicação: health mínimo, liveness sem DB, readiness com JDBC/DB e métricas JVM/HTTP pela sessão autenticada existente. Sem serviço externo de monitoring, perfil Render ou logs de corpos/cookies.
- Override Compose de readiness; base mantém health HTTP `/`, publicações host em loopback e volume persistente.
- Gate CI de vulnerabilidades de bibliotecas npm (incluindo dev) e JAR realmente entregue, Trivy 0.76.2 fixado por digest, cobertura obrigatória e relatórios com retenção configurada de sete dias. HIGH/CRITICAL bloqueiam mesmo sem fix; scanner/DB/coverage em erro também falham, sem ignores/exceções.
- Estas release notes e atualização da arquitetura/relatório para distinguir evidência local, histórico e validação final pendente.

### Alterado

- Migração autorizada para Java 21 / Boot 4.0.9 / Framework 7.0.10 / Security 7.0.8 / Jackson 3.1.7 / Flyway 11.14.1; PostgreSQL 17 e Node 22 no Docker mantidos.
- Starters modulares MVC/MVC-test/Flyway e Testcontainers 2 para testes; uso do `JsonMapper` Jackson 3 autoconfigurado com defaults JSON de Boot 3 e rejeição de campos desconhecidos.
- Versão frontend (manifest/lock) e `info.version` OpenAPI alinhadas ao backend `0.4.0-rc.1`. Título histórico do contrato de negócio preservado; endpoints/schemas/permissões sem alterações funcionais em T5.

### Corrigido e verificado antes de T5

- Remediação local das bibliotecas entregues: findings HIGH/CRITICAL **38→2→0**, sem supressões. Boot 4 entrega Framework 7.0.10, com os dois findings restantes ausentes no scan fresco.
- Compatibilidade Problem Details (`about:blank`, extensões e UTF-8), datas/Unicode/JSON estrito e IOException verificada por regressões; fixtures de `EndpointId` corrigidas sem remover testes.
- Maven final: **19 testes**, 0 falhas/erros/ignorados. Imagem Boot 4 pré-T5: **0 HIGH/CRITICAL**, cobertura **216/216 npm** e **63/63 JARs internos** (64 pacotes Java incluindo app).

### Mantido / pendente

- Contrato RF/RN, sessão/scrypt/CSRF, JDBC, migrations V1–V3 e seed fictício sem reinicialização. Sem migrations SQL novas, purga ou nova funcionalidade de negócio.
- Nenhuma execução GitHub Actions deste candidato ou prova remota de upload em falha; nenhum deploy/publicação T5.
- T3 reportou 5 E2E/persistência **pré-Boot 4**, sem registos brutos independentes disponíveis na pasta de evidência; não são validação final.
- Rebuild com metadados atuais, E2E 5/5 e fecho integrado **T6 concluídos localmente**, conforme evidência T6 de 12-11-2026; não são novas execuções desta correção documental. Critérios remotos e aprovação humana final pendentes. Produção diferida; scan só de bibliotecas, não SO/certificação.

Detalhes, comandos, hashes e proveniência em [docs/verification.md](docs/verification.md#ficha-05--candidato-040-rc1); compatibilidade/operação em [RELEASE_NOTES.md](RELEASE_NOTES.md).
