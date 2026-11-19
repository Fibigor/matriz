# Quickstart — validação futura da feature 002

Guia de validação, **não autorização de executar** nem prova de PASS.
Nenhum comando de aplicação, teste, migration ou serviço foi executado na fase
de planeamento. [plan.md](plan.md) contém caminhos propostos e ER-01–ER-07;
[delta de contrato](contracts/status-delta.md) e [dados](data-model.md)
definem o que observar sem duplicar API completa.

## 1. Gates e pré-requisitos

Antes de implementar: aprovação exata de
specs/002-estado-em-revisao/tasks.md, geração por speckit-tasks,
speckit-analyze readonly com SPECIFY_FEATURE_NO_PERSIST=1 e nova aprovação
de implementação dos caminhos do plano. Gerar tasks não autoriza implementar.
Executores seguem AGENTS/validacao-matriz; revisão independente pelo
Revisor Matriz é distinta da execução dos testes.

Para testes futuros: Java 21/Maven e Docker/Testcontainers disponíveis;
dependências frontend e browser Playwright **já instalados** e autorizados.
Não instalar por este guia. Backend usa PostgreSQL isolado pelos testes;
nunca apontar migrations/testes para DB real ou de outro agente.

Para E2E: API/Vite com seed fictício, ou Compose de teste, em ambiente
isolado explicitamente aprovado e confirmado pelo responsável. Existência
de serviço anterior não autoriza usá-lo. Playwright tem workers=1 e não
arranca servidores na configuração atual. Alocar ambiente sem outro executor,
nomes únicos e limpeza apenas dos recursos fictícios criados pelo próprio
teste; não apagar volumes nem dados demo preexistentes.

Configuração/arranque constam do [README](../../README.md) e
[desenvolvimento](../../docs/development.md); não são executados nem
implicitamente autorizados aqui. Não ler/imprimir segredos/substituir .env.

## 2. Comandos existentes — só após autorização própria

Na raiz, suite backend (inclui unidade, API/Testcontainers e migrations):

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
```

Dentro de frontend, testes/build:

```powershell
npm test
npm run build
```

Dentro de frontend, apenas com API/Vite/seed já confirmados/autorizados:

```powershell
npm run test:e2e
```

Alternativa ao Vite: ambiente Compose de teste explicitamente aprovado,
aplicação loopback 8080, dentro de frontend:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
```

Não correr ambas as variantes por formalidade. Sem instalar browser, iniciar
serviços, reutilizar ambiente alheio ou alterar configuração para ultrapassar
pré-requisito em falta. Compilar não valida comportamento visual/persistência.

## 3. Cenários e evidência esperada

Preparação abaixo pertence aos futuros testes em ficheiros existentes; não
autoriza introduzir dados agora. Usar participantes ativos e não participante
para regressão de acesso.

### V-01 — Regra obrigatória e atomicidade (ER-02/03/04/05)

- Criar tarefa: TODO por omissão, sem responsáveis.
- Via API, tentar TODO→DONE e IN_PROGRESS→DONE com versão atual/campos válidos:
  esperar 422, campo status/mensagem de revisão e snapshot igual de tarefa,
  versão, datas e contagem/conteúdo de eventos.
- Guardar TODO→IN_REVIEW, consultar resposta e novo GET. Depois concluir:
  aceite se restantes condições satisfeitas. Repetir desde IN_PROGRESS.
- Fazer revisão→TODO e revisão→IN_PROGRESS; tentativa direta DONE continua
  recusada. Não aceitar revisão antiga pelo histórico.
- Membro ativo sem atribuição pode rever/concluir, inclusive mesma pessoa.
  Não participante/inativo/revogado e escrita sem CSRF mantêm recusas.
- Selecionar revisão num draft TODO não habilita DONE. Depois de guardar
  revisão confirmada, DONE disponível; sem auto-save/segunda escrita automática.
- 422/409/transporte conserva rascunho e explica falha; não repetir escrita.
  Refetch externo com dirty não promove base/estado/versão; recuperação exige
  confirmação. Testar painel e acesso direto/layout móvel.

FR-002/003/004/010, SC-001/002; evidência: asserts API/corpos/snapshots,
componentes de base/draft/refetch e jornada browser.

### V-02 — Quatro estados e globais (ER-02/03/04/05)

- Projeto isolado: uma TODO, uma IN_PROGRESS, uma IN_REVIEW e uma DONE
  legitimamente concluída após revisão.
- Listagem/detalhe de projeto e TaskPage.project.progress/TaskPage.progress:
  total=4, todo=1, inProgress=1, inReview=1, done=1, percentagem=25.
- Filtrar revisão: uma tarefa no resultado e globais inalterados. Mudar
  página/tamanho/prioridade não altera globais.
- Vazio: 0%, todas contagens zero e «Sem tarefas»; manter arredondamentos
  1/8→13%, 1/3→33%, 2/3→67% e todos os motivos DONE no numerador.
- Enum desconhecido recusado; selector/filtro na ordem de quatro estados.

FR-001/005/006, SC-003/004; evidência: InputsTest, ApiIntegrationTest,
fixtures/componentes/E2E. Não confundir totalItems filtrado com total global.

