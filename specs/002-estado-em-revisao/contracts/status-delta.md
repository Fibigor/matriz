# Contrato proposto — delta de estado e progresso

Este documento contém **somente o delta proposto** da feature 002. A fonte
canónica continua a ser [openapi.yaml](../../../openapi.yaml); não é API
alternativa nem comportamento já implementado.
Requisitos: [spec.md](../spec.md), FR-001–010; desenho:
[data-model.md](../data-model.md); caminhos/dependências:
[plan.md](../plan.md), ER-01–ER-07.

## C-01 — Estado

Expandir components.schemas.Status para TODO, IN_PROGRESS, IN_REVIEW, DONE,
nesta ordem de apresentação. IN_REVIEW corresponde a «Em revisão».
Preservar TODO como inicial: criação não recebe estado inicial selecionável.

Referências existentes a Status propagam valor a Task, TaskReference, filtro
de listagem e PUT. Sem endpoint/rota/verbo, parâmetro adicional, reviewer ou
permissão nova. Histórico mantém payload text existente para ChangeField.status.

## C-02 — Escrita e origem imediatamente persistida

No PUT existente `/projects/{projectId}/tasks/{taskId}` sob base `/api`,
nova entrada DONE exige estado anterior persistido IN_REVIEW.
TODO→DONE e IN_PROGRESS→DONE são recusados, mesmo que a tarefa tenha estado
em revisão no passado. DONE→DONE é manutenção, não nova entrada.

TODO→IN_REVIEW e IN_PROGRESS→IN_REVIEW são permitidos sem atribuição,
IN_PROGRESS prévio, gestor ou pessoa diferente. Revisão pode regressar aos
dois estados. Reaberturas DONE continuam sujeitas a BLOCKS.

Sessão/CSRF, autorização do recurso, conta/participação ativa, versão e
restantes campos obrigatórios do PUT não mudam. Estado anterior é lido pelo
servidor após lock/revalidação e versão, nunca aceite do cliente.
Selecionar revisão e logo DONE no mesmo rascunho não basta: o único pedido
DONE continua recusado para base TODO/IN_PROGRESS.

### Recusa semântica

Resposta existente 422 application/problem+json, components.schemas.Problem,
com errors no campo status. Mensagem proposta:
«Coloque a tarefa em revisão antes de a concluir.», no detail e mensagem
de campo pelo mecanismo atual ApiErrors. Sem novo formato/código de erro.
Recusa não altera tarefa, versão, datas ou histórico.

Versão antiga continua 409; 401/403/404/CSRF preservados. Não trocar erro de
acesso/versão por 422 nem redefinir prioridade de todos os campos inválidos.
Para pedido válido/atual de entrada direta, recusa de revisão precede a
verificação de bloqueadores, dando indicação acionável; IN_REVIEW→DONE ainda
passa pela proteção BLOCKS existente.

## C-03 — Motivo, bloqueadores e histórico

Sem mudança de campos/formatos:

- Só DONE admite closeReason não null; revisão é não concluída.
- Omissão de motivo em DONE→DONE preserva; entrada DONE sem motivo dá null;
  reabertura limpa; valores inválidos continuam recusados.
- Para concluir desde revisão, todos os bloqueadores diretos têm de estar
  DONE. Revisão do bloqueador não basta. Entrar em revisão não exige isso.
- Reabrir bloqueador DONE para IN_REVIEW com dependente direto DONE é recusado.
  Inserir bloqueador não-DONE para dependente DONE continua recusado.
- Eventos usam oldValue/newValue tipados existentes, autoria/data; sem backfill,
  evento de aprovação ou API de escrita de história.

## C-04 — Progress aditivo e global

Adicionar propriedade **obrigatória** inReview, inteiro mínimo zero,
a components.schemas.Progress, ao required e exemplos relevantes.
Manter todos os campos existentes e os respetivos significados:

| Campo afetado | Delta |
|---|---|
| inReview | Nova contagem de tarefas IN_REVIEW |
| total | Soma de todo + inProgress + inReview + done |
| completedPercent | Só done no numerador; HALF_UP inteiro; vazio 0 |

Exemplo **apenas do agregado delta**, não resposta completa:

```json
{"total":4,"todo":1,"inProgress":1,"inReview":1,"done":1,"completedPercent":25}
```

Todos os locais com Progress recebem campo: ProjectView nos endpoints
existentes e TaskPage tanto em project.progress como em progress.
GET de tarefas com status=IN_REVIEW filtra items/pagination; agregados
permanecem globais, independentemente do filtro, prioridade ou página.

## C-05 — Apresentação

Seletores de edição/filtro e labels comuns apresentam revisão entre
«Em curso» e «Concluída». Lista/detalhe/relações e old/new de status na história
reconhecem valor; tradução localizada a status, sem transformar outros valores
ou payloads.

Editor explica que é necessário guardar revisão primeiro e só disponibiliza
DONE para base persistida IN_REVIEW/DONE. Não altera status automaticamente,
não submete revisão por si nem descarta campos/rascunhos após 422/409.
Base/versão não avançam por refetch externo enquanto dirty.

Dashboard mostra quatro contagens/barras/cartões, sem corte em SVG, com
labels/descrição e layout estreito legíveis. Só cor não identifica estado.
Build não prova geometria, teclado ou aprovação visual.

## C-06 — Compatibilidade e alinhamento futuro

Dados antigos e DONE existentes não são convertidos; DONE→DONE continua
aceite com regras atuais. Contagem nova é aditiva no JSON, mas enum expandido
e proibição de conclusão direta alteram pressupostos de clientes antigos.
Cliente/servidor/OpenAPI devem ser alinhados coordenadamente; sem promessa de
rollout misto ou clientes externos não inventariados.

Na implementação aprovada, atualizar enum, Progress/required/exemplos,
descrição PUT/422 e semântica de transições na OpenAPI existente.
RF-08/RN-07/US-08 canónicos terão de substituir conclusão direta pelo novo
pré-requisito; caminhos completos em ER-06. Nenhuma fonte canónica foi
alterada por este contrato. Sem endpoints ou autenticação novos.

## Verificação futura

SC-001/002: HTTP direto, duas origens recusadas, revisão guardada aceite,
abandono recusado e permissões existentes.
SC-003: quatro tarefas/25%, filtro/paginação com globais constantes.
SC-004/005: leitura/persistência/labels e preservação de dados antigos.
SC-006: BLOCKS/motivo/reabertura mantidos. Ver [quickstart.md](../quickstart.md).
Nenhum desses critérios foi executado nesta fase.
