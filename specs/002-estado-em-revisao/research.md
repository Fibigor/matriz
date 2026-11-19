# Research — Estado «Em revisão»

Data: 2026-11-18. Fase speckit-plan, apenas desenho; decisões funcionais em [spec.md](spec.md), organização e caminhos em [plan.md](plan.md). Pesquisa local dirigida, sem rede, testes ou documentos binários. A pré-análise fornecida pelo utilizador foi contexto, não substituto da confirmação dos pontos abaixo.

## R-01 — Origem persistida obrigatória, sem novo papel

**Decisão do autor**: revisão imediatamente antes de nova conclusão, qualquer participante ativo com permissão atual, TODO→IN_REVIEW permitido. Sem decisões de comportamento pendentes.

**Decisão técnica proposta**: TaskService.STATES passa a reconhecer IN_REVIEW. Na validação de transição, após lock/revalidação do ator e verificação de versão, recusar entrada em DONE quando o estado persistido é diferente de IN_REVIEW e DONE. DONE→DONE não é nova entrada. Mensagem proposta: «Coloque a tarefa em revisão antes de a concluir.», por Inputs.invalid("status", ...).

**Evidência**: `backend/src/main/java/pt/matriz/tasks/TaskService.java` lê before depois de lockProject, testa versão antes de checkTransition e só depois executa UPDATE e evento. `common/Inputs.java` produz ApiException 422 com campo; `common/ApiErrors.java` devolve Problem Details e errors[{field,message}]. Regras existentes de formato/campos continuam a poder recusar primeiro um pedido inválido; não se altera precedência de autenticação/versão.

**Justificação**: um único PUT não demonstra que o estado intermédio foi persistido. O estado anterior não deve ser inferido do histórico ou fornecido pelo cliente.

**Alternativas rejeitadas**: validar só UI; aceitar revisão histórica abandonada; escrever revisão e conclusão automaticamente; exigir IN_PROGRESS, atribuição, gestor, revisor separado ou novo endpoint.

## R-02 — Migration mínima sobre CHECK existente

**Decisão técnica proposta**: criar futuramente apenas `backend/src/main/resources/db/migration/V5__task_in_review.sql`, substituindo o CHECK de status por domínio de quatro valores. Sem DML, mudança de default, coluna/tabela/índice novo ou alteração de V1–V4.

**Evidência**: V1 real é `V1__initial_schema.sql`, não V1__schema.sql; task.status VARCHAR(20) NOT NULL DEFAULT TODO tem CHECK inline sem nome explícito. PostgreSQL gera o nome esperado task_status_check neste schema, sem declaração concorrente observada. V4 nomeia task_close_reason_status, não altera o domínio status e mantém motivo só DONE. Cadeia local: V1, V2, V3 e V4; V5 ainda não existe.

**Justificação**: IN_REVIEW cabe na coluna existente; permitir novo valor não exige converter nenhuma linha. Confirmar a constraint gerada pelo PostgreSQL no teste de upgrade; não se afirma inspeção de catálogo nesta fase. Se o schema de teste não corresponder, parar antes de outro desenho.

**Alternativas rejeitadas**: editar migration aplicada, converter DONE antigo em revisão, inventar eventos, usar enum PostgreSQL/tabela de workflow ou retirar validação de domínio.

## R-03 — Quatro contagens, um único progresso global

**Decisão técnica proposta**: adicionar long inReview a ApiModels.Progress, argumento correspondente a Inputs.progress e contagem FILTER de IN_REVIEW em ProjectService.progress. Somar quatro contagens; done permanece único numerador e HALF_UP inteiro permanece intacto.

**Evidência**: `backend/src/main/java/pt/matriz/common/ApiModels.java` tem Progress(total,todo,inProgress,done,completedPercent), consumido por ProjectView e TaskPage. Pesquisa dirigida encontrou apenas ProjectService a chamar Inputs.progress em main e quatro chamadas em InputsTest. ProjectService constrói cada ProjectView com progress(id); TaskService.list devolve ProjectView e Progress global, ambos fora do WHERE filtrado, na leitura REPEATABLE_READ.

**Justificação**: adicionar apenas enum omite revisão do total atual. O novo campo tem de existir em listagem/detalhe de projeto e em ambos os locais de progresso da página de tarefas.

