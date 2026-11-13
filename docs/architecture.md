# Matriz — Arquitetura atual e histórico das fichas 02 e 03

## Arquitetura implementada — candidato da ficha 05

### Extensões atuais — 13-11-2026

Âmbito aprovado pelo autor, não cliente: V4 sobre HEAD `640b7e847f385cd69fabf0ff5ffd62dbf7f06cc2`, mantendo `0.4.0-rc.1`, monólito, sessão/CSRF, JDBC e permissões anteriores. T6 de 12-11 e respetivos números abaixo são baseline histórica, não prova atual de V4. O final local de 13-11 passou com 41/43/6, imagem fresca identificada em contentores novos e a mesma imagem nos scans/E2E: Trivy 0 HIGH/CRITICAL, 294/294 pares npm e 63/63 bibliotecas JAR; Semgrep 135 regras/47 alvos/0 findings; actionlint 1.7.7 PASS. Migração populada V3→V4/MAT/defaults passou no Maven; recriação app/db mudou ambos IDs, mantendo volume e snapshots de dados/links/comentários/bytes. Paragem só da DB própria deu readiness 503/liveness 200, recuperação 200 e dados iguais; app/db próprios ficaram parados com volume retido. Revisão independente/humana, aceitação do cliente e prova GitHub Actions no âmbito/branch atual, uploads/retenção reais continuam pendentes. Esta escrita só leu [relatórios guardados](verification.md#validação-final-local-das-extensões--execução-de-13-11-2026), sem novas execuções.

| Componente atual | Responsabilidade confirmada no código |
|---|---|
| `TaskService` / `ApiModels` | Chave MAT global, TASK/BUG/IMPROVEMENT, peso opcional, motivo só DONE; PUT com presença dos novos campos (`@JsonSetter`), mantendo campos antigos. Todo DONE conta no progresso, sem ponderação por peso. |
| `TaskLinkService` | RELATED canónica/simétrica, BLOCKS/DUPLICATES dirigidas; mesmo projeto, duas versões, eventos por extremo. BLOCKS valida ciclos e conclusão/reabertura; remover link/eliminar bloqueador não altera estados dos dependentes. |
| `TaskAttachmentService` / controller | BYTEA PostgreSQL; lote validado antes da gravação, 5 diretos/tarefa ou 5/comentário e 4 MiB cada; acesso atual ao download e autor/gestor participante na eliminação. |
| `TaskActivityService` | Payload JSONB tipado, ator/data na mesma transação da mutação; apenas leitura paginada, snapshots sem FK ao link/ficheiro/extremo removido e sem cópias de conteúdo textual. |
| `TaskDetail`, `TaskDetailPanel`, `App` | Detalhe partilhado painel/página hash; painel aberto da lista em >960 px, acesso direto/móvel em página; foco/Escape/inert e layout adaptável ao resize. |
| `MarkdownEditor`, `taskTemplates` | react-markdown 10.1.0, Markdown básico em descrição/comentário; sem HTML/imagens/GFM, só HTTP/HTTPS; três templates fixos, confirmação antes de substituir texto. |
| `TaskLinks`, `TaskAttachments`, `TaskActivity`, `api.ts` | Relações, upload/download binário, comentários JSON/multipart e histórico; CSRF existente, FormData sem forçar boundary. Pesquisa/filtros visuais limitados à página indicada, sem inventar novos parâmetros de API. |

Todas as escritas das extensões bloqueiam a linha existente do projeto. Após esperar pelo lock, revalidam participação/permissão e conta ativa num snapshot atual; isto evita que a autorização anterior à espera sobreviva a uma revogação. Grafo, estado, contagem de ficheiros e eventos são atómicos. POST de link novo/DELETE explícito incrementam ambas as versões/updatedAt; POST duplicado atual não o faz. Cascata de eliminação de tarefa regista remoção no sobrevivente sem mudar a sua versão/estado/datas.

Comentário JSON `{content}` ou multipart com `comment` application/json e `files` repetidos: texto obrigatório, lote/comentário/evento numa transação, sem upload posterior nem edição/eliminação isolada do comentário. Anexos/comentários não alteram versão/updatedAt da tarefa. Download entrega bytes com MIME canónico, Content-Length, Content-Disposition attachment UTF-8, nosniff e no-store.

Validação de ficheiros é limitada: assinaturas PNG/JPEG/GIF, RIFF/chunks WebP delimitados, PDF cabeçalho/EOF, TXT/MD UTF-8 estrito sem NUL/markup HTML/XML/SVG; não antivírus nem parsing completo. Armazenamento/crescimento/backups/retention exigem decisão, sem autosweep. Histórico não copia título/descrição/comentário; flags, valores tipados e metadados bastam. V4 atribui chaves por `(created_at,id)` sem modificar datas/versões ou backfill.

Respostas locais conhecidas de atribuição/relação podem avançar a base do rascunho apenas se coincidir com a versão de partida, conservando campos editáveis. Refetch externo nunca promove base suja; 409 preserva texto, recuperação exige confirmação. Mudar de painel para página não remonta o detalhe; sair com rascunho exige confirmação. Não se afirma conformidade integral de acessibilidade.

Decisões aprovadas pelo autor em 29-10-2026: monólito modular, Java 21/Spring Boot, React/TypeScript/Vite, PostgreSQL 17 e Flyway. A baseline original usou Boot 3.5; a migração autorizada em 12-11-2026 mantém o desenho e prepara **`0.4.0-rc.1`**, não publicado e com **T6 concluído localmente**. Prova positiva/negativa GitHub Actions, uploads/retenção reais e revisão final humana/independente continuam pendentes; não se declaram todos os critérios da ficha concluídos. Stack efetiva: Boot **4.0.9**, Framework **7.0.10**, Security **7.0.8**, Jackson **3.1.7**, Flyway **11.14.1**, Java **21**, PostgreSQL **17**; Docker compila frontend com Node **22**. JDBC é usado com parâmetros preparados; não há ORM, serviços distribuídos ou persistência em memória.

| Componente | Implementação e responsabilidade |
|---|---|
| Interface | `frontend/src/App.tsx`, `Layout.tsx`, `Projects.tsx`, `Tasks.tsx`: login, estrutura partilhada, painel, projetos, detalhe de projeto/tarefa; cliente `api.ts` e estados comuns em `ui.tsx`. |
| Identidade | `backend/.../identity`: Spring Security com email/palavra-passe, hash scrypt, sessão no servidor, perfil e logout local. Contas inativas ou sem credenciais não autenticam. |
| Projetos | `backend/.../projects`: propriedade, participação, CRUD, pesquisa, paginação, autorização e contagens globais. |
| Tarefas | `backend/.../tasks`: CRUD, estado/prioridade, filtros, atribuições N:M e comentários, com autorização pelo contrato interno do módulo projetos. |
| Transversal | `backend/.../common`: DTOs tipados, erros Problem Details, validação Unicode e paginação. |
| Persistência | Migration Flyway e PostgreSQL com FKs/restrições; transações locais, bloqueio de projeto nas escritas e versão otimista. |
| Entrega | Dockerfile multi-stage compila React e inclui o resultado no JAR. Compose executa aplicação e PostgreSQL com volume persistente. Vite separado apenas em desenvolvimento. |
| Observabilidade local | Actuator opt-in no perfil `observability`, no mesmo listener da aplicação; apenas health mínimo e métricas JVM/HTTP autenticadas. Sem serviço externo de monitorização. |

### Implantação atual

```mermaid
flowchart LR
    Browser["Browser"] -->|"HTTP, mesma origem"| App["Spring Boot: estáticos React + API /api"]
    App -->|"JDBC / Flyway"| DB[("PostgreSQL 17 + volume persistente")]
    App -.->|"opt-in local, mesma porta da aplicação"| Ops["/actuator: health + métricas JVM/HTTP"]
```

`Ops` é uma superfície HTTP do **mesmo processo**, não um serviço/contentor adicional. Em Compose a aplicação escuta dentro do contentor em `0.0.0.0:8080`, publicada no host apenas em `127.0.0.1:${APP_HOST_PORT:-8080}`; PostgreSQL também fica em loopback, porta host configurável (55432 por omissão). Fora de Compose, a aplicação usa `SERVER_ADDRESS=127.0.0.1` por omissão e respeita `PORT`. O diagrama descreve a configuração atual, não uma implantação nova verificada ao vivo.

### Migração e compatibilidade

O POM usa os starters modulares oficiais MVC/MVC-test/Flyway e Testcontainers 2 (apenas testes). Segurança e erros usam o `JsonMapper` Jackson 3 autoconfigurado. `spring.jackson.use-jackson2-defaults=true` preserva defaults JSON/data/coerção de Boot 3 **sobre Jackson 3**, mantendo recusa de campos desconhecidos; não adiciona o módulo de compatibilidade MVC Jackson 2. O JAR também contém Jackson 2 core/databind 2.21.7 por dependência interna de Flyway, gerida pelo BOM, não como mapper paralelo da API. Problem Details mantém `type: about:blank`, extensões, UTF-8 e tratamento de IOException, com regressões locais documentadas.

Na migração Boot 4 de 12-11 não houve migrations SQL novas: V1–V3, JDBC, sessão/scrypt/CSRF e permissões permaneceram. A extensão aprovada de 13-11 acrescenta V4 e RF-12–16/RN-13–19. T6 validou localmente o rebuild fresco com metadados `0.4.0-rc.1`: 19 testes Maven, 13 frontend e 5 E2E passaram; build frontend concluído, Semgrep com 0 findings e Trivy com 0 HIGH/CRITICAL, cobertura 216/216 pares npm incluindo dev e 63/63 JARs internos. A mesma imagem passou os scans, E2E, recriação app/db com dados/volume preservados e readiness perante paragem real da DB própria (503/DOWN, liveness 200/UP) e retoma (readiness 200/UP, sessão/dados iguais). São resultados T6 registados em 12-11-2026, não medições novas desta correção nem reutilização do histórico pré-T5; não substituem validação pelo cliente ou revisão final humana/independente. [Release notes](../RELEASE_NOTES.md) e [verificação](verification.md#ficha-05--candidato-040-rc1) detalham evidência e limites.

### Superfície operacional e gates

Sem `observability`, o resolver fornece `Access.NONE` a todos os endpoints operacionais mesmo com exposição wildcard. Com o perfil, só health/metrics recebem acesso read-only; restantes continuam indisponíveis. GET anónimo de `/actuator/health` devolve `status` e nomes dos grupos, sem detalhes/componentes; `/actuator/health/liveness` e `/actuator/health/readiness` devolvem só `status`, sem criar sessão. Liveness inclui `livenessState`; readiness inclui `readinessState,db`. Não há `/livez`/`/readyz` ou listener de gestão separado.

`/actuator/metrics` e leituras `jvm.*`/`http.server.requests` exigem a sessão autenticada local existente; nomes de outras famílias e endpoints sensíveis são recusados. Não recolher corpos, cookies, tokens ou credenciais nos logs. A observabilidade não inclui monitoring externo, tracing, dashboard ou alvo p95. O perfil é local opt-in, desligado por omissão e não configurado no Render.

Compose base: health HTTP em `/`, que não comprova readiness DB. O override `compose.observability.yaml` ativa o perfil e verifica readiness DB na mesma porta; não acrescenta serviço, volume ou publicação externa. T6 ensaiou-o no projeto isolado `matriz-ficha05-final`, portas 18085/55435 em loopback; app/db próprios ficaram parados e volume/fixture preservados. Procedimentos seguros de arranque/paragem e preservação de `.env`/volumes em [README](../README.md#observabilidade-local--opt-in).

Na definição atual de CI, Semgrep/testes backend/testes-build frontend antecedem o job integrado; este constrói uma imagem, aplica Trivy 0.76.2 fixado por digest e verifica cobertura npm (incluindo dev) e JAR entregue, antes de E2E na mesma imagem. Só vulnerabilidades de bibliotecas são analisadas, não SO. HIGH/CRITICAL bloqueiam mesmo sem fix; scanner/DB/cobertura em erro também bloqueiam, sem ignores/exceções. Relatórios têm retenção configurada de sete dias; gates/fixtures locais passaram em T6, mas prova positiva/negativa GitHub Actions, upload em falha e retenção reais continuam não verificados. Bases públicas são descarregadas sem upload de código; sem telemetry/consultas remotas de dependências.

Render mantém `autoDeployTrigger: checksPass` e health `/`, sem perfil operacional. Isso requer autorização específica antes de push/checks remotos, mesmo sem deploy no workflow. Produção diferida; a janela curta de suporte OSS Boot 4.0 indicada para dezembro de 2026 requer reconfirmação/decisão antes de operação prolongada.

### Identidade e ciclo de acesso

O login local consulta a conta pelo email e só aceita contas ativas com hash de palavra-passe. A identidade interna é o ID associado à autenticação Spring, nunca um valor enviado em operações de negócio. Não há criação pública de contas.

`POST /api/auth/login` valida as credenciais e estabelece sessão no servidor; o cookie `JSESSIONID` é HttpOnly, SameSite Strict e Secure quando configurado para HTTPS. A sessão expira após 30 minutos de inatividade e o ID é renovado no login. Hashes usam scrypt; erros de autenticação são genéricos e cinco falhas por email/endereço em 15 minutos aplicam bloqueio de 15 minutos. O limite também fica em memória por instância e reiniciar a aplicação limpa o estado. CSRF protege login e restantes escritas. O logout invalida a sessão; reiniciar o serviço invalida sessões mantidas em memória. Não há CORS aberto nem localStorage com segredos.

#### Implementação anterior ao login local — histórico

O Bearer preliminar da ficha 02 foi substituído, com autorização do autor, por sessão Spring Security: cookie HttpOnly/SameSite Strict, sessão renovada no login, expiração inativa de 30 minutos, invalidação no logout. `COOKIE_SECURE=true` é obrigatório com HTTPS fora da demonstração local. O frontend usa mesma origem/proxy; não há CORS aberto, localStorage com segredos ou identidade inferida de valores enviados pelo cliente.

`GET /api/auth/csrf` fornece token; `X-CSRF-TOKEN` protege login e todas as escritas. O cliente obtém token atual antes de cada escrita, incluindo após login/logout. O backend obtém proprietário e autor do Principal; nunca aceita esses campos como prova de identidade.

### Dados, autorização e consistência

Todas as escritas de um projeto bloqueiam a respetiva linha durante a transação. A autorização é verificada no mesmo contexto da gravação; isso serializa remoções/atribuições concorrentes. Recursos alheios/inexistentes recebem 404, membros sem gestão recebem 403. Sessões não armazenam permissões por projeto em cache.

Edições de projeto/tarefa exigem versão; tarefas também a exigem nas atribuições e eliminações. FKs asseguram pertença ao mesmo projeto e unicidade. Projeto tem participação do gestor assegurada por FK composta diferível. Eliminações confirmadas removem dependentes na transação; falha reverte o conjunto.

Listagens de projetos/tarefas usam retrato `REPEATABLE_READ`; o progresso conta todas as tarefas do projeto, não a página ou filtros. `pagination.totalItems` de tarefas conta o subconjunto filtrado, portanto pode diferir de `progress.total`. Ordenação: criação ascendente e id ascendente.

Frontend desativa a submissão e tem guarda síncrona contra duplicados; conserva texto em falhas e atualiza dados após resposta confirmada. Uma falha de transporte não prova rollback: é apresentada incerteza e não há repetição automática de escritas.

### Organização visual aprovada

Tema escuro/azul com referência visual no [Black Dashboard React](https://github.com/creativetimofficial/black-dashboard-react), mantendo React/TypeScript/Vite e sem importar código, assets ou dependências do template. Por decisão posterior do autor, a estrutura segue um espaço de trabalho ao estilo Jira: barra superior global, navegação lateral compacta, breadcrumbs, links entre vistas e tabelas de projetos/tarefas.

`Layout.tsx` partilha navegação, perfil e saída; em telemóvel usa um `<dialog>` modal nativo com fecho por Escape e mudança de rota. O atalho para o conteúdo mantém a rota hash e o conteúdo focado não fica sob a barra fixa. Formulários, rascunhos, autorização e chamadas à API mantêm as regras existentes.

O painel representa a distribuição atual dos três estados do projeto selecionado, usando os seus agregados globais devolvidos pela API. A seleção corresponde aos projetos da página/pesquisa atual; não se apresentam somas dessa página como totais globais nem séries temporais inexistentes. Não há novas capacidades de Jira, quadros ou sprints.

### Revisão e limites

API completa da demonstração em [openapi.yaml](../openapi.yaml); plano/resultados em [implementation-plan.md](implementation-plan.md) e [verification.md](verification.md). O wireframe da ficha 02 é histórico; interface real inclui prioridade, responsáveis múltiplos e comentários.

Continuam fora do âmbito registo público, recuperação de palavra-passe, Defcon/Goal, @mentions, notificações, sprints, integrações/serviços externos e operação de produção. Anexos fazem parte de V4. Não foram assumidas escalabilidade ou conformidade. Não se reivindica certificação de segurança; políticas corporativas, limitação de tentativas, HTTPS, logs/monitorização e recuperação devem ser tratados antes de produção.

<details>
<summary>Architecture Pack original da ficha 02 — preservado como histórico; contrato parcial e responsável único foram substituídos</summary>

## 1. Contexto e estado

Este documento responde aos exercícios 1 e 5 da Ficha Prática Laboratorial 02. O objetivo é conceber a solução do MVP, não implementar código funcional.

Base de requisitos: [requirements.md](requirements.md), [user-stories.md](user-stories.md) e [constraints.md](constraints.md). O Specification Pack foi versionado manualmente pelo autor no commit `c13da97` (`docs: Specification Pack`), observado em `main` e `origin/main` no início desta atividade.

O autor escolheu **monólito modular** para este exercício e autorizou este Architecture Pack. As regras de negócio continuam a ser pressupostos de desenho sujeitos a validação com o cliente. A autorização não resolve automaticamente as questões Q-01 a Q-10 nem autoriza implementação ou exploração com dados reais.

## 2. Comparação de alternativas

| Alternativa | Benefícios neste MVP | Custos e limitações | Adequação |
|---|---|---|---|
| Monólito simples | Uma aplicação e operação inicial simples. | Fronteiras menos explícitas facilitam mistura de permissões, tarefas e persistência. | Viável, mas oferece menos orientação para evolução. |
| Monólito modular | Uma implantação; módulos com responsabilidades claras; transações locais para regras que atravessam participação e tarefas. | Requer disciplina nas dependências; a aplicação é entregue e dimensionada em conjunto. | Escolhida: equilibra simplicidade e organização. |
| Microserviços | Possibilidade de entregas e escala independentes. | Rede, autenticação entre serviços, consistência distribuída, observabilidade e operação adicionais; benefício não demonstrado. | Não justificada pelo âmbito e contexto disponíveis. |

Não foram confirmados tamanho da equipa, orçamento, volume ou metas de disponibilidade. A escolha apoia-se no âmbito funcional pequeno e na ausência de necessidades demonstradas de distribuição, não em números inventados. Rever se esses fatores mudarem.

## 3. Decisão e consequências

**DEC-01 — Monólito modular, escolhido pelo autor para a ficha 02.** Uma aplicação implantável, organizada por capacidades, com uma interface de utilizador, uma API e uma persistência lógica comum. Não são especificados processos frontend separados, fornecedor cloud ou um motor de base de dados.

**Propostas de desenho que suportam a decisão:**

- **DES-01:** persistência com modelo relacional lógico e transações locais, sem escolher SGBD, SQL, ORM ou migrations.
- **DES-02:** identificadores opacos representados como texto nos contratos, sem impor UUID ou inteiro; metadados de criação/alteração e versão de tarefa para consistência.
- **DES-03:** API REST parcial em OpenAPI 3.1. O acesso Bearer opaco é uma convenção preliminar do contrato autorizada pelo autor; não pressupõe JWT, fornecedor, fluxo de login ou armazenamento de credenciais.
- **DES-04:** wireframe desktop estático e de baixa fidelidade, sem escolher framework ou design system.

Estas propostas não são requisitos originais do cliente. Devem ser revistas antes da ficha 03. A consequência principal de DEC-01 é manter transações e operação simples, aceitando que os módulos não têm deploy independente.

## 4. Componentes e responsabilidades

| Componente | Responsabilidade | Limites |
|---|---|---|
| Interface | Apresentar projetos, tarefas, estados e progresso; recolher entradas e apresentar falhas. | Não decide autorização e não é a fonte de verdade das contagens. |
| Entrada HTTP/API | Interpretar pedidos, obter identidade, validar o contrato e traduzir resultados/erros. | Não contém regras de participação ou progresso duplicadas. |
| Identidade e acesso | Resolver a identidade e o estado ativo da conta através de um adaptador a definir. | Não escolhe agora o fornecedor nem cria registo público. |
| Projetos e participação | Criar projetos e participação inicial, consultar contexto e gerir membros e permissões. | É dono dos dados de projeto/participação; não altera tarefas diretamente. |
| Tarefas e progresso | Criar, consultar e editar tarefas; controlar responsável, estados, versão e agregados. | Obtém autorização pelo contrato interno de participação, não por regras próprias divergentes. |
| Persistência e coordenação transacional | Guardar dados e executar operações atómicas, restrições e consultas consistentes. | Um armazenamento lógico comum não autoriza acesso arbitrário aos dados de outros módulos. |

Não existe um módulo separado de relatórios, comentários, notificações ou sprints. Progresso é uma consulta derivada das tarefas.

```mermaid
flowchart TD
    Person["Participante autenticado"] --> UI["Interface de utilizador"]
    UI --> API["Entrada HTTP / API"]
    API --> Identity["Identidade e acesso"]
    API --> Projects["Projetos e participação"]
    API --> Tasks["Tarefas e progresso"]
    Tasks -->|"contrato interno de autorização"| Projects
    Identity --> IdentityAdapter["Adaptador de identidade por definir"]
    Projects --> Store["Persistência lógica comum e transações locais"]
    Tasks --> Store
    Identity --> Store
```

O diagrama representa dependências lógicas, não serviços ou implantações independentes. A aplicação fornece casos de uso que coordenam os módulos na mesma transação, sem expor os seus repositórios como API pública.

## 5. Fluxos e consistência

### Consultar tarefas e progresso

1. Validar autenticação e conta ativa.
2. Verificar a participação no projeto sem revelar projetos alheios.
3. Ler contexto, tarefas paginadas, total e agregados no mesmo retrato consistente dos dados.
4. Responder com a página e com progresso calculado sobre todas as tarefas desse projeto, não só as visíveis.

### Criar tarefa

1. Resolver a identidade e verificar participação.
2. Normalizar espaços nas extremidades do título e validar os limites após essa normalização.
3. Na mesma transação que valida o acesso, criar tarefa em `TODO`, sem responsável e com versão inicial 1.
4. Confirmar sucesso apenas após persistência; uma transação falhada não deixa tarefa parcial.

### Alterar atribuições, remover membros e editar tarefas

Estas operações pertencem ao MVP, mas não às duas operações OpenAPI desta ficha. Os contratos ficam para expansão posterior.

Verificação de participação, elegibilidade do responsável e escrita devem ser atómicas. Serializar por projeto as alterações de participação/atribuição que possam competir; isto impede que uma remoção autorizada concorra com uma atribuição e deixe uma referência inválida. A aplicação não deve fazer apenas uma verificação fora da transação e gravar mais tarde.

Toda a alteração da tarefa verifica a versão lida e incrementa-a quando muda dados. Uma edição desatualizada é recusada sem sobreposição; repetir o mesmo estado ou responsável mantém o resultado e não duplica dados. O mecanismo concreto de bloqueio/controlo otimista depende do SGBD futuro.

Uma falha de transporte depois de um commit pode deixar o resultado desconhecido para o cliente. Não prometer que não houve gravação nem repetir automaticamente um POST: consultar os dados e informar a incerteza. Idempotência de criação pode ser avaliada numa expansão, mas não foi adicionada como funcionalidade aprovada.

## 6. Contrato parcial e wireframe

O [openapi.yaml](../openapi.yaml) documenta:

| Operação | Cobertura direta | Observação |
|---|---|---|
| `GET /projects/{projectId}/tasks` | US-05, US-09 e contexto mínimo de US-03 | Página de tarefas, contexto do projeto e progresso global; sem pesquisa ou filtros. |
| `POST /projects/{projectId}/tasks` | Criação de US-05 | Apenas título e descrição; estado e responsável iniciais definidos pelo sistema. |

Autenticação e restrição de acesso de US-01/US-03 aplicam-se às duas operações. O pack **não contém uma API completa do MVP**: criar/listar projetos, gerir membros, autenticar, terminar acesso, editar tarefa, gerir responsável e mudar estado exigirão contratos adicionais.

O [wireframe PNG](ui/wireframe.png), com [fonte SVG](ui/wireframe.svg), mostra o detalhe do projeto “Alfa”, cinco tarefas e 40% concluído. Usa apenas dados fictícios e explicita o estado inicial do formulário de criação. “Projetos”, “Membros” e “Ver” são destinos de navegação previstos, não chamadas já contratadas ou implementadas.

O desenho inclui estados alternativos de carregamento, vazio e erro como notas, não como dados simultâneos do mesmo ecrã. Uma representação estática não comprova acessibilidade, navegação por teclado, responsividade ou comportamento de erro em execução.

## 7. Exercício 5 — Revisão crítica

Pedido aplicado à proposta: identificar omissões ou contradições entre requisitos, arquitetura, modelo, API e wireframe, sem aumentar o MVP nem tratar exemplos da aula como decisões do cliente.

| Observação | Tratamento fundamentado |
|---|---|
| “Gestor” global contradiria os perfis por projeto. | Derivar o perfil do proprietário do projeto; participação é local ao projeto. Não criar um administrador global. |
| Relação N:M entre pessoas e tarefas contrariaria responsável único. | Usar responsável opcional e referência à participação do mesmo projeto, não uma tabela de atribuições múltiplas. |
| Contar só a página visível distorceria o progresso. | Resposta GET separa paginação de agregados globais; ambos vêm de um retrato consistente. |
| Validar `maxLength` do título bruto rejeitaria entradas válidas após remoção de espaços. | Pedido valida presença de texto e documenta limite após normalização; resposta limita o título normalizado a 200 pontos de código. |
| Estado ou responsável editáveis na criação contradiriam RN-05. | POST não aceita esses campos; o wireframe apresenta-os apenas como valores iniciais informativos. |
| Eliminar participação poderia invalidar atribuições ou remover o gestor. | Restrição lógica/transacional e recusa de remoção, também para tarefas concluídas; sem eliminação em cascata. |
| Uma API de duas operações não suporta todos os botões do MVP. | Limite explicitado; wireframe identifica navegação futura. Não inventar endpoints completos para aparentar cobertura. |
| Incluir comentários, prioridade ou datas copiaria funcionalidades futuras. | Rejeitar esses campos e controlos neste pack; manter as exclusões da ficha 01. |
| Escala, identidade e ciclo de vida continuam desconhecidos. | Manter Q-03/Q-08/Q-09 abertas; não afirmar arquitetura pronta para produção nem conformidade legal. |

Esta é uma auto-revisão fundamentada da IA. Depois de apresentados os artefactos e o wireframe, o autor aceitou a triagem: responsável único, exclusão de funcionalidades futuras, API parcial e manutenção das questões de identidade, escala e privacidade em aberto. Essa aceitação não é confirmação pelo cliente nem demonstração do comportamento de uma aplicação.

## 8. Validação e passagem à ficha 03

Verificações documentais efetuadas:

- YAML lido sem chaves duplicadas, com exatamente duas operações e 31 referências locais resolvidas.
- Catorze exemplos de pedidos/respostas verificados contra os tipos, campos obrigatórios, limites, padrões e alternativas presentes nos respetivos schemas.
- Valores iniciais, campos não permitidos no POST, limites do título após normalização e exemplos de progresso 0/0, 1/3, 2/3, 1/8, 2/5 e 5/5 verificados.
- Quatro entidades e cinco relações do ER conferidas estruturalmente e por leitura; correspondência com o responsável opcional, participação do gestor e regras de integridade revista.
- Ligações locais e blocos Markdown conferidos; ficheiros de requisitos e User Stories mantidos iguais aos da ficha 01 em `main`.
- PNG de 1440 × 1120 gerado localmente a partir da fonte SVG, integridade verificada e apresentação inspecionada visualmente; tarefas e contagens coincidem com o exemplo GET.
- SVG aberto no painel de pré-visualização; as onze eliminações originalmente staged foram preservadas, sem adicionar ficheiros ao índice.

Limitações: as verificações locais de OpenAPI são estruturais e dos exemplos, não certificação por um validador completo de OpenAPI 3.1/JSON Schema. O Mermaid foi revisto como texto, mas não renderizado por um motor Mermaid. Não houve instalação de dependências nem testes de servidor, base de dados, autorização ou acessibilidade de uma aplicação, pois não existe implementação.

Checklist: arquitetura justificada, modelo/ER, duas operações OpenAPI, wireframe e pressupostos estão documentados; a triagem crítica foi aceite pelo autor. Permanecem necessárias revisão integral pelo responsável e validação com o cliente.

Permanecem pendentes: validação humana final, questões do cliente, stack, SGBD, identidade, contratos restantes, medições de escala e estratégia de operação. Os novos artefactos só ficam versionados quando houver um commit autorizado; o commit `c13da97` cobre a ficha 01, não esta ficha.

</details>
