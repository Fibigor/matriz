# Feature Specification: Estado «Em revisão» obrigatório antes da conclusão

**Feature Branch**: Não criada; esta especificação não altera branches.

**Created**: 2026-11-18

**Status**: Draft — especificação elaborada na fase autorizada; planeamento e implementação não autorizados.

**Input**: User description: "quero adicionar um novo estado para as tarefas \"Em revisão\""

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submeter a revisão antes de concluir (Priority: P1)

Como participante ativo de um projeto, quero colocar uma tarefa em «Em revisão»
antes de a concluir, para distinguir trabalho por rever de trabalho concluído.

**Why this priority**: É o comportamento central solicitado; acrescentar apenas
um rótulo sem impedir a conclusão direta não satisfaz a decisão do autor.

**Independent Test**: Com tarefas próprias do projeto em cada estado, verificar
as entradas em «Em revisão» e as tentativas de conclusão, incluindo pedidos
diretos que não dependam das opções apresentadas na interface.

**Acceptance Scenarios**:

1. **Given** uma tarefa «Por fazer», **When** um participante ativo a coloca
   «Em revisão», **Then** a alteração é aceite, sem passagem obrigatória por
   «Em curso».
2. **Given** uma tarefa «Em curso», **When** um participante ativo a coloca
   «Em revisão», **Then** a alteração é aceite.
3. **Given** uma tarefa «Por fazer» ou «Em curso», **When** um participante tenta
   concluí-la diretamente, **Then** a operação é recusada com uma indicação
   explícita de que deve passar primeiro por «Em revisão», sem alterações
   parciais aos dados, versão ou histórico.
4. **Given** uma tarefa «Em revisão» sem bloqueadores pendentes, **When** um
   participante ativo a conclui, **Then** fica «Concluída», sem exigir gestor,
   responsável atribuído ou pessoa diferente de quem a submeteu a revisão.
5. **Given** uma tarefa que esteve «Em revisão» mas regressou a «Em curso» ou
   «Por fazer», **When** alguém tenta concluí-la, **Then** a passagem anterior
   por revisão não é suficiente: deve voltar a estar «Em revisão».
6. **Given** uma tarefa «Em revisão», **When** um participante a devolve a
   «Por fazer» ou «Em curso», **Then** a alteração é aceite pelas regras
   existentes de autorização e versão.

---

### User Story 2 - Identificar e contabilizar trabalho em revisão (Priority: P2)

Como participante, quero identificar e filtrar as tarefas «Em revisão» e
consultar a sua contagem, para acompanhar trabalho ainda não concluído.

**Why this priority**: O novo estado deve ser visível e não pode retirar tarefas
dos totais ou aumentar incorretamente o progresso.

**Independent Test**: Num projeto com uma tarefa de cada um dos quatro estados,
consultar listas, detalhe, relações, histórico, filtros e agregados, sem
depender da execução da jornada anterior para preparar esses dados.

**Acceptance Scenarios**:

1. **Given** uma tarefa «Em revisão», **When** é apresentada numa lista, detalhe,
   relação ou alteração de estado no histórico, **Then** o estado é reconhecido
   e tem uma apresentação legível e coerente com a nomenclatura da interface.
2. **Given** os controlos de alteração e filtragem de estado, **When** o
   participante os utiliza, **Then** encontra «Em revisão» entre «Em curso» e
   «Concluída», mantendo as restantes opções.
3. **Given** um projeto com uma tarefa de cada estado, **When** se consulta o
   progresso global, **Then** o total é quatro, existe uma tarefa contabilizada
   em cada estado e a percentagem concluída é 25%.
4. **Given** esse projeto, **When** se filtra por «Em revisão», **Then** apenas
   a tarefa nesse estado aparece nos resultados e os agregados globais mantêm
   os valores do cenário anterior, independentemente da paginação.
5. **Given** uma tarefa «Em revisão» guardada, **When** se volta a consultar
   após recarregar ou reiniciar a aplicação sem eliminar dados, **Then** o seu
   estado permanece «Em revisão».

---

### User Story 3 - Preservar tarefas existentes e regras de bloqueio (Priority: P1)

Como participante, quero que a introdução de «Em revisão» preserve os dados
existentes e as regras de dependências, para não perder trabalho nem concluir
tarefas ainda bloqueadas.

**Why this priority**: A revisão obrigatória não substitui as proteções atuais
de conclusão e reabertura, nem autoriza a alteração retroativa de tarefas.

**Independent Test**: Preparar tarefas existentes e relações de bloqueio e
verificar atualização dos dados, edição de concluídas e transições protegidas.

**Acceptance Scenarios**:

1. **Given** tarefas existentes nos três estados anteriores, incluindo
   «Concluída», **When** a alteração é introduzida, **Then** mantêm os seus
   estados, identificadores, versões, datas, relações e histórico; não se
   fabricam passagens anteriores por revisão.
