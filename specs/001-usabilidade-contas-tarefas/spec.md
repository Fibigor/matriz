# Feature Specification: Usabilidade de contas, tarefas e participantes

**Feature Branch**: Não criada nem alterada; diretório `001-usabilidade-contas-tarefas` independente de branch.

**Created**: 2026-11-17

**Status**: Draft — especificação redigida; planeamento técnico e implementação não autorizados.

**Input**: Pedido do autor de 17-11-2026: mínimo de seis caracteres no registo, máximo interno de 200 sem divulgação na interface de registo, ações de detalhe e anexos com ícones, templates desativados após aplicação, seletores textuais, ações de guardar/eliminar lado a lado e revisão da adição de participantes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Adicionar uma conta pelo email conhecido (Priority: P1)

Como gestor, quero adicionar uma conta ativa pelo seu email completo, para colaborar sem descobrir ou introduzir um identificador interno.

**Why this priority**: O fluxo atual exige um identificador interno que torna a adição de contas recém-criadas pouco utilizável.

**Independent Test**: Registar uma conta fictícia, adicioná-la a um projeto existente através do email e confirmar que passa a conseguir aceder apenas a esse projeto e aos seus próprios projetos.

**Acceptance Scenarios**:

1. **Given** uma conta ativa recém-criada e um gestor de projeto, **When** o gestor introduz o email completo e confirma a adição, **Then** a conta passa a membro, sem obter gestão nem acesso a outros projetos.
2. **Given** o mesmo email com diferenças de maiúsculas ou espaços nas extremidades, **When** o gestor adiciona a conta, **Then** encontra a mesma conta segundo a normalização vigente no registo e login.
3. **Given** uma conta já participante, **When** o gestor volta a adicioná-la, **Then** continua a existir uma única participação e a interface não anuncia a criação de uma segunda.
4. **Given** email inexistente ou de conta inativa, **When** o gestor confirma, **Then** não há alteração e ambos recebem a mesma indicação de conta não elegível.
5. **Given** um membro sem gestão ou alguém sem acesso ao projeto, **When** tenta adicionar participantes, **Then** mantêm-se as recusas de acesso vigentes, mesmo fora da interface.
6. **Given** a área de participantes, **When** é apresentada, **Then** mostra nomes, funções e eventual inatividade, sem usar identificadores internos como informação ou exemplos para o utilizador; a adição pede email completo e não oferece diretório ou sugestões de contas.

---

### User Story 2 - Criar conta com uma palavra-passe de seis caracteres (Priority: P1)

Como visitante da demonstração, quero criar conta com uma palavra-passe de pelo menos seis caracteres e receber indicações simples de validação.

**Why this priority**: É uma alteração expressa à regra atual de criação de conta, que deve ser coerente em todos os pontos de validação.

**Independent Test**: Submeter palavras-passe com 5, 6, 200 e 201 pontos de código Unicode, mantendo os restantes campos válidos, e verificar mensagens e aceitação.

**Acceptance Scenarios**:

1. **Given** os restantes campos válidos e confirmação exata, **When** a palavra-passe tem 6 ou 200 pontos de código, **Then** o registo é aceite segundo o fluxo vigente de conta académica.
2. **Given** palavra-passe com 5 pontos de código, **When** é submetida, **Then** é recusada e a mensagem indica o mínimo de seis.
3. **Given** palavra-passe com 201 pontos de código, **When** é submetida, **Then** é recusada sem truncagem e a interface apresenta «Palavra-passe demasiado longa», sem indicar o valor 200.
4. **Given** o formulário inicial ou um erro de palavra-passe no registo, **When** é apresentado ao utilizador, **Then** a ajuda mostra «Mínimo de 6 caracteres» e nenhum texto de registo divulga o máximo.
5. **Given** espaços ou símbolos representados por vários elementos de texto internos, **When** se conta o comprimento, **Then** contam pontos de código Unicode sem remover espaços nem exigir composição.
6. **Given** criação aceite, **When** o utilizador regressa ao login, **Then** mantêm-se a mensagem de confirmação, ausência de login automático e ausência de transporte ou armazenamento da palavra-passe entre formulários.

---

### User Story 3 - Usar um template específico sem reaplicação acidental (Priority: P2)

Como participante, quero aplicar o template do tipo selecionado uma vez durante a edição, para estruturar a descrição sem a substituir repetidamente por engano.

