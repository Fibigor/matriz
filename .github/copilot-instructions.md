# Instrucoes do Copilot — Matriz

Antes de trabalhar neste repositorio, ler `AGENTS.md` e seguir as suas regras de contexto, aprovacao, seguranca, preservacao do worktree e validacao.

## Contexto do projeto

- A Matriz e uma demonstracao academica de gestao de projetos e tarefas, nao um servico pronto para producao.
- A implementacao atual e um monolito modular: Java 21/Spring Boot, React/TypeScript e PostgreSQL 17, com JDBC, Flyway e autenticacao local por sessao Spring.
- Em 17-11-2026 o autor aprovou registo publico apenas academico: conta ativa sem confirmacao email; POST `/api/auth/register` publico com CSRF, 201 apenas mensagem, regresso ao login sem auto-login nem transporte/armazenamento de password. Sem recuperacao/email externo/producao ou publicacao desta alteracao.
- Usar RF-17/RN-20–22 e US-20 para limites e criterios: nome 1–120 pontos apos trim, email normalizado compativel com login/Unicode, password de registo 6–200 pontos brutos sem trim/truncagem/composicao, inclusive so espacos (login conserva antigas curtas/ate 200). UI/erro curto «Mínimo de 6 caracteres»; excesso «Palavra-passe demasiado longa», sem maximo em detail/errors/UI de registo nem maxLength HTML. Duplicado 409 explicito aceite; throttle independente 5 pedidos/endereco remoto observado/15 min apos CSRF, memoria por instancia, 429/Retry-After, sem confiar em forwarded cliente nem prometer IP real atras de proxy. Sem participacoes/projetos herdados; pode criar projetos apos login. Schema V3 suficiente.
- Estado vigente em 18-11-2026: T024 fechada, 28/28 tarefas, full E2E 11/11 PASS as 11:55–11:56 UTC e revisao independente readonly `review-t024-full-closure` PASS documentados; B5/T028 PASS. Visual humano aprovado as 09:42:49Z separadamente. Backend 58/frontend 141/build sao anteriores B1/B3; selecao 74/build da correcao de foco tem proveniencia propria, sem reexecucao documental. RED/bloqueios anteriores sao historicos, nao autorizacao de usar servicos. Consultar resumo vigente de `docs/verification.md`.
- CI: excecao temporaria apenas `picomatch@4.0.7`/`CVE-2026-112366`/HIGH/frontend npm, todas as ocorrencias dessa versao no lock `dev: true`, sem `FixedVersion`, antes de `2026-11-25T00:00:00Z` exclusivo. Nao scan limpo/remediacao; restantes findings e erros bloqueiam. Fontes: `docs/constraints.md`, `docs/verification.md` e workflow, sem alterar politica fora de aprovacao.
- Participantes: gestor indica email completo conhecido; UI so email/nome/funcao/inatividade sem IDs/diretorio/sugestoes/convites. API conserva userId exato, XOR por presenca inclusive null; repeticao/concorrencia 204 neutro/uma PK e mesma recusa inexistente/inativo. Emails.java e frontend/src/email.ts partilham regras; revalidacao apos lock do ator e FOR SHARE do alvo sao localizados em addMember, nao em todos os metodos de projetos.
- Templates: conjunto local por tipo/ciclo, aplicar desativa/acinzenta, cancelar nao consome; save/falha/refetch/recuperacao/resize/maximizar conservam, nova criacao apos sucesso ou fecho/reabertura efetiva/outra tarefa reiniciam, sem persistir. Icones maximizar/X a direita (standalone so X via guard router), seletores nativos Editar/Pre-visualizar/atividade textuais com foco/selecao, Guardar/Eliminar lado a lado e anexos metadados→icones/nome por ficheiro/canDelete preservam guards/confirmacoes/permissoes. Cobertura browser e aprovacao humana sao as documentadas em verification, nao certificacao integral.
- Para requisitos e regras atuais, usar a secao em vigor de `docs/requirements.md`, `docs/constraints.md` e `docs/user-stories.md`. Secoes historicas nao substituem decisoes atuais.
- Consultar `docs/architecture.md`, `docs/database.md`, `openapi.yaml`, `docs/implementation-plan.md` e `docs/verification.md` quando forem relevantes.
- Distinguir factos documentados, decisoes do autor, propostas e pressupostos. Nao apresentar uma proposta como validacao do cliente.

## Limites de trabalho

- Nao alargar o produto nem alterar permissoes, autenticacao, dependencias ou arquitetura fora do pedido aprovado.
- Apresentar os ficheiros e o plano de alteracao antes de trabalho significativo. Pedir aprovacao antes de criar/remover ficheiros ou executar operacoes sensiveis.
- Nunca ler, divulgar ou gravar credenciais. Usar apenas dados ficticios; nao copiar `.env.example` sobre `.env`.
- Nao apagar volumes/dados, publicar, fazer deploy, commit, push ou merge sem aprovacao explicita.
- Aplicar apenas verificacoes apropriadas ao pedido, usando comandos existentes no README e em `AGENTS.md`. Relatar resultados observados, sem os inventar.

## Spec Kit

- Integracao GitHub Spec Kit 1.4.2 para Copilot, com scripts PowerShell e nove skills `speckit-*`; consultar `.specify/memory/constitution.md` antes de as usar.
- Usar apenas para incrementos novos. `docs/` e `openapi.yaml` continuam fontes canonicas; nao migrar retroativamente nem duplicar requisitos/contratos em `specs/`.
- Propor caminhos e obter aprovacao antes de cada fase que escreva ficheiros, incluindo especificacoes, planos, tarefas e `.specify/feature.json`. Comandos, hooks e checklists nao autorizam automaticamente a fase seguinte.
- Manter os agentes Matriz e as skills existentes. As skills Spec Kit incluem um bloco local de governanca; preservar esse bloco e a constituicao ao atualizar a ferramenta.
- A integracao nao inclui extensoes opcionais, automatizacao Git ou autorizacao de implementacao, commit, push, merge ou deploy.

Os agentes e skills em `.github/` complementam estas regras; nao as substituem.
