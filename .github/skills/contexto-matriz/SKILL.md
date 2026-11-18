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
- A autenticacao atual da demonstracao e local: contas ativas, email/palavra-passe, hash scrypt, sessao no servidor e protecao CSRF. Registo publico academico aprovado pelo autor em 17-11-2026, nao cliente: conta ativa imediatamente sem confirmacao email, sucesso regressa ao login com mensagem e sem auto-login/transporte ou armazenamento de password. Sem recuperacao de palavra-passe/envio de email.
- POST `/api/auth/register` publico exige CSRF e JSON displayName/email/password; 201 apenas mensagem, 422 errors por campo, 409 email existente inclusive concorrencia (divulgacao aceite). Nome 1–120 pontos Unicode apos trim; email trim/lowercase, maximo 254 unidades UTF-16, regex igual ao login incluindo Unicode; password de registo 6–200 pontos brutos sem trim/truncagem/composicao, inclusive so espacos; confirmacao so frontend. UI/erro curto «Mínimo de 6 caracteres»; excesso «Palavra-passe demasiado longa», sem maximo em detail/errors/UI de registo nem maxLength HTML. Login mantem passwords antigas curtas e ate 200 pontos.
- Throttle de registo independente do login: 5 pedidos/endereco remoto observado/15 min, sucessos/falhas apos CSRF valido, 429/Retry-After; memoria por instancia limpa no restart. Matcher PathPattern partilhado filtro/autorizacao apos CSRF cobre caminho codificado. Nao confiar em forwarded cliente nem prometer IP real do visitante atras de proxy. UUID/username internos gerados; sem projetos/participacoes/privilegios herdados, mas pode criar projetos apos login. Schema V3 suficiente, sem migration/dependencias novas.
- Estado vigente 18-11-2026: delta aprovado pelo autor, T024 fechada e 28/28 tarefas; full E2E 11/11 PASS as 11:55–11:56 UTC e revisao independente readonly `review-t024-full-closure` PASS documentados, B5/T028 PASS. Aprovacao visual humana as 09:42:49Z separada. Backend 58/frontend 141/build sao execucoes anteriores B1/B3; selecao 74/build da correcao de foco tem proveniencia propria, nao reexecucao documental. RED/bloqueios anteriores ficam historicos, sem autorizar implicitamente usar servicos. Ver RF-17/RN-20–22/US-20 e resumo vigente de `docs/verification.md`.
- Excecao CI aprovada em 18-11: exclusivamente `picomatch@4.0.7`/`CVE-2026-112366`/HIGH/frontend npm, todas as ocorrencias da versao no lock `dev: true`, sem `FixedVersion`, antes de `2026-11-25T00:00:00Z` exclusivo. Nao e scan limpo ou remediacao; outros findings, fix, expiracao e erros de scanner/cobertura bloqueiam. Ler `docs/constraints.md` e `docs/verification.md`, sem alterar politica.
- O ambito atual inclui projetos e membros, tarefas com prioridade, filtros, varios responsaveis elegiveis, comentarios, progresso global e eliminacoes transacionais com confirmacao na interface.
- Os detalhes de permissao e validacao sao os requisitos em vigor da ficha 03, nao as regras historicas das fichas anteriores.
- Gestor adiciona por email completo conhecido, sem diretorio/sugestoes/convites; UI envia so email, mostra nome/funcao/inatividade sem IDs. API conserva userId exato; XOR por presenca inclusive null, ambos/nenhum 422 email, unknown 400; inexistente/inativo mesmo 422 no campo do criterio. Repeticao/concorrencia mista 204 neutro/uma PK sem alterar papel/joined_at/versao. Emails.java e frontend/src/email.ts partilham regras vigentes; addMember autoriza/lock de projeto, revalida ator apos espera e protege alvo FOR SHARE ate commit, sem generalizar a outros metodos de projetos.
- Templates fixos por tipo/ciclo local: aplicar desativa/acinzenta, apagar/regressar ao tipo nao reativa, cancelar nao consome. Save/falha/refetch/recuperacao/resize/maximizar conservam; nova criacao apos sucesso ou fecho/reabertura efetiva/outra tarefa reiniciam sem persistir. NewTask conserva montagem apos primeira carga inclusive em erro recuperavel, base suja protegida.
- Detalhe partilhado: maximizar/X a direita com nomes acessiveis (standalone so X via guard router, sem dupla confirmacao); seletores nativos Editar/Pre-visualizar e atividade textuais com foco/selecao; Guardar/Eliminar lado a lado. Anexos diretos/comentarios: metadados→icones com nome por ficheiro, retirar so selecao, eliminar so canDelete com confirmacao. Preservar foco/Escape/inert/rascunhos/permissoes; CSS/build nao provam geometria ou teclado browser.

## Como interpretar a documentacao

- Preferir as secoes marcadas como atuais/em vigor. Secoes historicas preservam a evolucao e nao anulam decisoes posteriores.
- Distinguir factos documentados, decisoes do autor, propostas e pressupostos; nao afirmar validacao do cliente sem evidencia.
- Retencao anual e um pressuposto provisório, sem politica, ambito ou evento inicial definidos; nao ha purga automatica aprovada.
- p95 nao tem carga de referencia nem alvo aprovado. A demonstracao temporaria nao prova prontidao de producao.
- Nao inventar endpoints, permissoes, limites, dados ou decisoes de seguranca. Se fontes atuais divergirem, explicitar a divergencia e pedir orientacao.

## Limites de dados e operacao

Usar somente dados ficticios. Nao ler nem partilhar `.env`, credenciais ou informacao pessoal. Nao tratar a interface como controlo de autorizacao: a API e a fonte de controlo no servidor. Nunca executar deploy, alterar servicos externos ou apagar dados sem aprovacao explicita.
