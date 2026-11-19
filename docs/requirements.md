# Matriz — Requisitos e âmbito funcional

## Especificação em vigor — ficha 03, extensões V4, registo e estado Em revisão

Em 29-10-2026 o autor aprovou implementar integralmente o âmbito da ficha 03 e as regras abaixo. Esta secção substitui as exclusões e a responsabilidade única da ficha 01; o levantamento original é conservado no histórico no final, não é uma segunda especificação em vigor. Não se presume validação com o cliente ou autorização de produção.

Stack escolhida: Java 21/Spring Boot, React/TypeScript e PostgreSQL, monólito modular. A autenticação da demonstração usa email e palavra-passe de contas locais ativas, hash scrypt, sessão Spring no servidor e CSRF. Em **17-11-2026**, o autor aprovou registo público exclusivamente académico, substituindo a exclusão anterior; não há recuperação de palavra-passe nem envio/confirmação de email. Esta decisão não é validação do cliente ou publicação da alteração.

**Suplemento vigente — 18-11-2026:** delta de usabilidade aprovado pelo autor: mínimo de registo 6, membros por email completo com compatibilidade `userId`, templates por ciclo e ações/seletores compactos. As regras abaixo incorporam esse delta. **T024 fechada, 28/28 tarefas**, full E2E **11/11 PASS às 11:55–11:56 UTC**, revisão independente `review-t024-full-closure` PASS; B5/T028 PASS documentados. Aprovação visual humana de 09:42:49Z separada. Backend 58/frontend 141/build anteriores e seleção 74/build da correção de foco não foram reexecutados nesta revisão. [Estado, proveniência e limites](verification.md#estado-vigente--18-11-2026).

**Incremento vigente — feature 002, 19-11-2026:** implementação aprovada pelo
autor em 18-11 às 23:33:19 UTC; revisão persistida obrigatória antes de nova
conclusão substitui a regra anterior RF-08/RN-07. Alinhamento documental
T035–T040 antecipado por aprovação excecional de 19-11 às 01:31:49 UTC,
sem aprovação G3 ou fecho. [Spec e decisões](../specs/002-estado-em-revisao/spec.md),
[modelo delta](../specs/002-estado-em-revisao/data-model.md) e
[OpenAPI canónico](../openapi.yaml). Os limites de fase nos artefactos da
feature são proveniência histórica. Implementado não significa aceitação:
[evidência e gates pendentes](verification.md#feature-002).
O fecho de 001 referido acima não valida 002 nem a imagem GHCR anterior.

| ID atual | Requisito | Prioridade |
|---|---|---|
| RF-01 | Autenticar por email e palavra-passe de conta local ativa, consultar perfil e terminar sessão Matriz. | Must |
| RF-02 | Criar projetos com proprietário inferido da sessão. | Must |
| RF-03 | Listar, pesquisar pelo nome e consultar apenas projetos acessíveis, com paginação. | Must |
| RF-04 | Gestor adiciona contas ativas por email completo conhecido e remove membros elegíveis; API mantém alternativa por userId exato, exclusivamente um critério por pedido. Participantes consultam nomes, funções e inatividade, sem IDs visíveis ou diretório de contas. | Must |
| RF-05 | Criar/listar/consultar tarefas persistidas, inicialmente TODO, com paginação e filtros pelos quatro estados TODO/IN_PROGRESS/IN_REVIEW/DONE e por prioridade. | Must |
| RF-06 | Participantes editam título, descrição, estado e prioridade com controlo de versão e origem persistida segura para concluir (RN-07). | Must |
| RF-07 | Gestor associa zero ou vários participantes ativos à tarefa, sem duplicados, e remove atribuições. | Must |
| RF-08 | Quatro estados TODO/IN_PROGRESS/IN_REVIEW/DONE; nova entrada DONE só desde IN_REVIEW imediatamente persistido, sem responsável/revisor obrigatório, sujeita a RN-07 e BLOCKS de RN-15. | Must |
| RF-09 | Painel e projeto apresentam quatro contagens globais (todo/inProgress/inReview/done), total e percentagem só de DONE, independentes da página/filtros. | Must |
| RF-10 | Gestor edita/elimina projetos; participantes eliminam tarefas; confirmar eliminação na interface. | Must |
| RF-11 | Participantes adicionam/listam comentários com autor autenticado e data do servidor. | Must |
| RF-12 | Identificar tarefas por chave global MAT-n estável; editar tipo, peso opcional e motivo de fecho opcional. | Must |
| RF-13 | Participantes criam/listam/removem relações RELATED/BLOCKS/DUPLICATES com controlo das duas versões. | Must |
| RF-14 | Adicionar/listar/descarregar anexos diretos ou de comentário; eliminar apenas como autor ou gestor participante. | Must |
| RF-15 | Consultar histórico paginado, com autoria/data e alterações tipadas; apresentar estados reconhecidos incluindo revisão, sem revisões retroativas nem API de edição/eliminação. | Must |
| RF-16 | Editar/pré-visualizar Markdown básico, aplicar templates fixos e usar detalhe partilhado painel/página com rascunhos protegidos. | Must |
| RF-17 | Criar conta pública académica ativa com nome, email e palavra-passe; confirmar apenas na UI e regressar ao login com mensagem, sem auto-login. | Must |

### Regras em vigor

- **RN-01:** conta ativa e participação aplicável verificadas no servidor nas operações protegidas; CSRF/login/registo são públicos, com CSRF obrigatório nos POST. Projeto alheio e inexistente não são distinguíveis (404). Participante sem permissão de gestão recebe 403. Não confiar em botões escondidos.
- **RN-02:** nome de projeto 1–120 e título de tarefa 1–200 pontos de código Unicode após remover espaços nas extremidades; descrições opcionais até 2 000, sem truncagem. Nomes repetidos são permitidos.
- **RN-03:** criador é o único gestor e participa no projeto; não há promoção, transferência ou remoção do gestor. Só gestor gere projeto, membros e atribuições. Qualquer conta ativa pode criar projeto.
- **RN-04:** membros sem atribuições podem ser removidos; atribuições de tarefas concluídas também bloqueiam remoção. Remoção retira acesso nas operações seguintes. Só gestor adiciona por email completo normalizado como RN-20, sem pesquisa parcial/sugestões/convites. API conserva userId exato: exatamente uma propriedade presente, mesmo null conta como presença; ambos/nenhum dão 422 em email, critério escolhido null/vazio/inválido é recusado, campos desconhecidos dão 400. Conta inexistente/inativa recebe o mesmo 422 «Conta não elegível.» no campo escolhido. Repetição/concorrência email/email ou email/userId dá 204 e uma participação, sem alterar papel, joined_at ou versão; UI confirma participação de forma neutra, não uma segunda criação.
- **RN-05:** tarefa pertence a um projeto fixo; estado inicial TODO, prioridade inicial MEDIUM, sem responsáveis. Prioridades LOW/MEDIUM/HIGH. Participantes podem criar, editar e eliminar qualquer tarefa do projeto.
- **RN-06:** tarefa admite zero ou vários responsáveis. Só participantes ativos do mesmo projeto são elegíveis; o par tarefa/utilizador é único. Atribuição inválida preserva o estado anterior.
- **RN-07:** nova entrada em DONE exige IN_REVIEW imediatamente persistido. TODO/IN_PROGRESS podem ir a IN_REVIEW e revisão pode regressar a ambos, sem exigir passagem por IN_PROGRESS. Rascunho intermédio e revisão histórica abandonada não autorizam conclusão; TODO/IN_PROGRESS→DONE dá 422 no campo status, «Coloque a tarefa em revisão antes de a concluir.», sem mudar dados/versão/datas/histórico. Qualquer participante ativo autorizado, mesmo sem atribuição e a mesma pessoa que submeteu a revisão, pode rever/concluir; não há papel/revisor adicional. DONE→DONE é manutenção permitida; reabrir para qualquer não-DONE respeita RN-15 e limpa motivo. Tarefas DONE antigas não são convertidas nem recebem revisão fictícia.
- **RN-08:** progresso global com `total = todo + inProgress + inReview + done`; 100 vezes done/total, arredondamento inteiro HALF_UP (meios para cima), só DONE no numerador. Uma tarefa de cada estado dá total 4 e 25%; projeto sem tarefas apresenta todas as contagens zero, 0% e “Sem tarefas”. Filtros afetam resultados/paginação, não os agregados globais.
- **RN-09:** operações transacionais; nenhuma falha é anunciada como sucesso. Edições de projeto/tarefa e alterações de atribuição exigem versão atual, caso contrário 409. Atribuição repetida é idempotente quando a versão é atual. Falha de transporte pode deixar resultado incerto; não repetir escritas automaticamente.
- **RN-10:** eliminar tarefa remove comentários/atribuições/relações/anexos/histórico; eliminar projeto remove também tarefas/participações. Extremos sobreviventes registam LINK_REMOVED sem mudar estado/versão/datas. Só remover após confirmação humana na interface. Não eliminar contas por esta API.
- **RN-11:** comentários têm 1–2 000 pontos de código após remoção de espaços nas extremidades, autor/data definidos no servidor; Markdown básico seguro conforme RN-18. Não há edição/eliminação de comentário isolado nem upload posterior ao comentário.
- **RN-12:** autenticação local usa hash scrypt e sessão no servidor com timeout inativo de 30 minutos; CSRF protege login, registo e escritas, erros de credenciais são genéricos e cinco falhas por email/endereço em 15 minutos bloqueiam novas tentativas durante 15 minutos. O limite de login é mantido em memória por instância e reiniciar o serviço limpa o estado; produção está diferida. Login aceita palavras-passe antigas curtas (não vazias) e até 200 pontos de código, sem trim. Registo segue RN-20–22; não há recuperação de palavra-passe.
- **RN-13:** chave única global `MAT-n`, sequencial com lacunas permitidas; UUID continua identidade e projeto é fixo. Tipo TASK/BUG/IMPROVEMENT, inicial TASK; peso null ou 1/2/3/5/8/13, sem ponderação do progresso. Motivo null ou COMPLETED/CANCELLED/DUPLICATE/WONT_DO apenas em DONE; todos os DONE contam como concluídos.
- **RN-14:** PUT continua a exigir título/estado/prioridade/versão; descrição omitida/null normaliza para vazio. Tipo/peso omitidos preservam; type null explícito no PUT é 422, weight null limpa. Motivo omitido preserva em DONE→DONE, entrada em DONE sem motivo dá null; reabertura limpa-o, motivo não null fora de DONE é 422. PUT aceite incrementa versão mesmo sem alteração efetiva; nesse caso não emite evento.
- **RN-15:** RELATED simétrica com extremos canónicos por ID; BLOCKS/DUPLICATES dirigidas, mesmo projeto, sem auto-relação ou duplicação do mesmo tipo/direção. Tipos distintos podem coexistir; apenas BLOCKS proíbe ciclos. A BLOCKS B permite B iniciar/editar/entrar em revisão mesmo bloqueada; entrar em DONE exige RN-07 e todos os bloqueadores diretos DONE. IN_REVIEW continua não-DONE, não liberta dependentes. A não reabre, inclusive para IN_REVIEW, com qualquer dependente direto DONE. Criar A não DONE BLOCKS B DONE é 422. Remover relação/eliminar bloqueador desbloqueia sem mudar estados.
- **RN-16:** POST/DELETE de relação exigem versão da tarefa da rota e targetVersion do outro extremo, mesmo no POST repetido ou DELETE pelo extremo de entrada. Criação/remoção explícita incrementa ambas uma vez; POST duplicado atual dá 200 sem incremento/evento. Versão antiga é 409; auto-relação/ciclo/bloqueio semântico é 422. Lock da linha do projeto serializa verificações/escritas, com revalidação de conta ativa/participação após espera; histórico participa na mesma transação.
- **RN-17:** anexos PostgreSQL BYTEA, até 5 diretos por tarefa e independentemente 5 por comentário, cada um 1–4 194 304 bytes. Multipart `files` repetidos; comentário aceita JSON `{content}` ou multipart `comment` application/json mais ficheiros opcionais, texto sempre obrigatório e lote/comentário/evento atómicos. PNG/JPEG/GIF/WebP/PDF/TXT/MD exigem extensão/MIME/validação limitada de conteúdo; UTF-8 estrito, sem NUL ou markup HTML/XML/SVG nos ficheiros textuais. Participante adiciona; só autor ou gestor ainda participante elimina; download revalida acesso e usa attachment/nosniff/no-store. Anexos/comentários não incrementam versão/updatedAt da tarefa.
- **RN-18:** descrição/comentário mantêm limite de 2 000 pontos de código; react-markdown 10.1.0 apresenta títulos, listas, negrito, ênfase, citações e código, ligações HTTP/HTTPS, sem HTML/imagens/GFM. Três templates fixos TASK/BUG/IMPROVEMENT; substituir descrição não vazia exige confirmação; mudar tipo não aplica template. Cada tipo só pode ser aplicado uma vez por ciclo local de criação/edição: aplicação efetiva desativa/acinzenta o controlo, apagar texto ou regressar ao tipo não o reativa; cancelar confirmação não consome. Save, falha, refetch limpo/sujo, recuperação confirmada, maximização e resize conservam o conjunto; só nova criação após sucesso ou fecho/reabertura efetiva/outra tarefa o reinicia. Sem persistência/JSON/storage desse estado. Painel a partir da lista desktop (>960 px), página em acesso hash direto/móvel, mesmo detalhe; foco devolvido, Escape/inert no painel, adaptação ao redimensionamento e rascunhos protegidos na navegação.
- **Apresentação de RF-14/RF-16 (RN-18):** maximizar e X à direita com nomes acessíveis; página já completa tem X sem maximização sem destino. Guardar/Eliminar na mesma linha, com confirmação e bloqueio durante submissão. «Editar»/«Pré-visualizar» e as três vistas de atividade são botões nativos textuais, negrito/sublinhado, sem fundo/moldura/relevo, com seleção e foco distintos. Ficheiros selecionados: metadados seguidos de X «Retirar {nome}», sem DELETE; guardados diretos/de comentário: seta «Descarregar {nome}» e X «Eliminar {nome}» só se canDelete. Preservar permissões/feedback/confirmar eliminação e quebra de nomes longos sem sobreposição. Cobertura geométrica/teclado de T024 registada em verification; não implica conformidade integral.
- **RN-19:** histórico apenas de leitura, com ator/data do servidor; antigos/novos `text`, `number` ou `userIds`, sem copiar título/descrição/texto de comentário. Comentário gera uma referência/evento com metadados dos seus anexos, sem eventos duplicados de upload; relações geram evento por extremo, anexos diretos eventos singulares. Referências opcionais null/listas vazias. V4 preserva datas/versões e não cria backfill; cascata remove história da tarefa eliminada, não os snapshots dos sobreviventes.
- **RN-20:** registo público académico recebe apenas `displayName`, `email`, `password`. Nome 1–120 pontos de código Unicode após trim de espaços nas extremidades; email `String.trim()`/lowercase (`Locale.ROOT`), máximo 254 unidades UTF-16 após normalização e regex Java `^[^\s@]+@[^\s@]+\.[^\s@]+$` compatível com login, incluindo Unicode (não valida entrega ou posse). Palavra-passe 6–200 pontos de código brutos, sem trim/truncagem/composição obrigatória; espaços permitidos, inclusive como todo o conteúdo. UI mostra «Mínimo de 6 caracteres», sem divulgar o máximo nem truncar por maxLength HTML. Curto/null: «Mínimo de 6 caracteres»; excesso: «Palavra-passe demasiado longa», sem número máximo em detail/errors de registo. Confirmação exata só no frontend, não enviada à API. Login/registo/participantes partilham validador de email na UI, sem bloqueio HTML `type=email`; login mantém RN-12.
- **RN-21:** `POST /api/auth/register` é público com CSRF válido. Cria conta imediatamente ativa, hash scrypt, UUID e username internos únicos gerados; sem projetos, participações ou privilégios herdados. Após login explícito pode criar projetos como qualquer conta ativa (RN-03). Sucesso 201 `application/json`, apenas `{"message":"Conta criada. Inicie sessão."}`, sem dados sensíveis/autenticação; UI regressa ao login e limpa password, sem a transportar/guardar. Inválidos dão 422 com `errors[{field,message}]`; email existente dá 409 explícito inclusive em concorrência, sem substituir conta/hash. A divulgação da existência foi aceite pelo autor. Schema V3 suficiente, sem migration/dependência nova.
- **RN-22:** registo tem limite independente do login, de 5 pedidos por endereço remoto observado em janela de 15 minutos; conta sucessos e falhas que passam CSRF, incluindo JSON/campos inválidos. CSRF ausente/inválido dá 403 antes de consumir quota; excedido dá 429 com `Retry-After` em segundos. Matcher PathPattern partilhado pelo filtro e autorização reconhece também segmentos codificados; não há quota separada por forma codificada do caminho. Estado em memória por instância, limpo no reinício, sem proteção distribuída; não confia em headers forwarded fornecidos pelo cliente. Proxy pode agregar visitantes; não se promete IP real do visitante.

A aprovação destes RF-12–16/RN-13–19 é do autor em **13-11-2026**, para implementação académica; não é validação do cliente. Contrato atual em [OpenAPI](../openapi.yaml), arquitetura/dados e [evidência](verification.md#extensões-de-tarefas--13-11-2026).

RF-17/RN-20–22 foram aprovados pelo autor em **17-11-2026**, não pelo cliente. [US-20](user-stories.md#registo-académico--us-20) define aceitação; [evidência do registo](verification.md#registo-académico--17-11-2026) distingue reports/relatos de T1/T2 e verificações documentais T3. A pendência visual/E2E para T4 era o estado após T3; critérios não implicam execução.

O estado T4 dessa redação é histórico: a execução posterior de 17-11 está preservada em verification (1 E2E/quatro Axe relatados). Não comprova este delta; para o estado vigente prevalece o suplemento de 18-11 acima.

### Qualidade e exclusões

Mantêm-se RNF-01 a RNF-06 do levantamento inicial: autorização direta, persistência, validação com texto conservado, teclado/rótulos/estados textuais, minimização de dados e concorrência sem perda silenciosa. Um ano de retenção é apenas um pressuposto provisório para discussão, não uma policy aprovada: âmbito dos dados e evento inicial do prazo continuam indefinidos; não existe purga automática. A demonstração temporária está publicada em [https://matriz-demo-h27u.onrender.com](https://matriz-demo-h27u.onrender.com), com a base de dados gratuita atual a expirar em 2 de dezembro de 2026; este limite da infraestrutura não define a retenção da aplicação. p95 é uma métrica a recolher, sem carga de referência ou alvo aprovado. A produção continua diferida; a demonstração não implica autorização nem prontidão de produção. A cobertura observada nos testes da ficha 03 e os procedimentos para verificar cada fluxo por teclado estão em [verification.md](verification.md); não se alega conformidade integral de acessibilidade.

Sem notificações, @mentions, Defcon/Goal, sprints, integrações/serviços externos, recuperação de palavra-passe, envio/confirmação de email ou relatórios avançados. Registo público é só demonstração académica, não solução de identidade para produção. Capacidade do PostgreSQL BYTEA, crescimento de anexos/histórico e backups exigem avaliação; não há autosweep ou decisão de retenção adicional. Validação de formatos não é antivírus, parsing completo de média ou certificação PDF. A policy de retenção e o respetivo âmbito/evento inicial, identidade empresarial, backups, metas de escala/disponibilidade, segurança e obrigações legais de produção continuam pendentes. Documentar resultados reais em [verification.md](verification.md).

<details>
<summary>Histórico da ficha 01 — levantamento inicial e exercício de prompts; âmbito substituído acima</summary>

## 1. Origem, estado e convenções

Este documento responde aos exercícios 1, 2 e 4 da Ficha Prática Laboratorial 01. A ferramenta utilizada é o GitHub Copilot. Não existe implementação.

Fontes disponibilizadas: `01 - Introdução.pdf`, `02 - Mindset Engenharia IA.pdf`, `03 - Ficha Prática 01.pdf`, `04 - Arquiteturas e Prototipagem.pdf`, `05 - ADRs.pdf`, os anexos da pasta `06 - Anexos` e `07 - Ficha Prática 02.pdf`. A ficha 01 define a entrega; os materiais seguintes são contexto pedagógico, não requisitos aprovados.

Usam-se três estados:

- **Confirmado pelo enunciado:** informação explicitamente fornecida na ficha.
- **Âmbito proposto autorizado pelo autor:** funcionalidades que o autor aceitou documentar, sem confirmação pelo cliente.
- **Regra proposta:** detalhe operacional assumido para tornar a especificação verificável; exige revisão humana e validação com o cliente.

Só os factos F-01 a F-04 em [constraints.md](constraints.md) estão confirmados pelo enunciado. Os requisitos RF/RNF, as regras RN e as User Stories abaixo constituem uma proposta, não um levantamento validado pelo cliente.

## 2. Visão e objetivos

A Matriz destina-se a equipas que necessitam de organizar projetos, gerir tarefas e acompanhar o trabalho num ponto comum.

Objetivos propostos: identificar o trabalho de cada projeto, tornar visível quem é responsável por cada tarefa e apresentar o progresso sem depender de relatórios manuais. A conclusão do MVP será verificável pelos critérios das User Stories; não se presume qualquer melhoria percentual de produtividade.

## 3. Utilizadores e permissões propostas

Os perfis são relativos a cada projeto, não cargos globais. Uma pessoa pode gerir um projeto e ser membro de outro. “Participante” significa gestor ou membro desse projeto.

| Ação | Gestor do projeto | Membro do projeto | Pessoa sem participação |
|---|---|---|---|
| Consultar projeto, tarefas, participantes e progresso | Sim | Sim | Não |
| Criar tarefas e editar título/descrição | Sim | Sim | Não |
| Alterar estado de qualquer tarefa do projeto | Sim | Sim | Não |
| Atribuir, substituir ou retirar responsável | Sim | Não | Não |
| Adicionar ou remover membros | Sim | Não | Não |

Qualquer utilizador autenticado com conta ativa pode criar um projeto e torna-se o seu gestor. No MVP, o criador é o único gestor: não existe promoção de membros, transferência de gestão ou remoção do gestor. Contas são disponibilizadas previamente; registo público e administração de contas não fazem parte da aplicação nesta fase.

## 4. Requisitos funcionais e prioridades

**Must:** indispensável ao fluxo mínimo proposto. **Should:** melhoria a considerar depois do MVP. **Could:** possibilidade futura sem compromisso. Estas prioridades pertencem ao backlog; não são um campo de prioridade de tarefa.

| ID | Funcionalidade proposta | Justificação | Prioridade | História |
|---|---|---|---|---|
| RF-01 | Autenticar utilizadores com conta ativa e permitir terminar o acesso. | Identificar o autor das operações e restringir informação interna. | Must | US-01 |
| RF-02 | Criar projeto com nome e descrição opcional, tornando o criador gestor. | Disponibilizar o contexto onde o trabalho será organizado. | Must | US-02 |
| RF-03 | Consultar apenas os projetos em que se participa e os seus detalhes. | Encontrar o trabalho sem expor projetos alheios. | Must | US-03 |
| RF-04 | Adicionar contas ativas existentes como membros e remover membros elegíveis. | Permitir colaboração e controlar o acesso de cada equipa. | Must | US-04 |
| RF-05 | Criar e consultar tarefas pertencentes a um único projeto. | Registar unidades concretas de trabalho. | Must | US-05 |
| RF-06 | Editar título e descrição de uma tarefa sem mudar o seu projeto. | Corrigir e clarificar o trabalho registado. | Must | US-06 |
| RF-07 | Gerir um responsável opcional por tarefa, escolhido entre os participantes ativos. | Tornar explícita a responsabilidade sem impor atribuição na criação. | Must | US-07 |
| RF-08 | Alterar o estado de uma tarefa entre os três estados definidos. | Tornar visível a evolução do trabalho. | Must | US-08 |
| RF-09 | Consultar contagens por estado e percentagem concluída por projeto. | Acompanhar progresso com uma medida objetiva. | Must | US-09 |

## 5. Regras de negócio propostas

Todas estas regras dependem dos pressupostos de [constraints.md](constraints.md).

- **RN-01 — Acesso:** cada consulta e alteração exige conta ativa, autenticação válida e autorização para o projeto. Conhecer o identificador de uma tarefa não concede acesso. A autorização é verificada novamente em cada operação, incluindo após remoção de um membro.
- **RN-02 — Projeto:** o nome, depois de removidos espaços no início e no fim, tem entre 1 e 120 caracteres Unicode; a descrição é texto simples opcional com até 2 000 caracteres Unicode. Nomes repetidos são permitidos; projetos distintos mantêm identificadores distintos. Editar ou eliminar projetos não faz parte do MVP.
- **RN-03 — Participação:** o criador é o único gestor. Só o gestor adiciona ou remove membros. Adicionar novamente um membro não duplica a participação. Só podem ser adicionadas contas ativas existentes na organização, através de um identificador exato já conhecido pelo gestor; não existe pesquisa pública de contas.
- **RN-04 — Remoção:** o gestor não pode ser removido. Um membro responsável por pelo menos uma tarefa, mesmo concluída, não pode ser removido até o gestor substituir ou retirar todas essas atribuições. A recusa não altera dados. Uma remoção bem-sucedida retira o acesso desse membro nas operações seguintes.
- **RN-05 — Tarefa:** pertence sempre a um único projeto existente e autorizado; não pode ser transferida nem eliminada no MVP. O título, sem espaços nas extremidades, tem entre 1 e 200 caracteres Unicode; a descrição é texto simples opcional com até 2 000 caracteres Unicode. Títulos repetidos são permitidos. Uma nova tarefa começa em “Por fazer” e sem responsável.
- **RN-06 — Responsável:** uma tarefa tem zero ou um responsável. Só o gestor pode atribuir, substituir ou retirar essa pessoa, que deve ser participante ativo do mesmo projeto, incluindo o próprio gestor. Uma atribuição inválida preserva a anterior.
- **RN-07 — Estados:** os únicos estados são “Por fazer”, “Em curso” e “Concluída”. Qualquer participante pode passar de qualquer um destes estados para outro, incluindo reabrir uma tarefa concluída. Repetir o estado atual não cria outra tarefa nem altera as contagens. Não são exigidos responsável ou passagem por “Em curso” para concluir.
- **RN-08 — Progresso:** para todas as tarefas do projeto, apresentar total e contagem de cada estado. A percentagem é 100 vezes o número de tarefas concluídas dividido pelo total, arredondada ao inteiro mais próximo, com meios arredondados para cima. Sem tarefas, apresentar 0% e “Sem tarefas”. As contagens não dependem da página visível de resultados nem de uma seleção de tarefas. Esta medida conta tarefas; não mede esforço, tempo ou produtividade individual.
- **RN-09 — Consistência:** uma operação recusada ou falhada não pode deixar alterações parciais nem ser apresentada como sucesso. Depois de uma alteração bem-sucedida, uma nova consulta apresenta os dados persistidos e recalcula o progresso. Se outra pessoa tiver alterado a tarefa desde a versão consultada, recusar a edição desatualizada e pedir atualização dos dados, sem sobrepor silenciosamente a alteração mais recente.

Os limites de caracteres são propostas pedagógicas, não valores fornecidos pelo cliente. Para estes limites, “carácter Unicode” significa ponto de código, não byte; não se remove conteúdo interno nem se transforma o texto para o encurtar. A validação aplica-se ao nome/título após remoção dos espaços das extremidades e à descrição tal como introduzida.

## 6. Requisitos não funcionais propostos

| ID | Requisito e verificação esperada | Estado |
|---|---|---|
| RNF-01 | Negar leitura e escrita de projetos e tarefas a pessoas não autorizadas, também em acesso direto; não revelar título, participantes ou existência de um projeto alheio. Coberto por US-01, US-03 e US-04. | Proposta de segurança |
| RNF-02 | Manter alterações confirmadas numa nova sessão autorizada; não anunciar sucesso quando a gravação falha. Coberto por US-05 e US-06. | Proposta de integridade |
| RNF-03 | Identificar campos inválidos e explicar a ação possível; conservar o texto introduzido enquanto o utilizador corrige o formulário, sem o expor a terceiros. Coberto por US-02 e US-05. | Proposta de usabilidade |
| RNF-04 | Permitir os fluxos do MVP por teclado, com foco visível, campos identificados e estados compreensíveis sem depender apenas de cor. Validar cada fluxo com teclado e leitura dos respetivos rótulos/estados. | Proposta de acessibilidade |
| RNF-05 | Limitar os dados de perfil ao identificador e nome de apresentação necessários; não expor credenciais nem registar conteúdos de tarefas em logs por omissão. A identificação exata de contas para convites não implica uma listagem pública. Rever saídas, erros e registos com dados fictícios. | Proposta de privacidade |
| RNF-06 | Impedir sobreposição silenciosa de alterações concorrentes da mesma tarefa. Validar com duas sessões conforme US-06. | Proposta de colaboração |

Não se inventam metas de desempenho, disponibilidade ou escala. Volumes, latência máxima, recuperação de dados e contexto de acessibilidade devem ser acordados antes da validação operacional; ver Q-08 e Q-09 em `constraints.md`. Não se afirma conformidade legal nem com uma norma de acessibilidade sem avaliação própria.

## 7. Limites do MVP e evolução

O fluxo mínimo é: obter acesso com conta existente, criar projeto, adicionar um membro, criar tarefa, atribuí-la, atualizar o estado e consultar progresso. Ambos os participantes trabalham sobre a informação persistida do mesmo projeto.

| Funcionalidade futura | Justificação possível | Prioridade futura |
|---|---|---|
| Pesquisa e filtros de tarefas | Encontrar trabalho em projetos com mais tarefas. | Should |
| Comentários e notificações | Reduzir comunicação dispersa, se essa necessidade for confirmada. | Should |
| Datas-limite e prioridade por tarefa | Apoiar planeamento quando as regras forem clarificadas. | Should |
| Anexos, sprints e relatórios avançados | Apoiar equipas com processos mais complexos. | Could |
| Integrações, automações e funcionalidades de IA no produto | Ligar ferramentas existentes apenas perante uma necessidade demonstrada. | Could |
| Vários responsáveis, múltiplos gestores e transferência de gestão | Suportar outras formas de colaboração, se necessárias. | Could |

Também estão fora do MVP: registo público, gestão global de contas, eliminação/arquivo de projetos ou tarefas, mudança de tarefa entre projetos, hierarquias de tarefas, histórico de negócio consultável, aplicação móvel dedicada e edição em tempo real. Não há compromisso de entrega das funcionalidades futuras.

## 8. Exercício 1 — Prompt Engineering

### Origem e âmbito da comparação

O autor realizou a comparação em conversas distintas no Gemini Pro e disponibilizou as respostas para análise em 29-10-2026. Registam-se apenas as conclusões; os prompts completos e as transcrições não integram o repositório. Esta análise substitui o exemplo ilustrativo anteriormente elaborado na sessão do projeto.

### Resultados observados

| Aspeto | Pedido simples | Pedido estruturado |
|---|---|---|
| Orientação da resposta | Avançou para protótipo, modelo de domínio e desenho técnico antes de clarificar o problema. | Manteve o foco na análise de requisitos e nas perguntas de clarificação. |
| Funcionalidades sugeridas | Projetos, tarefas e utilizadores, com datas, prioridade, estados, responsável, quadro Kanban e estatísticas, sem confirmação do âmbito. | Perguntou sobre perfis, permissões, ciclo de vida, estados, responsabilidades, métricas e integrações, sem fechar o MVP. |
| Decisões técnicas | Invocou Java/Quarkus, Maven, Helm, Panache e padrões de desenho como enquadramento para a solução. Essas opções não estavam estabelecidas pelo pedido simples. | Respeitou a restrição de não propor tecnologias, arquitetura, código ou protótipos. |
| Factos e pressupostos | Misturou a proposta com um contexto técnico cuja aplicabilidade ao exercício não foi confirmada. | Separou factos de hipóteses, incluindo público corporativo, interpretações do nome Matriz e colaboração em tempo real. |

### Conclusões críticas

O pedido simples favoreceu uma resposta orientada à solução antes de validar o domínio. Deveriam ter sido clarificados primeiro os utilizadores e permissões, os dados essenciais, o ciclo de vida de projetos/tarefas, a cardinalidade dos responsáveis e a definição de progresso. As funcionalidades e tecnologias sugeridas não constituem requisitos nem decisões aprovadas.

A estrutura Goal → Context → Constraints → Task → Validation tornou o papel, o âmbito e os critérios de resposta explícitos. Na resposta analisada, conduziu a perguntas acionáveis e evitou o desenho técnico prematuro. A separação de hipóteses facilita a revisão humana, mas não valida essas hipóteses: o nome Matriz não justifica por si só RACI, priorização de Eisenhower ou colaboração em tempo real.

As respostas não permitem determinar se o contexto técnico invocado no pedido simples veio de memória, personalização ou de uma suposição do modelo. Conversas distintas não garantem condições experimentais idênticas; não se registaram a versão exata do modelo nem todos os parâmetros/contextos. A conclusão é qualitativa sobre as respostas fornecidas, não uma medição controlada nem uma garantia de correção de prompts estruturados.

A escolha posterior de Java/Spring Boot, React e PostgreSQL resulta das decisões aprovadas da ficha 03, não da sugestão inicial do Gemini Pro.

</details>
