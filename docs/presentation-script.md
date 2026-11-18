# Matriz — Guião da apresentação final

**Antes de começar:** aplicação aberta, sessão de gestor iniciada, projeto fictício com dois participantes ativos e filtros limpos. Ter uma tarefa de reserva sem bloqueadores e o [repositório GitHub](https://github.com/Fibigor/matriz) aberto noutro separador.

## 0:00–0:30 — Contexto

**Mostrar:** painel inicial.

**Dizer:** «A Matriz permite organizar projetos, gerir tarefas e acompanhar o progresso da equipa. Vou mostrar a gestão de uma tarefa e a colaboração entre participantes.»

## 0:30–1:30 — Fluxo 1: gerir uma tarefa

**Fazer:**

1. Abrir o projeto e apontar os filtros de estado e prioridade.
2. Criar **«Preparar demonstração»**, com prioridade **Alta**.
3. Clicar no título para abrir o detalhe.
4. Guardar como **Em curso** e depois como **Concluída**.
5. Voltar à lista e apontar o progresso.

**Dizer enquanto clico:** «A tarefa começa em Por fazer. As alterações ficam guardadas na base de dados e atualizam o progresso global do projeto.»

## 1:30–2:20 — Fluxo 2: colaborar sobre a tarefa

**Fazer:**

1. Reabrir a tarefa e atribuir dois participantes, um de cada vez.
2. Comentar **«Pronto para revisão»**.
3. Apontar os responsáveis, o autor e a data do comentário.
4. Recarregar e mostrar que os dados permanecem.

**Dizer:** «O gestor atribui responsáveis e os participantes podem comentar. O servidor controla as permissões e define o autor e a data. Ao recarregar, os dados mantêm-se.»

## 2:20–3:05 — Tecnologias e arquitetura

**Manter a aplicação visível e dizer:** «Usei React e TypeScript na interface, Java 21 e Spring Boot no backend e PostgreSQL com JDBC e Flyway nos dados. Escolhi um monólito modular pela simplicidade de desenvolvimento e operação. O frontend e a API são entregues juntos; o Docker Compose executa a aplicação e a base de dados. A autenticação usa sessão e proteção CSRF.»

## 3:05–3:50 — Metodologia e utilização de IA

**Dizer:** «Comecei pelos requisitos e arquitetura, depois implementei por incrementos. Usei o GitHub Copilot e agentes especializados para planear, implementar e rever tarefas. No incremento de usabilidade, usei também o Spec Kit. As decisões ficaram do meu lado e validei o resultado com testes de backend, componentes e percursos completos. A IA apoiou o desenvolvimento; não é uma funcionalidade da aplicação.»

## 3:50–4:35 — Desafio: Keycloak no deployment

**Dizer:** «Inicialmente usei Keycloak para autenticação, mas tive dificuldades na fase de deployment. Para viabilizar a demonstração, decidi retirá-lo e usar autenticação local com Spring Security, mantendo palavras-passe com hash, sessões no servidor e proteção CSRF. A aprendizagem foi perceber que uma solução tem de ser adequada não só ao desenvolvimento, mas também ao ambiente onde vai executar. Neste projeto académico, simplificar a arquitetura permitiu reduzir dependências externas.»

## 4:35–4:45 — Fecho

**Mostrar:** separador do repositório GitHub.

**Dizer:** «Aqui estão o código, os testes, a configuração e a documentação. É uma demonstração académica, não um serviço pronto para produção. Obrigado.»

**Até aos 5:00:** margem para atrasos. Se algo falhar, dizer «Vou continuar com a tarefa preparada» e usar a reserva. Não depurar nem executar testes ao vivo.