**Alternativas rejeitadas**: ponderação por peso, progresso parcial para revisão, calcular agregado da página/filtro ou guardar contagens duplicadas na DB.

## R-04 — Bloqueios, motivo e histórico preservados

**Decisão técnica proposta**: manter predicados DONE/não-DONE e transações atuais. Revisão pode ser iniciada com bloqueadores; concluir exige revisão persistida e todos os bloqueadores DONE. Reabrir DONE para revisão também é protegido por dependente DONE. Sem novo tipo/payload de evento.

**Evidência**: TaskService.checkTransition consulta bloqueadores com status diferente de DONE só ao entrar em DONE e dependentes DONE ao reabrir. `backend/src/main/java/pt/matriz/tasks/TaskLinkService.java` já compara DONE/não-DONE para nova BLOCKS. Motivo validado só para DONE; omissão em DONE→DONE preserva, reabertura/entrada sem motivo produz null. Evento usa ChangeField.status e TextValue com strings na mesma transação; PUT sem mudança efetiva incrementa versão sem evento.

**Justificação**: IN_REVIEW é não concluído; invariantes existentes cobrem-no sem generalização do grafo/autorização.

**Alternativas rejeitadas**: exigir bloqueadores DONE antes da revisão, considerar revisão como concluída, fazer DML/backfill de história ou separar escrita do evento.

## R-05 — Base segura no editor

**Decisão técnica proposta**: snapshot de estado persistido associado à base/version do editor, independente de values.status e do último GET. Desativar DONE se base não é IN_REVIEW/DONE, com explicação de guardar revisão primeiro. Manter revisão e DONE como duas ações deliberadas.

**Evidência**: `frontend/src/TaskDetail.tsx` conserva values, dirty e received; received.current avança mesmo com dirty, mas values só mudam em refetch limpo. Usar esse ref diretamente como estado-base permitiria promover dados externos. Editor avança metadados/versão após resposta local de atribuição/relação apenas quando identidade e previousVersion correspondem; não alterar proteção dos restantes campos.

**Justificação**: snapshot só avança com inicialização, save, refetch limpo, recuperação confirmada ou reconhecimento local correspondente. Após save IN_REVIEW confirmado, DONE torna-se admissível; falha ou mera escolha no dropdown não basta. API continua autoridade para conflitos/versão/permissão.

**Alternativas rejeitadas**: testar apenas draftstatus; utilizar último task recebido sobre rascunho sujo; mudar estado silenciosamente no erro, salvar automaticamente ou repetir escrita.

## R-06 — Superfícies partilhadas e quatro barras

**Decisão técnica proposta**: ordem/label central em `frontend/src/types.ts`; inReview em `frontend/src/ui.tsx` e `frontend/src/Projects.tsx`; estilo em `frontend/src/styles.css`; tradução localizada de old/new de status em `frontend/src/TaskActivity.tsx`.

**Evidência**: Tasks.tsx usa Object.entries(statusLabels) para filtro e o mesmo mapa na lista. TaskLinks.tsx apresenta statusLabels[other.status]. Não se pressupõe editar esses componentes. TaskActivity.valueText apresenta texto bruto de todos os campos; traduzir apenas status conhecido preserva a semântica restante. Dashboard tem três estados, x=120+index*200 num viewBox 640 e metrics-grid de três colunas: append produziria x=720 fora do SVG.

**Justificação**: labels partilhadas propagam revisão sem duplicar opções. Redistribuir quatro barras na área útil (por exemplo centros 100/245/390/535, sem tornar esses pixels requisito funcional) e adaptar grelha. Manter contagens/desc/texto e verificar visualmente, não só compilar CSS.

**Alternativas rejeitadas**: labels locais divergentes, substituir globalmente valores da história, quarta barra sem recalcular geometria, estado identificado só por cor.

## R-07 — Testes existentes e prova histórica preservada

**Decisão técnica proposta**: alterar somente dois testes backend, quatro de componentes e E2E enumerados em ER-03/04/05, sem ficheiro novo de teste. Introduzir fixture IN_REVIEW só nos percursos que realmente precisam de alcançar DONE.

