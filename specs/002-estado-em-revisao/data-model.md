# Data model — delta «Em revisão»

Proposta de desenho para [spec.md](spec.md), não schema implementado.
Referências canónicas: [dados](../../docs/database.md),
[regras RN-05/08/09/13–16/19](../../docs/requirements.md) e
[OpenAPI](../../openapi.yaml). Não reproduz o schema completo.

## 1. Tarefa: domínio de estado

| Aspeto | Atual observado | Delta proposto |
|---|---|---|
| Campo persistido | task.status, VARCHAR(20), NOT NULL | Mesmo campo/tipo; novo valor IN_REVIEW |
| Valores | TODO, IN_PROGRESS, DONE | TODO, IN_PROGRESS, IN_REVIEW, DONE |
| Inicial | DEFAULT TODO | Sem alteração |
| Motivo | close_reason opcional, só DONE | IN_REVIEW exige null como os demais não-DONE |
| Versão/datas | PUT aceite incrementa versão/updated_at | Sem alteração; recusa não altera nenhum deles |
| Identidade e restantes atributos | UUID lógico, chave MAT, projeto fixo, tipo/peso etc. | Sem alteração ou reclassificação retroativa |

Sem reviewerId, tabela de aprovações, timestamp dedicado, aprovação por pessoa
distinta ou estado paralelo. A evidência de mudança usa histórico existente;
não é esse histórico que autoriza DONE.

## 2. Matriz de transições

Toda a matriz depende de participante ativo autorizado, versão atual, validação
dos campos e transação/lock de projeto existentes. Origem é estado
**persistido** lido sob essa proteção, não seleção intermédia do cliente.

| Origem \ destino | TODO | IN_PROGRESS | IN_REVIEW | DONE |
|---|---|---|---|---|
| TODO | Manter | Permitir | Permitir | Recusar: falta revisão |
| IN_PROGRESS | Permitir | Manter | Permitir | Recusar: falta revisão |
| IN_REVIEW | Permitir | Permitir | Manter | Permitir se bloqueadores diretos DONE |
| DONE | Reabertura protegida | Reabertura protegida | Reabertura protegida | Manter, sem exigir revisão |

Reabertura protegida: nenhum dependente direto DONE; limpar motivo. Revisão
abandonada não altera a matriz: TODO/IN_PROGRESS→DONE continua recusado.
Bloqueadores pendentes não impedem entrar/manter revisão. Bloqueador em
revisão continua não-DONE; não permite concluir dependente nem criar
BLOCKS desse bloqueador para tarefa já DONE.

Manter estado não é nova entrada: PUT válido continua a incrementar versão;
sem mudanças efetivas, não emite evento. DONE→DONE preserva motivo omitido;
entrada IN_REVIEW→DONE sem motivo dá null; motivo não null em revisão é 422.
Sem exigência de atribuição, gestor ou pessoa diferente.

## 3. Evolução física futura

Única migration proposta:
`backend/src/main/resources/db/migration/V5__task_in_review.sql`.

V1 real (V1__initial_schema.sql) declara CHECK inline sem nome.
No PostgreSQL deste schema o nome gerado esperado é task_status_check;
confirmá-lo no catálogo do teste V4→V5. V5 apenas substitui esse CHECK pelo
domínio de quatro estados, mantendo nome estável. Não contém conversões de
linhas, mudanças de default ou SQL de implementação neste artefacto.

Preservar task_close_reason_status de V4. Não alterar V1–V4, Flyway
history/checksums antigos, colunas, índices, chaves, relações, bytes de
anexos ou conteúdo do histórico. Se catálogo não corresponder à cadeia
observada, parar e reportar, sem heurística para eliminar outra constraint.

### Compatibilidade e verificação futura

1. Cadeia limpa V1→V5: default TODO e persistência de IN_REVIEW; valor
   desconhecido continua rejeitado pela DB.
2. Em schema até V4, preparar dados fictícios nos três estados, DONE com motivo
   e versões/datas distintas, relações e histórico existente.
3. Capturar tarefas completas, relações e eventos; migrar V5 e comparar:
   mesmos valores/identidades/datas/versões/chaves/conteúdo; zero backfill.
4. V5 é única migration nesse upgrade; repetição executa zero. Depois,
   leitura/escrita de revisão funciona e constraint de motivo mantém-se.
5. Teste histórico V3→V4 fixa target 4 no segundo Flyway; não transformar essa
   prova de V4 em prova de V5 sem cenário próprio.

Sem plano de downgrade destrutivo ou rollout operacional autorizado.

## 4. Progresso do projeto: apenas derivado

Delta DTO, não tabela: ApiModels.Progress e frontend/src/types.ts ganham
inReview obrigatório, inteiro não negativo (long no servidor, number no
frontend), ao lado de todo/inProgress/done.

ProjectService agrega todas as tarefas do projeto, contando IN_REVIEW.
Inputs.progress recebe quatro contagens:

- total = todo + inProgress + inReview + done;
- completedPercent = 0 se total=0; senão 100×done/total arredondado HALF_UP
  para inteiro, como atualmente;
- todo DONE conta, sem ponderação por peso ou motivo de fecho.

Uma tarefa por estado: total=4, todo=1, inProgress=1, inReview=1, done=1,
completedPercent=25. Projeto vazio: todas contagens zero, 0% e «Sem tarefas».
Preservar arredondamentos 1/8→13%, 1/3→33%, 2/3→67%.

Propagar a ProjectView em listagem/detalhe/criação/edição que o devolvam e aos
dois agregados de TaskPage (project.progress e progress).
Filtros afetam items/totalItems; paginação não muda contagens globais.
Não criar cache/coluna de contagem, ponderação ou agregado por página.

## 5. Histórico e relações

task_activity.payload já representa mudanças de status como valores tipados
text em TASK_UPDATED. IN_REVIEW pode ser origem/destino desses valores,
com ator/data atuais e sem alterar formato, enum de eventos ou permissões.
Nenhum evento de revisão retroativo para tarefas antigas.

Revisão efetiva e conclusão são duas gravações confirmadas, portanto dois
incrementos/eventos de mudança quando realizados; não simular ambos num
único PUT. Recusa não grava evento nem altera versão.

Relações continuam nos mesmos modelos. TaskReference.status reconhece novo
valor. Comparações DONE/não-DONE de TaskLinkService continuam adequadas;
sem nova topologia ou campos.

## 6. Estado local de edição, não persistência adicional

Editor precisa de snapshot seguro do estado persistido associado à versão
de base, separado de values.status. Não vai para DB/JSON/storage.
Só base IN_REVIEW ou DONE habilita escolher DONE; revisão escolhida mas não
guardada não habilita conclusão. Save confirmado avança base; erro mantém
rascunho/base. Refetch externo com dirty não promove base.

Reconhecimento local de atribuição/relação só avança base quando identidade
e previousVersion correspondem, preservando campos editáveis; não confundir
último objeto recebido com base confirmada. Recuperação que substitui
rascunho continua a exigir confirmação explícita.

## 7. Limites

Persistência após reload é cenário API/E2E futuro; reinício preservando dados
requer autorização operacional específica. Nenhuma migration, teste ou
reinício foi executado nesta fase. Rastreabilidade FR/SC/caminhos em plan.md,
ER-02–ER-05.
