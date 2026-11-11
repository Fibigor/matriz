---
name: contexto-matriz
description: "Contexto funcional, arquitetural e de seguranca da Matriz. Usar ao planear ou alterar este projeto, interpretar requisitos ou resolver divergencias documentais."
---

# Contexto da Matriz

## Fontes a consultar

Antes de trabalhar, seguir `AGENTS.md`. Ler `README.md`, `docs/requirements.md`, `docs/constraints.md` e as historias relevantes de `docs/user-stories.md`. Consultar `docs/architecture.md`, `docs/database.md`, `openapi.yaml`, `docs/implementation-plan.md` e `docs/verification.md` conforme necessario.

## Estado atual

- A Matriz e uma demonstracao academica de gestao de projetos e tarefas. A producao esta diferida.
- A stack documentada e um monolito modular com Java 21/Spring Boot, React/TypeScript e PostgreSQL 17, JDBC e migrations Flyway.
- A autenticacao atual da demonstracao e local: contas ativas, email/palavra-passe, hash scrypt, sessao no servidor e protecao CSRF. Nao ha registo publico nem recuperacao de palavra-passe.
- O ambito atual inclui projetos e membros, tarefas com prioridade, filtros, varios responsaveis elegiveis, comentarios, progresso global e eliminacoes transacionais com confirmacao na interface.
- Os detalhes de permissao e validacao sao os requisitos em vigor da ficha 03, nao as regras historicas das fichas anteriores.

## Como interpretar a documentacao

- Preferir as secoes marcadas como atuais/em vigor. Secoes historicas preservam a evolucao e nao anulam decisoes posteriores.
- Distinguir factos documentados, decisoes do autor, propostas e pressupostos; nao afirmar validacao do cliente sem evidencia.
- Retencao anual e um pressuposto provisório, sem politica, ambito ou evento inicial definidos; nao ha purga automatica aprovada.
- p95 nao tem carga de referencia nem alvo aprovado. A demonstracao temporaria nao prova prontidao de producao.
- Nao inventar endpoints, permissoes, limites, dados ou decisoes de seguranca. Se fontes atuais divergirem, explicitar a divergencia e pedir orientacao.

## Limites de dados e operacao

Usar somente dados ficticios. Nao ler nem partilhar `.env`, credenciais ou informacao pessoal. Nao tratar a interface como controlo de autorizacao: a API e a fonte de controlo no servidor. Nunca executar deploy, alterar servicos externos ou apagar dados sem aprovacao explicita.
