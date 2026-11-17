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
- POST `/api/auth/register` publico exige CSRF e JSON displayName/email/password; 201 apenas mensagem, 422 errors por campo, 409 email existente inclusive concorrencia (divulgacao aceite). Nome 1–120 pontos Unicode apos trim; email trim/lowercase, maximo 254 unidades UTF-16, regex igual ao login incluindo Unicode; password de registo 12–200 pontos sem trim/composicao, espacos permitidos; confirmacao so frontend. Login mantem passwords antigas curtas e ate 200 pontos.
- Throttle de registo independente do login: 5 pedidos/endereco remoto observado/15 min, sucessos/falhas apos CSRF valido, 429/Retry-After; memoria por instancia limpa no restart. Matcher PathPattern partilhado filtro/autorizacao apos CSRF cobre caminho codificado. Nao confiar em forwarded cliente nem prometer IP real do visitante atras de proxy. UUID/username internos gerados; sem projetos/participacoes/privilegios herdados, mas pode criar projetos apos login. Schema V3 suficiente, sem migration/dependencias novas.
- Visual/E2E do registo pendentes para T4; backend 49 nos reports locais e frontend 56/build relatados sao evidencia anterior a T3, nao execucao documental. Resultados de 12/13-11 nao cobrem o registo. Ver RF-17/RN-20–22/US-20 e `docs/verification.md`.
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
