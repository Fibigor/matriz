# Constituicao da Matriz

## Principios

### I. Fontes canonicas e rastreabilidade

Ler [AGENTS.md](../../AGENTS.md), [README.md](../../README.md),
[requisitos](../../docs/requirements.md), [restricoes](../../docs/constraints.md)
e as [User Stories](../../docs/user-stories.md) relevantes antes de atuar.
Consultar arquitetura, dados, OpenAPI, plano de implementacao e verificacao
quando aplicaveis. As secoes atuais prevalecem sobre o arquivo historico.

Esta constituicao complementa AGENTS.md; nao o substitui nem altera permissoes.
`docs/` e `openapi.yaml` continuam fontes canonicas. `specs/` guarda apenas
incrementos novos, sem migrar retroativamente funcionalidades existentes nem
criar um contrato concorrente. Cada incremento referencia RF/RN/US existentes
ou identifica claramente uma proposta nova, sujeita a aprovacao.

### II. Aprovacao humana antes da escrita

Apresentar ambito, criterios, ficheiros afetados e validacao antes de alteracoes
significativas e aguardar aprovacao. Propor criacoes e eliminacoes de ficheiros
antes de executar, incluindo artefactos em `specs/` e estado em `.specify/`.
Invocar uma skill, gerar um plano ou passar um checklist nao aprova a fase
seguinte. Nao executar hooks, instalacoes, mudancas de seguranca, operacoes
destrutivas, publicacao, deploy, commit ou push sem autorizacao explicita.
Nunca fazer merge autonomamente. Preservar worktree e staging existentes.

### III. Produto e arquitetura existentes

A Matriz e uma demonstracao academica, nao um servico pronto para producao.
Preservar Java 21/Spring Boot, React/TypeScript, PostgreSQL 17, monolito modular,
JDBC/Flyway e autenticacao local por sessao Spring com CSRF e hash scrypt.
Nao introduzir dependencias, permissoes ou funcionalidades fora do pedido
aprovado. Requisitos atuais, incluindo RF-17/RN-20-22/US-20, continuam em docs;
esta integracao nao aprova novas funcionalidades nem encerra pendencias.

### IV. Dados protegidos e falhas explicitas

Usar apenas dados ficticios. Nao ler, copiar, imprimir ou transmitir segredos;
nao substituir `.env`, apagar volumes ou alterar servicos alheios.
Preservar autorizacao no servidor, validacao e transacoes. Nao ocultar erros,
repetir escritas automaticamente ou anunciar sucesso sem evidencia.

### V. Evidencia verificavel, sem pressupostos promovidos

Distinguir factos observados, decisoes do autor, propostas e pressupostos.
Aprovacao do autor nao significa validacao do cliente. Perante lacunas ou
contradicoes relevantes, parar e pedir esclarecimento; exemplos dos templates
nao definem requisitos, metas de desempenho, retencao ou escala.

Escolher as verificacoes existentes mais pequenas que cubram a alteracao,
seguindo a skill `validacao-matriz`. Registar comandos, resultados e limitacoes
reais; evidencia historica nao e uma execucao atual. Atualizar documentacao
canonica diretamente afetada, sem declarar validacoes nao realizadas.

## Fluxo e pontos de controlo

1. Propor a especificacao do incremento com `/speckit-specify` e esclarecer
   duvidas com `/speckit-clarify`, apos aprovar os ficheiros a criar.
2. Elaborar `/speckit-plan` e `/speckit-tasks`; antes de escrever cada fase,
   confirmar que os seus artefactos e alteracoes de estado estao autorizados.
3. Executar `/speckit-analyze`, rever o plano e obter aprovacao explicita
   antes de `/speckit-implement` ou de delegar nos engenheiros Matriz.
4. Rever alteracoes e evidencia. `/speckit-converge` pode propor trabalho
   restante, mas nao o autoriza nem substitui revisao/aceitacao humana.

Os agentes e skills Matriz existentes mantem as suas responsabilidades.
Checklists de qualidade nao sao prova de testes nem autorizacao de execucao.

## Governanca

Constituicao inicial de integracao aprovada pelo autor em 17-11-2026; nao e
validacao do cliente nem alteracao do ambito funcional. Alteracoes futuras
exigem proposta, aprovacao e atualizacao coerente das referencias afetadas.
Conflitos com AGENTS.md ou fontes canonicas exigem esclarecimento humano.
Atualizacoes do Spec Kit devem preservar estes pontos de controlo e os blocos
locais das skills; nao executar novamente `init --force` sem rever o diff.

**Version**: 1.0.0 | **Ratified**: 2026-11-17 | **Last Amended**: 2026-11-17
