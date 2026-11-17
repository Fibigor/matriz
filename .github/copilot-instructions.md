# Instrucoes do Copilot — Matriz

Antes de trabalhar neste repositorio, ler `AGENTS.md` e seguir as suas regras de contexto, aprovacao, seguranca, preservacao do worktree e validacao.

## Contexto do projeto

- A Matriz e uma demonstracao academica de gestao de projetos e tarefas, nao um servico pronto para producao.
- A implementacao atual e um monolito modular: Java 21/Spring Boot, React/TypeScript e PostgreSQL 17, com JDBC, Flyway e autenticacao local por sessao Spring.
- Em 17-11-2026 o autor aprovou registo publico apenas academico: conta ativa sem confirmacao email; POST `/api/auth/register` publico com CSRF, 201 apenas mensagem, regresso ao login sem auto-login nem transporte/armazenamento de password. Sem recuperacao/email externo/producao ou publicacao desta alteracao.
- Usar RF-17/RN-20–22 e US-20 para limites e criterios: nome 1–120 pontos apos trim, email normalizado compativel com login/Unicode, password de registo 12–200 pontos sem trim/composicao (login conserva antigas curtas). Duplicado 409 explicito aceite; throttle independente 5 pedidos/endereco remoto observado/15 min apos CSRF, memoria por instancia, 429/Retry-After, sem confiar em forwarded cliente nem prometer IP real atras de proxy. Sem participacoes/projetos herdados; pode criar projetos apos login. Schema V3 suficiente.
- Resultados backend 49 nos reports locais e frontend 56/build relatados nao sao nova execucao documental; visual/E2E do registo pendentes para T4. Consultar a secao datada do registo em `docs/verification.md`, sem promover evidencia antiga a atual.
- Para requisitos e regras atuais, usar a secao em vigor de `docs/requirements.md`, `docs/constraints.md` e `docs/user-stories.md`. Secoes historicas nao substituem decisoes atuais.
- Consultar `docs/architecture.md`, `docs/database.md`, `openapi.yaml`, `docs/implementation-plan.md` e `docs/verification.md` quando forem relevantes.
- Distinguir factos documentados, decisoes do autor, propostas e pressupostos. Nao apresentar uma proposta como validacao do cliente.

## Limites de trabalho

- Nao alargar o produto nem alterar permissoes, autenticacao, dependencias ou arquitetura fora do pedido aprovado.
- Apresentar os ficheiros e o plano de alteracao antes de trabalho significativo. Pedir aprovacao antes de criar/remover ficheiros ou executar operacoes sensiveis.
- Nunca ler, divulgar ou gravar credenciais. Usar apenas dados ficticios; nao copiar `.env.example` sobre `.env`.
- Nao apagar volumes/dados, publicar, fazer deploy, commit, push ou merge sem aprovacao explicita.
- Aplicar apenas verificacoes apropriadas ao pedido, usando comandos existentes no README e em `AGENTS.md`. Relatar resultados observados, sem os inventar.

Os agentes e skills em `.github/` complementam estas regras; nao as substituem.
