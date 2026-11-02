# Ficha 03 — Plano de implementação

## Decisões validadas pelo autor

Em 29-10-2026 o autor aprovou o âmbito integral da ficha 03, substituindo as exclusões da ficha 02: comentários, prioridade, pesquisa/filtros, edição/eliminação de projetos/tarefas e vários responsáveis. Escolheu Java 21, Spring Boot, React e PostgreSQL, mantendo o monólito modular.

O gestor gere o projeto, os membros e as atribuições. Todos os participantes ativos criam, editam e eliminam tarefas e comentam. Responsáveis são participantes ativos do mesmo projeto. A eliminação confirmada remove os dependentes numa transação. Permanecem os limites aprovados: projeto 1–120, tarefa 1–200 e descrições até 2 000 pontos de código após normalização de nome/título.

Aprovados: sessão HttpOnly e CSRF com Spring Security. A decisão de demonstração mais recente substitui OIDC por login local de contas ativas através de email e palavra-passe, hashes scrypt, erros genéricos e limitação de tentativas; não há registo público nem recuperação de palavra-passe. O autor autorizou preparar um Blueprint Render em Frankfurt com planos gratuitos e seed fictício ativo, exclusivamente para demonstração temporária e aceitando dados descartáveis. Isto não autoriza provisionar recursos, efetuar deploy, commit, push, eliminar dados existentes ou alterar o staging. A base gratuita expira após 30 dias e, depois de mais 14 dias sem upgrade, é eliminada; o serviço gratuito pode dormir após 15 minutos sem tráfego. Retenção de um ano é pressuposto provisório sem purga; p95 é métrica sem alvo/carga; produção está diferida.

## Incrementos e verificações

| Incremento | Componentes previstos | Aceitação e verificação | Estado |
|---|---|---|---|
| 1 — Base e persistência | `backend/pom.xml`, aplicação/configuração, migration Flyway, seed opt-in, `.env.example`, `compose.yaml`, Dockerfile | Arranque com PostgreSQL; migration reproduzível; seed sem apagar dados; nenhum segredo real no repositório. | Verificado localmente |
| 2 — Identidade e projetos | Módulos `identity`, `projects`, segurança e erros comuns | Login local com sessão, perfil, logout, CSRF, autorização direta; CRUD/pesquisa/paginação de projetos e membros. | Implementado e verificado localmente |
| 3 — Tarefas e colaboração | Módulo `tasks`, validação partilhada e versão otimista | CRUD, filtros, prioridade, vários responsáveis sem duplicados, comentários com autor/data do servidor; integridade e concorrência. | Verificado localmente |
| 4 — Interface | `frontend/` React/TypeScript/Vite, cliente API e estilos | Cinco vistas ligadas à API, carregamento/vazio/erro/sucesso, formulários preservados e sem duplicação, layout adaptável. | Verificado localmente |
| 5 — Entrega | Testes backend/frontend, `docs/verification.md`, documentação e OpenAPI | Pelo menos validação, autorização e criação/consulta persistida; build e percurso real; evidência e limitações sem inventar resultados. | Ficha 03 em `e73250d`; revisão visual em `f780a29`; procedimentos de reprodução documentados |

Cada incremento é analisado e verificado antes do seguinte. O plano pode ser ajustado com evidência, sem alargar o âmbito autorizado. A revisão crítica final e qualquer refatoração separada são registadas em `verification.md`. Os exemplos de bugs dos anexos são cenários de teste, não bugs observados neste projeto.

## Ficheiros e limites

Criar `backend/` com código Java, SQL e testes; `frontend/` com código React, testes e manifests; configuração Docker e exemplo de ambiente. Atualizar requisitos, histórias, restrições, arquitetura, dados, API, README e AGENTS; manter o wireframe da ficha 02 identificado como referência histórica. Não alterar `.idea` nem o índice Git.

O login local e contas fictícias servem exclusivamente a demonstração. O Blueprint Render ativa o seed; visitantes poderão alterar os dados demo, que são descartáveis. Registo público, recuperação de palavra-passe, anexos, notificações, sprints e operação de produção permanecem fora do âmbito. Não há migração de dados de uma aplicação anterior, porque não existia implementação. V3 adiciona email e índice único case-insensitive; V2 permanece no histórico de schema.

## Fecho das verificações

Em 29-10-2026: 7 testes Java, 7 testes de componentes e 2 E2E passaram; frontend compilado e aplicação completa construída/iniciada em Docker. Projeto, tarefa, comentário e responsável sobreviveram a reinício real; sessão antiga deixou de ser válida. Dependências de desenvolvimento corrigidas com aprovação adicional; `npm audit` completo sem alertas na execução final.

O contrato documenta 21 operações; foram verificados YAML, 99 referências, parâmetros de caminho e estrutura de oito respostas reais de leitura. Não foi instalado/executado um validador integral de OpenAPI. O relatório distingue esta limitação de testes funcionais bem-sucedidos.

O autor autorizou parar os serviços locais no final, sem apagar o volume. A entrega original foi depois aplicada e versionada pelo autor em `e73250d`. Isso não autoriza o agente a fazer commit/push, alterar o índice ou integrar esse commit nesta worktree.

## Iteração visual posterior

O autor aprovou adaptar a apresentação do Black Dashboard React sem novas dependências e esclareceu a direção final: manter o tema escuro/azul, mas usar navegação e conteúdo de espaço de trabalho ao estilo Jira. Implementação original, não importação do template, da sua stack ou de funcionalidades adicionais.

Criados `frontend/src/Layout.tsx` e `Layout.test.tsx`; atualizados `App.tsx`, `Projects.tsx`, `Tasks.tsx`, `ui.tsx`, `styles.css`, testes de componentes e E2E. Inclui barra global, navegação lateral/modal móvel, breadcrumbs, vistas, tabelas compactas e resumo de um projeto com dados reais. API, autenticação, permissões e dependências mantidas.

Verificação desta iteração: 13 testes de componentes, build TypeScript/Vite e três percursos E2E executados duas vezes (6 execuções sem falhas), com aplicação empacotada em Docker. Inspeção visual desktop/móvel e correção do foco sob a barra superior; detalhe em [verification.md](verification.md). No fecho da execução, serviços parados e volume conservado. O autor versionou depois a revisão visual em `f780a29`.

## Atualização documental e reprodução

Atualizados os registos de versionamento e as conclusões da comparação de prompts da ficha 01, realizada pelo autor no Gemini Pro, sem incluir os chats no repositório. A comparação reforça a análise de requisitos antes do desenho técnico e não introduz decisões de produto.

Para reproduzir a entrega, seguir os procedimentos de [verification.md](verification.md): usar uma cópia limpa do commit identificado, executar os comandos do README e os testes, percorrer os fluxos por teclado e validar contrato/diagramas. Para cada execução, registar versão, comando ou passos, resultado esperado, observado e evidência. Estes procedimentos não são apresentados como novas execuções realizadas nesta atualização documental.