**Why this priority**: Protege o texto em edição e torna explícita a relação entre tipo e template.

**Independent Test**: Numa criação e numa edição, percorrer tarefa, bug e melhoria, aplicar os respetivos templates e cancelar uma confirmação de substituição.

**Acceptance Scenarios**:

1. **Given** tipo tarefa, bug ou melhoria, **When** o utilizador aplica o template, **Then** recebe o template específico já existente para esse tipo, distinto dos outros dois.
2. **Given** aplicação efetiva de template, **When** o utilizador continua no mesmo tipo, **Then** «Aplicar template» fica cinzento e desativado, mesmo que edite ou apague manualmente a descrição.
3. **Given** um tipo com template aplicado durante a edição atual, **When** muda para outro tipo ainda não aplicado, **Then** a ação volta a estar disponível, mas a descrição não muda automaticamente.
4. **Given** aplicação anterior no tipo tarefa e mudança para bug, **When** regressa a tarefa, **Then** a ação continua desativada para tarefa nessa edição.
5. **Given** descrição não vazia, **When** cancela a confirmação de substituição, **Then** conserva a descrição e pode voltar a tentar aplicar esse template.
6. **Given** início de uma nova criação após sucesso ou reabertura posterior da tarefa, **When** começa essa nova edição, **Then** o controlo das aplicações anteriores é reiniciado; não há registo permanente por tarefa.
7. **Given** um rascunho aberto, **When** alterna entre painel e página ou recebe atualização externa, **Then** não perde o rascunho nem reinicia indevidamente o controlo de aplicações dessa edição.

---

### User Story 4 - Distinguir navegação textual e ações do detalhe (Priority: P2)

Como participante, quero reconhecer claramente as ações do detalhe e os seletores de edição e atividade, para navegar sem confundir controlos com ações de gravação.

**Why this priority**: Melhora a leitura visual sem alterar os fluxos de trabalho nem as permissões.

**Independent Test**: Abrir uma tarefa em painel e página, usar os controlos por rato e teclado, alternar os modos de texto e verificar o alinhamento das ações.

**Acceptance Scenarios**:

1. **Given** detalhe aberto, **When** observa a barra superior, **Then** as ações de página completa e fecho são representadas por ícones de maximizar e X, alinhados à direita, sem os antigos textos visíveis.
2. **Given** um ícone de fecho ou maximização, **When** recebe foco ou é consultado por tecnologia de apoio, **Then** tem um nome acessível que identifica a ação; ativá-lo mantém a navegação e proteção de rascunhos existentes.
3. **Given** descrição ou comentário em edição, **When** observa os modos disponíveis, **Then** vê «Editar» e «Pré-visualizar» em texto a negrito e sublinhado, sem fundo, moldura ou relevo de botão.
4. **Given** a secção de atividade, **When** observa as vistas, **Then** «Comentários», «Histórico» e «Toda a atividade» têm o mesmo tratamento textual, mantêm a seleção percetível e não alteram a paginação ou filtragem vigentes.
5. **Given** qualquer seletor textual, **When** navega por teclado, **Then** pode focá-lo e ativá-lo, com foco e estado selecionado percetíveis; mudar a aparência não remove a sua semântica interativa.
6. **Given** o editor da tarefa em desktop ou móvel, **When** observa as ações finais, **Then** «Guardar tarefa» e «Eliminar tarefa» aparecem lado a lado, sem sobreposição ou deslocamento horizontal da página, preservando a distinção destrutiva e a confirmação.

---

### User Story 5 - Gerir anexos através de ícones junto aos metadados (Priority: P2)

Como participante, quero retirar, descarregar ou eliminar um anexo com ícones junto à sua identificação, para tornar a lista mais compacta.

**Why this priority**: Uniformiza ações de anexos selecionados e já guardados, incluindo comentários.

**Independent Test**: Selecionar ficheiros para tarefa e comentário, retirar um antes de enviar e consultar as ações de um anexo guardado como autor e como outro membro.

**Acceptance Scenarios**:

