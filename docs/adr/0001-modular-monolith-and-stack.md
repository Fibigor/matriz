# ADR-0001 — Monólito modular e stack aprovada

- **Estado:** Aceite
- **Ficha de referência:** Ficha Prática 02 — 22/10/2026 (monólito modular); stack confirmada na Ficha Prática 03 — 29/10/2026.

## Contexto

O âmbito da Matriz é um MVP de gestão de projetos e tarefas. A aplicação precisa de fronteiras claras entre identidade, projetos e tarefas, mantendo simples as operações que atravessam esses domínios. Não há requisitos confirmados que justifiquem serviços distribuídos ou deploy independente dos módulos.

## Decisão

Manter um monólito modular numa única aplicação implantável, com interface React/TypeScript, backend Java 21/Spring Boot e PostgreSQL 17. Organizar o backend por capacidades, mantendo responsabilidades e dependências explícitas entre módulos.

## Consequências

- A aplicação e os módulos são compilados, implantados e escalados em conjunto.
- Operações entre módulos podem usar transações locais.
- As fronteiras entre módulos exigem disciplina para evitar dependências ou regras duplicadas.
- A demonstração temporária no Render não altera esta decisão nem significa prontidão para produção.

## Alternativas consideradas

- **Monólito simples:** viável, mas oferece menos orientação para manter as responsabilidades separadas.
- **Microserviços:** não justificados pelo âmbito; acrescentariam rede, consistência distribuída e custos operacionais sem benefício demonstrado.

## Referências

- [Arquitetura](../architecture.md), incluindo a DEC-01 e a comparação de alternativas.
- [Plano de implementação](../implementation-plan.md), decisões validadas e incrementos.