### V-03 — BLOCKS, motivos e concorrência (ER-02/03/04)

- Tarefa bloqueada pode entrar em revisão; IN_REVIEW→DONE com bloqueador
  não-DONE continua 422. Bloqueador IN_REVIEW continua pendente.
- Reabrir bloqueador DONE para revisão com dependente DONE é recusado; sem
  impedimento, reabrir para qualquer não-DONE limpa motivo e reduz progresso.
- Criar bloqueador IN_REVIEW para dependente DONE continua recusado; remover
  relação/eliminar bloqueador desbloqueia sem mudar estado de dependente.
- IN_REVIEW com motivo não null é inválido; IN_REVIEW→DONE sem motivo dá null;
  DONE→DONE com motivo omitido preserva; sem mudança não inventa evento, mas
  mantém incremento de versão atual.
- Versão antiga mantém 409. Exercitar races de conclusão/reabertura, inserção
  de bloqueador, revogação/inatividade após espera e rollback por falha tardia.
  Preparar IN_REVIEW antes da tentativa crítica para o teste não passar apenas
  pela nova recusa e deixar de testar proteção antiga.

FR-007/008/010, SC-001/005/006; evidência: regressões backend/snapshots
de atomicidade. Guardas UI não substituem chamadas API.

### V-04 — Upgrade/ausência de retroatividade (ER-02/03)

- Arranque limpo: V1→V5; default TODO, novo valor permitido/desconhecido recusado.
- Fixar target 4 do teste histórico V3→V4 para conservar prova antiga de uma
  migration, defaults/MAT e zero backfill.
- Novo cenário no mesmo ApiIntegrationTest: migrar até V4, popular estados
  antigos, DONE com motivo, versões/datas, relações/eventos; snapshot antes
  e depois de V5 igual, só uma migration, segunda execução zero.
- Confirmar nome/corpo do CHECK de status no catálogo e manutenção do CHECK de
  motivo. Nenhuma linha antiga reclassificada ou revisão fictícia.
- Editar DONE antiga mantendo DONE é aceite; reabrir mantém invariantes,
  voltar a DONE exige revisão imediatamente anterior.

FR-001/007/008/009, SC-004/005/006; evidência: upgrade/API, sem editar
migrations antigas ou inventar execução.

### V-05 — Apresentação, história e consulta persistida (ER-04/05)

- Estado legível em lista/filtro/detalhe painel/página/relação e old/new na
  história. Tradução localizada não altera priority/type/outros valores/JSON.
  Mudanças efetivas geram eventos tipados esperados.
- Após guardar revisão, reload e consulta por outra sessão autorizada mantêm
  IN_REVIEW; percurso não depende de estado local ou mock.
- Dashboard: quatro barras inteiras no viewBox, labels/valores/desc e quatro
  cartões visíveis; desktop e 390/320 px, sem corte/sobreposição/regressão.
- Teclado/foco/seleção acessíveis; identificação não depende só de cor.
  Preservar Escape/inert/guards/rascunhos na mudança de layout.

FR-005/006/009/010, SC-003/004. Browser/asserções geométricas e inspeção
visual humana identificados separadamente; build/DOM isolado não provam isso.

## 4. Reinício preservando dados — gate operacional separado

SC-004 e FR-009 incluem estado após reinício, mas aprovação de testes/E2E não
autoriza parar/recriar serviços. Obter autorização específica para ambiente e
operação exatos, confirmar exclusividade e volume preservado.
Registar tarefa/revisão/versão/história antes; depois de reinício autorizado,
autenticar novamente (sessão não tem de sobreviver) e confirmar mesmos dados.
Não apagar volume, recriar DB vazia, correr down -v ou mascarar perda com seed.

Sem autorização, registar «reinício não executado; persistência pós-reload
apenas», sem anunciar SC plenamente comprovado. Este plano não fornece ordem
automática de arranque/paragem.

## 5. Registo e revisão independente (ER-06/07)

Para cada comando futuro: diretoria, ambiente autorizado, horário, comando
literal, exit code, totais/falhas e evidência observada, sem segredos.
Falha/inconclusivo/bloqueio não se transforma em PASS; evidência histórica em
docs/verification ou feature 001 não prova este incremento.

Engenheiro de Documentacao e Configuracao Matriz atualiza apenas caminhos
futuramente aprovados de ER-06 e, com autorização expressa, é único escritor
de tasks.md. Revisor Matriz verifica readonly delta/relatórios, incluindo
testes que poderiam mascarar BLOCKS/rollback e segurança de base suja.
Sem criar ficheiro de evidência ou alterar artefactos sem caminho aprovado.

Conferência documental desta fase: template preenchido, links relativos e
inventário de caminhos revistos, FR-001–010/SC-001–006 rastreados, gates
constitucionais antes/depois avaliados. Não executados Git diff --check,
builds, suites, browser, speckit-analyze ou certificação do índice.
Próxima fase possível: tasks, só após aprovação do caminho exato;
implementação e operações Git/publicação/deploy fora desta aprovação.
