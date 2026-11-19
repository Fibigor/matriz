# Matriz — Histórias e critérios de aceitação

## Backlog em vigor — ficha 03, extensões V4 e registo académico

O autor aprovou o âmbito alargado da ficha 03 em 29-10-2026. As histórias seguintes têm prioridade Must e substituem as regras incompatíveis do histórico da ficha 01. Cenários Given/When/Then são critérios de aceitação; a execução observada é registada separadamente em [verification.md](verification.md).

**Suplemento vigente — 18-11-2026:** critérios atuais incorporam o delta aprovado pelo autor, não validação do cliente. T024 fechada, **28/28 tarefas**, full **11/11 PASS às 11:55–11:56 UTC** e revisão `review-t024-full-closure` PASS; B5/T028 PASS documentados. Aprovação visual humana de 09:42:49Z separada; backend 58/frontend 141/build anteriores e seleção 74/build da correção de foco não reexecutados nesta revisão. [Estado e limites](verification.md#estado-vigente--18-11-2026). O T4 de 17-11 permanece histórico.

**Feature 002 — 19-11-2026:** revisão obrigatória aprovada pelo autor e
implementada; [evidência parcial e gates pendentes](verification.md#feature-002).
T035–T040 documentais antecipadas com aprovação excecional, sem fechar G3–G5.
Os critérios atuais abaixo substituem conclusão direta. [Modelo do delta](../specs/002-estado-em-revisao/data-model.md)
e [OpenAPI](../openapi.yaml); US1/US2/US3 na spec 002 são jornadas locais,
**não** renumeração destas histórias canónicas. Resultados/visual de 001
acima permanecem anteriores, não aceitação desta feature.

| História | Formulação | Critérios verificáveis |
|---|---|---|
| US-01 / RF-01 | Como utilizador ativo, quero autenticar-me com email e palavra-passe e consultar o meu perfil, para aceder de forma identificada. | Given credenciais válidas de uma conta local ativa, When inicio sessão, Then obtenho sessão no servidor e perfil; credenciais inválidas ou conta inativa dão o mesmo 401; cinco falhas por email/endereço em 15 minutos bloqueiam novas tentativas por 15 minutos; escrita sem CSRF dá 403; logout invalida a sessão; reinício não conserva sessão. |
| US-02 / RF-02 | Como utilizador ativo, quero criar um projeto, para organizar o trabalho. | Given nome válido, When crio, Then o servidor infere-me como gestor e participante; nome só espaços ou acima de 120 é recusado; descrição acima de 2 000 é recusada; dados permanecem após reinício. |
| US-03 / RF-03 | Como participante, quero listar/pesquisar os meus projetos e consultar o detalhe, para encontrar o trabalho autorizado. | Given projetos próprios e alheios, When pesquiso pelo nome, Then só os acessíveis aparecem; nomes repetidos não confundem identidades; paginação válida; projeto alheio e inexistente dão a mesma indisponibilidade. |
| US-04 / RF-04 | Como gestor, quero adicionar uma conta pelo email completo conhecido e gerir membros, para controlar colaboração. | Given conta ativa, When adiciono por email completo (normalização vigente, incluindo Unicode/caixa/espaços), Then entra só nesse projeto como membro; repetir ou concorrer email/email ou email/userId mantém uma participação e 204 com confirmação neutra. API conserva userId exato: ambos/nenhum, mesmo um null, dão 422 em email; critério escolhido null/vazio/inválido é recusado, unknown dá 400. Inexistente/inativa têm o mesmo 422/field do critério, sem diretório/sugestões/convites. UI pede email, mostra nome/função/inatividade sem IDs. Membro não gere membros; gestor não pode ser removido; atribuições existentes bloqueiam remoção; removido perde acesso na API; 401/403/404/CSRF preservados. |
| US-05 / RF-05 | Como participante, quero criar/consultar tarefas persistidas, para tornar visível o trabalho. | Given título válido, When crio, Then a tarefa aparece uma única vez sem reload, em TODO e sem responsáveis, prioridade MEDIUM por omissão; permanece após reload/reinício. Espaços, 201 pontos de código ou descrição acima de 2 000 são recusados sem perder o formulário. |
| US-06 / RF-06 | Como participante, quero editar a tarefa, para manter o trabalho atualizado. | Given versão atual, When guardo dados válidos, Then ficam persistidos e aumenta a versão; versão antiga dá 409 sem sobreposição; estado/prioridade fora do enum são recusados; falha não anuncia sucesso. Selecionar revisão no mesmo rascunho não habilita DONE: só base persistida IN_REVIEW/DONE; refetch externo sujo não a promove. Save confirmado, refetch limpo ou recuperação explicitamente confirmada podem atualizar a base. Erro 409/422 conserva texto/base, sem escrita automática. |
| US-07 / RF-07 | Como gestor, quero associar vários responsáveis elegíveis, para partilhar a execução. | Given dois participantes ativos, When os atribuo, Then ambos aparecem; repetir associação não duplica; pessoa fora do projeto/inativa é recusada; membro não gere atribuições; retirar uma associação mantém as restantes. |
| US-08 / RF-08 | Como participante, quero atualizar estado/prioridade, para comunicar evolução e urgência. | Given TODO ou IN_PROGRESS, When guardo IN_REVIEW, Then permitido, inclusive TODO direto e com bloqueadores; posso devolver revisão a qualquer desses estados. Nova entrada DONE exige IN_REVIEW imediatamente persistido e todos os bloqueadores diretos DONE; TODO/IN_PROGRESS→DONE dá 422 status «Coloque a tarefa em revisão antes de a concluir.», sem mudar dados/versão/datas/histórico, mesmo com revisão abandonada no passado. Qualquer participante ativo autorizado pode rever/concluir sem atribuição, gestor ou pessoa distinta. DONE→DONE antiga mantém-se editável sem revisão fictícia; reabertura para TODO/IN_PROGRESS/IN_REVIEW sem dependentes diretos DONE limpa motivo e retira do numerador. Seletores/filtros TODO/IN_PROGRESS/IN_REVIEW/DONE nessa ordem e LOW/MEDIUM/HIGH mostram correspondências. |
| US-09 / RF-09 | Como participante, quero acompanhar contagens/progresso, para perceber o trabalho restante. | Given uma tarefa de cada estado, Then total=4, todo=1, inProgress=1, inReview=1, done=1 e 25%; só DONE conta no numerador. Given 2 concluídas em 5, Then 40%; 1/8 → 13%, 1/3 → 33%, 2/3 → 67%; sem tarefas → contagens zero, 0% e indicação de vazio. Filtro IN_REVIEW devolve uma tarefa, sem alterar agregados globais nos projetos e nos dois locais de TaskPage, independentemente da página. |
| US-10 / RF-10 | Como gestor, quero editar/eliminar um projeto, e como participante eliminar tarefas, para corrigir o contexto de trabalho. | Given confirmação na interface e versão atual, When elimino projeto/tarefa autorizado, Then dependentes são removidos sem órfãos; cancelar a confirmação não envia eliminação; membro não elimina projeto; versões antigas dão 409. |
| US-11 / RF-11 | Como participante, quero comentar tarefas, para partilhar informação com a equipa. | Given conteúdo válido, When comento, Then autor/data são do servidor e permanecem após reload/reinício; conteúdo só espaços ou acima de 2 000 é recusado; não aceitar autor forjado do cliente. |
| US-12 / RF-12 | Como participante, quero reconhecer a chave e classificar a tarefa, para clarificar o trabalho. | Given nova tarefa, Then UUID estável, MAT-n global, TASK e peso null; lacunas da sequência são permitidas. When edito, Then tipo TASK/BUG/IMPROVEMENT e peso null/1/2/3/5/8/13; campos omitidos type/weight preservam no PUT, weight null limpa, type null no PUT dá 422. |
| US-13 / RF-12/08/09 | Como participante, quero indicar motivo de fecho, para explicar DONE sem distorcer progresso. | Given DONE, Then motivo opcional COMPLETED/CANCELLED/DUPLICATE/WONT_DO; todos contam no progresso. DONE→DONE sem motivo enviado preserva; entrada em DONE sem motivo dá null; reabertura limpa; motivo não null em outro estado dá 422 sem escrita parcial. |
| US-14 / RF-13 | Como participante, quero ligar tarefas do mesmo projeto, para representar relações. | Given versões atuais de ambos, When crio RELATED, Then um link simétrico canónico e incremento de ambas; repetir de qualquer extremo dá 200 sem incremento/evento. BLOCKS/DUPLICATES mantêm direção; auto-relação dá 422, alvo alheio 404, qualquer versão antiga 409. DELETE incidente exige ambas as versões e incrementa ambas. |
| US-15 / RF-13/08 | Como participante, quero que bloqueios impeçam conclusão incoerente, para respeitar dependências. | Given A e C BLOCKS B, When B inicia ou entra em revisão, Then permitido; concluir B desde revisão persistida exige A e C DONE, IN_REVIEW num bloqueador ainda é pendente. Se B DONE, reabrir A/C inclusive para revisão ou criar novo bloqueador não DONE é 422; ciclo BLOCKS é 422. Remover link/eliminar bloqueador desbloqueia sem mudar estado de B; DUPLICATES não exige aciclicidade. |
| US-16 / RF-14/11 | Como participante, quero anexar ficheiros autorizados, para apoiar a tarefa/comentário. | Given até 5 diretos/tarefa ou 5/comentário, cada um até 4 MiB e formato válido, When envio files repetidos ou comentário multipart comment application/json, Then lote/comentário/evento são atómicos. Um ficheiro inválido reverte tudo; tamanho excedido dá 413, MIME de pedido/parte não suportado 415, formato/count semântico 422. JSON sem ficheiros devolve attachments vazio. |
| US-17 / RF-14 | Como participante, quero descarregar e como autor/gestor remover anexos, para controlar os ficheiros. | Given acesso atual, Then download binário com Content-Disposition attachment, nosniff e no-store. Membro não autor recebe 403 ao eliminar; autor removido/inativo não conserva acesso; tarefa/projeto alheio ou ficheiro não incidente dá 404. Remoção conserva metadados históricos e não muda versão/estado da tarefa. |
| US-18 / RF-15 | Como participante, quero consultar história atribuída e paginada, para compreender alterações. | Given alteração efetiva, Then ator/data e oldValue/newValue tipados text/number/userIds; status reconhecido usa rótulos incluindo Em revisão, desconhecido mantém fallback, priority/type não são traduzidos como estados. Título/descrição só flags, comentário só referência e metadados de anexos num evento. Repetição idempotente não emite evento; V4/V5 não inventam backfill nem revisão de DONE antigas; listas vazias/referências null; remoção de tarefa faz cascata da sua história. |
| US-19 / RF-16 | Como participante, quero Markdown/templates e detalhe acessível, para editar sem perder rascunhos. | Given descrição/comentário ≤2 000 pontos de código, Then pré-visualização básica sem HTML/imagens/GFM, só HTTP/HTTPS; três templates distintos por tipo, substituir texto exige confirmação, mudar tipo não o aplica. Aplicação efetiva desativa/acinzenta esse tipo no ciclo; apagar texto/regressar ao tipo não reativa e cancelar não consome. Save/falha/refetch limpo-sujo/recuperação/resize/maximização conservam; nova criação após sucesso ou fecho/reabertura efetiva/outra tarefa reiniciam sem persistir. Painel desktop da lista (>960 px), hash direto/móvel em página; mesmo detalhe, foco/Escape/inert e guards. Maximizar/X à direita, X standalone sem dupla confirmação; Editar/Pré-visualizar e três vistas de atividade textuais negrito/sublinhado, button/aria-pressed/teclado/foco/seleção; Guardar/Eliminar lado a lado. Anexos diretos/comentários: metadados→ícones com nome por ficheiro, retirar só seleção, eliminar só canDelete com confirmação; cancelar conserva dados/rascunhos. Geometria 1440/390/320 e teclado browser com evidência T024 no resumo vigente, não certificação integral. |
| US-20 / RF-17 | Como visitante da demonstração académica, quero criar uma conta e depois iniciar sessão explicitamente, para criar os meus projetos sem herdar acesso alheio. | Critérios AC-20.1–8 abaixo; RN-20–22. |

US-12–19 foram aprovadas pelo autor em **13-11-2026**; critérios não são prova de execução nem validação do cliente. [Relatórios armazenados e pendências](verification.md#extensões-de-tarefas--13-11-2026) distinguem as duas coisas.

### Registo académico — US-20

**Decisão do autor em 17-11-2026**, prioridade Must, RF-17/RN-20–22; não validação do cliente. [Estado de evidência e T4 pendente](verification.md#registo-académico--17-11-2026).

O rótulo T4 acima conserva o estado daquela fase, ultrapassado pela execução posterior de 17-11; o delta atual e o fecho T024 estão no [resumo vigente de 18-11](verification.md#estado-vigente--18-11-2026).

- **AC-20.1:** Given visitante no login, When escolhe “Criar conta”, Then formulário com nome/email/password/confirmação e foco no nome, rótulos e erros associados; aviso académico/conta ativa sem confirmação email. Voltar ao login devolve foco ao email.
- **AC-20.2:** Given nome aparado com 1 ou 120 pontos de código, email normalizado válido até 254 unidades UTF-16 e password com 6 ou 200 pontos, Then aceita; nome vazio/121, email inválido/255 ou password 5/201 são recusados sem truncagem. Testar ASCII, astral e espaços, inclusive só espaços e extremos; contagem bruta sem trim/composição. Ajuda/erro curto «Mínimo de 6 caracteres»; excesso «Palavra-passe demasiado longa», inclusive resposta servidor em resumo/campo, sem divulgar máximo em textos de registo/detail/errors e sem maxLength HTML. Confirmação exata é validada só na UI e não integra o JSON.
- **AC-20.3:** Given CSRF válido, When envia JSON `{displayName,email,password}` válido, Then 201 `application/json` exatamente `{"message":"Conta criada. Inicie sessão."}`, conta ativa com hash scrypt e UUID/username internos únicos gerados. Não responde com perfil/hash/password nem estabelece autenticação; `/api/auth/me` continua 401 para visitante.
- **AC-20.4:** Given sucesso, Then UI regressa ao login com confirmação, foco no email e password vazia, sem transportar/guardar password nem enviar login automático. When inicia sessão explicitamente, Then lista de projetos inicialmente vazia, sem participações/privilégios herdados; pode criar projeto pelas permissões atuais e terminar sessão.
- **AC-20.5:** Given email já existente, inclusive duas criações concorrentes ou variantes de caixa/espaços, Then um único registo e 409 explícito com erro `email`, sem alterar conta/hash existente. A divulgação de existência é aceite pelo autor; validações de campos dão 422 e `errors[{field,message}]`.
- **AC-20.6:** Given pedidos sem CSRF/válido alternados, Then ausente/inválido dá 403 sem consumir quota. Os primeiros cinco pedidos com CSRF válido por endereço remoto observado em 15 minutos contam independentemente do sucesso/erro, incluindo JSON/campos inválidos; seguinte dá 429 com `Retry-After`. Literal e `/api/auth/registe%72` partilham quota; mudar forwarded cliente não a contorna. Outro endereço tem quota própria, login independente; expiração da janela/restart limpa tentativas como descrito em RN-22. Não se promete IP visitante real atrás de proxy.
- **AC-20.7:** Given erro 422/409/429/indisponibilidade/transporte, Then não anuncia sucesso, conserva formulário para correção e não repete escrita automaticamente; erro de campo foca o campo. Durante submissão bloqueia duplicação e navegação. Falha de transporte avisa resultado incerto.
- **AC-20.8:** Given email Unicode aceite pela regex do backend, When submete registo e depois login por teclado, Then o mesmo validador da UI permite ambos sem rejeição HTML `type=email`; login continua compatível com passwords antigas curtas e máximo 200 pontos de código. Contas demo, sessão/CSRF e permissões existentes não são substituídas.

### Exceções transversais

Sessão expirada encaminha para login; erro recuperável conserva texto; durante submissão não são enviados pedidos repetidos. Nova tarefa pode não corresponder aos filtros ativos: manter os filtros e explicar o resultado, sem fingir que foi inserida no conjunto filtrado. Quando corresponde, apresentar a página onde foi inserida na ordenação estável. Comentários novos ficam visíveis na última página.

Nomes/títulos de 120/200 pontos de código e descrições com 2 000 são aceites; contagem é Unicode, não bytes nem unidades UTF-16. Comentários e atribuições não conferem acesso fora da participação no projeto.

Rascunho sujo conserva a base perante refetch externo; só resposta local reconhecida de atribuição/relação pode avançar a versão de base se corresponde à versão de partida, preservando campos editáveis. Conflito externo 409 mantém texto e substituir pela versão atual exige confirmação. Retry dos candidatos é consulta, não submissão; Enter sem destino não cria link. Pesquisa do seletor é da página explicitamente indicada, não pesquisa global da API; filtro visual de história não altera a paginação de todos os eventos.

<details>
<summary>Histórico da ficha 01 — histórias iniciais; responsabilidade única e exclusões substituídas pelo backlog acima</summary>

## Estado e convenções

As nove histórias são propostas do MVP descrito em [requirements.md](requirements.md). O autor autorizou documentar esse âmbito; as regras detalhadas RN-01 a RN-09 continuam sujeitas à revisão indicada em [constraints.md](constraints.md).

Todas as histórias têm prioridade **Must**. A ordem de apresentação não obriga a uma sequência de implementação. Os cenários Given / When / Then especificam comportamentos futuros; não são testes executados de uma aplicação existente.

Todos os exemplos usam contas e projetos fictícios. Salvo indicação contrária, a conta está ativa, a autenticação é válida e o recurso pertence a um projeto autorizado. “Participante” inclui o gestor e os membros do projeto.

## US-01 — Aceder à aplicação

**Como utilizador com conta ativa, quero iniciar e terminar o meu acesso à Matriz, para trabalhar com os projetos a que estou autorizado.**

Prioridade: Must. Rastreabilidade: RF-01, RN-01, RNF-01.

- **AC-01.1:** Given uma conta ativa previamente disponibilizada, When a pessoa apresenta uma prova de identidade válida pelo mecanismo que vier a ser aprovado, Then obtém acesso autenticado e pode consultar apenas os seus projetos.
- **AC-01.2:** Given uma pessoa não autenticada, When tenta consultar ou alterar um projeto ou tarefa, Then a operação é recusada sem revelar os dados do recurso.
- **AC-01.3:** Given uma autenticação inválida ou conta inativa, When é tentado o acesso, Then não é estabelecido acesso autenticado e é apresentada uma mensagem genérica, sem confirmar a existência da conta.
- **AC-01.4:** Given acesso autenticado, When o utilizador termina o acesso, Then esse acesso deixa de permitir novas operações protegidas e exige nova autenticação.

Exceção: o mecanismo concreto de identidade e o aprovisionamento de contas estão pendentes (Q-03); estes critérios não pressupõem palavras-passe, tokens ou um fornecedor.

## US-02 — Criar um projeto

**Como utilizador autenticado, quero criar um projeto, para organizar o trabalho de uma equipa num contexto próprio.**

Prioridade: Must. Rastreabilidade: RF-02, RN-02, RN-03, RNF-03.

- **AC-02.1:** Given nome e descrição válidos segundo RN-02, When o utilizador confirma a criação, Then existe um único projeto com esses dados, um identificador próprio e o criador como único gestor; não são adicionados outros membros.
- **AC-02.2:** Given um nome vazio ou apenas com espaços, When se tenta criar o projeto, Then a criação é recusada, o campo é identificado e os restantes dados introduzidos permanecem disponíveis para correção.
- **AC-02.3:** Given um nome com 120 caracteres após remoção de espaços nas extremidades e descrição com 2 000, When se confirma, Then os limites são aceites; com 121 ou 2 001, respetivamente, a criação é recusada sem truncar texto ou criar projeto.
- **AC-02.4:** Given um projeto existente chamado “Alfa”, When é criado outro com esse nome válido, Then ambos mantêm identificadores distintos e não são fundidos nem sobrepostos.

Caso-limite: nome com espaços nas extremidades é guardado sem esses espaços; descrição omitida é aceite.

## US-03 — Consultar os meus projetos

**Como participante, quero consultar os projetos em que participo e os seus detalhes, para encontrar o contexto do meu trabalho.**

Prioridade: Must. Rastreabilidade: RF-03, RN-01, RNF-01.

- **AC-03.1:** Given participação nos projetos “Alfa” e “Beta”, mas não em “Gama”, When se consultam os projetos acessíveis, Then “Alfa” e “Beta” estão disponíveis e “Gama” não é revelado.
- **AC-03.2:** Given participação num projeto, When se abrem os seus detalhes, Then são apresentados nome, descrição e participantes desse projeto, com acesso às suas tarefas e progresso.
- **AC-03.3:** Given ausência de projetos acessíveis, When se consulta a lista, Then é apresentada uma lista vazia e uma indicação de ausência de projetos, não uma falha nem projetos de outras pessoas.
- **AC-03.4:** Given um identificador de projeto alheio ou inexistente, When se tenta aceder diretamente ao projeto ou a uma das suas tarefas, Then não são devolvidos dados e a resposta apresentada não permite distinguir esses dois casos.

Exceção: os mesmos controlos aplicam-se a consulta de participantes e contagens, não apenas ao ecrã principal.

## US-04 — Gerir os membros do projeto

**Como gestor do projeto, quero adicionar e remover membros, para permitir colaboração apenas às pessoas autorizadas.**

Prioridade: Must. Rastreabilidade: RF-04, RN-01, RN-03, RN-04, RNF-01, RNF-05.

- **AC-04.1:** Given uma conta ativa da organização ainda não participante e o seu identificador exato, When o gestor a adiciona, Then essa conta passa a membro do projeto e consegue consultá-lo; não recebe permissões de gestor.
- **AC-04.2:** Given um membro já existente, When o gestor o adiciona novamente, Then não é criada outra participação e é indicado que já é membro.
- **AC-04.3:** Given um membro sem atribuições de tarefas no projeto, When o gestor confirma a remoção, Then a participação é removida e as operações seguintes desse membro sobre o projeto e as tarefas são recusadas, mesmo com autenticação ainda válida.
- **AC-04.4:** Given um membro responsável por qualquer tarefa do projeto, incluindo uma concluída, When é tentada a remoção, Then esta é recusada, as atribuições e participação são mantidas e o gestor é informado de que deve primeiro retirar ou substituir as atribuições.
- **AC-04.5:** Given o próprio gestor como alvo da remoção, When se tenta removê-lo, Then a operação é recusada e continua a existir um gestor.
- **AC-04.6:** Given um membro sem perfil de gestor, When tenta adicionar ou remover participantes, Then a operação é recusada e nenhuma participação é alterada.
- **AC-04.7:** Given um identificador de conta inexistente, inativa ou fora da organização, When o gestor tenta adicioná-la, Then não é criada participação e é apresentada a mesma indicação de conta não elegível, sem expor dados de diretório.

Caso-limite: se a conta-alvo passar a inativa antes da confirmação, a adição é recusada. Não existe registo automático de uma nova conta.

## US-05 — Criar e consultar tarefas

**Como participante, quero criar e consultar tarefas num projeto, para tornar visível o trabalho que precisa de ser realizado.**

Prioridade: Must. Rastreabilidade: RF-05, RN-01, RN-05, RN-09, RNF-02, RNF-03.

- **AC-05.1:** Given um projeto autorizado e título válido, When se confirma a criação, Then existe uma tarefa identificável nesse projeto, com o título normalizado, descrição opcional, estado “Por fazer” e sem responsável.
- **AC-05.2:** Given a tarefa criada, When outro participante consulta o projeto, incluindo numa nova sessão autorizada, Then encontra essa tarefa e os dados persistidos; a consulta dos detalhes apresenta título, descrição, estado e responsável ou “Sem responsável”.
- **AC-05.3:** Given título vazio, apenas com espaços ou acima de 200 caracteres após normalização, When se tenta criar, Then a operação é recusada sem criar tarefa, o campo inválido é identificado e o texto introduzido é conservado para correção.
- **AC-05.4:** Given título com 200 caracteres e descrição com 2 000, When se cria a tarefa, Then os limites são aceites; descrição com 2 001 é recusada sem truncar nem criar tarefa.
- **AC-05.5:** Given projeto inexistente ou não autorizado, When se tenta criar ou listar tarefas, Then a operação é recusada sem revelar dados, criar tarefas ou distinguir publicamente os dois casos.
- **AC-05.6:** Given projeto sem tarefas, When um participante consulta as tarefas, Then vê uma indicação de ausência de tarefas e pode iniciar a criação, sem serem criadas tarefas de exemplo automaticamente.

Caso-limite: duas tarefas com título igual são permitidas e mantêm identidades distintas.

## US-06 — Clarificar uma tarefa

**Como participante, quero editar o título e a descrição de uma tarefa, para manter a definição do trabalho correta e atualizada.**

Prioridade: Must. Rastreabilidade: RF-06, RN-05, RN-09, RNF-02, RNF-06.

- **AC-06.1:** Given uma tarefa existente e os dados atuais, When um participante guarda título e descrição válidos, Then uma nova consulta apresenta os novos textos, mantendo identidade, projeto, estado e responsável.
- **AC-06.2:** Given valores inválidos segundo RN-05, When se guarda, Then os dados persistidos anteriores são mantidos e os campos inválidos são identificados; não se aceita apenas parte da alteração.
- **AC-06.3:** Given duas pessoas que consultaram a mesma versão, When a primeira guarda e a segunda tenta guardar com os dados antigos, Then a segunda alteração é recusada, a primeira é preservada e é pedido que se consultem os dados atuais antes de tentar novamente.
- **AC-06.4:** Given falha ao persistir a alteração, When o participante tenta guardar, Then não é apresentada confirmação de sucesso, os dados persistidos anteriores mantêm-se e o utilizador recebe indicação da falha.

Exceção: a deteção de edição desatualizada aplica-se também às alterações de responsável e estado; o mecanismo técnico não está escolhido.

## US-07 — Definir o responsável

**Como gestor do projeto, quero atribuir, substituir ou retirar o responsável de uma tarefa, para tornar explícito quem acompanha a sua execução.**

Prioridade: Must. Rastreabilidade: RF-07, RN-06, RN-09.

- **AC-07.1:** Given uma tarefa e um participante ativo do mesmo projeto, When o gestor o atribui, Then a tarefa passa a ter exatamente essa pessoa como único responsável.
- **AC-07.2:** Given uma tarefa atribuída à pessoa A, When o gestor escolhe a pessoa B elegível, Then B substitui A e nunca ficam dois responsáveis.
- **AC-07.3:** Given uma tarefa atribuída, When o gestor retira o responsável, Then a tarefa fica sem responsável e mantém os restantes dados.
- **AC-07.4:** Given pessoa inativa, inexistente ou sem participação no projeto, When se tenta atribuí-la, Then a operação é recusada sem alterar a atribuição anterior.
- **AC-07.5:** Given um membro sem perfil de gestor, When tenta atribuir, substituir ou retirar o responsável, Then a operação é recusada e a atribuição mantém-se.

Casos-limite: o gestor pode atribuir a tarefa a si próprio; voltar a atribuir o responsável atual mantém uma única atribuição; uma edição desatualizada segue AC-06.3.

## US-08 — Atualizar o estado

**Como participante, quero alterar o estado das tarefas, para comunicar a evolução do trabalho à equipa.**

Prioridade: Must. Rastreabilidade: RF-08, RN-07, RN-09.

- **AC-08.1:** Given uma tarefa em qualquer um dos três estados, When um participante escolhe outro estado válido, Then a tarefa fica nesse estado, mantendo projeto, textos e responsável.
- **AC-08.2:** Given uma tarefa “Concluída”, When um participante a muda para “Em curso” ou “Por fazer”, Then a tarefa é reaberta e uma nova consulta do progresso deixa de a contar como concluída.
- **AC-08.3:** Given uma tarefa sem responsável em “Por fazer”, When um participante a muda diretamente para “Concluída”, Then a mudança é aceite, sem exigir atribuição ou estado intermédio.
- **AC-08.4:** Given estado diferente dos três definidos, When se tenta guardar, Then a alteração é recusada e o estado anterior mantém-se.
- **AC-08.5:** Given uma tarefa no estado selecionado, When se confirma novamente esse estado, Then não é criada outra tarefa e as contagens não aumentam.

Exceção: estado alterado sobre uma versão desatualizada segue AC-06.3; sem participação no projeto aplica-se RN-01.

## US-09 — Acompanhar o progresso

**Como participante, quero consultar o progresso do projeto, para perceber o trabalho concluído e o que continua por realizar.**

Prioridade: Must. Rastreabilidade: RF-09, RN-08, RN-09, RNF-01.

- **AC-09.1:** Given cinco tarefas, duas “Concluída”, uma “Em curso” e duas “Por fazer”, When se consulta o progresso, Then são apresentados total 5, contagens 2/1/2 nos respetivos estados e 40% concluído.
- **AC-09.2:** Given um projeto sem tarefas, When se consulta o progresso, Then são apresentados total 0, contagens 0 para cada estado, 0% e “Sem tarefas”, sem erro de divisão por zero.
- **AC-09.3:** Given três tarefas, uma concluída, When se consulta o progresso, Then são apresentados 33%; com duas concluídas, são apresentados 67%.
- **AC-09.4:** Given oito tarefas, uma concluída, When se consulta o progresso, Then são apresentados 13%, verificando o arredondamento de 12,5% para cima.
- **AC-09.5:** Given um projeto com todas as tarefas concluídas, When se consulta o progresso, Then são apresentados 100%; se for criada uma nova tarefa ou reaberta uma existente, uma nova consulta reflete o novo total e a nova percentagem.
- **AC-09.6:** Given tarefas em vários projetos, When se consulta o progresso de um deles, Then só as tarefas desse projeto são contadas, independentemente da página de tarefas apresentada.

Limitação: a percentagem não representa esforço estimado, horas consumidas nem desempenho de uma pessoa.

</details>
