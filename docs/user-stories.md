# Matriz — Histórias e critérios de aceitação

## Backlog em vigor — ficha 03

O autor aprovou o âmbito alargado da ficha 03 em 29-10-2026. As histórias seguintes têm prioridade Must e substituem as regras incompatíveis do histórico da ficha 01. Cenários Given/When/Then são critérios de aceitação; a execução observada é registada separadamente em [verification.md](verification.md).

| História | Formulação | Critérios verificáveis |
|---|---|---|
| US-01 / RF-01 | Como utilizador ativo, quero autenticar-me com email e palavra-passe e consultar o meu perfil, para aceder de forma identificada. | Given credenciais válidas de uma conta local ativa, When inicio sessão, Then obtenho sessão no servidor e perfil; credenciais inválidas ou conta inativa dão o mesmo 401; cinco falhas por email/endereço em 15 minutos bloqueiam novas tentativas por 15 minutos; escrita sem CSRF dá 403; logout invalida a sessão; reinício não conserva sessão. |
| US-02 / RF-02 | Como utilizador ativo, quero criar um projeto, para organizar o trabalho. | Given nome válido, When crio, Then o servidor infere-me como gestor e participante; nome só espaços ou acima de 120 é recusado; descrição acima de 2 000 é recusada; dados permanecem após reinício. |
| US-03 / RF-03 | Como participante, quero listar/pesquisar os meus projetos e consultar o detalhe, para encontrar o trabalho autorizado. | Given projetos próprios e alheios, When pesquiso pelo nome, Then só os acessíveis aparecem; nomes repetidos não confundem identidades; paginação válida; projeto alheio e inexistente dão a mesma indisponibilidade. |
| US-04 / RF-04 | Como gestor, quero gerir membros do projeto, para controlar colaboração. | Given conta ativa existente, When adiciono duas vezes, Then há uma participação; membro não gere membros; gestor não pode ser removido; atribuições existentes bloqueiam remoção; removido deixa de ter acesso na API. |
| US-05 / RF-05 | Como participante, quero criar/consultar tarefas persistidas, para tornar visível o trabalho. | Given título válido, When crio, Then a tarefa aparece uma única vez sem reload, em TODO e sem responsáveis, prioridade MEDIUM por omissão; permanece após reload/reinício. Espaços, 201 pontos de código ou descrição acima de 2 000 são recusados sem perder o formulário. |
| US-06 / RF-06 | Como participante, quero editar a tarefa, para manter o trabalho atualizado. | Given versão atual, When guardo dados válidos, Then ficam persistidos e aumenta a versão; versão antiga dá 409 sem sobreposição; estado/prioridade fora do enum são recusados; falha não anuncia sucesso. |
| US-07 / RF-07 | Como gestor, quero associar vários responsáveis elegíveis, para partilhar a execução. | Given dois participantes ativos, When os atribuo, Then ambos aparecem; repetir associação não duplica; pessoa fora do projeto/inativa é recusada; membro não gere atribuições; retirar uma associação mantém as restantes. |
| US-08 / RF-08 | Como participante, quero atualizar estado/prioridade, para comunicar evolução e urgência. | Given tarefa concluída, When reabro, Then deixa de contar como concluída; concluir sem responsável é permitido; filtros TODO/IN_PROGRESS/DONE e LOW/MEDIUM/HIGH mostram só correspondências. |
| US-09 / RF-09 | Como participante, quero acompanhar contagens/progresso, para perceber o trabalho restante. | Given 2 concluídas em 5, Then 40%; 1/8 → 13%, 1/3 → 33%, 2/3 → 67%; sem tarefas → 0% e indicação de vazio. Agregados não mudam com página/filtro e atualizam após operações. |
| US-10 / RF-10 | Como gestor, quero editar/eliminar um projeto, e como participante eliminar tarefas, para corrigir o contexto de trabalho. | Given confirmação na interface e versão atual, When elimino projeto/tarefa autorizado, Then dependentes são removidos sem órfãos; cancelar a confirmação não envia eliminação; membro não elimina projeto; versões antigas dão 409. |
| US-11 / RF-11 | Como participante, quero comentar tarefas, para partilhar informação com a equipa. | Given conteúdo válido, When comento, Then autor/data são do servidor e permanecem após reload/reinício; conteúdo só espaços ou acima de 2 000 é recusado; não aceitar autor forjado do cliente. |

### Exceções transversais

Sessão expirada encaminha para login; erro recuperável conserva texto; durante submissão não são enviados pedidos repetidos. Nova tarefa pode não corresponder aos filtros ativos: manter os filtros e explicar o resultado, sem fingir que foi inserida no conjunto filtrado. Quando corresponde, apresentar a página onde foi inserida na ordenação estável. Comentários novos ficam visíveis na última página.

Nomes/títulos de 120/200 pontos de código e descrições com 2 000 são aceites; contagem é Unicode, não bytes nem unidades UTF-16. Comentários e atribuições não conferem acesso fora da participação no projeto.

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
