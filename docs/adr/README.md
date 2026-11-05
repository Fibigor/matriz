# Architecture Decision Records

ADRs registam decisões técnicas duradouras já aprovadas, o contexto que lhes deu origem e as respetivas consequências. Não substituem os requisitos, o contrato da API ou a documentação detalhada de arquitetura e dados.

| ADR | Estado | Decisão | Ficha / data de referência |
|---|---|---|---|
| [0001 — Monólito modular e stack](0001-modular-monolith-and-stack.md) | Aceite | Manter uma aplicação modular única com Java/Spring Boot, React/TypeScript e PostgreSQL. | Ficha 02 — 22/10/2026; stack confirmada na Ficha 03 — 29/10/2026 |
| [0002 — Autenticação local](0002-local-session-authentication.md) | Aceite | Usar email/palavra-passe com sessão Spring no servidor, CSRF e hashes scrypt. | Ficha 03 — 29/10/2026; decisão OIDC/Keycloak — 30/10/2026 |
| [0003 — Persistência relacional](0003-postgresql-jdbc-flyway.md) | Aceite | Usar PostgreSQL 17, JDBC parametrizado, Flyway e transações locais. | Ficha 03 — 29/10/2026 |
| [0004 — Demonstração temporária no Render](0004-temporary-render-demo.md) | Aceite | Publicar uma demonstração visual temporária no Render, sem a tratar como produção. | Ficha 03 — 29/10/2026; decisão — 30/10/2026 |
| [0005 — Análise estática com Semgrep](0005-semgrep-static-analysis.md) | Aceite | Executar Semgrep localmente e na CI para Java e TypeScript. | Ficha 04 — 05/11/2026 |

A escolha do Render para a demonstração está registada no ADR-0004; o URL atualmente ativo, a data de expiração da base e os limites do serviço são estado operacional documentado em [verification.md](../verification.md). Retenção de um ano e alvo p95 continuam pressupostos ou questões em aberto, não decisões aceites.
