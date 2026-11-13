# Matriz — Guião da apresentação final

**Objetivo:** apresentar a Matriz em **5 minutos**, com demonstração ao vivo de dois fluxos na aplicação. Guião para **4m45**, com **15 segundos de margem**; não são necessários slides.

## 0:00–0:30 — Contexto

*Ação: começar no painel, com sessão já iniciada como gestor e o projeto de demonstração selecionado.*

> A Matriz é uma aplicação de gestão de projetos e tarefas desenvolvida ao longo desta formação. O objetivo é permitir que uma equipa organize o trabalho, atribua responsáveis e acompanhe o progresso num único local. Vou mostrar dois fluxos representativos: gerir uma tarefa e colaborar sobre essa tarefa.

## 0:30–1:30 — Fluxo 1: gerir uma tarefa

*Ações: abrir o projeto, mostrar brevemente a lista e os filtros por estado e prioridade. Com os filtros limpos, criar «Preparar demonstração», com prioridade «Alta». Confirmar «Por fazer» (TODO), abrir o detalhe pelo título e guardar primeiro «Em curso» e depois «Concluída». Voltar ao projeto e apontar o progresso.*

> Esta lista vem da base de dados real, através da API. Os filtros ajudam a encontrar trabalho por estado e prioridade. Vou criar uma tarefa com prioridade alta; começa em «Por fazer».
>
> Ao passar para «Em curso» e depois para «Concluída», a equipa acompanha a evolução. O progresso é calculado sobre todas as tarefas do projeto, independentemente dos filtros ou da página apresentada.

*Nota de execução: a criação atualiza a lista e o progresso; não abre automaticamente o detalhe. Clicar no título. Usar um projeto com poucas tarefas para tornar visível a alteração da percentagem, sem percorrer várias páginas ou combinações de filtros.*

## 1:30–2:20 — Fluxo 2: colaborar sobre a tarefa

*Ações: voltar ao detalhe da mesma tarefa. Como gestor, atribuir dois participantes ativos elegíveis, um de cada vez. Adicionar «Pronto para revisão». Mostrar os responsáveis, o autor e a data do comentário; recarregar a página e confirmar que os dados permanecem.*

> Uma tarefa pode ter vários responsáveis, desde que sejam participantes ativos do projeto. Aqui, como gestor, atribuo duas pessoas e acrescento um comentário.
>
> O servidor define o autor e a data. As permissões são verificadas na API, não apenas nos botões da interface: o gestor gere atribuições e os participantes podem comentar. Ao recarregar, os responsáveis e o comentário mantêm-se. É uma aplicação com persistência, não apenas um protótipo visual.

## 2:20–3:05 — Tecnologias e arquitetura

*Ação: manter a aplicação visível; explicar sem abrir código ou configuração.*

> A interface usa React e TypeScript. O backend usa Java 21 e Spring Boot, com PostgreSQL para persistência.
>
> A arquitetura é um monólito modular, organizado em identidade, projetos e tarefas — não são microserviços. Há uma única unidade de entrega da aplicação: o Docker compila o frontend e inclui os ficheiros estáticos no JAR. O Compose executa a aplicação e a base de dados.
>
> A autenticação usa sessões no servidor e proteção CSRF nas operações de escrita.

## 3:05–3:50 — Metodologia e utilização de IA

*Ação: manter o foco no processo e na validação, sem abrir conversas com a IA.*

> O trabalho evoluiu de requisitos e arquitetura para implementação, testes e entrega. Usei o GitHub Copilot para análise, propostas e implementação de tarefas delimitadas, com revisão humana e aprovação das decisões.
>
> Uma resposta da IA não é prova de que a solução funciona. A validação inclui testes de backend, testes de componentes e testes ponta a ponta automatizados. As decisões, os resultados observados e as limitações ficam documentados no repositório.

## 3:50–4:35 — Desafio: dependências e compatibilidade

*Ação: explicar a sequência; não executar scans durante a apresentação.*