**Evidência**: `backend/src/test/java/pt/matriz/ApiIntegrationTest.java`, método populatedV3MigrationAssignsDeterministicGlobalKeysWithoutChangingDatesVersionsOrInventingHistory, migra até target 3 e depois usa Flyway sem target esperando uma migration. V5 faria essa expectativa deixar de isolar V4; fixar o segundo target em 4 e acrescentar cenário V4→V5 populada no mesmo ficheiro. Contexto Spring/Testcontainers continua a aplicar cadeia limpa até à última migration.

Pesquisa dirigida de Progress em frontend/src encontrou fixtures em Tasks.test.tsx, TaskDetail.test.tsx e TaskDetailPanel.test.tsx, além de tipos/consumidores conhecidos; não inventou Projects.test.tsx. TaskLinks.test.tsx usa Task/TaskReference e serve para label em relação, não foi encontrado Progress aí. O teste de 422 BLOCKS em TaskDetail.test seleciona DONE desde TODO: terá de iniciar com base IN_REVIEW para continuar a testar erro de bloqueador.

Races de conclusão/reabertura, inserção concorrente de bloqueador, rollback por falha DB e motivo/história existem em ApiIntegrationTest. Preparar revisão antes da tentativa crítica é necessário para esses testes continuarem a exercitar proteção antiga e não passarem só por nova recusa de origem.

**Alternativas rejeitadas**: helper que insere revisão universalmente; relaxar asserts de 409/422; remover testes antigos; inventar resultados de suite ou adicionar teste sem caminho aprovado.

## R-08 — Contrato coordenado e fontes canónicas

**Decisão técnica proposta**: enum expandido e Progress.inReview obrigatório/aditivo no mesmo contrato de API existente, com entrega futura coordenada de cliente/servidor. Endurecer transição não é compatibilidade transparente para clientes que concluem diretamente. Não se promete rollout misto ou clientes arbitrários.

**Evidência**: `openapi.yaml` referencia Status no filtro, Task/TaskReference e PUT; Progress é reutilizado em projetos e TaskPage. `docs/requirements.md` RF-08/RN-07 e `docs/user-stories.md` US-08 contradizem novo fluxo, conforme a própria spec. README e diagrama de architecture anunciam V1–V4; docs/database enumera três estados.

**Justificação**: conflito resolvido pelo autor para o incremento, não por edição silenciosa das fontes nesta fase. ER-06 propõe nove caminhos concretos diretamente afetados. `docs/constraints.md`, AGENTS, skill de contexto e copilot-instructions foram conferidos e não repetem regra vigente de três estados/RN-07 que exija alteração por este delta. Históricos mantêm proveniência.

**Alternativas rejeitadas**: copiar toda OpenAPI para contracts/, endpoint/versão novos, alterar docs agora, editar arquivos históricos ou alargar governação por formalidade.

## R-09 — Processo, helpers e validação

**Decisão técnica/processual**: setup-plan inspecionado, resolvedor composto e NoPersist; apenas cinco caminhos aprovados. Sem agents/context update ou continuidade automática.

**Evidência**: setup-plan chama Get-FeaturePathsEnv, cria diretório da feature já existente e grava IMPL_PLAN se faltar. common.ps1 suporta SPECIFY_FEATURE_NO_PERSIST; Resolve-TemplateContent resolve overrides/presets/extensões/core com replace/prepend/append/wrap. Ramo de manifests usa temporário, mas não há presets/extensões no inventário atual e não é percorrido. extensions.yml não encontrado antes da fase. Comando/output reais em plan.md: exit 0 e feature 002.

**Justificação**: não substituir resolver por cópia fixa nem executar helper com escritas adicionais. Reavaliar hooks no fecho; hook nunca autoriza Git/fase seguinte.

**Alternativas rejeitadas**: branch, persistir seleção novamente, hooks arbitrários, alterar agent context, gerar tasks ou executar testes para validar documentação.

## Conclusão e limites

Desenho pronto para decomposição, não implementação. Sem pressuposto funcional novo ou clarificação consequencial pendente. Execução de testes, revisão independente, ambiente E2E e reinício preservando dados são pendências de validação, não resultados desta pesquisa. speckit-analyze aguarda tasks.md autorizado; não foi executado. Caminho adicional, schema divergente ou requisito novo exige paragem/aprovação.