2. **Given** uma tarefa já «Concluída», **When** se editam outros campos
   mantendo esse estado, **Then** não é exigida uma passagem artificial por
   «Em revisão» e mantêm-se as regras atuais do motivo de fecho.
3. **Given** uma tarefa «Em revisão» com um bloqueador direto não concluído,
   **When** se tenta concluí-la, **Then** continua a ser recusada.
4. **Given** um bloqueador direto «Em revisão», **When** se tenta concluir a
   tarefa que dele depende, **Then** esse bloqueador ainda conta como pendente.
5. **Given** uma tarefa com bloqueadores pendentes, **When** se coloca
   «Em revisão», **Then** a revisão é permitida: a restrição de bloqueadores
   continua a aplicar-se à conclusão, não à entrada em revisão.
6. **Given** um bloqueador concluído com um dependente direto concluído,
   **When** se tenta reabri-lo para «Em revisão», **Then** a operação continua
   a ser recusada, tal como nas restantes reaberturas protegidas.
7. **Given** uma tarefa concluída sem impedimento à reabertura, **When** regressa
   a «Por fazer», «Em curso» ou «Em revisão», **Then** deixa de contar como
   concluída e o motivo de fecho é limpo; para voltar a concluir, o estado
   imediatamente anterior tem de ser «Em revisão».

### Edge Cases

- Criar uma tarefa continua a colocá-la «Por fazer»; revisão não é um estado
  inicial alternativo.
- Uma edição que mantém o estado, incluindo «Concluída» para «Concluída», não
  constitui nova entrada em conclusão; conserva a semântica atual de versão
  e de emissão de histórico.
- Um valor de estado desconhecido continua a ser recusado.
- Uma tarefa «Em revisão» não admite motivo de fecho; a regra de motivo apenas
  para concluídas mantém-se.
- Uma conclusão de tarefa «Em revisão» exige simultaneamente a nova condição
  de origem e as regras vigentes de bloqueadores; não pode satisfazer apenas
  uma delas.
- Edições concorrentes, versões antigas e perda de participação continuam
  sujeitas às regras atuais; uma alteração entretanto efetuada não pode ser
  ultrapassada para concluir a tarefa.
- Projetos vazios mantêm total zero e progresso de 0%; tarefas «Em revisão»
  integram o total mas não o número de concluídas.
- Recarregar, mudar de layout ou abrir o detalhe por outro acesso não pode
  contornar a passagem obrigatória pela revisão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE acrescentar «Em revisão» aos estados reconhecidos
  das tarefas, preservando os três estados atuais e o estado inicial «Por
  fazer». Cobertura: histórias 1 e 2; casos de fronteira.
- **FR-002**: O sistema DEVE permitir nova entrada em «Concluída» apenas quando
  o estado imediatamente anterior seja «Em revisão»; uma revisão anterior
  entretanto abandonada não é suficiente. Cobertura: história 1, cenários 3–5.
- **FR-003**: O sistema DEVE permitir entrar em «Em revisão» a partir de
  «Por fazer» ou «Em curso» e regressar a esses dois estados a partir de revisão.
  As reaberturas a partir de «Concluída» conservam as restrições atuais.
  Cobertura: história 1, cenários 1, 2 e 6; história 3, cenários 6 e 7.
- **FR-004**: Qualquer participante ativo com permissão atual para editar a
  tarefa DEVE poder submetê-la a revisão e concluí-la a partir de revisão;
  o sistema NÃO DEVE introduzir um papel de revisor, aprovação por outra pessoa
  ou exigência de gestor ou responsável atribuído. Cobertura: história 1,
  cenário 4; regras vigentes de acesso.
- **FR-005**: O novo estado DEVE estar disponível e ser apresentado
  consistentemente nos seletores, filtros, listas, detalhe, relações e
  alterações de estado do histórico. Cobertura: história 2, cenários 1, 2 e 4.
- **FR-006**: Os agregados por estado DEVEM incluir uma contagem autónoma de
  «Em revisão»; o total DEVE incluir os quatro estados, mantendo apenas as
  tarefas concluídas no numerador do progresso. Filtros e paginação NÃO DEVEM
  alterar os agregados globais. Cobertura: história 2, cenários 3 e 4.
- **FR-007**: O sistema DEVE preservar as tarefas e o histórico existentes ao
  introduzir o estado, sem transformar tarefas concluídas em tarefas por rever
  nem simular uma revisão passada. Cobertura: história 3, cenários 1 e 2.
- **FR-008**: O sistema DEVE preservar as invariantes atuais de bloqueio,
  reabertura e motivo de fecho, considerando «Em revisão» um estado ainda não
  concluído. Cobertura: história 3, cenários 3–7 e casos de fronteira.
