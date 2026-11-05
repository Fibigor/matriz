
# ADR-0003 — PostgreSQL, JDBC e Flyway

- **Estado:** Aceite
- **Ficha de referência:** Ficha Prática 03 — 29/10/2026 (implementação fullstack e stack aprovada).

## Contexto

Projetos, participações, tarefas, atribuições e comentários têm relações e regras de integridade que precisam de persistência duradoura. Operações como eliminar um projeto e os seus dependentes devem ser atómicas; alterações concorrentes não podem sobrescrever dados silenciosamente.

## Decisão

Usar PostgreSQL 17 como base de dados relacional, JDBC com parâmetros preparados e Flyway para migrations versionadas. Aplicar transações locais, restrições relacionais e controlo de concorrência conforme o modelo implementado.

## Consequências

- FKs, restrições e índices da base reforçam regras de integridade da aplicação.
- As alterações de schema são entregues como migrations Flyway versionadas, não como recriação do schema no arranque.
- Queries e mapeamentos são explícitos em JDBC; a implementação atual não usa ORM.
- A base PostgreSQL da demonstração está sujeita às condições do plano gratuito; o estado e a data de expiração atuais estão em [verification.md](../verification.md). Esse limite operacional não altera a decisão de persistência nem define a retenção dos dados ao nível da aplicação.

## Alternativas consideradas

Os documentos de arquitetura não registam uma comparação formal de motores de base de dados ou ORMs. Não se afirma que alternativas específicas tenham sido avaliadas e rejeitadas.

## Referências

- [Modelo de dados](../database.md), schema implementado e integridade.
- [Arquitetura](../architecture.md), persistência, transações e concorrência.
- [Verificação](../verification.md), estado atual da demonstração Render.