1. **Given** um ficheiro selecionado ainda não enviado, **When** consulta a sua linha, **Then** nome e tamanho são seguidos de um X que o retira apenas da seleção.
2. **Given** anexo direto ou de comentário já guardado, **When** consulta a sua linha, **Then** os metadados são seguidos da seta de descarga e, apenas se autorizado, do ícone de eliminação.
3. **Given** o ícone de eliminar um anexo guardado, **When** o ativa e cancela a confirmação, **Then** o ficheiro permanece; confirmar mantém as regras de eliminação atuais.
4. **Given** vários ficheiros, **When** navega pelos ícones por teclado ou tecnologia de apoio, **Then** distingue ação e ficheiro pelo nome acessível e não encontra botões de texto «Retirar», «Descarregar» ou «Eliminar» nestas linhas.
5. **Given** uma operação em curso ou uma falha, **When** consulta os anexos, **Then** mantém bloqueio de duplicação, mensagens de erro/sucesso e permissões existentes.

### Edge Cases

- Contar palavras-passe Unicode de 5/6/200/201 pontos, incluindo espaços e símbolos fora do plano básico; nunca cortar nem aparar o valor.
- Uma rejeição de comprimento devolvida pelo servidor também não deve revelar o máximo na interface de registo.
- Cancelar uma confirmação não consome a aplicação do template; guardar, falhar uma gravação ou atualizar dados externos não cria uma nova edição.
- Mudar tipo não altera a descrição; regressar a um tipo já aplicado mantém o bloqueio nessa edição.
- O estado de templates não é persistido nem partilhado entre tarefas; uma nova criação bem-sucedida inicia outro ciclo.
- Alternar painel/página preserva o rascunho e respetivo estado de interação; manter Escape, foco e proteção de saída.
- Nomes ou metadados longos de anexos não devem afastar as ações da linha nem criar sobreposição.
- Email conhecido não prova posse: preserva-se a limitação académica de contas sem confirmação de email, sem criar um fluxo de convite.
- Repetição ou concorrência de adição não duplica participação; acesso ao projeto continua dependente de participação atual.
- Manter os consumidores existentes que adicionam por identificador exato, sem permitir uma escolha ambígua entre email e identificador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O registo DEVE aceitar palavras-passe de 6 a 200 pontos de código Unicode e recusar valores fora desse intervalo, sem trim, truncagem ou novas exigências de composição.
- **FR-002**: A interface de registo DEVE mostrar apenas o mínimo de seis; para excesso de comprimento DEVE apresentar «Palavra-passe demasiado longa», incluindo quando a rejeição vem do servidor.
- **FR-003**: O fluxo de criação de conta e o login existente DEVEM conservar as restantes regras de RF-17/RN-20–22/US-20, alterando apenas o mínimo do registo e a apresentação do seu máximo.
- **FR-004**: O detalhe DEVE apresentar maximizar e fechar como ícones alinhados à direita, mantendo nomes acessíveis, navegação e proteção de rascunhos.
- **FR-005**: Criação e edição de tarefas DEVEM reutilizar os três templates específicos atuais, com aplicação manual e confirmação antes de substituir descrição não vazia.
- **FR-006**: Cada tipo DEVE poder ter o seu template aplicado no máximo uma vez por edição/criação; aplicação confirmada desativa e acinzenta o controlo nesse tipo. Cancelar confirmação não conta. Mudar tipo não aplica texto automaticamente.
- **FR-007**: O controlo de aplicações DEVE reiniciar apenas numa nova edição/criação, não numa atualização externa nem numa alternância painel/página; não é persistido como atributo da tarefa.
- **FR-008**: Os seletores de Markdown DEVEM usar «Editar» e «Pré-visualizar»; estes e os três seletores de atividade DEVEM ter aparência de texto a negrito e sublinhado, com foco, ativação por teclado e estado selecionado percetíveis.
- **FR-009**: Guardar e eliminar tarefa DEVEM aparecer lado a lado, preservando confirmação de eliminação, bloqueios durante submissão e distinção destrutiva.
- **FR-010**: Seleções de ficheiros e listas de anexos diretos/de comentário DEVEM apresentar ações por ícones após os metadados, sem perder nomes acessíveis específicos do ficheiro, confirmações ou permissões.
- **FR-011**: Apenas o gestor DEVE poder adicionar uma conta ativa ao projeto através do email completo normalizado pelas regras vigentes; não há diretório, pesquisa parcial, sugestões nem envio de convites.
- **FR-012**: Adição por email DEVE ser idempotente; contas inexistentes ou inativas DEVEM produzir a mesma indicação de não elegibilidade, sem conceder acesso ou privilégios.
- **FR-013**: O fluxo de participantes DEVE apresentar nome, função e eventual inatividade, substituindo exemplos e introdução de identificadores internos por email completo na interface.
- **FR-014**: A integração existente de adição por identificador DEVE continuar compatível; cada pedido de adição DEVE identificar a conta por exatamente um critério, email completo ou identificador.
- **FR-015**: As alterações DEVEM preservar permissões de projeto e anexos, confirmação de eliminações, proteção de sessão e escritas, erros explícitos e conservação de rascunhos.