- **FR-009**: O estado guardado DEVE persistir entre consultas e reinícios que
  preservem os dados, e as mudanças efetivas de estado DEVEM continuar
  representadas pelo histórico existente. Cobertura: história 2, cenários 1 e 5.
- **FR-010**: O sistema DEVE impor a revisão obrigatória também fora da
  interface; uma recusa DEVE ser explícita, conservar o trabalho do
  participante e não alterar parcialmente dados, versão ou histórico.
  Cobertura: história 1, cenário 3; casos de fronteira de concorrência.

### Key Entities *(include if feature involves data)*

- **Tarefa**: conserva a sua identidade, projeto e restantes atributos;
  o seu estado passa a poder representar trabalho em revisão.
- **Progresso do projeto**: mantém o total e a percentagem de conclusão e
  distingue agora quatro contagens de estado, incluindo revisão.
- **Alteração de estado no histórico**: mantém autoria e momento e reconhece
  o novo estado como origem ou destino, sem criar revisões retroativas.
- **Relação de bloqueio**: conserva o seu significado atual; um extremo em
  revisão continua a ser considerado não concluído.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nos dois estados de origem «Por fazer» e «Em curso», todas as
  tentativas de conclusão direta são recusadas sem alteração parcial; em
  «Em revisão», a conclusão é aceite quando as restantes condições atuais
  estão satisfeitas.
- **SC-002**: Os dois percursos de entrada em revisão, a partir de «Por fazer»
  e de «Em curso», podem ser realizados por um participante ativo sem
  intervenção de outro papel; abandonar revisão e tentar concluir não
  dispensa nova entrada em revisão.
- **SC-003**: Num projeto com uma tarefa de cada estado, todos os pontos de
  consulta de progresso apresentam total quatro, uma tarefa em revisão e 25%
  concluído; o filtro de revisão devolve uma tarefa sem alterar esses agregados.
- **SC-004**: Em todas as superfícies da história 2, o estado de revisão é
  reconhecido sem valores em falta, rótulos desconhecidos ou perda do estado
  após voltar a consultar.
- **SC-005**: Todas as tarefas da amostra anterior à alteração, incluindo as
  concluídas, conservam estado, identidade, versões, datas e histórico ao
  introduzir o novo estado.
- **SC-006**: Todos os cenários de bloqueio e reabertura da história 3 mantêm
  os resultados definidos, incluindo considerar um bloqueador em revisão
  como pendente.

## Assumptions

### Decisões expressas do autor nesta conversa

- «Em revisão» é obrigatório imediatamente antes de uma nova conclusão.
- Qualquer participante ativo mantém a permissão de concluir; não é exclusiva
  do gestor.
- É permitido «Por fazer» para «Em revisão», sem exigir «Em curso».
- Foi aprovada apenas a escrita desta especificação, do respetivo checklist
  e do estado local de seleção da feature, não a implementação.

### Preservação das regras atuais

- As restantes transições mantêm-se disponíveis quando não contrariem a nova
  entrada obrigatória em conclusão ou as invariantes existentes de bloqueio.
- Editar uma tarefa já concluída sem mudar o estado não requer reabri-la.
- Tarefas existentes não são reclassificadas; não há revisão retroativa.
- Não são introduzidas novas metas de desempenho, retenção ou disponibilidade.

### Fontes, dependências e limites de âmbito

- Este documento descreve apenas o delta proposto. As fontes canónicas
  continuam a ser [requisitos](../../docs/requirements.md),
  [restrições](../../docs/constraints.md),
  [User Stories](../../docs/user-stories.md),
  [dados](../../docs/database.md) e [contrato atual](../../openapi.yaml).
- Há um conflito intencional a resolver na implementação futura: RF-08,
  RN-07 e US-08 atuais permitem concluir sem estado intermédio obrigatório.
  A decisão expressa desta feature propõe substituir essa permissão pela
  revisão obrigatória; os documentos canónicos ainda não foram alterados.
- As regras complementares relevantes são RF-05/06/09/15, RN-08/09/13–16/19
  e US-06/09/13/15/18; são referenciadas, não reproduzidas como novo contrato.
- O planeamento deve abranger persistência, edição, filtros, apresentação,
  agregados, histórico, compatibilidade dos dados e testes, bem como a
  atualização da documentação canónica diretamente afetada. Não está autorizado
  a modificar migrations já aplicadas.
- Ficam fora: novos papéis, revisores atribuídos, aprovação por pessoa
  diferente, notificações, integrações, mudança de autenticação ou permissões,
  produção, publicação de imagem ou release, commit, push e deploy.
- A arquitetura, os pormenores de contrato e os caminhos de implementação
  serão definidos numa fase de planeamento separada e sujeita a aprovação.
- Não há decisões de comportamento pendentes após as três respostas do autor.
  A qualidade desta especificação não comprova implementação ou testes.