> Um desafio foi atualizar dependências sem perder compatibilidade. A análise inicial identificou 38 ocorrências de severidade alta ou crítica. As atualizações compatíveis reduziram esse número para duas, mas o critério de segurança continuava bloqueado.
>
> Foi então aprovada a migração major para Spring Boot 4, com adaptação ao Jackson e preservação do contrato da API. Depois de reconstruir e repetir os testes e os scans com bases atualizadas, o resultado local documentado foi zero ocorrências altas ou críticas.
>
> Isto não é uma certificação de segurança. A lição foi atualizar e verificar o comportamento e a cobertura da análise, não apenas procurar um número a zero.

## 4:35–4:45 — Fecho

*Ação: terminar na aplicação. Só se houver tempo, mostrar os separadores do README e da execução de CI já preparados.*

> A Matriz é uma demonstração académica funcional, com execução reproduzível, testes e CI definidos no repositório, mas não está pronta para produção. A entrega é o URL do repositório GitHub, onde estão o código e a documentação. Obrigado.

## 4:45–5:00 — Margem e contingência

- Reservar estes 15 segundos para latência ou transições, não para novas funcionalidades.
- Se a demonstração falhar: reconhecer brevemente — «Esta operação não respondeu como esperado; vou continuar com a tarefa preparada.» Passar à tarefa de reserva, sem depurar ao vivo nem anunciar sucesso não observado.
- Se houver atraso, encurtar as explicações; não acelerar os cliques nem ultrapassar os cinco minutos.
- Evitar eliminações, exploração exaustiva de filtros, execução de testes, arranques Docker ou alterações de configuração durante a demonstração.

## Checklist de preparação e entrega

| Confirmar antes da apresentação | Estado |
|---|---|
| Aplicação iniciada e acessível; sessão de gestor já iniciada, sem mostrar palavras-passe. | ☐ |
| Projeto selecionado, com poucas tarefas e pelo menos dois participantes ativos elegíveis para atribuição, podendo incluir o gestor. | ☐ |
| Filtros limpos; título «Preparar demonstração» e comentário «Pronto para revisão» prontos a introduzir. | ☐ |
| Tarefa de reserva preparada para continuar caso a criação ou outra operação falhe. | ☐ |
| README e execução de CI bem-sucedida indicada pelo utilizador abertos em separadores. Confirmar a versão a que essa execução corresponde; não a apresentar como prova do candidato atual sem confirmação. | ☐ |
| **URL definitivo do repositório GitHub confirmado pelo utilizador**, pronto a entregar; não substituir pelo endereço da aplicação. | ☐ |
| Formador com acesso ao repositório, incluindo autorização de leitura se for privado. | ☐ |
| Código e documentação da versão a entregar versionados pelo responsável, sem `.env` real, segredos ou dados pessoais desnecessários. | ☐ |
| Ensaio com cronómetro concluído em 4m45; pontos de corte nas explicações identificados. | ☐ |

**Entrega:** segundo as orientações fornecidas pelo utilizador, é obrigatório submeter o URL do repositório GitHub; capturas de ecrã ou ficheiros ZIP não o substituem. Os cinco minutos incluem a demonstração. Não é necessário criar slides nem uma release para entregar o URL.

**Base factual e limites:** fluxos e regras confrontados com [requisitos](requirements.md), [User Stories](user-stories.md), [OpenAPI](../openapi.yaml) e `frontend/src/Tasks.tsx`; stack e entrega descritas no [README](../README.md) e na [arquitetura](architecture.md). A sequência histórica **38 → 2 → 0** e os resultados locais constam de [verificação](verification.md). Zero HIGH/CRITICAL refere-se aos scans locais documentados de bibliotecas, à imagem e às bases de vulnerabilidades usadas, não a uma garantia geral de segurança. A execução de CI bem-sucedida é informação fornecida pelo utilizador, não revalidada nesta tarefa; a documentação mantém pendente a prova remota do candidato atual. O URL definitivo e o acesso do formador exigem confirmação humana.