### Key Entities *(include if feature involves data)*

- **Conta**: Conta local existente, com nome, email e estado ativo; pode ser localizada por email completo exclusivamente para a adição autorizada.
- **Participação**: Associação única entre conta e projeto; o gestor continua a ser o único responsável pela gestão de participantes.
- **Edição de tarefa**: Rascunho atual e conjunto transitório dos tipos cujos templates foram aplicados; não constitui um novo dado permanente da tarefa.
- **Anexo**: Ficheiro selecionado ou guardado, identificado por metadados; as ações continuam dependentes do estado e da autorização vigentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em quatro casos de fronteira com os restantes dados válidos, os comprimentos 6 e 200 são aceites e 5 e 201 recusados; nenhum texto de registo revela o máximo.
- **SC-002**: Uma conta fictícia recém-criada pode ser adicionada a um projeto por email, iniciar sessão e aceder ao projeto; repetir a adição mantém exatamente uma participação e nenhum acesso adicional.
- **SC-003**: Os três tipos apresentam os seus templates distintos em criação e edição; cada template pode ser aplicado uma única vez por edição, com cancelamento e mudança de tipo a respeitar os cenários definidos.
- **SC-004**: Os cinco seletores textuais pedidos são reconhecíveis sem aparência de botão, utilizáveis por teclado e com seleção percetível; «Escrever» deixa de aparecer como modo de edição.
- **SC-005**: Fechar e maximizar ficam à direita; guardar e eliminar ficam lado a lado; as linhas de anexos apresentam apenas ações por ícones após os metadados, em desktop e móvel sem sobreposição ou deslocamento horizontal.
- **SC-006**: Todos os ícones de ação têm nome acessível e cada ação de anexo identifica o ficheiro; cancelar saída ou eliminação mantém os dados e rascunhos aplicáveis.

## Assumptions

- **Fontes canónicas**: `docs\requirements.md` (RF-04, RF-14, RF-16, RF-17; RN-01–04, RN-17–18 e RN-20–22), `docs\constraints.md`, `docs\user-stories.md` (US-04, US-16–17, US-19–20) e `openapi.yaml`. Este documento descreve só o delta proposto, não substitui nem duplica integralmente essas fontes.
- **Decisões do utilizador nesta sessão**: escolheu adicionar por email completo sem diretório; escolheu permitir o template de outro tipo ainda não aplicado, mantendo o bloqueio nos tipos já aplicados; confirmou ocultar o número máximo inclusive nos erros do registo.
- **Aprovação recebida**: «Aprovar a especificação nestes caminhos», autorizando apenas este `spec.md`, `checklists\requirements.md` e `.specify\feature.json`. Aprovar esta fase não autoriza plano técnico, tarefas, implementação ou edição canónica.
- **Proposta apresentada e aceite para especificação**: manter compatibilidade de adição por identificador na integração existente, sem continuar a exigi-lo na interface; não persistir o estado de aplicação de templates; mostrar nomes e funções em vez de IDs na área de participantes.
- **Templates existentes**: manter os conteúdos específicos atuais de tarefa (objetivo/passos/critérios), bug (reprodução/esperado/obtido) e melhoria (problema/proposta/critérios); não criar um gerador ou catálogo adicional.
- **Âmbito do limite oculto**: refere-se ao registo solicitado; não altera a compatibilidade das palavras-passe antigas nem as regras ou mensagens específicas do login.
- **Exclusões**: sem novas permissões, diretório de contas, convites, mudança de gestor, alteração de seed/IDs de contas existentes, dependências, migrations, serviços externos, instalação, publicação ou produção.
- **Evidência**: análise por leitura, sem testes executados nesta fase. `docs\verification.md`, na secção «Execução local autorizada do registo e revisão por leitura — 17-11-2026», contém execução posterior ao bloqueio T4 descrito noutros documentos; é evidência histórica relatada, não validação deste incremento.
- **Fases seguintes**: plano técnico, tarefas e análise cruzada requerem os respetivos caminhos e aprovações. Não existem ainda `plan.md` nem `tasks.md` desta feature.
